import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type Language = 'en' | 'tr'

type Dictionary = Record<string, { en: string; tr: string }>

const STORAGE_KEY = 'aivora_language'

const dictionary: Dictionary = {
  'nav.dashboard': { en: 'Dashboard', tr: 'Panel' },
  'nav.tasks': { en: 'PRD Tracker', tr: 'PRD Takip' },
  'nav.knowledge': { en: 'Knowledge Base', tr: 'Bilgi Tabanı' },
  'nav.chat': { en: 'Chat', tr: 'Sohbet' },
  'layout.aiChat': { en: 'AI Chat', tr: 'Yapay Zeka Sohbeti' },
  'common.settings': { en: 'Settings', tr: 'Ayarlar' },
  'common.logout': { en: 'Logout', tr: 'Çıkış' },
  'common.refresh': { en: 'Refresh', tr: 'Yenile' },
  'common.filters': { en: 'Filters', tr: 'Filtreler' },
  'common.retry': { en: 'Retry', tr: 'Tekrar Dene' },
  'common.clearFilters': { en: 'Clear Filters', tr: 'Filtreleri Temizle' },
  'topbar.profileSettings': { en: 'Profile Settings', tr: 'Profil Ayarları' },
  'topbar.signOut': { en: 'Sign out', tr: 'Çıkış Yap' },
  'topbar.language': { en: 'Language', tr: 'Dil' },
  'lang.en': { en: 'English', tr: 'İngilizce' },
  'lang.tr': { en: 'Turkish', tr: 'Türkçe' },
  'dashboard.welcome': { en: 'Welcome back', tr: 'Tekrar hoş geldin' },
  'dashboard.overview': { en: "Here's an overview of your AI platform activity.", tr: 'AI platform aktivitenizin genel özeti.' },
  'dashboard.organization': { en: 'Your Organization', tr: 'Organizasyonunuz' },
  'dashboard.administrator': { en: 'Administrator', tr: 'Yönetici' },
  'dashboard.member': { en: 'Member', tr: 'Üye' },
  'dashboard.tenantId': { en: 'Tenant ID', tr: 'Tenant ID' },
  'dashboard.totalTasks': { en: 'Total Tasks', tr: 'Toplam Görev' },
  'dashboard.allPrdTasks': { en: 'All PRD tasks', tr: 'Tüm PRD görevleri' },
  'dashboard.activeTasks': { en: 'Active Tasks', tr: 'Aktif Görevler' },
  'dashboard.activeDesc': { en: 'Todo, In Progress, Blocked, Review', tr: 'Yapılacak, Devam Eden, Bloklu, İnceleme' },
  'dashboard.completedTasks': { en: 'Completed Tasks', tr: 'Tamamlanan Görevler' },
  'dashboard.completedDesc': { en: 'Successfully completed', tr: 'Başarıyla tamamlandı' },
  'dashboard.blockedTasks': { en: 'Blocked Tasks', tr: 'Bloklu Görevler' },
  'dashboard.blockedDesc': { en: 'Need attention', tr: 'Dikkat gerekli' },
  'dashboard.taskBreakdown': { en: 'Task Status Breakdown', tr: 'Görev Durum Dağılımı' },
  'dashboard.failedStats': { en: 'Failed to load task statistics', tr: 'Görev istatistikleri yüklenemedi' },
  'dashboard.documents': { en: 'Documents', tr: 'Dokümanlar' },
  'dashboard.inKnowledgeBase': { en: 'In knowledge base', tr: 'Bilgi tabanında' },
  'dashboard.aiConversations': { en: 'AI Conversations', tr: 'AI Konuşmaları' },
  'dashboard.totalChatSessions': { en: 'Total chat sessions', tr: 'Toplam sohbet oturumu' },
  'dashboard.quickActions': { en: 'Quick Actions', tr: 'Hızlı Aksiyonlar' },
  'dashboard.manageTasks': { en: 'Manage Tasks', tr: 'Görevleri Yönet' },
  'dashboard.uploadDocument': { en: 'Upload Document', tr: 'Doküman Yükle' },
  'dashboard.startChat': { en: 'Start AI Chat', tr: 'AI Sohbet Başlat' },
  'dashboard.tasksByPriority': { en: 'Tasks by Priority', tr: 'Önceliğe Göre Görevler' },
  'tasks.title': { en: 'PRD Tracker', tr: 'PRD Takip' },
  'tasks.subtitle': { en: 'Manage and track product requirements and development tasks', tr: 'Ürün gereksinimlerini ve geliştirme görevlerini yönetin' },
  'tasks.newTask': { en: 'New Task', tr: 'Yeni Görev' },
  'tasks.totalTasks': { en: 'Total Tasks', tr: 'Toplam Görev' },
  'tasks.todo': { en: 'To Do', tr: 'Yapılacak' },
  'tasks.inProgress': { en: 'In Progress', tr: 'Devam Ediyor' },
  'tasks.blocked': { en: 'Blocked', tr: 'Bloklu' },
  'tasks.review': { en: 'Review', tr: 'İnceleme' },
  'tasks.done': { en: 'Done', tr: 'Tamamlandı' },
  'tasks.search': { en: 'Search tasks...', tr: 'Görev ara...' },
  'tasks.allStatus': { en: 'All Status', tr: 'Tüm Durumlar' },
  'tasks.allPriority': { en: 'All Priority', tr: 'Tüm Öncelikler' },
  'tasks.updated': { en: 'Updated', tr: 'Güncellendi' },
  'tasks.created': { en: 'Created', tr: 'Oluşturuldu' },
  'tasks.titleCol': { en: 'Title', tr: 'Başlık' },
  'tasks.priorityCol': { en: 'Priority', tr: 'Öncelik' },
  'tasks.statusCol': { en: 'Status', tr: 'Durum' },
  'tasks.advanced': { en: 'Advanced', tr: 'Gelişmiş' },
  'tasks.advancedFilters': { en: 'Advanced Filters', tr: 'Gelişmiş Filtreler' },
  'tasks.module': { en: 'Module', tr: 'Modül' },
  'tasks.allModules': { en: 'All Modules', tr: 'Tüm Modüller' },
  'tasks.assignee': { en: 'Assignee', tr: 'Atanan' },
  'tasks.allAssignees': { en: 'All Assignees', tr: 'Tüm Atananlar' },
  'tasks.unassigned': { en: 'Unassigned', tr: 'Atanmamış' },
  'tasks.filtersLabel': { en: 'Filters:', tr: 'Filtreler:' },
  'tasks.searchLabel': { en: 'Search', tr: 'Arama' },
  'tasks.statusLabel': { en: 'Status', tr: 'Durum' },
  'tasks.priorityLabel': { en: 'Priority', tr: 'Öncelik' },
  'tasks.moduleLabel': { en: 'Module', tr: 'Modül' },
  'tasks.noTasks': { en: 'No tasks found', tr: 'Görev bulunamadı' },
  'tasks.noTasksDesc': { en: 'Try adjusting your filters or create a new task to get started.', tr: 'Filtreleri değiştirin veya başlamak için yeni görev oluşturun.' },
  'tasks.task': { en: 'Task', tr: 'Görev' },
  'tasks.more': { en: 'more', tr: 'daha fazla' },
  'tasks.less': { en: 'less', tr: 'daha az' },
  'tasks.actions': { en: 'Actions', tr: 'İşlemler' },
  'tasks.total': { en: 'total', tr: 'toplam' },
  'tasks.low': { en: 'Low', tr: 'Düşük' },
  'tasks.medium': { en: 'Medium', tr: 'Orta' },
  'tasks.high': { en: 'High', tr: 'Yüksek' },
  'tasks.urgent': { en: 'Urgent', tr: 'Acil' },
  'tasks.auth': { en: 'Authentication', tr: 'Kimlik Doğrulama' },
  'tasks.rag': { en: 'RAG Pipeline', tr: 'RAG Hattı' },
  'tasks.chatModule': { en: 'Chat System', tr: 'Sohbet Sistemi' },
  'tasks.kbModule': { en: 'Knowledge Base', tr: 'Bilgi Tabanı' },
  'tasks.dashboardModule': { en: 'Dashboard', tr: 'Panel' },
  'tasks.infrastructure': { en: 'Infrastructure', tr: 'Altyapı' },
  'tasks.selected': { en: 'selected', tr: 'seçili' },
  'tasks.clear': { en: 'Clear', tr: 'Temizle' },
  'tasks.export': { en: 'Export', tr: 'Dışa Aktar' },
  'tasks.resetFilters': { en: 'Reset filters', tr: 'Filtreleri sıfırla' },
  'tasks.failedToLoad': { en: 'Failed to load tasks', tr: 'Görevler yüklenemedi' },
  'tasks.tryAgain': { en: 'Try again', tr: 'Tekrar dene' },
  'tasks.pageOf': { en: 'Page {current} of {total}', tr: '{total} sayfanın {current}. sayfası' },
  'tasks.previous': { en: 'Previous', tr: 'Önceki' },
  'tasks.next': { en: 'Next', tr: 'Sonraki' },
  'kb.title': { en: 'Knowledge Base', tr: 'Bilgi Tabanı' },
  'kb.subtitle': { en: "Manage your organization's documents and RAG vector embeddings", tr: 'Organizasyon dokümanlarını ve RAG vektör embeddinglerini yönetin' },
  'kb.readyOf': { en: 'ready of', tr: 'hazır /' },
  'kb.documents': { en: 'documents', tr: 'doküman' },
  'kb.documentsTitle': { en: 'Documents', tr: 'Dokümanlar' },
  'kb.documentsDesc': { en: 'Browse and manage uploaded files and their embedding status', tr: 'Yüklenen dosyaları ve embedding durumlarını yönetin' },
  'kb.failed': { en: 'Failed to load documents', tr: 'Dokümanlar yüklenemedi' },
  'kb.failedDesc': { en: 'There was an error communicating with the server. Please check your connection and try again.', tr: 'Sunucu iletişiminde hata oluştu. Bağlantınızı kontrol edip tekrar deneyin.' },
  'kb.empty': { en: 'No documents found', tr: 'Doküman bulunamadı' },
  'kb.emptyWithFilter': { en: "We couldn't find any documents matching your current filters. Try adjusting your search criteria.", tr: 'Mevcut filtrelere uyan doküman bulunamadı. Arama kriterlerini güncellemeyi deneyin.' },
  'kb.emptyWithoutFilter': { en: "You haven't uploaded any documents yet. Drag and drop a file above to get started.", tr: 'Henüz doküman yüklemediniz. Başlamak için yukarıdan dosya sürükleyip bırakın.' },
  'kb.search': { en: 'Search documents by name, uploader, or tenant...', tr: 'İsim, yükleyen veya tenant ile doküman ara...' },
  'kb.allStatuses': { en: 'All Statuses', tr: 'Tüm Durumlar' },
  'kb.allTypes': { en: 'All Types', tr: 'Tüm Türler' },
  'kb.status': { en: 'Status', tr: 'Durum' },
  'kb.fileType': { en: 'File Type', tr: 'Dosya Türü' },
  'kb.uploadDrop': { en: 'Click to drop files or drag here', tr: 'Dosyaları bırakmak için tıkla veya sürükle' },
  'kb.supportedFormats': { en: 'Supported formats', tr: 'Desteklenen formatlar' },
  'kb.unsupportedRejected': { en: '{count} unsupported file{suffix} rejected', tr: '{count} desteklenmeyen dosya reddedildi' },
  'kb.uploadingTitle': { en: 'Uploading documents...', tr: 'Dokümanlar yükleniyor...' },
  'kb.uploadingDesc': { en: 'Please wait while we process your files', tr: 'Dosyalar işlenirken lütfen bekleyin' },
  'kb.filesSelected': { en: '{count} file{suffix} selected', tr: '{count} dosya seçildi' },
  'kb.clearAll': { en: 'Clear All', tr: 'Tümünü Temizle' },
  'kb.uploadFiles': { en: 'Upload Files', tr: 'Dosyaları Yükle' },
  'kb.addMoreFiles': { en: '+ Add more files', tr: '+ Daha fazla dosya ekle' },
  'kb.targetFile': { en: 'TargetFile', tr: 'Hedef Dosya' },
  'kb.size': { en: 'Size', tr: 'Boyut' },
  'kb.uploaded': { en: 'Uploaded', tr: 'Yüklenme' },
  'kb.vectorData': { en: 'Vector Data', tr: 'Vektör Verisi' },
  'kb.actions': { en: 'Actions', tr: 'İşlemler' },
  'kb.chunks': { en: 'chunks', tr: 'parça' },
  'kb.deleteDocument': { en: 'Delete document', tr: 'Dokümanı sil' },
  'doc.uploading': { en: 'Uploading', tr: 'Yükleniyor' },
  'doc.processing': { en: 'Processing', tr: 'İşleniyor' },
  'doc.ready': { en: 'Ready', tr: 'Hazır' },
  'doc.error': { en: 'Error', tr: 'Hata' },
  'doc.archived': { en: 'Archived', tr: 'Arşivlendi' },
  'doc.pending': { en: 'Pending', tr: 'Beklemede' },
  'doc.inProgress': { en: 'In Progress', tr: 'Devam Ediyor' },
  'doc.completed': { en: 'Completed', tr: 'Tamamlandı' },
  'doc.failed': { en: 'Failed', tr: 'Başarısız' },
}

interface I18nContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`,
  )
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'tr' ? 'tr' : 'en'
  })

  const setLanguage = (next: Language) => {
    setLanguageState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, vars) => {
        const entry = dictionary[key]
        const text = entry ? entry[language] : key
        return interpolate(text, vars)
      },
    }),
    [language],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
