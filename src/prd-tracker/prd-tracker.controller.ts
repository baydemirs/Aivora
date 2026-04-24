import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CreatePrdTaskDto } from './dto/create-prd-task.dto';
import { UpdatePrdTaskDto } from './dto/update-prd-task.dto';
import { PrdTrackerService } from './prd-tracker.service';

@Controller('prd')
@UseGuards(JwtAuthGuard)
export class PrdTrackerController {
  constructor(private readonly prdTrackerService: PrdTrackerService) {}

  @Post()
  create(
    @Body() createPrdTaskDto: CreatePrdTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.prdTrackerService.create(createPrdTaskDto, user.tenantId);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.prdTrackerService.findAll(user.tenantId);
  }

  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() updatePrdTaskDto: UpdatePrdTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.prdTrackerService.updateStatus(
      id,
      updatePrdTaskDto,
      user.tenantId,
    );
  }
}
