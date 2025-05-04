
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import LibraryPanel from './sidebars/library-panel';
import PropertiesPanel from './sidebars/properties-panel';
// import KonvaCanvas from './canvas/konva-canvas'; // Import dynamically instead
import TopBar from '@/components/layout/top-bar'; // Reuse existing TopBar if suitable
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/store/editor-store'; // Import the new store
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state

// Dynamically import KonvaCanvas with ssr: false
const KonvaCanvas = dynamic(() => import('./canvas/konva-canvas'), {
  ssr: false,
  loading: () => (
     // Optional: Add a loading skeleton or placeholder
     <div className="flex justify-center items-center h-full">
       <Skeleton className="w-[80%] h-[80%] rounded-md" />
     </div>
   ),
});


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
          <KonvaCanvas />
        </main>

        <Separator orientation="vertical" className="h-full" />

        {/* Right Sidebar: Properties Panel */}
        <PropertiesPanel selectedShape={selectedShape} />
      </div>
    </div>
  );
}
