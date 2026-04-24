import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
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
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
