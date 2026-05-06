import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';

export interface QdrantPoint {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
}

@Injectable()
export class QdrantService implements OnModuleInit {
  private readonly client: QdrantClient;
  private readonly logger = new Logger(QdrantService.name);
  private readonly collectionName = 'aivora_documents';

  constructor(private readonly configService: ConfigService) {
    this.client = new QdrantClient({
      url: this.configService.get<string>(
        'QDRANT_URL',
        'http://localhost:6333',
      ),
    });
  }

  async onModuleInit() {
    await this.ensureCollection();
  }

  private async ensureCollection() {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        (c) => c.name === this.collectionName,
      );

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 1536, // text-embedding-3-small dimension
            distance: 'Cosine',
          },
        });
        this.logger.log(`Collection "${this.collectionName}" created.`);
      }
    } catch (error) {
      this.logger.warn(
        `Qdrant connection failed. Vector search will be unavailable: ${error}`,
      );
    }
  }

  async upsertPoints(points: QdrantPoint[]): Promise<void> {
    await this.client.upsert(this.collectionName, {
      points: points.map((p) => ({
        id: p.id,
        vector: p.vector,
        payload: p.payload,
      })),
    });
  }

  async searchSimilar(
    vector: number[],
    tenantId: string,
    limit = 5,
  ): Promise<
    { id: string; score: number; payload: Record<string, unknown> }[]
  > {
    const results = await this.client.search(this.collectionName, {
      vector,
      limit,
      filter: {
        must: [{ key: 'tenantId', match: { value: tenantId } }],
      },
      with_payload: true,
    });

    return results.map((r) => ({
      id: String(r.id),
      score: r.score,
      payload: (r.payload as Record<string, unknown>) || {},
    }));
  }
}
