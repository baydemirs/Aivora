import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RagService } from '../rag/rag.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ragService: RagService,
  ) {}

  async sendMessage(dto: SendMessageDto, tenantId: string) {
    // 1. Get or create conversation
    let conversationId = dto.conversationId;

    if (!conversationId) {
      const conversation = await this.prisma.conversation.create({
        data: {
          tenantId,
          title: dto.message.substring(0, 100),
        },
      });
      conversationId = conversation.id;
    } else {
      // Verify tenant ownership
      const existing = await this.prisma.conversation.findFirst({
        where: { id: conversationId, tenantId },
      });
      if (!existing) {
        throw new NotFoundException('Conversation not found or access denied');
      }
    }

    // 2. Get AI response via RAG FIRST, before saving any messages
    //    This prevents orphaned user messages if RAG/OpenAI fails
    let ragResponse;
    try {
      ragResponse = await this.ragService.askQuestion(dto.message, tenantId);
    } catch (error) {
      this.logger.error('RAG pipeline failed', error);
      // Provide a graceful fallback instead of crashing
      ragResponse = {
        answer: 'I was unable to process your request at this time. Please try again later.',
        confidence: 0,
        sourcesCount: 0,
        taskCreated: false,
      };
    }

    // 3. Save both messages atomically — either both persist or neither
    await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId,
          content: dto.message,
          role: 'user',
        },
      }),
      this.prisma.message.create({
        data: {
          conversationId,
          content: ragResponse.answer,
          role: 'assistant',
        },
      }),
    ]);

    return {
      conversationId,
      answer: ragResponse.answer,
      confidence: ragResponse.confidence,
      sourcesCount: ragResponse.sourcesCount,
      taskCreated: ragResponse.taskCreated,
    };
  }

  async getConversation(conversationId: string, tenantId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, tenantId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    return conversation;
  }

  async listConversations(tenantId: string) {
    return this.prisma.conversation.findMany({
      where: { tenantId },
      include: { _count: { select: { messages: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
