import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui'
import type { KBDocument } from '../types'
import { Loader2, Trash2 } from 'lucide-react'

interface DeleteDocumentDialogProps {
  document: KBDocument | null
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export function DeleteDocumentDialog({
  document,
  open,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteDocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Document
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-semibold text-foreground">{document?.name}</span>? 
            This action cannot be undone and will permanently remove the file and all associated vector embeddings.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex gap-2 sm:space-x-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Document'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
