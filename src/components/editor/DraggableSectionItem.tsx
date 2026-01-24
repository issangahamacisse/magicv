import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface DraggableSectionItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  visible: boolean;
  onToggleVisibility: () => void;
}

const DraggableSectionItem: React.FC<DraggableSectionItemProps> = ({
  id,
  label,
  icon: Icon,
  visible,
  onToggleVisibility,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-card transition-all',
        isDragging ? 'shadow-lg border-primary/50 z-50' : 'border-border',
        !visible && 'opacity-50'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none"
        aria-label="Réorganiser"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <div className="flex items-center gap-3 flex-1">
        <div className={cn(
          'p-2 rounded-md',
          visible ? 'bg-primary/10' : 'bg-muted'
        )}>
          <Icon className={cn(
            'h-4 w-4',
            visible ? 'text-primary' : 'text-muted-foreground'
          )} />
        </div>
        <span className={cn(
          'font-medium text-sm',
          !visible && 'text-muted-foreground'
        )}>
          {label}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onToggleVisibility}
        aria-label={visible ? 'Masquer la section' : 'Afficher la section'}
      >
        {visible ? (
          <Eye className="h-4 w-4 text-primary" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
};

export default DraggableSectionItem;
