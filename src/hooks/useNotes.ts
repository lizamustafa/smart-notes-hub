import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Note, NoteVersion, NoteColor, NoteCategory, NotePriority, FilterState, SortOption } from '@/types/note';

const STORAGE_KEY = 'notes-app-data';
const TRASH_EXPIRY_DAYS = 7;

const loadNotesFromStorage = (): Note[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load notes:', error);
  }
  return [];
};

const saveNotesToStorage = (notes: Note[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save notes:', error);
  }
};

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes on mount
  useEffect(() => {
    const loaded = loadNotesFromStorage();
    // Clean up expired trash items
    const now = new Date();
    const cleaned = loaded.filter((note) => {
      if (note.deleted_at) {
        const deletedDate = new Date(note.deleted_at);
        const daysSinceDeleted = (now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceDeleted < TRASH_EXPIRY_DAYS;
      }
      return true;
    });
    setNotes(cleaned);
    setIsLoading(false);
  }, []);

  // Save notes whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveNotesToStorage(notes);
    }
  }, [notes, isLoading]);

  const createNote = useCallback((
    title: string,
    description: string,
    category: NoteCategory,
    color: NoteColor,
    priority: NotePriority
  ): Note => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: uuidv4(),
      title,
      description,
      category,
      color,
      priority,
      pinned: false,
      favorite: false,
      created_at: now,
      updated_at: now,
      deleted_at: null,
      version_history: [],
    };
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  }, []);

  const updateNote = useCallback((
    id: string,
    updates: Partial<Omit<Note, 'id' | 'created_at' | 'version_history'>>
  ) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id !== id) return note;

        // Create version if title or description changed
        const newVersionHistory = [...note.version_history];
        if (updates.title !== undefined || updates.description !== undefined) {
          const version: NoteVersion = {
            id: uuidv4(),
            title: note.title,
            description: note.description,
            timestamp: note.updated_at,
          };
          newVersionHistory.unshift(version);
          // Keep only last 3 versions
          if (newVersionHistory.length > 3) {
            newVersionHistory.pop();
          }
        }

        return {
          ...note,
          ...updates,
          updated_at: new Date().toISOString(),
          version_history: newVersionHistory,
        };
      })
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, deleted_at: new Date().toISOString() }
          : note
      )
    );
  }, []);

  const permanentlyDeleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  const restoreNote = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, deleted_at: null } : note
      )
    );
  }, []);

  const togglePin = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, pinned: !note.pinned, updated_at: new Date().toISOString() }
          : note
      )
    );
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, favorite: !note.favorite, updated_at: new Date().toISOString() }
          : note
      )
    );
  }, []);

  const restoreVersion = useCallback((noteId: string, versionId: string) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id !== noteId) return note;
        const version = note.version_history.find((v) => v.id === versionId);
        if (!version) return note;

        // Save current as new version
        const currentVersion: NoteVersion = {
          id: uuidv4(),
          title: note.title,
          description: note.description,
          timestamp: note.updated_at,
        };

        const newHistory = [currentVersion, ...note.version_history.filter((v) => v.id !== versionId)];
        if (newHistory.length > 3) {
          newHistory.pop();
        }

        return {
          ...note,
          title: version.title,
          description: version.description,
          updated_at: new Date().toISOString(),
          version_history: newHistory,
        };
      })
    );
  }, []);

  const importNotes = useCallback((importedNotes: Note[]) => {
    setNotes((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const newNotes = importedNotes.filter((n) => !existingIds.has(n.id));
      const updatedNotes = importedNotes.filter((n) => existingIds.has(n.id));
      
      // Merge: update existing, add new
      const merged = prev.map((existing) => {
        const updated = updatedNotes.find((n) => n.id === existing.id);
        return updated || existing;
      });
      
      return [...newNotes, ...merged];
    });
  }, []);

  const getActiveNotes = useCallback(() => {
    return notes.filter((note) => !note.deleted_at);
  }, [notes]);

  const getTrashNotes = useCallback(() => {
    return notes.filter((note) => note.deleted_at);
  }, [notes]);

  const emptyTrash = useCallback(() => {
    setNotes((prev) => prev.filter((note) => !note.deleted_at));
  }, []);

  const filterAndSortNotes = useCallback(
    (filter: FilterState, sort: SortOption) => {
      let filtered = getActiveNotes();

      // Apply filters
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filtered = filtered.filter(
          (note) =>
            note.title.toLowerCase().includes(searchLower) ||
            note.description.toLowerCase().includes(searchLower) ||
            note.category.toLowerCase().includes(searchLower)
        );
      }

      if (filter.category !== 'all') {
        filtered = filtered.filter((note) => note.category === filter.category);
      }

      if (filter.color !== 'all') {
        filtered = filtered.filter((note) => note.color === filter.color);
      }

      if (filter.priority !== 'all') {
        filtered = filtered.filter((note) => note.priority === filter.priority);
      }

      if (filter.pinnedOnly) {
        filtered = filtered.filter((note) => note.pinned);
      }

      if (filter.favoritesOnly) {
        filtered = filtered.filter((note) => note.favorite);
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sort) {
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'alphabetical':
            return a.title.localeCompare(b.title);
          case 'updated':
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          default:
            return 0;
        }
      });

      return filtered;
    },
    [getActiveNotes]
  );

  return {
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
    getActiveNotes,
    getTrashNotes,
    emptyTrash,
    filterAndSortNotes,
  };
};
