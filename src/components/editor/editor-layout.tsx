
'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import LibraryPanel from './sidebars/library-panel';
import PropertiesPanel from './sidebars/properties-panel'; // Adjusted import path
import TopBar from '@/components/layout/top-bar';
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/store/editor-store';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipProvider } from "@/components/ui/tooltip";
import PageManager from './page-manager';
import { useVisualEditorStore } from '@/store/visual-editor-store'; // Import flow store

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
  } = useEditorStore();

   // Get selected flow node from the visual editor store
   const selectedFlowNode = useVisualEditorStore((state) => state.selectedNode);
   // Clear shape selection when flow node selection changes (and vice-versa)
   const setSelectedShapeId = useEditorStore((state) => state.setSelectedShapeId);
   const setSelectedFlowNode = useVisualEditorStore((state) => state.setSelectedNode);

    useEffect(() => {
        if (selectedFlowNode) {
            setSelectedShapeId(null); // Clear shape selection if flow node selected
        }
    }, [selectedFlowNode, setSelectedShapeId]);

    useEffect(() => {
        if (selectedShapeId) {
            setSelectedFlowNode(null); // Clear flow selection if shape selected
        }
    }, [selectedShapeId, setSelectedFlowNode]);


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

  // Find the selected shape *object* if needed (though panel primarily uses ID)
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

          {/* Pass selected Flow node (if any) to the PropertiesPanel */}
          {/* The panel will use this OR the selectedShapeId from its own store access */}
          <PropertiesPanel
             node={selectedFlowNode} // Pass the selected flow node
             onClose={() => { // Define onClose behavior for the panel
                 setSelectedFlowNode(null);
                 setSelectedShapeId(null);
             }}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
