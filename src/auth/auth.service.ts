import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
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
    const { email, password, name } = registerDto;

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
          password: hashedPassword,
          role: Role.ADMIN,
          tenantId: tenant.id,
        },
        select: {
          id: true,
          email: true,
          role: true,
          tenantId: true,
          createdAt: true,
        },
      });
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return { access_token: this.jwtService.sign(payload) };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return { access_token: this.jwtService.sign(payload) };
  }
}
