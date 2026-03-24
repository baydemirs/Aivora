import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { OpenaiModule } from './openai/openai.module';
import { PrdTrackerModule } from './prd-tracker/prd-tracker.module';
import { QdrantModule } from './qdrant/qdrant.module';
import { RagModule } from './rag/rag.module';
import { ChatModule } from './chat/chat.module';
import { TenantModule } from './tenant/tenant.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    TenantModule,
    PrdTrackerModule,
    OpenaiModule,
    QdrantModule,
    KnowledgeBaseModule,
    RagModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
