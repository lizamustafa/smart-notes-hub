import { useState } from 'react';
import { Download, Upload, FileText, FileCode, File } from 'lucide-react';
import { Note } from '@/types/note';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ExportImportProps {
  notes: Note[];
  onImport: (notes: Note[]) => void;
}

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

export const ExportImport = ({ notes, onImport }: ExportImportProps) => {
  const { toast } = useToast();

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

  const exportAsText = (note: Note) => {
    const content = `${note.title}\n${'='.repeat(note.title.length)}\n\nCategory: ${note.category}\nPriority: ${note.priority}\nCreated: ${new Date(note.created_at).toLocaleString()}\nUpdated: ${new Date(note.updated_at).toLocaleString()}\n\n${stripHtml(note.description)}`;
    downloadFile(content, `${note.title || 'note'}.txt`, 'text/plain');
    toast({ title: 'Exported as text', description: `${note.title || 'Note'} has been downloaded.` });
  };

  const exportAsMarkdown = (note: Note) => {
    const content = `# ${note.title}\n\n**Category:** ${note.category}  \n**Priority:** ${note.priority}  \n**Created:** ${new Date(note.created_at).toLocaleString()}  \n**Updated:** ${new Date(note.updated_at).toLocaleString()}\n\n---\n\n${htmlToMarkdown(note.description)}`;
    downloadFile(content, `${note.title || 'note'}.md`, 'text/markdown');
    toast({ title: 'Exported as Markdown', description: `${note.title || 'Note'} has been downloaded.` });
  };

  const exportAllAsJson = () => {
    const activeNotes = notes.filter((n) => !n.deleted_at);
    const content = JSON.stringify(activeNotes, null, 2);
    downloadFile(content, 'notes-backup.json', 'application/json');
    toast({ title: 'Backup created', description: `${activeNotes.length} notes have been exported.` });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importedNotes = JSON.parse(text) as Note[];
        
        // Validate imported data
        if (!Array.isArray(importedNotes)) {
          throw new Error('Invalid format');
        }

        // Validate each note has required fields
        const validNotes = importedNotes.filter(
          (n) => n.id && n.title !== undefined && n.description !== undefined
        );

        if (validNotes.length === 0) {
          throw new Error('No valid notes found');
        }

        onImport(validNotes);
        toast({
          title: 'Import successful',
          description: `${validNotes.length} notes have been imported.`,
        });
      } catch (error) {
        toast({
          title: 'Import failed',
          description: 'Invalid file format. Please use a valid JSON backup.',
          variant: 'destructive',
        });
      }
    };
    input.click();
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={exportAllAsJson}>
            <File className="w-4 h-4 mr-2" />
            Backup All (JSON)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="outline" size="sm" onClick={handleImport}>
        <Upload className="w-4 h-4 mr-2" />
        Import
      </Button>
    </div>
  );
};

// Export options for a single note
export const NoteExportMenu = ({ note }: { note: Note }) => {
  const { toast } = useToast();

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
    const content = `${note.title}\n${'='.repeat(note.title.length || 8)}\n\nCategory: ${note.category}\nPriority: ${note.priority}\nCreated: ${new Date(note.created_at).toLocaleString()}\nUpdated: ${new Date(note.updated_at).toLocaleString()}\n\n${stripHtml(note.description)}`;
    downloadFile(content, `${note.title || 'note'}.txt`, 'text/plain');
    toast({ title: 'Exported as text' });
  };

  const exportAsMarkdown = () => {
    const content = `# ${note.title}\n\n**Category:** ${note.category}  \n**Priority:** ${note.priority}  \n**Created:** ${new Date(note.created_at).toLocaleString()}  \n**Updated:** ${new Date(note.updated_at).toLocaleString()}\n\n---\n\n${htmlToMarkdown(note.description)}`;
    downloadFile(content, `${note.title || 'note'}.md`, 'text/markdown');
    toast({ title: 'Exported as Markdown' });
  };

  return (
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
  );
};
