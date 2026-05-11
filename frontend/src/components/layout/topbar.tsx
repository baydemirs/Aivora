import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Check,
  ChevronDown,
  Globe2,
  LogOut,
  Menu,
  MonitorSmartphone,
  Moon,
  Settings,
  Sun,
} from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/use-auth'
import { useSettings, useUpdateSettings } from '@/features/settings/hooks/useSettings'
import type { SettingsLanguage, ThemePreference } from '@/features/settings/types'
import { useTheme } from '@/features/theme/use-theme'
import { getInitials } from '@/utils/format'
import { useI18n } from '@/i18n'

interface TopbarProps {
  onMenuClick: () => void
  onSettingsClick: () => void
  title?: string
}

type OpenMenu = 'theme' | 'user' | null

const themeOptions: Array<{
  value: ThemePreference
  labelKey: string
}> = [
  { value: 'light', labelKey: 'settings.themeLight' },
  { value: 'dark', labelKey: 'settings.themeDark' },
  { value: 'system', labelKey: 'settings.themeSystem' },
]

function ThemePreferenceIcon({
  className,
  themePreference,
}: {
  className?: string
  themePreference: ThemePreference
}) {
  if (themePreference === 'light') return <Sun className={className} />
  if (themePreference === 'dark') return <Moon className={className} />
  return <MonitorSmartphone className={className} />
}

function getRoleLabel(role: string | undefined, t: (key: string) => string) {
  return role === 'ADMIN' ? t('settings.roleAdmin') : t('settings.roleMember')
}

export function Topbar({ onMenuClick, onSettingsClick, title }: TopbarProps) {
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useI18n()
  const { themePreference, setThemePreference } = useTheme()
  const settingsQuery = useSettings(!!user)
  const updateSettingsMutation = useUpdateSettings()
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const actionsRef = useRef<HTMLDivElement>(null)

  const backendThemePreference = settingsQuery.data?.preferences.themePreference
  const backendLanguage = settingsQuery.data?.preferences.language
  const isPersistingPreference = updateSettingsMutation.isPending

  useEffect(() => {
    if (
      !backendThemePreference ||
      isPersistingPreference ||
      backendThemePreference === themePreference
    ) {
      return
    }

    setThemePreference(backendThemePreference)
  }, [
    backendThemePreference,
    isPersistingPreference,
    setThemePreference,
    themePreference,
  ])

  useEffect(() => {
    if (!backendLanguage || isPersistingPreference || backendLanguage === language) {
      return
    }

    setLanguage(backendLanguage)
  }, [backendLanguage, isPersistingPreference, language, setLanguage])

  useEffect(() => {
    if (!openMenu) return

    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [openMenu])

  const displayName = user?.fullName || user?.email || t('settings.unknownUser')
  const tenantName = user?.tenantName || t('settings.noTenant')
  const roleLabel = getRoleLabel(user?.role, t)

  const currentThemeLabel = useMemo(() => {
    const selectedTheme = themeOptions.find((option) => option.value === themePreference)
    return selectedTheme ? t(selectedTheme.labelKey) : t('settings.themeSystem')
  }, [t, themePreference])

  const persistThemePreference = (nextThemePreference: ThemePreference) => {
    setOpenMenu(null)
    if (nextThemePreference === themePreference || isPersistingPreference) return

    const previousThemePreference = themePreference
    setThemePreference(nextThemePreference)
    updateSettingsMutation.mutate(
      { themePreference: nextThemePreference },
      {
        onError: () => {
          setThemePreference(previousThemePreference)
        },
      },
    )
  }

  const persistLanguage = (nextLanguage: SettingsLanguage) => {
    if (nextLanguage === language || isPersistingPreference) return

    const previousLanguage = language as SettingsLanguage
    setLanguage(nextLanguage)
    updateSettingsMutation.mutate(
      { language: nextLanguage },
      {
        onError: () => {
          setLanguage(previousLanguage)
        },
      },
    )
  }

  const openSettingsFromMenu = () => {
    setOpenMenu(null)
    onSettingsClick()
  }

  const signOut = () => {
    setOpenMenu(null)
    logout()
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/60 bg-card/85 px-3 backdrop-blur-sm sm:px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {title && (
        <h1 className="min-w-0 truncate text-base font-semibold text-foreground">
          {title}
        </h1>
      )}

      <div ref={actionsRef} className="ml-auto flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-2 rounded-xl border border-border/70 bg-background/70 px-2 py-1 shadow-sm sm:flex">
          <Globe2 className="h-4 w-4 text-muted-foreground" />
          <Select
            value={language}
            onValueChange={(value) => persistLanguage(value as SettingsLanguage)}
            disabled={isPersistingPreference}
          >
            <SelectTrigger
              aria-label={t('topbar.language')}
              className="h-7 w-[112px] border-0 bg-transparent px-1.5 py-0 text-xs shadow-none focus:ring-0 focus:ring-offset-0"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="tr">{t('lang.tr')}</SelectItem>
              <SelectItem value="en">{t('lang.en')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={t('topbar.theme')}
            aria-haspopup="menu"
            aria-expanded={openMenu === 'theme'}
            className={cn(
              'h-9 w-9 rounded-xl border-border/70 bg-background/70 shadow-sm hover:border-primary/25 hover:bg-primary/5',
              openMenu === 'theme' && 'border-primary/30 bg-primary/10 text-primary',
            )}
            onClick={() => setOpenMenu((current) => (current === 'theme' ? null : 'theme'))}
          >
            <ThemePreferenceIcon
              className="h-4 w-4"
              themePreference={themePreference}
            />
          </Button>

          {openMenu === 'theme' && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-border/70 bg-popover p-1.5 text-popover-foreground shadow-xl animate-fade-in"
            >
              <div className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t('topbar.theme')}
              </div>
              {themeOptions.map((option) => {
                const selected = option.value === themePreference

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    disabled={isPersistingPreference}
                    onClick={() => persistThemePreference(option.value)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60',
                      selected
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted/70',
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <ThemePreferenceIcon
                        className="h-4 w-4 shrink-0"
                        themePreference={option.value}
                      />
                      <span className="truncate">{t(option.labelKey)}</span>
                    </span>
                    {selected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {user && (
          <div className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={openMenu === 'user'}
              onClick={() => setOpenMenu((current) => (current === 'user' ? null : 'user'))}
              className={cn(
                'flex h-10 max-w-[220px] items-center gap-2 rounded-xl border border-border/70 bg-background/70 px-1.5 py-1 text-left shadow-sm transition-all hover:border-primary/25 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                openMenu === 'user' && 'border-primary/30 bg-primary/10',
              )}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-sm font-semibold leading-4 text-foreground">
                  {displayName}
                </span>
                <span className="mt-0.5 block truncate text-[11px] leading-3 text-muted-foreground">
                  {roleLabel}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  'hidden h-4 w-4 shrink-0 text-muted-foreground transition-transform sm:block',
                  openMenu === 'user' && 'rotate-180',
                )}
              />
            </button>

            {openMenu === 'user' && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-[320px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-border/70 bg-popover text-popover-foreground shadow-xl animate-fade-in"
              >
                <div className="border-b border-border/70 p-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11 rounded-xl">
                      <AvatarFallback className="rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {displayName}
                        </p>
                        <Badge
                          variant="outline"
                          className="shrink-0 border-primary/20 bg-primary/5 text-[11px] text-primary"
                        >
                          {roleLabel}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {tenantName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-border/70 p-2 sm:hidden">
                  <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-background px-2.5 py-2">
                    <Globe2 className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={language}
                      onValueChange={(value) => persistLanguage(value as SettingsLanguage)}
                      disabled={isPersistingPreference}
                    >
                      <SelectTrigger
                        aria-label={t('topbar.language')}
                        className="h-7 flex-1 border-0 bg-transparent px-0 text-xs shadow-none focus:ring-0 focus:ring-offset-0"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="end">
                        <SelectItem value="tr">{t('lang.tr')}</SelectItem>
                        <SelectItem value="en">{t('lang.en')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={openSettingsFromMenu}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    {t('common.settings')}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={signOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('topbar.signOut')}
                  </button>
                </div>

                <div className="border-t border-border/70 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
                  {t('topbar.currentTheme')}: {currentThemeLabel}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
