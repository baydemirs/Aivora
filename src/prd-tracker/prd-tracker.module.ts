import { Module } from '@nestjs/common';
import { PrdTrackerService } from './prd-tracker.service';
import { PrdTrackerController } from './prd-tracker.controller';

@Module({
  providers: [PrdTrackerService],
  controllers: [PrdTrackerController]
})
export class PrdTrackerModule {}
