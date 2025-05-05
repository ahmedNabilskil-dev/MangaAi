
'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, PanelRightOpen, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import PropertyForm from './property-form';
import { type NodeData, type NodeType } from '@/types/nodes';
import { useVisualEditorStore } from '@/store/visual-editor-store';
import type { Node } from 'reactflow';
import { cn } from '@/lib/utils';
import nodeFormConfig from '@/config/node-form-config';
import { useEditorStore } from '@/store/editor-store'; // Import editor store
import { updateProject, updateChapter, updateScene, updatePanel, updatePanelDialogue, updateCharacter } from '@/services/data-service'; // Import specific update functions
import type { DeepPartial } from '@/types/utils';
import type { MangaProject, Chapter, Scene, Panel, PanelDialogue, Character } from '@/types/entities';

interface PropertiesPanelProps {
    node: Node<NodeData> | null;
    onClose: () => void; // Keep onClose to allow panel to signal closure
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

export default function PropertiesPanel({ node, onClose }: PropertiesPanelProps) {
    const { toast } = useToast();
    const refreshFlowData = useVisualEditorStore((state) => state.refreshFlowData); // Keep for manual refresh trigger
    const [isMinimized, setIsMinimized] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // Track saving state
    const formId = "property-form"; // Define form ID

    // Get the updateShape function from the editor store for Fabric canvas elements
    const updateFabricShape = useEditorStore((state) => state.updateShape);
    // Get the selected shape ID from the editor store to pass to PropertyForm
    const selectedFabricShapeId = useEditorStore((state) => state.selectedShapeId);

    // Extract data from the selected React Flow node (for flow elements)
    const flowNodeData = node?.data;
    const flowNodeType = node?.data?.type;
    const flowNodeId = node?.id; // React Flow node ID
    const initialFlowProperties = node?.data?.properties; // Properties from Flow node

    // Determine which item is selected (Flow node or Fabric shape)
    const isFlowNodeSelected = !!flowNodeId;
    const isFabricShapeSelected = !!selectedFabricShapeId && !isFlowNodeSelected; // Prioritize Flow node if both somehow selected

    const selectedItemId = isFlowNodeSelected ? flowNodeId : selectedFabricShapeId;
    const selectedItemType = isFlowNodeSelected ? flowNodeType : useEditorStore.getState().pages.flatMap(p => p.shapes).find(s => s.id === selectedFabricShapeId)?.type;
    const initialProperties = isFlowNodeSelected ? initialFlowProperties : useEditorStore.getState().pages.flatMap(p => p.shapes).find(s => s.id === selectedFabricShapeId);

    const title = selectedItemType ? `${selectedItemType.charAt(0).toUpperCase() + selectedItemType.slice(1)} Properties` : 'Properties';
    const description = selectedItemType ? `Edit properties for selected ${selectedItemType}.` : 'Select an item to edit.';


    // Handle explicit form submission (e.g., clicking Save)
    const handleFinalSubmit = async (formData: any) => {
         if (!selectedItemId || !selectedItemType) {
            toast({ title: "Error", description: "No item selected.", variant: "destructive" });
            return;
         }

         setIsSaving(true);
         console.log(`Final save triggered for ${selectedItemType}:`, selectedItemId, "Data:", formData);

         try {
            let updatePromise: Promise<void>;

             // Use appropriate update function based on type
             switch (selectedItemType) {
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
                     // Update both backend/flow node data and Fabric shape if applicable
                     updatePromise = updatePanel(selectedItemId, formData as DeepPartial<Panel>);
                     // If it's also a Fabric shape, update it too
                     if (useEditorStore.getState().pages.flatMap(p => p.shapes).some(s => s.id === selectedItemId && s.type === 'panel')) {
                        updateFabricShape(selectedItemId, formData);
                     }
                     break;
                 case 'dialogue':
                     updatePromise = updatePanelDialogue(selectedItemId, formData as DeepPartial<PanelDialogue>);
                      // If it's also a Fabric shape (e.g., bubble), update it too
                      if (useEditorStore.getState().pages.flatMap(p => p.shapes).some(s => s.id === selectedItemId && s.type === 'bubble')) {
                         updateFabricShape(selectedItemId, formData);
                      }
                     break;
                 case 'character':
                     updatePromise = updateCharacter(selectedItemId, formData as DeepPartial<Character>);
                       // If it's also a Fabric shape (e.g., image), update it too
                       if (useEditorStore.getState().pages.flatMap(p => p.shapes).some(s => s.id === selectedItemId && s.type === 'image')) {
                         updateFabricShape(selectedItemId, formData);
                       }
                     break;
                // Add cases for Fabric-only shapes if needed
                 case 'image': // Assume this updates the Fabric shape directly
                 case 'text':
                 case 'bubble':
                     updateFabricShape(selectedItemId, formData);
                     updatePromise = Promise.resolve(); // No backend update for pure Fabric shapes yet
                     break;
                 default:
                     console.warn(`No specific update handler for type: ${selectedItemType}`);
                     updatePromise = Promise.resolve();
                     break;
             }

             await updatePromise;

             toast({
                 title: "Success",
                 description: `${selectedItemType.charAt(0).toUpperCase() + selectedItemType.slice(1)} properties saved.`,
             });

             // Refresh Flow data if a flow node was updated
             if (isFlowNodeSelected) {
                 refreshFlowData();
             }
            // Fabric updates happen via Zustand store changes triggering re-renders

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
        // Optionally render a placeholder when nothing is selected, or let the Draggable wrapper hide it
        return null;
     }


    return (
        <motion.div
            layout
            variants={panelVariants}
            initial={false}
            animate={isMinimized ? "closed" : "open"}
            className={cn(
                 "bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col backdrop-blur-sm bg-opacity-95 dark:bg-opacity-80", // Adjusted opacity for dark mode
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
                     {/* Use selectedItemType to get icon */}
                     {selectedItemType && nodeFormConfig[selectedItemType as NodeType]?.icon && React.createElement(nodeFormConfig[selectedItemType as NodeType].icon, { className: "h-4 w-4 shrink-0"})}
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
                        onClick={onClose} // Use onClose prop passed from parent
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
                            {selectedItemType && initialProperties ? (
                                <PropertyForm
                                    key={selectedItemId} // Use the ID of the selected item
                                    // Use appropriate type cast if needed, ensure config exists
                                    nodeType={selectedItemType as NodeType}
                                    initialValues={initialProperties} // Pass properties
                                    onSubmit={handleFinalSubmit} // Pass the explicit save handler
                                    formId={formId} // Pass the form ID
                                    // Pass fabric shape ID for real-time updates if it's a fabric shape
                                    selectedShapeId={isFabricShapeSelected ? selectedItemId : null}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
                                    <p>{description}</p>
                                </div>
                            )}
                        </ScrollArea>

                         <div className="px-4 pb-4 pt-3 border-t border-border mt-auto bg-background/80 flex justify-end gap-2 shrink-0">
                            <Button variant="outline" onClick={onClose} disabled={isSaving}>
                                Close
                            </Button>
                            {/* The 'Save Changes' button triggers the form submission via its form attribute */}
                            {selectedItemId && ( // Only show Save if an item is selected
                                <Button
                                    type="submit"
                                    form={formId} // Link button to the form ID
                                    disabled={isSaving} // Disable while saving
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
