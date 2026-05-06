import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard/dashboard.service'
import { appQueryKeys } from '@/lib/query-keys'
import { useAuth } from '@/features/auth/use-auth'

export const useDashboardSummary = () => {
  const { user } = useAuth()
  const tenantScope = user?.tenantId || 'anonymous'

  return useQuery({
    queryKey: [...appQueryKeys.dashboard.summary(), tenantScope],
    queryFn: () => dashboardService.getSummary(),
    staleTime: 1000 * 60 * 2,
  })
}
