import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, fullName } = registerDto;

    // Hash password before entering transaction (CPU-intensive work outside DB lock)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Atomic: check + create inside transaction to prevent race conditions
    const user = await this.prisma.$transaction(async (tx) => {
      // Check inside transaction for atomicity
      const existingUser = await tx.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const tenant = await tx.tenant.create({
        data: { name },
      });

      return tx.user.create({
        data: {
          email,
          fullName: fullName?.trim() || email.split('@')[0],
          password: hashedPassword,
          role: Role.ADMIN,
          tenantId: tenant.id,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
          tenant: {
            select: {
              name: true,
            },
          },
        },
      });
    });

    return this.buildAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        tenant: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: {
    id: string;
    email: string;
    fullName?: string | null;
    role: Role;
    tenantId: string;
    createdAt: Date;
    updatedAt?: Date;
    tenant?: { name: string };
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName?.trim() || user.email.split('@')[0],
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant?.name ?? '',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt ?? user.createdAt,
      },
    };
  }
}
