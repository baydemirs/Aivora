import { Module } from '@nestjs/common';
import { PrdTrackerService } from './prd-tracker.service';
import { PrdTrackerController } from './prd-tracker.controller';

@Module({
  providers: [PrdTrackerService],
  controllers: [PrdTrackerController],
  exports: [PrdTrackerService], // Required for RagModule to inject PrdTrackerService
})
export class PrdTrackerModule {}
