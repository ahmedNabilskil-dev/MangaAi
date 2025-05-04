
'use client';

import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { BookOpen, Film, Square, MessageSquare, User, Workflow, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NodeData } from '@/types/nodes';

const nodeIconMap: Record<NodeData['type'], React.ElementType> = {
    project: BookOpen,
    chapter: BookOpen,
    scene: Film,
    panel: Square,
    dialogue: MessageSquare,
    character: User,
};

const nodeColorMap: Record<NodeData['type'], string> = {
    project: 'bg-purple-100 border-purple-300 text-purple-800',
    chapter: 'bg-blue-100 border-blue-300 text-blue-800',
    scene: 'bg-green-100 border-green-300 text-green-800',
    panel: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    dialogue: 'bg-pink-100 border-pink-300 text-pink-800',
    character: 'bg-indigo-100 border-indigo-300 text-indigo-800',
};

const selectedColorMap: Record<NodeData['type'], string> = {
    project: 'ring-purple-500 bg-purple-200',
    chapter: 'ring-blue-500 bg-blue-200',
    scene: 'ring-green-500 bg-green-200',
    panel: 'ring-yellow-500 bg-yellow-200',
    dialogue: 'ring-pink-500 bg-pink-200',
    character: 'ring-indigo-500 bg-indigo-200',
}


export default function CustomNode({ data, selected, isConnectable, sourcePosition = Position.Right, targetPosition = Position.Left }: NodeProps<NodeData>) {
    const Icon = nodeIconMap[data.type] || Workflow; // Fallback icon
    const baseColor = nodeColorMap[data.type] || 'bg-gray-100 border-gray-300 text-gray-800';
    const selectedColor = selectedColorMap[data.type] || 'ring-gray-500 bg-gray-200';

    return (
        <div
            className={cn(
                'relative flex items-center gap-2 px-4 py-2 min-w-[180px] rounded-lg border shadow-md transition-all duration-150 ease-in-out',
                baseColor,
                selected ? `ring-2 ring-offset-2 ring-offset-background ${selectedColor}` : 'hover:shadow-lg',
            )}
        >
            {/* Handles */}
            <Handle
                type="target"
                position={targetPosition}
                isConnectable={isConnectable}
                className="!bg-slate-400 !h-2 !w-2"
            />
             <Handle
                type="source"
                position={sourcePosition}
                isConnectable={isConnectable}
                className="!bg-slate-400 !h-2 !w-2"
            />

            {/* Icon */}
            <Icon className="h-5 w-5 shrink-0 opacity-80" />

            {/* Content */}
            <div className="flex flex-col overflow-hidden">
                <div className="text-[10px] font-medium uppercase tracking-wider opacity-70">{data.type}</div>
                <div className="text-sm font-medium truncate" title={data.label}>
                    {data.label || `(${data.type})`}
                </div>
            </div>

             {/* Selected Indicator */}
            {selected && (
                <Pencil size={12} className="absolute top-1.5 right-1.5 text-primary opacity-70" />
            )}
        </div>
    );
}

