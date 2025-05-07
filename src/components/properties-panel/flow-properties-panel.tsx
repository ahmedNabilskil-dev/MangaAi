
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, PanelRightOpen, X, GripVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import PropertyForm from './property-form';
import { type NodeType } from '@/types/nodes';
import { useVisualEditorStore } from '@/store/visual-editor-store';
import type { Node } from 'reactflow';
import { cn } from '@/lib/utils';
import nodeFormConfig from '@/config/node-form-config';
// Import specific update functions from the abstract data-service (for Flow nodes)
import {
    updateProject,
    updateChapter,
    updateScene,
    // updatePanel, // Panel updates are handled by Fabric store now
    updatePanelDialogue,
    updateCharacter
} from '@/services/data-service';
import type { DeepPartial } from '@/types/utils';
import type { MangaProject, Chapter, Scene, Panel as PanelEntity, PanelDialogue, Character } from '@/types/entities';
import { ShapeConfig } from '@/types/editor';


interface FlowPropertiesPanelProps {
    selectedItemId: string | null; // ID of the selected Flow Node
    selectedItemType: NodeType | null; // Type of the selected Flow node
}

const panelVariants = {
    open: {
        opacity: 1,
        height: 'auto', // Let content define height, constrained by max-h
        width: '384px', // Keep width fixed
        transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: {
        opacity: 1,
        height: '52px', // Height when minimized
        width: '384px',
        transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
};

// This panel specifically handles properties for React Flow nodes
export default function FlowPropertiesPanel({ selectedItemId, selectedItemType }: FlowPropertiesPanelProps) {
    const { toast } = useToast();
    const refreshFlowData = useVisualEditorStore((state) => state.refreshFlowData);
    const clearFlowNodeSelection = useVisualEditorStore((state) => state.setSelectedNode);

    const [isMinimized, setIsMinimized] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [itemData, setItemData] = useState<Record<string, any> | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const formId = useMemo(() => `flow-property-form-${selectedItemId ?? 'none'}`, [selectedItemId]); // Unique form ID

    // Fetch data when selected Flow node changes
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedItemId || !selectedItemType) {
                setItemData(null);
                return;
            }

            setIsLoadingData(true);
            setItemData(null);

            try {
                // Fetch Flow node data from store
                const node = useVisualEditorStore.getState().nodes.find(n => n.id === selectedItemId);
                if (node?.data?.properties) {
                    setItemData(node.data.properties);
                } else {
                    console.warn(`Flow node data not found for ID: ${selectedItemId}`);
                    // Optionally fetch from backend if store is stale? Requires async fetch here.
                    toast({ title: "Error", description: "Could not load flow node data.", variant: "destructive" });
                }
            } catch (error) {
                 console.error("Error fetching flow node data:", error);
                 toast({ title: "Error", description: "Failed to load flow node data.", variant: "destructive" });
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, [selectedItemId, selectedItemType, toast]);

    // Handle closing the panel (clearing Flow node selection)
    const handleClose = () => {
        console.log("Flow properties panel close triggered.");
        clearFlowNodeSelection(null);
        setItemData(null);
        setIsMinimized(false);
    };

    // Handle explicit form submission (saving Flow node data)
    const handleFinalSubmit = async (formData: any) => {
         if (!selectedItemId || !selectedItemType) {
            toast({ title: "Error", description: "No Flow node selected.", variant: "destructive" });
            return;
         }

         setIsSaving(true);
         console.log(`Final save triggered for Flow Node ${selectedItemType}:`, selectedItemId, "Data:", formData);

         try {
            let updatePromise: Promise<void> = Promise.resolve();

            // Use appropriate update function based on type
            switch (selectedItemType as NodeType) { // Use NodeType here
                case 'project':
                    updatePromise = updateProject(selectedItemId, formData as DeepPartial<MangaProject>);
                    break;
                case 'chapter':
                    updatePromise = updateChapter(selectedItemId, formData as DeepPartial<Chapter>);
                    break;
                case 'scene':
                    updatePromise = updateScene(selectedItemId, formData as DeepPartial<Scene>);
                    break;
                // 'panel' updates handled by Fabric store now
                case 'dialogue':
                    updatePromise = updatePanelDialogue(selectedItemId, formData as DeepPartial<PanelDialogue>);
                    break;
                case 'character':
                    updatePromise = updateCharacter(selectedItemId, formData as DeepPartial<Character>);
                    break;
                default:
                    console.warn(`No specific backend update handler for flow node type: ${selectedItemType}`);
                    break;
            }

             await updatePromise;

             toast({
                 title: "Success",
                 description: `${selectedItemType.charAt(0).toUpperCase() + selectedItemType.slice(1)} properties saved.`,
             });

             // Refresh Flow data as backend data has changed
             refreshFlowData();

         } catch (error: any) {
            console.error(`Error saving Flow Node ${selectedItemType}:`, error);
            toast({
                title: "Error saving properties",
                description: `Failed to save ${selectedItemType}: ${error.message || 'Unknown error'}`,
                variant: "destructive",
            });
         } finally {
             setIsSaving(false);
         }
    };

     // Conditional rendering based on item selection
     if (!selectedItemId) {
        // Do not render the panel if no item is selected
        return null;
     }

    const title = selectedItemType ? `${selectedItemType.charAt(0).toUpperCase() + selectedItemType.slice(1)} Properties` : 'Properties';
    const description = selectedItemType ? `Edit properties for selected ${selectedItemType}.` : 'Select an item to edit.';
    // Attempt to get icon based on type
    const ItemIcon = selectedItemType ? (nodeFormConfig[selectedItemType as keyof typeof nodeFormConfig]?.icon ?? null) : null;


    return (
        // Container is controlled by Draggable on the Home page
        <motion.div
            layout
            variants={panelVariants}
            initial={false}
            animate={isMinimized ? "closed" : "open"}
            className={cn(
                 "bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col backdrop-blur-sm bg-opacity-95 dark:bg-opacity-80",
                 isMinimized ? "max-h-[52px]" : "max-h-[calc(100vh-10rem)]" // Adjusted max height
            )}
            style={{ width: '384px' }} // Keep fixed width
        >
             {/* Add properties-panel-drag-handle class for Draggable */}
            <div
                 className="properties-panel-drag-handle flex items-center justify-between px-4 py-2 border-b border-border bg-background/80 shrink-0 cursor-grab active:cursor-grabbing"
                 style={{ height: '52px' }} // Fixed header height
            >
                <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical size={14} />
                    {ItemIcon && <ItemIcon className="h-4 w-4 shrink-0" />}
                    <h3 className="text-sm font-medium truncate">{title}</h3>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setIsMinimized(!isMinimized)}
                        aria-label={isMinimized ? "Maximize Panel" : "Minimize Panel"}
                    >
                        {isMinimized ? <PanelRightOpen size={16} /> : <Minus size={16} />}
                    </Button>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleClose} // Use internal close handler
                        aria-label="Close Panel"
                    >
                        <X size={16} />
                    </Button>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {!isMinimized && (
                    <motion.div
                        key="flow-panel-content" // Unique key
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col flex-grow min-h-0 overflow-hidden"
                    >
                        <ScrollArea className="flex-grow px-4 py-3">
                            {isLoadingData ? (
                                <div className="flex items-center justify-center h-full py-10">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                             ) : selectedItemType && itemData ? (
                                 // Check if config exists for this Flow Node type
                                 nodeFormConfig[selectedItemType as keyof typeof nodeFormConfig] ? (
                                     <PropertyForm
                                         key={formId} // Use unique key
                                         nodeType={selectedItemType as keyof typeof nodeFormConfig}
                                         initialValues={itemData}
                                         onSubmit={handleFinalSubmit}
                                         formId={formId}
                                         selectedShapeId={null} // Not a Fabric shape
                                         config={nodeFormConfig} // Pass the node config
                                     />
                                 ) : (
                                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">
                                        <p>No form configuration found for type: {selectedItemType}</p>
                                     </div>
                                 )
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">
                                    <p>{description}</p>
                                </div>
                            )}
                        </ScrollArea>

                         <div className="px-4 pb-4 pt-3 border-t border-border mt-auto bg-background/80 flex justify-end gap-2 shrink-0">
                            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
                                Close
                            </Button>
                            {selectedItemId && itemData && !isLoadingData && nodeFormConfig[selectedItemType as keyof typeof nodeFormConfig] && (
                                <Button
                                    type="submit"
                                    form={formId} // Link button to the form ID
                                    disabled={isSaving || isLoadingData}
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
