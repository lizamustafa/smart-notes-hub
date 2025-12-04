import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  hasFilters: boolean;
  onCreateNote: () => void;
  onClearFilters: () => void;
}

export const EmptyState = ({ hasFilters, onCreateNote, onClearFilters }: EmptyStateProps) => {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No notes found</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        <Button variant="outline" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">Start taking notes</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Create your first note to organize your thoughts, ideas, and tasks.
      </p>
      <Button onClick={onCreateNote} size="lg" className="gap-2">
        <Plus className="w-5 h-5" />
        Create your first note
      </Button>
    </div>
  );
};
