import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum ThemePreferenceDto {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum SettingsLanguageDto {
  EN = 'en',
  TR = 'tr',
}

export const SUPPORTED_SETTINGS_TIMEZONES = [
  'Europe/Istanbul',
  'UTC',
  'Europe/London',
  'America/New_York',
] as const;

export type SettingsTimezoneDto = (typeof SUPPORTED_SETTINGS_TIMEZONES)[number];

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsEnum(ThemePreferenceDto)
  themePreference?: ThemePreferenceDto;

  @IsOptional()
  @IsEnum(SettingsLanguageDto)
  language?: SettingsLanguageDto;

  @IsOptional()
  @IsString()
  @IsIn(SUPPORTED_SETTINGS_TIMEZONES)
  @MaxLength(100)
  timezone?: SettingsTimezoneDto;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppNotifications?: boolean;
}
