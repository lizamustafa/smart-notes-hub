export type NoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple';

export type NoteCategory = 'Personal' | 'Work' | 'Study' | 'Ideas';

export type NotePriority = 'low' | 'medium' | 'high';

export interface NoteVersion {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  category: NoteCategory;
  color: NoteColor;
  priority: NotePriority;
  pinned: boolean;
  favorite: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  version_history: NoteVersion[];
}

export type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'updated';

export interface FilterState {
  search: string;
  category: NoteCategory | 'all';
  color: NoteColor | 'all';
  priority: NotePriority | 'all';
  pinnedOnly: boolean;
  favoritesOnly: boolean;
}
