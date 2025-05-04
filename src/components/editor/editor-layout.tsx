
'use client';

import React from 'react';
import dynamic from 'next/dynamic'; // Import dynamic
import LibraryPanel from './sidebars/library-panel';
import PropertiesPanel from './sidebars/properties-panel';
import TopBar from '@/components/layout/top-bar'; // Reuse existing TopBar if suitable
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/store/editor-store'; // Import the new store
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state

// Dynamically import FabricCanvas with ssr: false
const FabricCanvas = dynamic(() => import('./canvas/fabric-canvas'), {
  ssr: false, // Ensure it only runs on the client
  loading: () => (
    // Provide a loading state while the canvas loads
    <div className="w-full h-full flex justify-center items-center p-4 bg-muted">
       <Skeleton className="w-full h-full max-w-[800px] max-h-[1100px] rounded-md bg-card" />
    </div>
   ),
});


export default function EditorLayout() {
  const selectedShapeId = useEditorStore((state) => state.selectedShapeId);
  const shapes = useEditorStore((state) => state.shapes);
  const selectedShape = shapes.find(shape => shape.id === selectedShapeId);

  // Determine project title (replace with actual logic if needed)
  const projectTitle = "Manga Page Editor (Fabric.js)";

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
          {/* Render the dynamically loaded FabricCanvas */}
          <FabricCanvas />
        </main>

        <Separator orientation="vertical" className="h-full" />

        {/* Right Sidebar: Properties Panel */}
        <PropertiesPanel selectedShape={selectedShape} />
      </div>
    </div>
  );
}
