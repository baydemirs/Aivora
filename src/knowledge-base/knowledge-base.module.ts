import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { OpenaiModule } from '../openai/openai.module';
import { QdrantModule } from '../qdrant/qdrant.module';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';

@Module({
  imports: [DatabaseModule, OpenaiModule, QdrantModule],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}
