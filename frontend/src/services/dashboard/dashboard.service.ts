import apiClient from '@/services/api/client'
import { env } from '@/config/env'
import { taskService } from '@/features/tasks/services/tasks.service'
import { getCurrentTenantId, getCurrentUser, isTenantScopedRecord } from '@/utils/tenant'

export interface DashboardSummary {
  tenantId: string | null
  tenantName: string
  totalTasks: number
  totalDocuments: number
  totalConversations: number
}

const mockSummary: DashboardSummary = {
  tenantId: 'tenant_demo_001',
  tenantName: 'Demo Organization',
  totalTasks: 8,
  totalDocuments: 12,
  totalConversations: 45,
}

interface DashboardDocumentApi {
  id: string
  tenantId?: string
}

interface DashboardConversationApi {
  id: string
  tenantId?: string
}

class RealDashboardService {
  async getSummary(): Promise<DashboardSummary> {
    const currentUser = getCurrentUser()
    const tenantId = getCurrentTenantId()

    const [taskStats, documentsResult, conversationsResult] = await Promise.allSettled([
      taskService.getTaskStats(),
      apiClient.get<DashboardDocumentApi[]>('/knowledge-base'),
      apiClient.get<DashboardConversationApi[]>('/chat'),
    ])

    const totalTasks = taskStats.status === 'fulfilled' ? taskStats.value.total : 0
    const totalDocuments = documentsResult.status === 'fulfilled'
      ? documentsResult.value.data.filter((doc) => isTenantScopedRecord(doc.tenantId, tenantId)).length
      : 0
    const totalConversations = conversationsResult.status === 'fulfilled'
      ? conversationsResult.value.data.filter((conv) => isTenantScopedRecord(conv.tenantId, tenantId)).length
      : 0

    return {
      tenantId,
      tenantName: currentUser?.tenantName || 'Organization',
      totalTasks: Number.isFinite(totalTasks) ? totalTasks : 0,
      totalDocuments: Number.isFinite(totalDocuments) ? totalDocuments : 0,
      totalConversations: Number.isFinite(totalConversations) ? totalConversations : 0,
    }
  }
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    if (env.enableMockApi) return mockSummary
    return new RealDashboardService().getSummary()
  },
}
