import { memo } from 'react';
import { motion } from 'framer-motion';
import { Pin, Star, Trash2, Clock } from 'lucide-react';
import { Note } from '@/types/note';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onPin: () => void;
  onFavorite: () => void;
  onDelete: () => void;
}

const colorClasses: Record<string, string> = {
  yellow: 'note-card-yellow',
  blue: 'note-card-blue',
  green: 'note-card-green',
  pink: 'note-card-pink',
  purple: 'note-card-purple',
};

const priorityConfig = {
  low: { label: 'Low', className: 'bg-priority-low/20 text-priority-low border-priority-low/30' },
  medium: { label: 'Medium', className: 'bg-priority-medium/20 text-priority-medium border-priority-medium/30' },
  high: { label: 'High', className: 'bg-priority-high/20 text-priority-high border-priority-high/30' },
};

const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export const NoteCard = memo(({ note, onClick, onPin, onFavorite, onDelete }: NoteCardProps) => {
  const plainDescription = stripHtml(note.description);
  const preview = plainDescription.length > 150 
    ? plainDescription.substring(0, 150) + '...' 
    : plainDescription;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn('note-card cursor-pointer group', colorClasses[note.color])}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
            {note.title || 'Untitled Note'}
          </h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
              className={cn(
                'p-1.5 rounded-lg hover:bg-foreground/10 transition-colors',
                note.pinned && 'text-primary'
              )}
            >
              <Pin className="w-4 h-4" fill={note.pinned ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavorite();
              }}
              className={cn(
                'p-1.5 rounded-lg hover:bg-foreground/10 transition-colors',
                note.favorite && 'text-accent'
              )}
            >
              <Star className="w-4 h-4" fill={note.favorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <p className="text-sm text-foreground/70 line-clamp-3 mb-3">
            {preview}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-medium">
              {note.category}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn('text-xs font-medium', priorityConfig[note.priority].className)}
            >
              {priorityConfig[note.priority].label}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatDate(note.updated_at)}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

NoteCard.displayName = 'NoteCard';
