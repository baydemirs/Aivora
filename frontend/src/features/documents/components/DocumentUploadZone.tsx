import { useState, useRef } from 'react'
import { Upload, X, File as FileIcon, Loader2 } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import { ACCEPTED_FILE_EXTENSIONS, ACCEPTED_FILE_TYPES_DISPLAY, formatFileSize, getFileTypeFromExtension, FILE_TYPE_CONFIG } from '../types'

interface DocumentUploadZoneProps {
  onUpload: (files: File[]) => void
  isUploading?: boolean
}

export function DocumentUploadZone({ onUpload, isUploading = false }: DocumentUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!isUploading) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (isUploading) return

    const files = Array.from(e.dataTransfer.files).filter(file => {
      const ext = `.${file.name.split('.').pop()?.toLowerCase()}`
      return ACCEPTED_FILE_EXTENSIONS.includes(ext)
    })

    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...files])
    }
    // Reset input so same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUploadClick = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles)
      setSelectedFiles([])
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && selectedFiles.length === 0 && fileInputRef.current?.click()}
          className={`
            relative p-8 text-center transition-all duration-200 border-2 border-dashed mx-4 mt-4 mb-4 rounded-xl
            ${isUploading ? 'opacity-70 cursor-not-allowed bg-muted/30 border-muted' : 
              selectedFiles.length > 0 ? 'border-primary/50 bg-primary/5' :
              isDragging ? 'border-primary bg-primary/10 scale-[0.99]' : 
              'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30 cursor-pointer'}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_FILE_EXTENSIONS}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          {!isUploading && selectedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                <Upload className="h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">
                  Click to drop files or drag here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supported formats: {ACCEPTED_FILE_TYPES_DISPLAY}
                </p>
              </div>
            </div>
          ) : isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div className="space-y-1">
                <p className="text-lg font-semibold tracking-tight">Uploading documents...</p>
                <p className="text-sm text-muted-foreground">Please wait while we process your files</p>
              </div>
            </div>
          ) : (
            <div className="w-full text-left" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{selectedFiles.length} file{selectedFiles.length !== 1 && 's'} selected</h3>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedFiles([])}
                  >
                    Clear All
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleUploadClick}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Files
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2 pb-2">
                {selectedFiles.map((file, i) => {
                  const type = getFileTypeFromExtension(file.name)
                  const typeConfig = type ? FILE_TYPE_CONFIG[type] : null
                  
                  return (
                    <div key={`${file.name}-${i}`} className="flex items-center justify-between p-3 rounded-lg border bg-background shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded-md shrink-0 ${typeConfig?.bgColor || 'bg-muted'}`}>
                          <FileIcon className={`h-4 w-4 ${typeConfig?.iconColor || 'text-muted-foreground'}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeFile(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-4 flex justify-center border-t pt-4">
                 <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-muted-foreground"
                >
                  + Add more files
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
