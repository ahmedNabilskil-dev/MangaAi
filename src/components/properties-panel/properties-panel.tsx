
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, PanelRightOpen, X, GripVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import PropertyForm from './property-form';
import { type NodeData, type NodeType } from '@/types/nodes';
import { useVisualEditorStore } from '@/store/visual-editor-store';
import { useEditorStore } from '@/store/editor-store'; // Import editor store
import type { Node } from 'reactflow';
import { cn } from '@/lib/utils';
import nodeFormConfig from '@/config/node-form-config';
// Import specific update functions from the abstract data-service (for Flow nodes)
import {
    updateProject,
    updateChapter,
    updateScene,
    updatePanel,
    updatePanelDialogue,
    updateCharacter
} from '@/services/data-service';
import type { DeepPartial } from '@/types/utils';
import type { MangaProject, Chapter, Scene, Panel, PanelDialogue, Character, ShapeConfig } from '@/types/entities';


interface PropertiesPanelProps {
    selectedItemId: string | null; // ID of the selected Flow Node or Fabric Shape
    selectedItemType: NodeType | ShapeConfig['type'] | null; // Type of the selected item
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

export default function PropertiesPanel({ selectedItemId, selectedItemType }: PropertiesPanelProps) {
    const { toast } = useToast();
    const refreshFlowData = useVisualEditorStore((state) => state.refreshFlowData); // Keep for manual refresh trigger
    const clearFlowNodeSelection = useVisualEditorStore((state) => state.setSelectedNode);
    const clearShapeSelection = useEditorStore((state) => state.setSelectedShapeId);
    const updateFabricShape = useEditorStore((state) => state.updateShape);

    const [isMinimized, setIsMinimized] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // Track saving state
    const [itemData, setItemData] = useState<Record<string, any> | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const formId = useMemo(() => `property-form-${selectedItemId ?? 'none'}`, [selectedItemId]); // Unique form ID per item


    const isFlowNode = useMemo(() => selectedItemType && ['project', 'chapter', 'scene', 'panel', 'dialogue', 'character'].includes(selectedItemType), [selectedItemType]);
    const isFabricShape = useMemo(() => selectedItemType && ['panel', 'bubble', 'image', 'text'].includes(selectedItemType), [selectedItemType]);

    // Fetch data when selected item changes
    useEffect(() => {
        const fetchData = () => {
            if (!selectedItemId || !selectedItemType) {
                setItemData(null);
                return;
            }

            setIsLoadingData(true);
            setItemData(null); // Clear previous data while loading

            if (isFlowNode) {
                // Fetch Flow node data from store
                const node = useVisualEditorStore.getState().nodes.find(n => n.id === selectedItemId);
                if (node?.data?.properties) {
                    setItemData(node.data.properties);
                } else {
                    console.warn(`Flow node data not found for ID: ${selectedItemId}`);
                    toast({ title: "Error", description: "Could not load flow node data.", variant: "destructive" });
                }
            } else if (isFabricShape) {
                // Fetch Fabric shape data from store
                const shape = useEditorStore.getState().pages.flatMap(p => p.shapes).find(s => s.id === selectedItemId);
                if (shape) {
                    setItemData(shape); // Fabric shape object itself contains the properties
                } else {
                     console.warn(`Fabric shape data not found for ID: ${selectedItemId}`);
                     toast({ title: "Error", description: "Could not load canvas shape data.", variant: "destructive" });
                }
            } else {
                 console.warn(`Unknown item type: ${selectedItemType}`);
                 toast({ title: "Error", description: "Unknown item type selected.", variant: "destructive" });
            }

            setIsLoadingData(false);
        };

        fetchData();
    }, [selectedItemId, selectedItemType, isFlowNode, isFabricShape, toast]);

    // Handle closing the panel (clearing selection in the relevant store)
    const handleClose = () => {
        console.log("Properties panel close triggered.");
         if (isFlowNode) {
             clearFlowNodeSelection(null);
         } else if (isFabricShape) {
            clearShapeSelection(null);
         }
         // Reset internal state if needed
         setItemData(null);
         setIsMinimized(false);
    };

    // Handle explicit form submission (e.g., clicking Save)
    const handleFinalSubmit = async (formData: any) => {
         if (!selectedItemId || !selectedItemType) {
            toast({ title: "Error", description: "No item selected.", variant: "destructive" });
            return;
         }

         setIsSaving(true);
         console.log(`Final save triggered for ${selectedItemType}:`, selectedItemId, "Data:", formData);

         try {
            let updatePromise: Promise<void> = Promise.resolve();

            if (isFlowNode) {
                 // Use appropriate update function based on type
                 switch (selectedItemType as NodeType) {
                     case 'project':
                         updatePromise = updateProject(selectedItemId, formData as DeepPartial<MangaProject>);
                         break;
                     case 'chapter':
                         updatePromise = updateChapter(selectedItemId, formData as DeepPartial<Chapter>);
                         break;
                     case 'scene':
                         updatePromise = updateScene(selectedItemId, formData as DeepPartial<Scene>);
                         break;
                     case 'panel':
                         updatePromise = updatePanel(selectedItemId, formData as DeepPartial<Panel>);
                         break;
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
            }

             // If it's also a Fabric shape (could be panel, dialogue (bubble), character (image)), update it too
             // Note: updateFabricShape triggers Zustand, which handles real-time canvas updates via its effect
             if (isFabricShape) {
                  updateFabricShape(selectedItemId, formData); // Use Zustand action directly
             }

             await updatePromise; // Wait for backend update if applicable

             toast({
                 title: "Success",
                 description: `${selectedItemType.charAt(0).toUpperCase() + selectedItemType.slice(1)} properties saved.`,
             });

             // Refresh Flow data only if a flow node was updated
             if (isFlowNode) {
                 refreshFlowData();
             }

         } catch (error: any) {
            console.error(`Error saving ${selectedItemType}:`, error);
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
        // Panel is not rendered if no item is selected (handled by parent's conditional rendering)
        return null;
     }

    const title = selectedItemType ? `${selectedItemType.charAt(0).toUpperCase() + selectedItemType.slice(1)} Properties` : 'Properties';
    const description = selectedItemType ? `Edit properties for selected ${selectedItemType}.` : 'Select an item to edit.';
    const ItemIcon = selectedItemType ? nodeFormConfig[selectedItemType as NodeType]?.icon ?? null : null;


    return (
        <motion.div
            layout
            variants={panelVariants}
            initial={false}
            animate={isMinimized ? "closed" : "open"}
            className={cn(
                 "bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col backdrop-blur-sm bg-opacity-95 dark:bg-opacity-80 absolute z-10", // Position absolute for Draggable
                 isMinimized ? "max-h-[52px]" : "max-h-[calc(100vh-8rem)]" // Adjusted max height
            )}
            style={{ width: '384px' }} // Keep fixed width
        >
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
                        key="panel-content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col flex-grow min-h-0 overflow-hidden"
                    >
                        <ScrollArea className="flex-grow px-4 py-3">
                            {isLoadingData ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                             ) : selectedItemType && itemData ? (
                                <PropertyForm
                                    key={formId} // Use unique key to force re-render on item change
                                    nodeType={selectedItemType as NodeType} // Cast needed for config lookup
                                    initialValues={itemData} // Pass fetched/derived data
                                    onSubmit={handleFinalSubmit} // Pass the explicit save handler
                                    formId={formId} // Pass the form ID
                                    selectedShapeId={isFabricShape ? selectedItemId : null} // Pass ID for fabric updates
                                />
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
                            {selectedItemId && itemData && !isLoadingData && ( // Only show Save if data is loaded
                                <Button
                                    type="submit"
                                    form={formId} // Link button to the form ID
                                    disabled={isSaving || isLoadingData} // Disable while saving or loading
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
