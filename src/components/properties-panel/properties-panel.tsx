
'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, PanelRightOpen, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import PropertyForm from './property-form';
import { type NodeData, type NodeType } from '@/types/nodes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useVisualEditorStore } from '@/store/visual-editor-store';
import {
    updateProject,
    updateChapter,
    updateScene,
    updatePanel,
    updatePanelDialogue,
    updateCharacter
} from '@/services/db'; // Use Dexie service (db.ts)
import type { Node } from 'reactflow';
import type { DeepPartial } from '@/types/utils';
import { cn } from '@/lib/utils';
import nodeFormConfig from '@/config/node-form-config';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


interface PropertiesPanelProps {
    // isOpen prop removed as visibility is controlled by parent now
    node: Node<NodeData> | null;
    onClose: () => void; // Keep onClose to allow panel to signal closure
}

// Ensure the update map uses the correct functions from the Dexie service
const updateFunctionMap: Record<NodeType, (id: string, data: any) => Promise<any>> = {
    project: updateProject,
    chapter: updateChapter,
    scene: updateScene,
    panel: updatePanel,
    dialogue: updatePanelDialogue,
    character: updateCharacter,
};

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
    // QueryClient might not be necessary if we rely solely on Dexie's reactivity via useLiveQuery in VisualEditor
    // const queryClient = useQueryClient();
    const refreshFlowData = useVisualEditorStore((state) => state.refreshFlowData); // Keep for potential manual refresh trigger
    const [isMinimized, setIsMinimized] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const nodeData = node?.data;
    const nodeId = node?.data?.properties?.id;
    const nodeType = node?.data?.type;

    const title = nodeType ? `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Properties` : 'Properties';
    const description = nodeType ? `Edit properties for ${nodeData?.label || 'selected item'}.` : 'Select an item to edit.';

    const mutation = useMutation({
        mutationFn: async ({ nodeType, id, data }: { nodeType: NodeType, id: string, data: DeepPartial<any> }) => {
            const updateFn = updateFunctionMap[nodeType];
            if (!updateFn) {
                throw new Error(`No update function found for node type: ${nodeType}`);
            }
            console.log("Submitting update to Dexie:", { nodeType, id, data });
            await updateFn(id, data); // Await the Dexie update
            return { nodeType, id }; // Return identifier for onSuccess
        },
        onSuccess: (result, variables) => {
            toast({
                title: "Success",
                description: `${result.nodeType.charAt(0).toUpperCase() + result.nodeType.slice(1)} properties saved successfully.`,
            });
            // No need to invalidate React Query cache if not using it for this data
            // queryClient.invalidateQueries({ queryKey: ['projectFlowData'] });
            // Data should update automatically via useLiveQuery in VisualEditor,
            // but keep refreshFlowData trigger if needed for complex scenarios
            // refreshFlowData();
        },
        onError: (error: any, variables) => {
            console.error(`Error updating ${variables.nodeType} (${variables.id}):`, error);
            toast({
                title: "Error saving properties",
                description: `Failed to save ${variables.nodeType}: ${error.message || 'Unknown error'}`,
                variant: "destructive",
            });
        },
    });

    const handleFormSubmit = (formData: any) => {
        if (!nodeType || !nodeId) {
            toast({ title: "Error", description: "No node selected or node ID/type missing.", variant: "destructive" });
            return;
        }
        const updateData = { ...formData };

        mutation.mutate({
            nodeType: nodeType,
            id: nodeId,
            data: updateData,
        });
    };

     // Conditional rendering based on node selection is handled by the parent Draggable wrapper
     if (!node) {
        return null; // Don't render if no node is selected
     }


    return (
        // This div is now positioned by the Draggable wrapper in page.tsx
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
            {/* Header - Make this the draggable handle */}
            <div
                 className="properties-panel-drag-handle flex items-center justify-between px-4 py-2 border-b border-border bg-background/80 shrink-0 cursor-grab active:cursor-grabbing"
                 style={{ height: '52px' }} // Fixed header height
            >
                <div className="flex items-center gap-2 text-muted-foreground">
                    <GripVertical size={14} />
                     {nodeType && nodeFormConfig[nodeType]?.icon && React.createElement(nodeFormConfig[nodeType].icon, { className: "h-4 w-4 shrink-0"})}
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
                        onClick={onClose} // Use the onClose prop to hide the panel (via parent state)
                        aria-label="Close Panel"
                    >
                        <X size={16} />
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence initial={false}>
                {!isMinimized && (
                    <motion.div
                        key="panel-content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col flex-grow min-h-0 overflow-hidden" // Important for flex layout with scroll
                    >
                        <ScrollArea className="flex-grow px-4 py-3">
                            {nodeData && nodeType && nodeData.properties ? (
                                <PropertyForm
                                    key={nodeId || 'no-node'}
                                    nodeType={nodeType}
                                    initialValues={nodeData.properties}
                                    onSubmit={handleFormSubmit}
                                    isLoading={mutation.isPending}
                                    formId="property-form" // Pass the form ID down
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
                                    <p>{description}</p> {/* Should not be reached if parent hides panel */}
                                </div>
                            )}
                        </ScrollArea>

                        {/* Footer with Buttons */}
                         <div className="px-4 pb-4 pt-3 border-t border-border mt-auto bg-background/80 flex justify-end gap-2 shrink-0">
                            <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
                                Close
                            </Button>
                            <Button
                                type="submit"
                                form="property-form" // Link button to the form ID
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
