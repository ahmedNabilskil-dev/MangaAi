'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEditorStore } from '@/store/editor-store';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from '../ui/separator'; // Import Separator

const PageManager: React.FC = () => {
    const { pages, currentPageId, setCurrentPageId, addPage, deletePage } = useEditorStore();

    const handlePageSelect = (pageId: string) => {
        setCurrentPageId(pageId);
    };

    const handleDeleteClick = (pageId: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent page selection when clicking delete
        // Confirmation dialog handles the actual deletion
    };

    const confirmDelete = (pageId: string) => {
        deletePage(pageId);
    }

    return (
        <div className="shrink-0 bg-card border-t border-border p-2 flex items-center gap-2 shadow-inner">
            <Button
                variant="outline"
                size="sm"
                onClick={addPage}
                className="shrink-0"
                aria-label="Add new page"
            >
                <Plus className="h-4 w-4 mr-1" />
                Add Page
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-2 pb-2">
                    {pages.map((page, index) => (
                        <div key={page.id} className="relative group">
                            <Button
                                variant={currentPageId === page.id ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => handlePageSelect(page.id)}
                                className={cn(
                                    "h-8 px-3 text-xs",
                                    currentPageId === page.id && "font-semibold border-primary text-primary"
                                )}
                            >
                                {page.name || `Page ${index + 1}`}
                            </Button>
                             {/* Delete Button - only show if more than one page */}
                            {pages.length > 1 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                         <Button
                                             variant="ghost"
                                             size="icon"
                                             className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/80 transition-opacity duration-150"
                                             onClick={(e) => handleDeleteClick(page.id, e)} // Prevent selection
                                             aria-label={`Delete ${page.name}`}
                                         >
                                             <Trash2 className="h-3 w-3" />
                                         </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete page "{page.name}" and all its content.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => confirmDelete(page.id)} className='bg-destructive hover:bg-destructive/80'>
                                            Delete
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};

export default PageManager;
