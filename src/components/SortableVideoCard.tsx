import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Video } from '../types';
import { VideoCard } from './VideoCard';

interface SortableVideoCardProps {
  video: Video;
  index: number;
  onSelect: (video: Video) => void;
  onToggleSave?: (videoId: string, e: React.MouseEvent) => void;
  onToggleLike?: (videoId: string, e: React.MouseEvent) => void;
}

export const SortableVideoCard: React.FC<SortableVideoCardProps> = ({
  video,
  index,
  onSelect,
  onToggleSave,
  onToggleLike,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.75 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group/sortable rounded-2xl ${
        isDragging ? 'ring-2 ring-cyan-400 shadow-2xl scale-[1.02]' : ''
      }`}
    >
      {/* Drag handle button overlay */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-2.5 right-11 z-30 flex items-center gap-1 px-2 py-1 rounded-lg bg-neutral-950/85 hover:bg-neutral-900 border border-neutral-700/80 text-neutral-300 hover:text-cyan-300 shadow-md backdrop-blur-sm cursor-grab active:cursor-grabbing transition-all opacity-90 sm:opacity-0 sm:group-hover/sortable:opacity-100"
        title="Drag to reorder playlist"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-[10px] font-mono font-medium">#{index + 1}</span>
      </button>

      {/* Render base VideoCard */}
      <VideoCard
        video={video}
        onSelect={onSelect}
        onToggleSave={onToggleSave}
        onToggleLike={onToggleLike}
      />
    </div>
  );
};
