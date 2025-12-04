import { Filter, SortAsc, Pin, Star } from 'lucide-react';
import { FilterState, SortOption, NoteCategory, NoteColor, NotePriority } from '@/types/note';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  filter: FilterState;
  sort: SortOption;
  onFilterChange: (filter: Partial<FilterState>) => void;
  onSortChange: (sort: SortOption) => void;
}

const categories: { value: NoteCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'Personal', label: 'Personal' },
  { value: 'Work', label: 'Work' },
  { value: 'Study', label: 'Study' },
  { value: 'Ideas', label: 'Ideas' },
];

const colors: { value: NoteColor | 'all'; label: string; className?: string }[] = [
  { value: 'all', label: 'All Colors' },
  { value: 'yellow', label: 'Yellow', className: 'bg-note-yellow' },
  { value: 'blue', label: 'Blue', className: 'bg-note-blue' },
  { value: 'green', label: 'Green', className: 'bg-note-green' },
  { value: 'pink', label: 'Pink', className: 'bg-note-pink' },
  { value: 'purple', label: 'Purple', className: 'bg-note-purple' },
];

const priorities: { value: NotePriority | 'all'; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'updated', label: 'Last Updated' },
];

export const FilterPanel = ({ filter, sort, onFilterChange, onSortChange }: FilterPanelProps) => {
  const hasActiveFilters =
    filter.category !== 'all' ||
    filter.color !== 'all' ||
    filter.priority !== 'all' ||
    filter.pinnedOnly ||
    filter.favoritesOnly;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Category filter */}
      <Select
        value={filter.category}
        onValueChange={(v) => onFilterChange({ category: v as NoteCategory | 'all' })}
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Color filter */}
      <Select
        value={filter.color}
        onValueChange={(v) => onFilterChange({ color: v as NoteColor | 'all' })}
      >
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {colors.map((col) => (
            <SelectItem key={col.value} value={col.value}>
              <div className="flex items-center gap-2">
                {col.className && (
                  <div className={cn('w-3 h-3 rounded-full', col.className)} />
                )}
                {col.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority filter */}
      <Select
        value={filter.priority}
        onValueChange={(v) => onFilterChange({ priority: v as NotePriority | 'all' })}
      >
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {priorities.map((pri) => (
            <SelectItem key={pri.value} value={pri.value}>
              {pri.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Toggle filters */}
      <Button
        variant={filter.pinnedOnly ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange({ pinnedOnly: !filter.pinnedOnly })}
        className="h-9"
      >
        <Pin className="w-4 h-4 mr-1" />
        Pinned
      </Button>

      <Button
        variant={filter.favoritesOnly ? 'default' : 'outline'}
        size="sm"
        onClick={() => onFilterChange({ favoritesOnly: !filter.favoritesOnly })}
        className="h-9"
      >
        <Star className="w-4 h-4 mr-1" />
        Favorites
      </Button>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 ml-auto">
            <SortAsc className="w-4 h-4 mr-1" />
            Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={cn(sort === option.value && 'bg-muted')}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onFilterChange({
              category: 'all',
              color: 'all',
              priority: 'all',
              pinnedOnly: false,
              favoritesOnly: false,
            })
          }
          className="h-9 text-muted-foreground"
        >
          Clear filters
        </Button>
      )}
    </div>
  );
};
