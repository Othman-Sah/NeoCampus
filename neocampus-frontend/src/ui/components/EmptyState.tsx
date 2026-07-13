import React from 'react'
import { FolderOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 bg-neutral-50/40 border border-dashed border-neutral-200 rounded-2xl max-w-lg mx-auto space-y-4 my-6">
      <div className="p-4 bg-neutral-100 rounded-full text-neutral-400">
        {icon || <FolderOpen className="h-8 w-8" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
          {title}
        </h3>
        <p className="text-xs text-neutral-400 font-semibold max-w-sm leading-relaxed">
          {description}
        </p>
      </div>
      {onAction && actionText && (
        <Button
          onClick={onAction}
          className="bg-black hover:bg-neutral-850 text-white font-bold text-xs rounded-xl h-9 px-4 cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{actionText}</span>
        </Button>
      )}
    </div>
  )
}

export default EmptyState;
