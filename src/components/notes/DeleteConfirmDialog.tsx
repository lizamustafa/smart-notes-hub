import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  noteTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmDialog = ({
  isOpen,
  noteTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete note?</AlertDialogTitle>
          <AlertDialogDescription>
            "{noteTitle || 'Untitled'}" will be moved to trash. You can restore it within 7 days.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface UndoToastProps {
  isVisible: boolean;
  noteTitle: string;
  onUndo: () => void;
  onExpire: () => void;
}

export const UndoToast = ({ isVisible, noteTitle, onUndo, onExpire }: UndoToastProps) => {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(10);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, onExpire]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="bg-foreground text-background px-4 py-3 rounded-xl shadow-xl flex items-center gap-4">
        <span className="text-sm">
          "{noteTitle || 'Note'}" deleted
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70">{timeLeft}s</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={onUndo}
            className="h-7"
          >
            <Undo2 className="w-3 h-3 mr-1" />
            Undo
          </Button>
        </div>
      </div>
    </div>
  );
};
