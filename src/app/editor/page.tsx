
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import EditorLayout (which contains FabricCanvas) with ssr: false
const EditorLayout = dynamic(() => import('@/components/editor/editor-layout'), {
  ssr: false, // This is crucial to prevent server-side rendering of canvas components
  loading: () => (
     // Optional: Add a loading skeleton or placeholder for the entire layout
     <div className="flex justify-center items-center h-screen w-screen">
       <Skeleton className="w-[90%] h-[90%] rounded-md bg-background" /> {/* Use background color */}
     </div>
   ),
});

// This page component is specifically for the Fabric.js manga page editor.
export default function FabricEditorPage() {
  return <EditorLayout />;
}
