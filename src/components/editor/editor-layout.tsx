
'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import LibraryPanel from './sidebars/library-panel';
import FabricPropertiesPanel from '@/components/properties-panel/fabric-properties-panel'; // Import specific Fabric panel
import TopBar from '@/components/layout/top-bar';
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/store/editor-store';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from "@/components/ui/tooltip";
import PageManager from './page-manager';

// Dynamically import FabricCanvas with ssr: false
const FabricCanvas = dynamic(() => import('./canvas/fabric-canvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex justify-center items-center p-4 bg-muted">
       <Skeleton className="w-full h-full max-w-[800px] max-h-[1100px] rounded-md bg-card" />
    </div>
   ),
});


export default function EditorLayout() {
  const {
      pages,
      currentPageId,
      selectedShapeId, // Get the ID from the editor store
      setCurrentPageId,
      setSelectedShapeId, // Get setter to clear selection
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

  // Find the selected shape *object* to determine its type
  const selectedShape = currentShapes.find(shape => shape.id === selectedShapeId);

  // Determine project title (replace with actual logic if needed)
  const projectTitle = "Manga Page Editor";

  return (
    <TooltipProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
        <TopBar projectTitle={projectTitle} />

        <div className="flex flex-1 overflow-hidden">
          <LibraryPanel />

          {/* Separator is handled within LibraryPanel structure */}

          <main className="flex-1 flex flex-col relative bg-muted/30 overflow-auto">
            <div className="flex-1 overflow-auto">
               <FabricCanvas />
            </div>
            <PageManager />
          </main>

          <Separator orientation="vertical" className="h-full" />

          {/* Use the specific FabricPropertiesPanel */}
          <FabricPropertiesPanel
             selectedItemId={selectedShapeId} // Pass the selected shape ID
             selectedItemType={selectedShape?.type ?? null} // Pass the type if shape found
             // PropertiesPanel now handles its own open/close logic based on selectedItemId
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
