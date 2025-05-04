'use client';

import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import PropertyForm from './property-form'; // Assuming PropertyForm exists and is adapted
import { type NodeData, type NodeType } from '@/types/nodes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useVisualEditorStore } from '@/store/visual-editor-store'; // Import store
import {
    updateProject,
    updateChapter,
    updateScene,
    updatePanel,
    updatePanelDialogue,
    updateCharacter
} from '@/services/strapi'; // Assuming Strapi service functions are correctly typed
import type { Node } from 'reactflow'; // Import Node type

interface PropertiesPanelProps {
    isOpen: boolean;
    node: Node<NodeData> | null; // Receive the full React Flow Node object or null
    onClose: () => void;
}

// Map NodeType to the corresponding update function
const updateFunctionMap: Record<NodeType, (id: string, data: any) => Promise<any>> = {
    project: updateProject,
    chapter: updateChapter,
    scene: updateScene,
    panel: updatePanel,
    dialogue: updatePanelDialogue,
    character: updateCharacter,
};


export default function PropertiesPanel({ isOpen, node, onClose }: PropertiesPanelProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const refreshFlowData = useVisualEditorStore((state) => state.refreshFlowData); // Get refresh action
    const formRef = React.useRef<{ reset: (values?: any) => void, formState: any }>(null); // Ref to access form methods if needed

    // Derive nodeData from the node prop
    const nodeData = node?.data;
    const nodeId = node?.data?.properties?.id;
    const nodeType = node?.data?.type;

    // Determine title and description based on node type
    const title = nodeType ? `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Properties` : 'Properties';
    const description = nodeType ? `Edit the properties for the selected ${nodeType}.` : 'Select an item in the editor to view its properties.';

    // --- Mutation Setup ---
     const mutation = useMutation({
        mutationFn: ({ nodeType, id, data }: { nodeType: NodeType, id: string, data: any }) => {
            const updateFn = updateFunctionMap[nodeType];
            if (!updateFn) {
                throw new Error(`No update function found for node type: ${nodeType}`);
            }
            // The form should handle processing (e.g., JSON stringify/parse),
            // so `data` should be the correct payload for the service.
            return updateFn(id, data);
        },
        onSuccess: (updatedStrapiData, variables) => {
            toast({
                title: "Success",
                description: `${variables.nodeType.charAt(0).toUpperCase() + variables.nodeType.slice(1)} properties saved successfully.`,
            });
            // Invalidate queries related to the updated node or the whole flow
            // Example: queryClient.invalidateQueries({ queryKey: [variables.nodeType, variables.id] });
            // queryClient.invalidateQueries({ queryKey: ['projectFlowData'] }); // Invalidate the main flow query
            refreshFlowData(); // Trigger data refresh via Zustand store action

            onClose(); // Close panel after successful save
        },
        onError: (error: any, variables) => {
            console.error(`Error updating ${variables.nodeType} (${variables.id}):`, error);
            toast({
                title: "Error",
                description: `Failed to save ${variables.nodeType} properties: ${error.message || 'Unknown error'}`,
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
        // Remove fields that shouldn't be sent in an update payload
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        delete updateData.publishedAt;
        // Remove relational fields if they are complex objects and shouldn't be sent directly
        // (depends on how your Strapi update expects relations - IDs vs objects)
        // e.g., delete updateData.mangaProject; delete updateData.scenes; etc.
        // Keep foreign keys if needed by the backend (e.g., mangaProjectId)

        console.log("Submitting update for:", nodeType, nodeId, updateData); // Debug log

        mutation.mutate({
            nodeType: nodeType,
            id: nodeId,
            data: updateData,
        });
    };

    // Reset form when the selected node changes
    // useEffect(() => {
    //     if (formRef.current && nodeData?.properties) {
    //         formRef.current.reset(nodeData.properties);
    //     } else if (formRef.current && !nodeData) {
    //          formRef.current.reset({}); // Reset to empty if no node selected
    //     }
    // }, [nodeData]);


    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-md w-[90vw] md:w-full md:max-w-md flex flex-col h-full p-0" side="right"> {/* Remove padding */}
                <SheetHeader className="px-6 pt-6 pb-4 border-b"> {/* Add padding back here */}
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>

                {/* ScrollArea wraps only the form content */}
                <ScrollArea className="flex-grow px-6 py-4"> {/* Add padding */}
                   {nodeData && nodeType ? (
                       <PropertyForm
                           // Use a key to force re-mount when node changes, ensuring form resets
                           key={nodeId || 'no-node'}
                           nodeType={nodeType}
                           // Pass the properties object directly. Ensure it contains the ID for context if needed,
                           // but the form schema should exclude it from submitted data.
                           initialValues={nodeData.properties || {}}
                           onSubmit={handleFormSubmit}
                           // Pass ref if needed for external control like reset
                           // ref={formRef}
                       />
                   ) : (
                       <div className="flex items-center justify-center h-full text-muted-foreground">
                           <p>Select an item in the editor to see its properties.</p>
                       </div>
                   )}
                </ScrollArea>

                {/* Footer should be outside the ScrollArea */}
                <SheetFooter className="px-6 pb-6 pt-4 border-t mt-auto bg-background"> {/* Add padding and background */}
                    <SheetClose asChild>
                        <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
                    </SheetClose>
                    {/* Conditionally render save button only if form is present */}
                    {nodeData && (
                        <Button
                            type="submit"
                            form="property-form" // Link button to the form within ScrollArea
                            disabled={mutation.isPending } // || !formRef?.current?.formState?.isDirty Check isDirty if form state access is implemented
                        >
                            {mutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
