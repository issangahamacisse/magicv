import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCV } from '@/context/CVContext';
import DraggableSectionItem from './DraggableSectionItem';
import {
  User,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Languages,
  FolderKanban,
  Award,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

const sectionConfig: Record<string, { label: string; icon: LucideIcon }> = {
  personal: { label: 'Informations personnelles', icon: User },
  experience: { label: 'Expérience professionnelle', icon: Briefcase },
  education: { label: 'Formation', icon: GraduationCap },
  skills: { label: 'Compétences', icon: Lightbulb },
  languages: { label: 'Langues', icon: Languages },
  projects: { label: 'Projets', icon: FolderKanban },
  certifications: { label: 'Certifications', icon: Award },
};

const SectionOrderPanel: React.FC = () => {
  const { cvData, reorderSections, toggleSectionVisibility } = useCV();
  const { sections } = cvData;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const newSections = arrayMove(sections, oldIndex, newIndex).map(
        (section, index) => ({
          ...section,
          order: index,
        })
      );

      reorderSections(newSections);
    }
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">
          Ordre des sections
        </h3>
        <p className="text-xs text-muted-foreground">
          Glissez-déposez pour réorganiser les sections de votre CV.
          Cliquez sur l'œil pour masquer/afficher une section.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedSections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sortedSections.map((section) => {
              const config = sectionConfig[section.type];
              if (!config) return null;

              return (
                <DraggableSectionItem
                  key={section.id}
                  id={section.id}
                  label={config.label}
                  icon={config.icon}
                  visible={section.visible}
                  onToggleVisibility={() => toggleSectionVisibility(section.id)}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SectionOrderPanel;
