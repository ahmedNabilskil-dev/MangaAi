
'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, PanelRightOpen, X } from 'lucide-react';
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
} from '@/services/in-memory'; // Use in-memory service
import type { Node } from 'reactflow';
import type { DeepPartial } from '@/types/utils';
import { cn } from '@/lib/utils';
import nodeFormConfig from '@/config/node-form-config'; // Import the new config
import { Label } from '@/components/ui/label'; // Ensure Label is imported

interface PropertiesPanelProps {
    isOpen: boolean;
    node: Node<NodeData> | null;
    onClose: () => void;
}

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
        x: 0,
        height: 'auto', // Or a specific max height like '600px'
        width: '384px', // Adjust width as needed (sm:max-w-md is 384px)
        transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: {
        opacity: 1,
        x: 0,
        height: '52px', // Height when minimized
        width: '384px',
        transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
};

export default function PropertiesPanel({ isOpen, node, onClose }: PropertiesPanelProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const refreshFlowData = useVisualEditorStore((state) => state.refreshFlowData);
    const [isMinimized, setIsMinimized] = useState(false);
    const formRef = useRef<HTMLFormElement>(null); // Ref for the form

    const nodeData = node?.data;
    const nodeId = node?.data?.properties?.id;
    const nodeType = node?.data?.type;

    const title = nodeType ? `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Properties` : 'Properties';
    const description = nodeType ? `Edit properties for ${nodeData?.label || 'selected item'}.` : 'Select an item to edit.';

    const mutation = useMutation({
        mutationFn: ({ nodeType, id, data }: { nodeType: NodeType, id: string, data: DeepPartial<any> }) => {
            const updateFn = updateFunctionMap[nodeType];
            if (!updateFn) {
                throw new Error(`No update function found for node type: ${nodeType}`);
            }
            console.log("Submitting update to in-memory store:", { nodeType, id, data });
            return updateFn(id, data);
        },
        onSuccess: (updatedData, variables) => {
            toast({
                title: "Success",
                description: `${variables.nodeType.charAt(0).toUpperCase() + variables.nodeType.slice(1)} properties saved successfully.`,
            });
            queryClient.invalidateQueries({ queryKey: ['projectFlowData'] }); // Invalidate cache if using React Query elsewhere
            refreshFlowData(); // Refresh the visual editor data
            // Keep panel open after save
            // onClose();
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
        // Remove fields that shouldn't be directly updated if necessary
        // delete updateData.id;

        mutation.mutate({
            nodeType: nodeType,
            id: nodeId,
            data: updateData, // Pass the processed data
        });
    };

    if (!isOpen) {
        return null; // Don't render anything if not open
    }

    return (
        <motion.div
            layout
            variants={panelVariants}
            initial={false}
            animate={isMinimized ? "closed" : "open"}
            className={cn(
                // Position just below the top bar (h-14 = 3.5rem = 56px). Adjust 'top-16' (4rem) if TopBar height changes.
                 "absolute top-16 right-4 z-10 bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col backdrop-blur-sm bg-opacity-95",
                 isMinimized ? "max-h-[52px]" : "max-h-[calc(100vh-5rem)]" // Adjust max height considering top-16 positioning
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/80 shrink-0">
                <div className="flex items-center gap-2">
                     {nodeType && nodeFormConfig[nodeType]?.icon && React.createElement(nodeFormConfig[nodeType].icon, { className: "h-4 w-4 text-muted-foreground"})}
                    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
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
                        onClick={onClose} // Use the onClose prop to hide the panel
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
                        className="flex flex-col flex-grow min-h-0" // Important for flex layout with scroll
                    >
                        <ScrollArea className="flex-grow px-4 py-3"> {/* ScrollArea wraps the form */}
                            {nodeData && nodeType && nodeData.properties ? (
                                <PropertyForm
                                    key={nodeId || 'no-node'} // Re-render form when node changes
                                    nodeType={nodeType}
                                    initialValues={nodeData.properties}
                                    onSubmit={handleFormSubmit}
                                    isLoading={mutation.isPending}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
                                    <p>{description}</p>
                                </div>
                            )}
                        </ScrollArea>

                        {/* Footer with Buttons (only if a node is selected) */}
                         {nodeData && (
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
                         )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
