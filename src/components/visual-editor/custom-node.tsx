
'use client';

import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { BookOpen, Film, Square, MessageSquare, User, Workflow, Pencil, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
import { cn } from '@/lib/utils';
import type { NodeData } from '@/types/nodes';
import Image from 'next/image'; // Import next/image

const nodeIconMap: Record<NodeData['type'], React.ElementType> = {
    project: BookOpen,
    chapter: BookOpen,
    scene: Film,
    panel: Square,
    dialogue: MessageSquare,
    character: User,
};

// Define base colors (background, border, text)
const nodeColorStyles: Record<NodeData['type'], string> = {
    project: 'bg-purple-100 border-purple-400 text-purple-900',
    chapter: 'bg-blue-100 border-blue-400 text-blue-900',
    scene: 'bg-green-100 border-green-400 text-green-900',
    panel: 'bg-yellow-100 border-yellow-400 text-yellow-900',
    dialogue: 'bg-pink-100 border-pink-400 text-pink-900',
    character: 'bg-indigo-100 border-indigo-400 text-indigo-900',
};

// Define selected state colors (ring, enhanced background)
const selectedColorStyles: Record<NodeData['type'], string> = {
    project: 'ring-purple-500 bg-purple-200 border-purple-500',
    chapter: 'ring-blue-500 bg-blue-200 border-blue-500',
    scene: 'ring-green-500 bg-green-200 border-green-500',
    panel: 'ring-yellow-500 bg-yellow-200 border-yellow-500',
    dialogue: 'ring-pink-500 bg-pink-200 border-pink-500',
    character: 'ring-indigo-500 bg-indigo-200 border-indigo-500',
};

// --- Enhanced Custom Node ---
export default function CustomNode({ data, selected, isConnectable }: NodeProps<NodeData>) {
    const Icon = nodeIconMap[data.type] || Workflow; // Fallback icon
    const baseStyle = nodeColorStyles[data.type] || 'bg-gray-100 border-gray-400 text-gray-900';
    const selectedStyle = selectedColorStyles[data.type] || 'ring-gray-500 bg-gray-200 border-gray-500';

    // Determine image URL from properties if available
    const imageUrl = data.type === 'panel' ? data.properties?.imageUrl : data.type === 'character' ? data.properties?.imgUrl : undefined;

    return (
        <div
            className={cn(
                'relative flex flex-col w-64 rounded-lg border-2 shadow-lg transition-all duration-150 ease-in-out overflow-hidden', // Increased width, added overflow hidden
                baseStyle,
                selected ? `ring-2 ring-offset-1 ring-offset-background ${selectedStyle}` : 'hover:shadow-xl hover:border-opacity-80',
            )}
        >
            {/* Handles on Left and Right */}
            <Handle
                type="target"
                position={Position.Left} // Target handle on the left
                isConnectable={isConnectable}
                className="!bg-slate-500 !h-3 !w-3 border-2 !border-background" // Slightly larger, contrast border
                style={{ top: '50%' }} // Center vertically
            />
            <Handle
                type="source"
                position={Position.Right} // Source handle on the right
                isConnectable={isConnectable}
                className="!bg-slate-500 !h-3 !w-3 border-2 !border-background"
                style={{ top: '50%' }} // Center vertically
            />

            {/* Optional Image Preview */}
            {imageUrl && (
                <div className="relative h-24 w-full bg-muted/50 flex items-center justify-center">
                    <Image
                        src={imageUrl}
                        alt={`${data.label} preview`}
                        layout="fill" // Use fill for responsive image covering
                        objectFit="cover" // Cover the area, might crop
                        className="opacity-90"
                        unoptimized // Use if image URLs are external and not optimized by Next.js
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div> {/* Subtle overlay */}
                </div>
            )}
            {!imageUrl && data.type === 'panel' && ( // Placeholder for Panel without image
                 <div className="h-16 w-full bg-muted/30 flex items-center justify-center text-muted-foreground">
                    <ImageIcon size={24} />
                 </div>
             )}

            {/* Content Area */}
            <div className="p-3">
                 {/* Header with Icon and Type */}
                 <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 shrink-0 opacity-80" />
                    <div className="text-[10px] font-semibold uppercase tracking-wider opacity-75">
                        {data.type}
                    </div>
                      {/* Selected Indicator */}
                    {selected && (
                        <Pencil size={12} className="ml-auto text-primary opacity-80" />
                    )}
                 </div>

                {/* Label (Title/Name) */}
                <div className="text-sm font-semibold truncate mb-1" title={data.label}>
                    {data.label || `(${data.type})`}
                </div>

                {/* Optional Description/Content Snippet */}
                {data.type === 'dialogue' && data.properties?.content && (
                     <p className="text-xs text-foreground/70 italic truncate" title={data.properties.content as string}>
                        "{data.properties.content}"
                     </p>
                 )}
                 {data.type === 'scene' && data.properties?.setting && (
                     <p className="text-xs text-foreground/70 truncate" title={data.properties.setting as string}>
                        Setting: {data.properties.setting}
                     </p>
                 )}
                 {data.type === 'panel' && data.properties?.action && (
                     <p className="text-xs text-foreground/70 line-clamp-2" title={data.properties.action as string}>
                        {data.properties.action}
                     </p>
                 )}
                  {data.type === 'character' && data.properties?.briefDescription && (
                     <p className="text-xs text-foreground/70 line-clamp-2" title={data.properties.briefDescription as string}>
                        {data.properties.briefDescription}
                     </p>
                 )}
                 {data.type === 'project' && data.properties?.description && (
                     <p className="text-xs text-foreground/70 line-clamp-2" title={data.properties.description as string}>
                         {data.properties.description}
                     </p>
                 )}
                  {data.type === 'chapter' && data.properties?.summary && (
                     <p className="text-xs text-foreground/70 line-clamp-2" title={data.properties.summary as string}>
                         {data.properties.summary}
                     </p>
                 )}
            </div>
        </div>
    );
}
