import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@/types'
import { getInitials } from '@/utils/format'
import { useI18n } from '@/i18n'
import { useAuth } from '@/features/auth/use-auth'
import {
  useSettings,
  useUpdateSettings,
} from '@/features/settings/hooks/useSettings'
import { useTheme } from '@/features/theme/use-theme'
import type {
  SettingsLanguage,
  SettingsResponse,
  SettingsTimezone,
  ThemePreference,
  UpdateSettingsRequest,
} from '@/features/settings/types'
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui'
import {
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Globe2,
  HelpCircle,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  MonitorSmartphone,
  Palette,
  Save,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

type SettingsCategory = 'profile' | 'account' | 'appearance' | 'notifications' | 'region' | 'security'

interface SettingsTriggerProps {
  active?: boolean
  onClick: () => void
}

interface SettingsPanelProps {
  open: boolean
  user: User | null
  onOpenChange: (open: boolean) => void
  onLogout: () => void
}

interface SettingsSectionProps {
  title: string
  description: string
  icon: LucideIcon
  children: ReactNode
}

interface SettingsFormBlockProps {
  title: string
  description: string
  children: ReactNode
}

interface SettingsSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  description: string
  disabled?: boolean
}

interface SettingsDraft {
  fullName: string
  email: string
  tenantName: string
  themePreference: ThemePreference
  language: SettingsLanguage
  timezone: SettingsTimezone
  emailNotifications: boolean
  appNotifications: boolean
}

const defaultDraft: SettingsDraft = {
  fullName: '',
  email: '',
  tenantName: '',
  themePreference: 'system',
  language: 'tr',
  timezone: 'Europe/Istanbul',
  emailNotifications: true,
  appNotifications: true,
}

function getDraftFromSettings(
  settings: SettingsResponse | undefined,
  user: User | null,
  fallbackLanguage: SettingsLanguage,
  fallbackThemePreference: ThemePreference,
): SettingsDraft {
  return {
    ...defaultDraft,
    fullName: settings?.profile.fullName || user?.fullName || user?.email || '',
    email: settings?.profile.email || user?.email || '',
    tenantName: settings?.profile.tenantName || user?.tenantName || '',
    themePreference:
      settings?.preferences.themePreference || fallbackThemePreference,
    language: settings?.preferences.language || fallbackLanguage,
    timezone: settings?.preferences.timezone || defaultDraft.timezone,
    emailNotifications:
      settings?.preferences.emailNotifications ??
      defaultDraft.emailNotifications,
    appNotifications:
      settings?.preferences.inAppNotifications ??
      defaultDraft.appNotifications,
  }
}

function toUpdatePayload(draft: SettingsDraft): UpdateSettingsRequest {
  return {
    fullName: draft.fullName.trim(),
    themePreference: draft.themePreference,
    language: draft.language,
    timezone: draft.timezone,
    emailNotifications: draft.emailNotifications,
    inAppNotifications: draft.appNotifications,
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function roleLabel(role: User['role'] | undefined, t: (key: string) => string) {
  if (role === 'ADMIN') return t('settings.roleAdmin')
  return t('settings.roleMember')
}

function SettingsSection({ title, description, icon: Icon, children }: SettingsSectionProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
      <div className="flex items-start gap-3 border-b border-border/70 bg-muted/20 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="divide-y divide-border/70">{children}</div>
    </section>
  )
}

function SettingsFormBlock({ title, description, children }: SettingsFormBlockProps) {
  return (
    <div className="grid gap-4 px-5 py-4 sm:grid-cols-[minmax(0,220px)_minmax(280px,560px)] sm:items-start sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function SettingsSwitch({ checked, onCheckedChange, label, description, disabled = false }: SettingsSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-lg border border-border/70 bg-background px-3 py-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border/70 disabled:hover:bg-background"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{description}</span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-muted-foreground/25'
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  )
}

export function SettingsTrigger({ active = false, onClick }: SettingsTriggerProps) {
  const { t } = useI18n()

  return (
    <button
      type="button"
      aria-expanded={active}
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        active
          ? 'border-primary/30 bg-primary/10 text-primary shadow-sm'
          : 'border-border/70 bg-background/70 text-sidebar-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-foreground'
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
          active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
        }`}
      >
        <Settings className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-5">{t('common.settings')}</span>
        <span className="block truncate text-[11px] leading-4 text-muted-foreground">
          {t('settings.triggerDescription')}
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}

export function SettingsPanel({ open, user, onOpenChange, onLogout }: SettingsPanelProps) {
  const { language, setLanguage, t } = useI18n()
  const { updateUser } = useAuth()
  const { themePreference, setThemePreference } = useTheme()
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('profile')
  const [draftOverrides, setDraftOverrides] = useState<Partial<SettingsDraft>>({})
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const settingsQuery = useSettings(open)
  const updateSettingsMutation = useUpdateSettings()

  const baseDraft = useMemo(
    () => getDraftFromSettings(settingsQuery.data, user, language, themePreference),
    [language, settingsQuery.data, themePreference, user],
  )
  const loadedLanguage = settingsQuery.data?.preferences.language
  const loadedThemePreference = settingsQuery.data?.preferences.themePreference

  useEffect(() => {
    if (
      !open ||
      !loadedLanguage ||
      draftOverrides.language !== undefined ||
      loadedLanguage === language
    ) {
      return
    }

    setLanguage(loadedLanguage)
  }, [draftOverrides.language, language, loadedLanguage, open, setLanguage])

  useEffect(() => {
    if (
      !open ||
      !loadedThemePreference ||
      draftOverrides.themePreference !== undefined ||
      loadedThemePreference === themePreference
    ) {
      return
    }

    setThemePreference(loadedThemePreference)
  }, [
    draftOverrides.themePreference,
    loadedThemePreference,
    open,
    setThemePreference,
    themePreference,
  ])

  const draft = useMemo(
    () => ({ ...baseDraft, ...draftOverrides }),
    [baseDraft, draftOverrides],
  )

  const settingsNav = useMemo<Array<{ id: SettingsCategory; label: string; icon: LucideIcon }>>(
    () => [
      { id: 'profile', label: t('settings.profile'), icon: CircleUserRound },
      { id: 'account', label: t('settings.account'), icon: Building2 },
      { id: 'appearance', label: t('settings.appearance'), icon: Palette },
      { id: 'notifications', label: t('settings.notifications'), icon: Bell },
      { id: 'region', label: t('settings.region'), icon: Globe2 },
      { id: 'security', label: t('settings.security'), icon: ShieldCheck },
    ],
    [t],
  )

  const updateDraft = <TKey extends keyof SettingsDraft>(key: TKey, value: SettingsDraft[TKey]) => {
    setDraftOverrides((current) => ({ ...current, [key]: value }))
    setSaved(false)
    setSaveError(null)
  }

  const handlePanelOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setDraftOverrides({})
      setSaved(false)
      setSaveError(null)
      if (settingsQuery.data?.preferences.themePreference) {
        setThemePreference(settingsQuery.data.preferences.themePreference)
      }
      updateSettingsMutation.reset()
    }

    onOpenChange(nextOpen)
  }

  const handleSave = async () => {
    if (updateSettingsMutation.isPending || settingsQuery.isLoading) return

    try {
      setSaveError(null)
      const settings = await updateSettingsMutation.mutateAsync(
        toUpdatePayload(draft),
      )

      updateUser({
        fullName: settings.profile.fullName,
        tenantName: settings.profile.tenantName,
      })
      setLanguage(settings.preferences.language)
      setThemePreference(settings.preferences.themePreference)
      setDraftOverrides({})
      setSaved(true)
    } catch (error) {
      setSaved(false)
      setSaveError(getErrorMessage(error, t('settings.saveFailed')))
    }
  }

  const displayName = draft.fullName || user?.email || t('settings.unknownUser')
  const tenantName = draft.tenantName || t('settings.noTenant')
  const role = roleLabel(user?.role, t)
  const isSettingsLoading = open && settingsQuery.isLoading
  const settingsError = settingsQuery.error
  const isSaving = updateSettingsMutation.isPending

  return (
    <Sheet open={open} onOpenChange={handlePanelOpenChange}>
      <SheetContent
        side="right"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-panel-title"
        className="inset-0 flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden border-0 bg-background p-0 sm:w-screen"
        onClose={() => handlePanelOpenChange(false)}
      >
        <SheetHeader className="border-b border-border/70 bg-card/95">
          <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-4 px-5 py-5 pr-12 sm:px-6 lg:px-8">
            <div className="space-y-1.5">
              <SheetTitle id="settings-panel-title" className="text-xl">
                {t('settings.title')}
              </SheetTitle>
              <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
            </div>
            <Badge variant="outline" className="hidden border-primary/20 bg-primary/5 text-primary sm:inline-flex">
              {t('settings.workspaceReady')}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-background">
          <div className="border-b border-border/70 bg-card/60">
            <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 rounded-lg border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <Avatar className="h-14 w-14 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-base font-semibold text-primary">
                    {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-semibold text-foreground">{displayName}</h2>
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                        {role}
                      </Badge>
                    </div>
                    <div className="mt-1.5 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{user?.email || t('settings.noEmail')}</span>
                      </span>
                      <span className="hidden h-3 w-px bg-border sm:block" />
                      <span className="flex min-w-0 items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{tenantName}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs sm:w-64">
                  <div className="rounded-md border border-border/70 bg-background px-3 py-2.5">
                    <p className="text-muted-foreground">{t('settings.accountState')}</p>
                    <p className="mt-1 font-semibold text-foreground">{t('settings.active')}</p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background px-3 py-2.5">
                    <p className="text-muted-foreground">{t('settings.tenant')}</p>
                    <p className="mt-1 truncate font-semibold text-foreground">{tenantName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
            <nav
              aria-label={t('settings.navigationLabel')}
              className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-6 lg:block lg:space-y-1.5 lg:overflow-visible lg:pb-0"
            >
              {settingsNav.map((item) => {
                const Icon = item.icon
                const isActive = activeCategory === item.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveCategory(item.id)}
                    className={`flex min-w-max items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:w-full ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
            </nav>

            <div className="max-w-4xl space-y-4">
              {(settingsError || saveError) && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {saveError ||
                    getErrorMessage(settingsError, t('settings.loadFailed'))}
                </div>
              )}

              {activeCategory === 'profile' && (
                <SettingsSection
                  title={t('settings.profile')}
                  description={t('settings.profileDescription')}
                  icon={CircleUserRound}
                >
                  <SettingsFormBlock title={t('settings.fullName')} description={t('settings.fullNameDescription')}>
                    <div className="space-y-2">
                      <Label htmlFor="settings-full-name" className="sr-only">
                        {t('settings.fullName')}
                      </Label>
                      <Input
                        id="settings-full-name"
                        value={draft.fullName}
                        onChange={(event) => updateDraft('fullName', event.target.value)}
                        placeholder={t('settings.fullNamePlaceholder')}
                        disabled={isSettingsLoading || isSaving}
                      />
                    </div>
                  </SettingsFormBlock>

                  <SettingsFormBlock title={t('settings.email')} description={t('settings.emailDescription')}>
                    <div className="space-y-2">
                      <Label htmlFor="settings-email" className="sr-only">
                        {t('settings.email')}
                      </Label>
                      <Input id="settings-email" value={draft.email} readOnly className="bg-muted/40" />
                    </div>
                  </SettingsFormBlock>
                </SettingsSection>
              )}

              {activeCategory === 'account' && (
                <SettingsSection
                  title={t('settings.account')}
                  description={t('settings.accountDescription')}
                  icon={Building2}
                >
                  <SettingsFormBlock title={t('settings.organization')} description={t('settings.organizationDescription')}>
                    <div className="space-y-2">
                      <Label htmlFor="settings-tenant" className="sr-only">
                        {t('settings.organization')}
                      </Label>
                      <Input
                        id="settings-tenant"
                        value={draft.tenantName}
                        placeholder={t('settings.organizationPlaceholder')}
                        readOnly
                        className="bg-muted/40"
                      />
                    </div>
                  </SettingsFormBlock>

                  <SettingsFormBlock title={t('settings.support')} description={t('settings.supportDescription')}>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button type="button" variant="outline" className="justify-start">
                        <HelpCircle className="h-4 w-4" />
                        {t('settings.openSupport')}
                      </Button>
                      <Button type="button" variant="outline" className="justify-start" disabled>
                        <Building2 className="h-4 w-4" />
                        {t('settings.billingPlaceholder')}
                      </Button>
                    </div>
                  </SettingsFormBlock>
                </SettingsSection>
              )}

              {activeCategory === 'appearance' && (
                <SettingsSection
                  title={t('settings.appearance')}
                  description={t('settings.appearanceDescription')}
                  icon={Palette}
                >
                  <SettingsFormBlock title={t('settings.theme')} description={t('settings.themeDescription')}>
                    <div className="space-y-2">
                      <Label htmlFor="settings-theme" className="sr-only">
                        {t('settings.theme')}
                      </Label>
                      <Select
                        value={draft.themePreference}
                        onValueChange={(value) => {
                          const nextThemePreference = value as ThemePreference
                          updateDraft('themePreference', nextThemePreference)
                          setThemePreference(nextThemePreference)
                        }}
                        disabled={isSettingsLoading || isSaving}
                      >
                        <SelectTrigger id="settings-theme">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">
                            <MonitorSmartphone className="mr-2 inline h-4 w-4" />
                            {t('settings.themeSystem')}
                          </SelectItem>
                          <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
                          <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </SettingsFormBlock>

                </SettingsSection>
              )}

              {activeCategory === 'notifications' && (
                <SettingsSection
                  title={t('settings.notifications')}
                  description={t('settings.notificationsDescription')}
                  icon={Bell}
                >
                  <SettingsFormBlock title={t('settings.delivery')} description={t('settings.deliveryDescription')}>
                    <div className="space-y-2">
                      <SettingsSwitch
                        checked={draft.emailNotifications}
                        onCheckedChange={(checked) => updateDraft('emailNotifications', checked)}
                        label={t('settings.emailNotifications')}
                        description={t('settings.emailNotificationsDescription')}
                        disabled={isSettingsLoading || isSaving}
                      />
                      <SettingsSwitch
                        checked={draft.appNotifications}
                        onCheckedChange={(checked) => updateDraft('appNotifications', checked)}
                        label={t('settings.appNotifications')}
                        description={t('settings.appNotificationsDescription')}
                        disabled={isSettingsLoading || isSaving}
                      />
                    </div>
                  </SettingsFormBlock>
                </SettingsSection>
              )}

              {activeCategory === 'region' && (
                <SettingsSection
                  title={t('settings.region')}
                  description={t('settings.regionDescription')}
                  icon={Globe2}
                >
                  <SettingsFormBlock title={t('settings.language')} description={t('settings.languageDescription')}>
                    <div className="space-y-2">
                      <Label htmlFor="settings-language" className="sr-only">
                        {t('settings.language')}
                      </Label>
                      <Select
                        value={draft.language}
                        onValueChange={(value) => updateDraft('language', value as SettingsLanguage)}
                        disabled={isSettingsLoading || isSaving}
                      >
                        <SelectTrigger id="settings-language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tr">{t('lang.tr')}</SelectItem>
                          <SelectItem value="en">{t('lang.en')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </SettingsFormBlock>

                  <SettingsFormBlock title={t('settings.timezone')} description={t('settings.timezoneDescription')}>
                    <div className="space-y-2">
                      <Label htmlFor="settings-timezone" className="sr-only">
                        {t('settings.timezone')}
                      </Label>
                      <Select
                        value={draft.timezone}
                        onValueChange={(value) => updateDraft('timezone', value as SettingsTimezone)}
                        disabled={isSettingsLoading || isSaving}
                      >
                        <SelectTrigger id="settings-timezone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Istanbul">
                            <Clock3 className="mr-2 inline h-4 w-4" />
                            Europe/Istanbul
                          </SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="Europe/London">Europe/London</SelectItem>
                          <SelectItem value="America/New_York">America/New_York</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </SettingsFormBlock>
                </SettingsSection>
              )}

              {activeCategory === 'security' && (
                <SettingsSection
                  title={t('settings.security')}
                  description={t('settings.securityDescription')}
                  icon={ShieldCheck}
                >
                  <SettingsFormBlock title={t('settings.password')} description={t('settings.passwordDescription')}>
                    <Button type="button" variant="outline" className="justify-start" disabled>
                      <KeyRound className="h-4 w-4" />
                      {t('settings.changePassword')}
                    </Button>
                  </SettingsFormBlock>

                  <SettingsFormBlock title={t('settings.sessions')} description={t('settings.sessionsDescription')}>
                    <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                      <div className="flex items-start gap-3">
                        <LockKeyhole className="mt-0.5 h-4 w-4 text-primary" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{t('settings.currentSession')}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{t('settings.currentSessionDescription')}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <Button type="button" variant="outline" onClick={onLogout}>
                          <LogOut className="h-4 w-4" />
                          {t('common.logout')}
                        </Button>
                        <Button type="button" variant="outline" disabled>
                          <ShieldCheck className="h-4 w-4" />
                          {t('settings.logoutAll')}
                        </Button>
                      </div>
                    </div>
                  </SettingsFormBlock>
                </SettingsSection>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border/70 bg-card/95">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {saved ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {t('settings.saved')}
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4" />
                  {isSettingsLoading ? t('settings.loading') : t('settings.futureReady')}
                </>
              )}
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => handlePanelOpenChange(false)}>
                {t('settings.close')}
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isSettingsLoading || isSaving}
              >
                <Save className="h-4 w-4" />
                {isSaving ? t('settings.saving') : t('settings.save')}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
