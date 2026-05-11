import { Role } from '@prisma/client';
import {
  SettingsLanguageDto,
  SettingsTimezoneDto,
  ThemePreferenceDto,
} from './update-settings.dto';

export class SettingsProfileDto {
  userId: string;
  tenantId: string;
  fullName: string;
  email: string;
  role: Role;
  tenantName: string;
}

export class SettingsPreferencesDto {
  themePreference: ThemePreferenceDto;
  language: SettingsLanguageDto;
  timezone: SettingsTimezoneDto;
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

export class SettingsResponseDto {
  id: string;
  profile: SettingsProfileDto;
  preferences: SettingsPreferencesDto;
  createdAt: Date;
  updatedAt: Date;
}
