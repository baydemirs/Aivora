import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { TenantModule } from './tenant/tenant.module';
import { PrdTrackerModule } from './prd-tracker/prd-tracker.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, AuthModule, TenantModule, PrdTrackerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
