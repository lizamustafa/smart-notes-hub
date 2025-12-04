import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RotateCcw, X, AlertTriangle } from 'lucide-react';
import { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TrashBinProps {
  notes: Note[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onEmptyTrash: () => void;
}

export const TrashBin = ({ notes, onRestore, onPermanentDelete, onEmptyTrash }: TrashBinProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  const formatDeleteDate = (dateString: string) => {
    const deleted = new Date(dateString);
    const expires = new Date(deleted.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Trash2 className="w-4 h-4 mr-2" />
            Trash
            {notes.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                {notes.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Trash</SheetTitle>
            <SheetDescription>
              Notes in trash are permanently deleted after 7 days
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {notes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Trash is empty</p>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmEmpty(true)}
                  >
                    Empty Trash
                  </Button>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {notes.map((note) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="p-4 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">
                              {note.title || 'Untitled'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {note.deleted_at && formatDeleteDate(note.deleted_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRestore(note.id)}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteNoteId(note.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirm empty trash dialog */}
      <AlertDialog open={confirmEmpty} onOpenChange={setConfirmEmpty}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Empty Trash?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {notes.length} note{notes.length !== 1 ? 's' : ''} in trash.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onEmptyTrash();
                setConfirmEmpty(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Empty Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete single note dialog */}
      <AlertDialog open={!!deleteNoteId} onOpenChange={() => setDeleteNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This note will be permanently deleted and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteNoteId) {
                  onPermanentDelete(deleteNoteId);
                  setDeleteNoteId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
