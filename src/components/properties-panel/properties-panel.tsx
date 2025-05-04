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
import { useToast } from '@/hooks/use-toast'; // Import useToast
import PropertyForm from './property-form';
import { type NodeData, type NodeType } from '@/types/nodes';
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Import React Query hooks

// Import update functions from Strapi service
import {
    updateProject,
    updateChapter,
    updateScene,
    updatePanel,
    updatePanelDialogue,
    updateCharacter
} from '@/services/strapi';

interface PropertiesPanelProps {
    isOpen: boolean;
    nodeData: NodeData | null; // Accepts the generic NodeData
    onClose: () => void;
    // Add a way to refetch React Flow data if needed
    // onSaveSuccess?: () => void;
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


export default function PropertiesPanel({ isOpen, nodeData, onClose /*, onSaveSuccess */}: PropertiesPanelProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient(); // Get Query Client instance

     // Determine title and description based on node type
     const title = nodeData ? `${nodeData.type.charAt(0).toUpperCase() + nodeData.type.slice(1)} Properties` : 'Properties';
     const description = nodeData ? `Edit the properties for the selected ${nodeData.type}.` : 'Select a node to view its properties.';

     // --- Mutation Setup ---
     const mutation = useMutation({
        mutationFn: ({ nodeType, id, data }: { nodeType: NodeType, id: string, data: any }) => {
            const updateFn = updateFunctionMap[nodeType];
            if (!updateFn) {
                throw new Error(`No update function found for node type: ${nodeType}`);
            }
            // Ensure complex fields are stringified if needed by the service/backend
            // The form already handles parsing back from strings, so data should be correct JS objects/arrays here
            return updateFn(id, data);
        },
        onSuccess: (data, variables) => {
            toast({
                title: "Success",
                description: `${variables.nodeType.charAt(0).toUpperCase() + variables.nodeType.slice(1)} properties saved successfully.`,
            });
            // Invalidate queries related to the updated node to refetch data
            // Example: queryClient.invalidateQueries({ queryKey: [variables.nodeType, variables.id] });
            // Example: queryClient.invalidateQueries({ queryKey: ['reactFlowNodes'] }); // Or invalidate the whole flow data

            // Potentially trigger React Flow update if necessary
            // onSaveSuccess?.();

            onClose(); // Close panel after successful save
        },
        onError: (error: any, variables) => {
            console.error(`Error updating ${variables.nodeType}:`, error);
            toast({
                title: "Error",
                description: `Failed to save ${variables.nodeType} properties: ${error.message || 'Unknown error'}`,
                variant: "destructive",
            });
        },
    });

    const handleFormSubmit = (formData: any) => {
        if (!nodeData || !nodeData.properties?.id) { // Check if nodeData and its ID exist
            toast({ title: "Error", description: "No node selected or node ID missing.", variant: "destructive" });
            return;
        }

        const updateData = { ...formData };
        // Remove ID from the data being sent for update if it exists in the form data itself
        // The ID is passed separately to the mutation function.
        delete updateData.id;
        // Remove other Strapi metadata if accidentally included in the form
        delete updateData.createdAt;
        delete updateData.updatedAt;
        delete updateData.publishedAt; // etc.

        mutation.mutate({
            nodeType: nodeData.type,
            id: nodeData.properties.id, // Pass the ID from nodeData.properties
            data: updateData,
        });
    };


    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
             {/* Ensure content has flex-col and h-full for proper layout */}
            <SheetContent className="sm:max-w-md w-[90vw] md:w-full md:max-w-md flex flex-col h-full" side="right">
                <SheetHeader className="px-6 pt-6">
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>

                {/* ScrollArea should wrap only the form content */}
                <ScrollArea className="flex-grow px-6 py-4">
                   {nodeData ? (
                       <PropertyForm
                           nodeType={nodeData.type}
                           // Pass the properties object directly. Ensure it contains the ID.
                           initialValues={nodeData.properties || {}}
                           onSubmit={handleFormSubmit} // Pass the submit handler
                       />
                   ) : (
                       <div className="flex items-center justify-center h-full text-muted-foreground">
                           <p>No node selected.</p>
                       </div>
                   )}
                </ScrollArea>

                {/* Footer should be outside the ScrollArea */}
                <SheetFooter className="px-6 pb-6 pt-4 border-t mt-auto">
                    <SheetClose asChild>
                        <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
                    </SheetClose>
                    {/* Conditionally render save button only if form is present and ready */}
                    {nodeData && (
                        <Button
                            type="submit"
                            form="property-form" // Link button to the form within ScrollArea
                            disabled={mutation.isPending || !form.formState.isDirty} // Disable if submitting or no changes
                        >
                            {mutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

// Helper hook to access form state (optional, could be managed within PropertyForm)
// If needed, you'd pass the form instance up or use context
const useFormRef = () => {
    // In a real scenario, this might involve context or refs
    // For now, we assume PropertyForm internally handles its state
    // and the parent relies on the onSubmit callback.
    // We can access formState via the mutation or by passing form up.
    // A simpler way for the button disable state is checking mutation.isPending
    // and potentially adding a check for form dirtiness if needed.
    // Let's assume mutation.isPending is sufficient for now.
    return { formState: { isDirty: true } }; // Placeholder
};

// Add a reference to the form instance to check its state
const form = useFormRef(); // Placeholder hook
