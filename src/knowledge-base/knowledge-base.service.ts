import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../database/prisma.service';
import { OpenaiService } from '../openai/openai.service';
import { QdrantService } from '../qdrant/qdrant.service';

const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly openaiService: OpenaiService,
    private readonly qdrantService: QdrantService,
  ) {}

  /**
   * Full pipeline: parse file → chunk → embed → store in Qdrant + Postgres
   */
  async uploadDocument(
    file: Express.Multer.File,
    tenantId: string,
  ) {
    // Validate file exists
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided or file is empty');
    }

    // Validate MIME type
    if (!SUPPORTED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Supported: PDF, DOCX, TXT`,
      );
    }

    // 1. Extract text from file
    let text: string;
    try {
      text = await this.extractText(file);
    } catch (error) {
      this.logger.error(`Failed to extract text from "${file.originalname}"`, error);
      throw new BadRequestException('Failed to parse the uploaded file');
    }

    if (!text || text.trim().length < 10) {
      throw new BadRequestException('The uploaded file contains no extractable text');
    }

    // 2. Save document metadata to Postgres
    const document = await this.prisma.document.create({
      data: { title: file.originalname, tenantId },
    });

    // 3. Split text into chunks
    const chunks = this.splitTextIntoChunks(text, 800);

    // 4. Generate embeddings & store in Qdrant + Postgres
    const savedChunks: { id: string; content: string; embeddingId: string }[] = [];

    for (const chunkText of chunks) {
      const embeddingId = uuidv4();

      try {
        const vector = await this.openaiService.generateEmbedding(chunkText);

        // Store vector in Qdrant
        await this.qdrantService.upsertPoints([
          {
            id: embeddingId,
            vector,
            payload: {
              tenantId,
              documentId: document.id,
              content: chunkText,
            },
          },
        ]);

        // Store chunk metadata in Postgres (inside same try/catch as Qdrant)
        const savedChunk = await this.prisma.documentChunk.create({
          data: {
            documentId: document.id,
            content: chunkText,
            embeddingId,
          },
        });

        savedChunks.push(savedChunk);
      } catch (error) {
        this.logger.error(`Failed to process chunk for doc "${document.id}"`, error);
        // Both Qdrant and Postgres writes are in the same block —
        // if Prisma fails after Qdrant succeeds, an orphan vector exists,
        // but it won't be referenced and will be harmless in filtered searches.
        continue;
      }
    }

    this.logger.log(
      `Document "${file.originalname}" processed: ${savedChunks.length}/${chunks.length} chunks created`,
    );

    return {
      documentId: document.id,
      title: document.title,
      chunksCount: savedChunks.length,
      totalChunks: chunks.length,
    };
  }

  /**
   * List all documents for a tenant
   */
  async findAll(tenantId: string) {
    return this.prisma.document.findMany({
      where: { tenantId },
      include: { _count: { select: { chunks: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Extract text from PDF or DOCX
   */
  private async extractText(file: Express.Multer.File): Promise<string> {
    const mimeType = file.mimetype;

    if (mimeType === 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(file.buffer);
      return result.text;
    }

    if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    }

    // Plain text fallback
    return file.buffer.toString('utf-8');
  }

  /**
   * Split text into chunks of ~maxChars characters, respecting sentence boundaries
   */
  private splitTextIntoChunks(text: string, maxChars = 800): string[] {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const chunks: string[] = [];
    let current = '';

    for (const sentence of sentences) {
      if ((current + ' ' + sentence).trim().length > maxChars && current) {
        chunks.push(current.trim());
        current = sentence;
      } else {
        current = current ? current + ' ' + sentence : sentence;
      }
    }

    if (current.trim()) {
      chunks.push(current.trim());
    }

    return chunks.filter((c) => c.length > 20); // skip tiny fragments
  }
}
