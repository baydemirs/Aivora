import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePrdTaskDto } from './dto/create-prd-task.dto';
import { UpdatePrdTaskDto } from './dto/update-prd-task.dto';

@Injectable()
export class PrdTrackerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPrdTaskDto: CreatePrdTaskDto, tenantId: string) {
    return this.prisma.prdTask.create({
      data: {
        ...createPrdTaskDto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.prdTask.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    id: string,
    updateDto: UpdatePrdTaskDto,
    tenantId: string,
  ) {
    // Verify ownership and existence
    const task = await this.prisma.prdTask.findFirst({
      where: { id, tenantId },
    });

    if (!task) {
      throw new NotFoundException(`Task not found or access denied`);
    }

    return this.prisma.prdTask.update({
      where: { id },
      data: { status: updateDto.status },
    });
  }
}
