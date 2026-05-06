import { Search } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import {
  DocumentStatus,
  DOCUMENT_STATUS_CONFIG,
  DocumentFileType,
  FILE_TYPE_CONFIG,
} from '../types'
import type { DocumentFilters as IDocumentFilters } from '../types'
import { useI18n } from '@/i18n'

interface DocumentFiltersProps {
  filters: IDocumentFilters
  onFilterChange: (filters: Partial<IDocumentFilters>) => void
  disabled?: boolean
}

export function DocumentFilters({ filters, onFilterChange, disabled }: DocumentFiltersProps) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={t('kb.search')}
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          disabled={disabled}
          className="w-full rounded-md border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(val) =>
            onFilterChange({ status: val === 'all' ? undefined : (val as DocumentStatus) })
          }
          disabled={disabled}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('kb.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t('kb.allStatuses')}</SelectItem>
              {Object.entries(DOCUMENT_STATUS_CONFIG).map(([status, config]) => (
                <SelectItem key={status} value={status}>
                  {{
                    Uploading: t('doc.uploading'),
                    Processing: t('doc.processing'),
                    Ready: t('doc.ready'),
                    Error: t('doc.error'),
                    Archived: t('doc.archived'),
                  }[config.label] || config.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* File Type Filter */}
        <Select
          value={filters.fileType || 'all'}
          onValueChange={(val) =>
            onFilterChange({ fileType: val === 'all' ? undefined : (val as DocumentFileType) })
          }
          disabled={disabled}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t('kb.fileType')} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t('kb.allTypes')}</SelectItem>
              {Object.entries(FILE_TYPE_CONFIG).map(([type, config]) => (
                <SelectItem key={type} value={type}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
