import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private readonly client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY')!,
    });
  }

  async generateEmbedding(text: string, retries = 2): Promise<number[]> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.client.embeddings.create({
          model: 'text-embedding-3-small',
          input: text,
        });
        return response.data[0].embedding;
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise((res) => setTimeout(res, 1000 * attempt));
      }
    }
    throw new Error('Failed to generate embedding');
  }

  async generateChatResponse(
    systemPrompt: string,
    userMessage: string,
    retries = 2,
  ): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.3,
          max_tokens: 1024,
        });
        return response.choices[0].message.content || '';
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise((res) => setTimeout(res, 1000 * attempt));
      }
    }
    throw new Error('Failed to generate chat response');
  }
}
