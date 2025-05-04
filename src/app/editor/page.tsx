'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state

// Dynamically import EditorLayout with ssr: false to ensure client-side rendering
const EditorLayout = dynamic(() => import('@/components/editor/editor-layout'), {
  ssr: false, // This is crucial to prevent server-side rendering of Konva components
  loading: () => (
     // Optional: Add a loading skeleton or placeholder for the entire layout
     <div className="flex justify-center items-center h-screen w-screen">
       <Skeleton className="w-[90%] h-[90%] rounded-md" />
     </div>
   ),
});

// This page component will simply render the dynamically loaded EditorLayout
export default function EditorPage() {
  return <EditorLayout />;
}
