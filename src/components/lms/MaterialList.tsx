import { Material } from '@/types/lms';
import { FileText, Video, File, Download, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MaterialListProps {
  materials: Material[];
  onDownload?: (material: Material) => void;
  onDelete?: (material: Material) => void;
  onView?: (material: Material) => void;
  isTeacher?: boolean;
}

export const MaterialList = ({ materials, onDownload, onDelete, onView, isTeacher = false }: MaterialListProps) => {
  const getIcon = (type: Material['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-destructive" />;
      case 'video':
        return <Video className="w-5 h-5 text-primary" />;
      default:
        return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: Material['type']) => {
    return type.toUpperCase();
  };

  if (materials.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No materials uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {materials.map((material) => (
        <div
          key={material.id}
          className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-md transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            {getIcon(material.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{material.title}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn(
                'px-2 py-0.5 rounded',
                material.type === 'pdf' && 'bg-destructive/10 text-destructive',
                material.type === 'video' && 'bg-primary/10 text-primary',
                material.type === 'document' && 'bg-muted'
              )}>
                {getTypeLabel(material.type)}
              </span>
              {material.size && <span>{material.size}</span>}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onView && (
              <Button variant="ghost" size="icon" onClick={() => onView(material)}>
                <Eye className="w-4 h-4" />
              </Button>
            )}
            {onDownload && (
              <Button variant="ghost" size="icon" onClick={() => onDownload(material)}>
                <Download className="w-4 h-4" />
              </Button>
            )}
            {isTeacher && onDelete && (
              <Button variant="ghost" size="icon" onClick={() => onDelete(material)} className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
