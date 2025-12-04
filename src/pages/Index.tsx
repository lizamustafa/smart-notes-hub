import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pin } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { Note, FilterState, SortOption } from '@/types/note';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { SearchBar } from '@/components/notes/SearchBar';
import { FilterPanel } from '@/components/notes/FilterPanel';
import { TrashBin } from '@/components/notes/TrashBin';
import { ExportImport } from '@/components/notes/ExportImport';
import { DeleteConfirmDialog, UndoToast } from '@/components/notes/DeleteConfirmDialog';
import { EmptyState } from '@/components/notes/EmptyState';
import { Button } from '@/components/ui/button';

const initialFilter: FilterState = {
  search: '',
  category: 'all',
  color: 'all',
  priority: 'all',
  pinnedOnly: false,
  favoritesOnly: false,
};

const Index = () => {
  const {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    permanentlyDeleteNote,
    restoreNote,
    togglePin,
    toggleFavorite,
    restoreVersion,
    importNotes,
    getTrashNotes,
    emptyTrash,
    filterAndSortNotes,
  } = useNotes();

  const [filter, setFilter] = useState<FilterState>(initialFilter);
  const [sort, setSort] = useState<SortOption>('newest');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isNewNote, setIsNewNote] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; note: Note | null }>({
    isOpen: false,
    note: null,
  });
  const [undoState, setUndoState] = useState<{ isVisible: boolean; note: Note | null }>({
    isVisible: false,
    note: null,
  });

  // Get filtered and sorted notes
  const filteredNotes = useMemo(() => filterAndSortNotes(filter, sort), [filter, sort, filterAndSortNotes]);
  
  // Separate pinned notes
  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.pinned), [filteredNotes]);
  const unpinnedNotes = useMemo(() => filteredNotes.filter((n) => !n.pinned), [filteredNotes]);
  const trashNotes = getTrashNotes();
  const activeNotes = notes.filter((n) => !n.deleted_at);

  const hasActiveFilters =
    filter.search ||
    filter.category !== 'all' ||
    filter.color !== 'all' ||
    filter.priority !== 'all' ||
    filter.pinnedOnly ||
    filter.favoritesOnly;

  const handleFilterChange = useCallback((updates: Partial<FilterState>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleCreateNote = useCallback(() => {
    setSelectedNote(null);
    setIsNewNote(true);
    setIsEditorOpen(true);
  }, []);

  const handleEditNote = useCallback((note: Note) => {
    setSelectedNote(note);
    setIsNewNote(false);
    setIsEditorOpen(true);
  }, []);

  const handleSaveNote = useCallback(
    (updates: Partial<Note>) => {
      if (isNewNote) {
        const newNote = createNote(
          updates.title || '',
          updates.description || '',
          updates.category || 'Personal',
          updates.color || 'yellow',
          updates.priority || 'medium'
        );
        setSelectedNote(newNote);
        setIsNewNote(false);
      } else if (selectedNote) {
        updateNote(selectedNote.id, updates);
        // Update the selected note reference
        setSelectedNote((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [isNewNote, selectedNote, createNote, updateNote]
  );

  const handleDeleteNote = useCallback((note: Note) => {
    setDeleteConfirm({ isOpen: true, note });
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm.note) {
      deleteNote(deleteConfirm.note.id);
      setUndoState({ isVisible: true, note: deleteConfirm.note });
      setDeleteConfirm({ isOpen: false, note: null });
      if (selectedNote?.id === deleteConfirm.note.id) {
        setIsEditorOpen(false);
        setSelectedNote(null);
      }
    }
  }, [deleteConfirm.note, deleteNote, selectedNote]);

  const handleUndo = useCallback(() => {
    if (undoState.note) {
      restoreNote(undoState.note.id);
      setUndoState({ isVisible: false, note: null });
    }
  }, [undoState.note, restoreNote]);

  const handleRestoreVersion = useCallback(
    (versionId: string) => {
      if (selectedNote) {
        restoreVersion(selectedNote.id, versionId);
      }
    },
    [selectedNote, restoreVersion]
  );

  const clearFilters = useCallback(() => {
    setFilter(initialFilter);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-foreground">Notes</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <ExportImport notes={activeNotes} onImport={importNotes} />
              <TrashBin
                notes={trashNotes}
                onRestore={restoreNote}
                onPermanentDelete={permanentlyDeleteNote}
                onEmptyTrash={emptyTrash}
              />
              <Button onClick={handleCreateNote} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Note
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchBar
              value={filter.search}
              onChange={(search) => handleFilterChange({ search })}
              className="flex-1"
            />
          </div>
          <div className="mt-4 overflow-x-auto pb-2">
            <FilterPanel
              filter={filter}
              sort={sort}
              onFilterChange={handleFilterChange}
              onSortChange={setSort}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        {filteredNotes.length === 0 ? (
          <EmptyState
            hasFilters={!!hasActiveFilters}
            onCreateNote={handleCreateNote}
            onClearFilters={clearFilters}
          />
        ) : (
          <div className="space-y-8">
            {/* Pinned Notes Section */}
            {pinnedNotes.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Pin className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Pinned
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onClick={() => handleEditNote(note)}
                        onPin={() => togglePin(note.id)}
                        onFavorite={() => toggleFavorite(note.id)}
                        onDelete={() => handleDeleteNote(note)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {/* All Notes Section */}
            {unpinnedNotes.length > 0 && (
              <section>
                {pinnedNotes.length > 0 && (
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                    All Notes
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {unpinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onClick={() => handleEditNote(note)}
                        onPin={() => togglePin(note.id)}
                        onFavorite={() => toggleFavorite(note.id)}
                        onDelete={() => handleDeleteNote(note)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Note Editor */}
      <NoteEditor
        note={selectedNote}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveNote}
        onRestoreVersion={handleRestoreVersion}
        isNew={isNewNote}
      />

      {/* Delete confirmation */}
      <DeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        noteTitle={deleteConfirm.note?.title || ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, note: null })}
      />

      {/* Undo toast */}
      <UndoToast
        isVisible={undoState.isVisible}
        noteTitle={undoState.note?.title || ''}
        onUndo={handleUndo}
        onExpire={() => setUndoState({ isVisible: false, note: null })}
      />
    </div>
  );
};

export default Index;
