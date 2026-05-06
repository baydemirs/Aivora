import type { User } from '@/types'
import { storage } from '@/utils/storage'

export const getCurrentUser = (): User | null => storage.getUser<User>()

export const getCurrentTenantId = (): string | null => {
  const tenantId = getCurrentUser()?.tenantId
  return typeof tenantId === 'string' && tenantId.trim().length > 0 ? tenantId : null
}

export const isTenantScopedRecord = (
  recordTenantId: string | null | undefined,
  expectedTenantId: string | null,
): boolean => {
  if (!expectedTenantId) return true
  if (!recordTenantId || recordTenantId.trim().length === 0) return false
  return recordTenantId === expectedTenantId
}
