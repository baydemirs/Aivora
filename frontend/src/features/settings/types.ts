import type { User } from '@/types'

export type ThemePreference = 'light' | 'dark' | 'system'
export type SettingsLanguage = 'en' | 'tr'
export type SettingsTimezone =
  | 'Europe/Istanbul'
  | 'UTC'
  | 'Europe/London'
  | 'America/New_York'

export interface SettingsProfile {
  userId: string
  tenantId: string
  fullName: string
  email: string
  role: User['role']
  tenantName: string
}

export interface SettingsPreferences {
  themePreference: ThemePreference
  language: SettingsLanguage
  timezone: SettingsTimezone
  emailNotifications: boolean
  inAppNotifications: boolean
}

export interface SettingsResponse {
  id: string
  profile: SettingsProfile
  preferences: SettingsPreferences
  createdAt: string
  updatedAt: string
}

export interface UpdateSettingsRequest {
  fullName?: string
  themePreference?: ThemePreference
  language?: SettingsLanguage
  timezone?: SettingsTimezone
  emailNotifications?: boolean
  inAppNotifications?: boolean
}
