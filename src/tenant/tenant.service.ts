import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    return this.prisma.tenant.create({
      data: {
        name: createTenantDto.name,
      },
    });
  }

  // Global findAll() is removed for security (SaaS isolation). Admin of Tenant A should not see Tenant B.

  async findTenantById(tenantId: string, currentUserTenantId: string) {
    if (tenantId !== currentUserTenantId) {
      throw new NotFoundException(`Tenant not found or access denied`);
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant not found`);
    }

    return tenant;
  }
}
