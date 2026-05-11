import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  Role,
  SettingsLanguage,
  ThemePreference,
  User,
  UserSettings,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import {
  SettingsLanguageDto,
  SettingsTimezoneDto,
  ThemePreferenceDto,
  UpdateSettingsDto,
} from './dto/update-settings.dto';
import { SettingsResponseDto } from './dto/settings-response.dto';

type UserWithTenant = Pick<
  User,
  'id' | 'email' | 'fullName' | 'role' | 'tenantId' | 'createdAt' | 'updatedAt'
> & {
  tenant: { name: string };
};

type SettingsUpdateData = Partial<
  Pick<
    UserSettings,
    | 'themePreference'
    | 'language'
    | 'timezone'
    | 'emailNotifications'
    | 'inAppNotifications'
  >
>;

function fallbackFullName(user: Pick<UserWithTenant, 'email' | 'fullName'>) {
  return user.fullName?.trim() || user.email.split('@')[0];
}

function themeToDto(theme: ThemePreference): ThemePreferenceDto {
  return theme.toLowerCase() as ThemePreferenceDto;
}

function languageToDto(language: SettingsLanguage): SettingsLanguageDto {
  return language.toLowerCase() as SettingsLanguageDto;
}

function themeFromDto(theme: ThemePreferenceDto): ThemePreference {
  return theme.toUpperCase() as ThemePreference;
}

function languageFromDto(language: SettingsLanguageDto): SettingsLanguage {
  return language.toUpperCase() as SettingsLanguage;
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMySettings(user: AuthenticatedUser): Promise<SettingsResponseDto> {
    const profile = await this.getTenantScopedUser(user);
    const settings = await this.getOrCreateSettings(profile.id, profile.tenantId);

    return this.toResponse(profile, settings);
  }

  async updateMySettings(
    user: AuthenticatedUser,
    dto: UpdateSettingsDto,
  ): Promise<SettingsResponseDto> {
    const profile = await this.getTenantScopedUser(user);

    const settingsData: SettingsUpdateData = {};
    if (dto.themePreference !== undefined) {
      settingsData.themePreference = themeFromDto(dto.themePreference);
    }
    if (dto.language !== undefined) {
      settingsData.language = languageFromDto(dto.language);
    }
    if (dto.timezone !== undefined) {
      settingsData.timezone = dto.timezone.trim() || 'Europe/Istanbul';
    }
    if (dto.emailNotifications !== undefined) {
      settingsData.emailNotifications = dto.emailNotifications;
    }
    if (dto.inAppNotifications !== undefined) {
      settingsData.inAppNotifications = dto.inAppNotifications;
    }

    const nextFullName =
      dto.fullName !== undefined ? dto.fullName.trim() || null : undefined;

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedUser =
        nextFullName !== undefined
          ? await tx.user.update({
              where: { id: profile.id },
              data: { fullName: nextFullName },
              include: { tenant: { select: { name: true } } },
            })
          : profile;

      const settings = await tx.userSettings.upsert({
        where: { userId: profile.id },
        update: {
          ...settingsData,
          tenantId: profile.tenantId,
        },
        create: {
          userId: profile.id,
          tenantId: profile.tenantId,
          themePreference:
            settingsData.themePreference ?? ThemePreference.SYSTEM,
          language: settingsData.language ?? SettingsLanguage.TR,
          timezone: settingsData.timezone ?? 'Europe/Istanbul',
          emailNotifications: settingsData.emailNotifications ?? true,
          inAppNotifications: settingsData.inAppNotifications ?? true,
        },
      });

      return { user: updatedUser, settings };
    });

    return this.toResponse(result.user, result.settings);
  }

  private async getTenantScopedUser(
    user: AuthenticatedUser,
  ): Promise<UserWithTenant> {
    const profile = await this.prisma.user.findFirst({
      where: {
        id: user.id,
        tenantId: user.tenantId,
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

    if (!profile) {
      throw new NotFoundException('Authenticated user was not found');
    }

    return profile;
  }

  private async getOrCreateSettings(userId: string, tenantId: string) {
    const existing = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (existing) {
      if (existing.tenantId === tenantId) {
        return existing;
      }

      return this.prisma.userSettings.update({
        where: { userId },
        data: { tenantId },
      });
    }

    try {
      return await this.prisma.userSettings.create({
        data: { userId, tenantId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return this.prisma.userSettings.findUniqueOrThrow({
          where: { userId },
        });
      }

      throw error;
    }
  }

  private toResponse(
    user: UserWithTenant & { role: Role },
    settings: UserSettings,
  ): SettingsResponseDto {
    return {
      id: settings.id,
      profile: {
        userId: user.id,
        tenantId: user.tenantId,
        fullName: fallbackFullName(user),
        email: user.email,
        role: user.role,
        tenantName: user.tenant.name,
      },
      preferences: {
        themePreference: themeToDto(settings.themePreference),
        language: languageToDto(settings.language),
        timezone: settings.timezone as SettingsTimezoneDto,
        emailNotifications: settings.emailNotifications,
        inAppNotifications: settings.inAppNotifications,
      },
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }
}
