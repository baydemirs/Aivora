import { Injectable, Logger } from '@nestjs/common';
import { OpenaiService } from '../openai/openai.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { PrdTrackerService } from '../prd-tracker/prd-tracker.service';

export interface RagResponse {
  answer: string;
  confidence: number;
  sourcesCount: number;
  taskCreated: boolean;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private readonly CONFIDENCE_THRESHOLD = 0.6;

  constructor(
    private readonly openaiService: OpenaiService,
    private readonly qdrantService: QdrantService,
    private readonly prdTrackerService: PrdTrackerService,
  ) {}

  async askQuestion(question: string, tenantId: string): Promise<RagResponse> {
    // 1. Generate query embedding
    const queryVector = await this.openaiService.generateEmbedding(question);

    // 2. Search Qdrant for relevant chunks (tenant-filtered)
    const results = await this.qdrantService.searchSimilar(
      queryVector,
      tenantId,
      5,
    );

    // 3. Calculate confidence based on top similarity scores
    const confidence =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.score, 0) / results.length
        : 0;

    // 4. Build context from retrieved chunks
    const context = results
      .map((r) => (r.payload?.content as string) || '')
      .filter(Boolean)
      .join('\n\n---\n\n');

    // 5. Generate answer via LLM
    let answer: string;

    if (results.length === 0) {
      answer =
        'No relevant documents found in the knowledge base for this question.';
    } else {
      const systemPrompt = `You are Aivora AI assistant. Answer the user's question based ONLY on the provided context. If the context doesn't contain enough information, say so clearly. Be concise and professional.

Context:
${context}`;

      answer = await this.openaiService.generateChatResponse(
        systemPrompt,
        question,
      );
    }

    // 6. Auto-create task if confidence is low
    let taskCreated = false;
    if (confidence < this.CONFIDENCE_THRESHOLD) {
      try {
        await this.prdTrackerService.create(
          {
            title: `Low confidence answer: "${question.substring(0, 80)}..."`,
            module: 'rag',
          },
          tenantId,
        );
        taskCreated = true;
        this.logger.warn(
          `Low confidence (${confidence.toFixed(2)}) — PRD task auto-created`,
        );
      } catch (error) {
        this.logger.error('Failed to auto-create PRD task', error);
      }
    }

    return {
      answer,
      confidence: Math.round(confidence * 100) / 100,
      sourcesCount: results.length,
      taskCreated,
    };
  }
}
