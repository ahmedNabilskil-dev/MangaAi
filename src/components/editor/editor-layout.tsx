'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic
import LibraryPanel from './sidebars/library-panel';
import PropertiesPanel from './sidebars/properties-panel';
import TopBar from '@/components/layout/top-bar'; // Reuse existing TopBar if suitable
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/store/editor-store'; // Import the new store
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state
import { TooltipProvider } from "@/components/ui/tooltip"; // Import TooltipProvider
import PageManager from './page-manager'; // Import the new PageManager component

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
  const {
      pages,
      currentPageId,
      selectedShapeId,
      setCurrentPageId,
      // Other actions like addShape, deleteShape are used by sub-components
  } = useEditorStore();

   // Initialize currentPageId on mount if it's null and pages exist
    useEffect(() => {
        if (!currentPageId && pages.length > 0) {
            setCurrentPageId(pages[0].id);
            console.log("EditorLayout mounted, setting initial page:", pages[0].id);
        }
    }, [currentPageId, pages, setCurrentPageId]);


  // Find the current page's shapes based on currentPageId
  const currentPage = pages.find(p => p.id === currentPageId);
  const currentShapes = currentPage ? currentPage.shapes : [];

  // Find the selected shape within the current page's shapes
  const selectedShape = currentShapes.find(shape => shape.id === selectedShapeId);

  // Determine project title (replace with actual logic if needed)
  const projectTitle = "Manga Page Editor";

  return (
    <TooltipProvider> {/* Wrap layout in TooltipProvider */}
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
        {/* Top Bar */}
        <TopBar projectTitle={projectTitle} />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Element Library */}
          <LibraryPanel />

          {/* Separator is handled within LibraryPanel structure */}

          {/* Center Area: Canvas & Page Management */}
          <main className="flex-1 flex flex-col relative bg-muted/30 overflow-auto">
            {/* Canvas Area */}
            <div className="flex-1 overflow-auto">
               <FabricCanvas />
            </div>
            {/* Page Management Bar */}
            <PageManager />
          </main>

          <Separator orientation="vertical" className="h-full" />

          {/* Right Sidebar: Properties Panel */}
          <PropertiesPanel selectedShape={selectedShape} />
        </div>
      </div>
    </TooltipProvider>
  );
}
