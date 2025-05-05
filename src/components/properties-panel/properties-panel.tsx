
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
// Removed Dexie imports - updates now handled by Zustand/PropertyForm
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
import { useEditorStore } from '@/store/editor-store'; // Import editor store


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
    const refreshFlowData = useVisualEditorStore((state) => state.refreshFlowData); // Keep for potential manual refresh trigger
    const [isMinimized, setIsMinimized] = useState(false);
    const formId = "property-form"; // Define form ID

     // Get the updateShape function from the editor store
     const updateShape = useEditorStore((state) => state.updateShape);
     // Get the selected shape ID from the editor store to pass to PropertyForm
     const selectedShapeId = useEditorStore((state) => state.selectedShapeId);

    // Extract data from the selected React Flow node
    const nodeData = node?.data;
    const nodeType = node?.data?.type;
    // Get the properties from the React Flow node's data, which should match ShapeConfig structure
    const initialProperties = node?.data?.properties;


    const title = nodeType ? `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Properties` : 'Properties';
    const description = nodeType ? `Edit properties for ${nodeData?.label || 'selected item'}.` : 'Select an item to edit.';


    // Handle explicit form submission (e.g., clicking Save)
    const handleFinalSubmit = (formData: any) => {
         if (!selectedShapeId) {
            toast({ title: "Error", description: "No shape selected.", variant: "destructive" });
            return;
         }
        console.log("Final save triggered for:", selectedShapeId, "Data:", formData);
        try {
            // Update shape using the zustand store function
            // PropertyForm now handles debounced updates, so this might just be for confirmation/final processing
            // updateShape(selectedShapeId, formData); // Update with the final, validated data

            toast({
                title: "Success",
                description: `${nodeType?.charAt(0).toUpperCase() + nodeType!.slice(1)} properties saved.`,
            });
            // Optionally close the panel after saving
            // onClose();
        } catch (error: any) {
            console.error(`Error saving ${nodeType}:`, error);
            toast({
                title: "Error saving properties",
                description: `Failed to save ${nodeType}: ${error.message || 'Unknown error'}`,
                variant: "destructive",
            });
        }
    };

     // Conditional rendering based on node selection is handled by the parent Draggable wrapper
     if (!node) {
        return null; // Don't render if no node is selected
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
                        onClick={onClose}
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
                            {nodeType && initialProperties ? (
                                <PropertyForm
                                    key={selectedShapeId || 'no-selection'} // Use selectedShapeId for key
                                    nodeType={nodeType}
                                    initialValues={initialProperties} // Pass node properties
                                    onSubmit={handleFinalSubmit} // Pass the explicit save handler
                                    // isLoading={mutation.isPending} // isLoading state removed, handled internally or not needed
                                    formId={formId} // Pass the form ID
                                    selectedShapeId={selectedShapeId} // Pass the shape ID for real-time updates
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4">
                                    <p>{description}</p>
                                </div>
                            )}
                        </ScrollArea>

                         <div className="px-4 pb-4 pt-3 border-t border-border mt-auto bg-background/80 flex justify-end gap-2 shrink-0">
                            <Button variant="outline" onClick={onClose} >
                                Close
                            </Button>
                            {/* The 'Save Changes' button triggers the form submission via its form attribute */}
                            <Button
                                type="submit"
                                form={formId} // Link button to the form ID
                                // disabled={mutation.isPending} // Disable based on form state if needed
                            >
                                {/* {mutation.isPending ? 'Saving...' : 'Save Changes'} */}
                                Save Changes {/* Keep label simple for now */}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
