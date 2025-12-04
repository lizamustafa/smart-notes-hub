import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, History, Loader2, Download, FileText, FileCode } from 'lucide-react';
import { Note, NoteColor, NoteCategory, NotePriority } from '@/types/note';
import { RichTextEditor } from './RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface NoteEditorProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Note>) => void;
  onRestoreVersion: (versionId: string) => void;
  isNew?: boolean;
}

const categories: NoteCategory[] = ['Personal', 'Work', 'Study', 'Ideas'];
const priorities: { value: NotePriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const colors: { value: NoteColor; label: string; className: string }[] = [
  { value: 'yellow', label: 'Yellow', className: 'bg-note-yellow border-note-yellow-dark' },
  { value: 'blue', label: 'Blue', className: 'bg-note-blue border-note-blue-dark' },
  { value: 'green', label: 'Green', className: 'bg-note-green border-note-green-dark' },
  { value: 'pink', label: 'Pink', className: 'bg-note-pink border-note-pink-dark' },
  { value: 'purple', label: 'Purple', className: 'bg-note-purple border-note-purple-dark' },
];

const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const htmlToMarkdown = (html: string): string => {
  let md = html;
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<ul[^>]*>|<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>|<\/ol>/gi, '\n');
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n');
  md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
};

export const NoteEditor = ({
  note,
  isOpen,
  onClose,
  onSave,
  onRestoreVersion,
  isNew = false,
}: NoteEditorProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<NoteCategory>('Personal');
  const [color, setColor] = useState<NoteColor>('yellow');
  const [priority, setPriority] = useState<NotePriority>('medium');
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Initialize form when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setDescription(note.description);
      setCategory(note.category);
      setColor(note.color);
      setPriority(note.priority);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Personal');
      setColor('yellow');
      setPriority('medium');
    }
    setShowHistory(false);
  }, [note]);

  // Autosave with debounce
  useEffect(() => {
    if (!note || isNew) return;

    const hasChanges =
      title !== note.title ||
      description !== note.description ||
      category !== note.category ||
      color !== note.color ||
      priority !== note.priority;

    if (!hasChanges) return;

    setIsSaving(true);
    const timeout = setTimeout(() => {
      onSave({ title, description, category, color, priority });
      setIsSaving(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [title, description, category, color, priority, note, isNew, onSave]);

  const handleSaveNew = useCallback(() => {
    onSave({ title, description, category, color, priority });
    onClose();
  }, [title, description, category, color, priority, onSave, onClose]);

  const formatVersionDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsText = () => {
    const content = `${title}\n${'='.repeat(title.length || 8)}\n\nCategory: ${category}\nPriority: ${priority}\n\n${stripHtml(description)}`;
    downloadFile(content, `${title || 'note'}.txt`, 'text/plain');
    toast({ title: 'Exported as text' });
  };

  const exportAsMarkdown = () => {
    const content = `# ${title}\n\n**Category:** ${category}  \n**Priority:** ${priority}\n\n---\n\n${htmlToMarkdown(description)}`;
    downloadFile(content, `${title || 'note'}.md`, 'text/markdown');
    toast({ title: 'Exported as Markdown' });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle>{isNew ? 'Create Note' : 'Edit Note'}</SheetTitle>
            <div className="flex items-center gap-2">
              {!isNew && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={exportAsText}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export as Text
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportAsMarkdown}>
                        <FileCode className="w-4 h-4 mr-2" />
                        Export as Markdown
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AnimatePresence mode="wait">
                    {isSaving ? (
                      <motion.div
                        key="saving"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1 text-sm text-muted-foreground"
                      >
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Saving...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="saved"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1 text-sm text-muted-foreground"
                      >
                        <Check className="w-3 h-3" />
                        Saved
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="text-lg font-medium"
            />
          </div>

          {/* Color selection */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    c.className,
                    color === c.value
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'hover:scale-110'
                  )}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as NoteCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as NotePriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Write your note..."
            />
          </div>

          {/* Version History */}
          {!isNew && note && note.version_history.length > 0 && (
            <div className="space-y-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <History className="w-4 h-4" />
                Version History ({note.version_history.length})
              </button>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pt-2">
                      {note.version_history.map((version) => (
                        <div
                          key={version.id}
                          className="p-3 rounded-lg bg-muted/50 text-sm"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{version.title || 'Untitled'}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRestoreVersion(version.id)}
                            >
                              Restore
                            </Button>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatVersionDate(version.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Save button for new notes */}
          {isNew && (
            <Button onClick={handleSaveNew} className="w-full" size="lg">
              Create Note
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
