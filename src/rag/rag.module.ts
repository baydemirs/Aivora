import { Module } from '@nestjs/common';
import { OpenaiModule } from '../openai/openai.module';
import { QdrantModule } from '../qdrant/qdrant.module';
import { PrdTrackerModule } from '../prd-tracker/prd-tracker.module';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';

@Module({
  imports: [OpenaiModule, QdrantModule, PrdTrackerModule],
  controllers: [RagController],
  providers: [RagService],
  exports: [RagService],
})
export class RagModule {}
