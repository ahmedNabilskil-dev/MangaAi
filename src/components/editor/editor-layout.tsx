
'use client';

import React from 'react';
// Remove dynamic import for KonvaCanvas, import directly
import KonvaCanvas from './canvas/konva-canvas';
import LibraryPanel from './sidebars/library-panel';
import PropertiesPanel from './sidebars/properties-panel';
import TopBar from '@/components/layout/top-bar'; // Reuse existing TopBar if suitable
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/store/editor-store'; // Import the new store
// Remove Skeleton import if no longer needed here
// import { Skeleton } from '@/components/ui/skeleton';


export default function EditorLayout() {
  const selectedShapeId = useEditorStore((state) => state.selectedShapeId);
  const shapes = useEditorStore((state) => state.shapes);
  const selectedShape = shapes.find(shape => shape.id === selectedShapeId);

  // Determine project title (replace with actual logic if needed)
  const projectTitle = "Manga Page Editor";

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      {/* Top Bar - Potentially reuse or create a specific editor top bar */}
      <TopBar projectTitle={projectTitle} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Element Library */}
        <LibraryPanel />

        <Separator orientation="vertical" className="h-full" />

        {/* Center Area: Canvas */}
        <main className="flex-1 relative bg-muted/30 overflow-auto">
          {/* Render KonvaCanvas directly */}
          <KonvaCanvas />
        </main>

        <Separator orientation="vertical" className="h-full" />

        {/* Right Sidebar: Properties Panel */}
        <PropertiesPanel selectedShape={selectedShape} />
      </div>
    </div>
  );
}
