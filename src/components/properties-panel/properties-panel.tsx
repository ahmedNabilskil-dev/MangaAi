
'use client';

import React, { useEffect } from 'react';
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
import PropertyForm from './property-form';
import { type NodeData, type NodeType } from '@/types/nodes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useVisualEditorStore } from '@/store/visual-editor-store';
// Import the in-memory service functions
import {
    updateProject,
    updateChapter,
    updateScene,
    updatePanel,
    updatePanelDialogue,
    updateCharacter
} from '@/services/in-memory';
import type { Node } from 'reactflow';
import type { DeepPartial } from '@/types/utils'; // Assuming you have a DeepPartial utility type

interface PropertiesPanelProps {
    isOpen: boolean;
    node: Node<NodeData> | null;
    onClose: () => void;
}

// Map NodeType to the corresponding in-memory update function
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
    const refreshFlowData = useVisualEditorStore((state) => state.refreshFlowData);
    const formRef = React.useRef<{ reset: (values?: any) => void, formState: any, trigger: () => Promise<boolean> }>(null); // Ref for form methods

    const nodeData = node?.data;
    const nodeId = node?.data?.properties?.id; // ID comes from properties now
    const nodeType = node?.data?.type;

    const title = nodeType ? `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Properties` : 'Properties';
    const description = nodeType ? `Edit the properties for the selected ${nodeType}.` : 'Select an item in the editor to view its properties.';

    // --- Mutation Setup ---
     const mutation = useMutation({
        mutationFn: ({ nodeType, id, data }: { nodeType: NodeType, id: string, data: DeepPartial<any> }) => {
            const updateFn = updateFunctionMap[nodeType];
            if (!updateFn) {
                throw new Error(`No update function found for node type: ${nodeType}`);
            }
             // Data should already be processed by PropertyForm's onSubmit handler
             // It will be a partial object ready for in-memory update
            return updateFn(id, data);
        },
        onSuccess: (updatedData, variables) => { // In-memory update might not return data
            toast({
                title: "Success",
                description: `${variables.nodeType.charAt(0).toUpperCase() + variables.nodeType.slice(1)} properties saved successfully.`,
            });
            // Invalidate the main flow query to refetch data
            queryClient.invalidateQueries({ queryKey: ['projectFlowData'] });
            refreshFlowData(); // Trigger data refresh via Zustand store action

            onClose(); // Close panel after successful save
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

        // The PropertyForm component's onSubmit wrapper already processes the data
        // (e.g., parsing JSON strings, converting comma-sep to arrays).
        // We just need to remove the 'id' field if it exists in the formData
        // as it shouldn't be part of the update payload itself.
        const updateData = { ...formData };
        delete updateData.id; // Remove id if present in form values

        console.log("Submitting update to in-memory store for:", nodeType, nodeId, updateData);

        mutation.mutate({
            nodeType: nodeType,
            id: nodeId,
            data: updateData, // Pass the processed data
        });
    };

    // Trigger form validation and submission from the external button
    const triggerSubmit = async () => {
        if (formRef.current) {
            // Trigger validation
            const isValid = await formRef.current.trigger();
            if (isValid) {
                // Manually call the form's internal submit handler if valid
                // This assumes PropertyForm uses useForm hook and exposes it via ref
                // You might need to adjust PropertyForm to correctly forward the ref and methods
                // formRef.current.handleSubmit(handleFormSubmit)(); // This pattern might not work directly with forwardRef
                // Alternative: Have a submit function inside PropertyForm triggered by this button
                // For now, let's rely on the form attribute of the button
            } else {
                 toast({
                    title: "Validation Error",
                    description: "Please fix the errors in the form before saving.",
                    variant: "destructive",
                });
            }
        }
    };


    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-md w-[90vw] md:w-full md:max-w-md flex flex-col h-full p-0" side="right">
                <SheetHeader className="px-6 pt-6 pb-4 border-b">
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-grow px-6 py-4">
                   {nodeData && nodeType && nodeData.properties ? ( // Ensure properties exist
                       <PropertyForm
                           key={nodeId || 'no-node'} // Use node ID from properties
                           nodeType={nodeType}
                           // Pass the properties object directly
                           initialValues={nodeData.properties}
                           onSubmit={handleFormSubmit}
                           // Pass the ref to potentially trigger submit/validation externally
                           // Requires PropertyForm to use React.forwardRef
                           // ref={formRef} // Uncomment and implement forwardRef in PropertyForm if needed
                       />
                   ) : (
                       <div className="flex items-center justify-center h-full text-muted-foreground">
                           <p>Select an item in the editor to see its properties.</p>
                       </div>
                   )}
                </ScrollArea>

                <SheetFooter className="px-6 pb-6 pt-4 border-t mt-auto bg-background">
                    <SheetClose asChild>
                        <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
                    </SheetClose>
                    {nodeData && (
                        <Button
                            type="submit" // This button submits the form
                            form="property-form" // Link button to the form's ID
                            disabled={mutation.isPending}
                            // onClick={triggerSubmit} // Or use onClick to trigger validation first
                        >
                            {mutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
