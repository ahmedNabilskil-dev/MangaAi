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
import PropertyForm from './property-form'; // Assuming PropertyForm exists
import { type NodeData } from '@/types/nodes';

interface PropertiesPanelProps {
    isOpen: boolean;
    nodeData: NodeData | null;
    onClose: () => void;
}

export default function PropertiesPanel({ isOpen, nodeData, onClose }: PropertiesPanelProps) {
    // Determine title based on node type
    const title = nodeData ? `${nodeData.type.charAt(0).toUpperCase() + nodeData.type.slice(1)} Properties` : 'Properties';
    const description = nodeData ? `Edit the properties for the selected ${nodeData.type}.` : 'Select a node to view its properties.';

    const handleFormSubmit = (data: any) => {
        console.log("Form submitted:", data);
        // TODO: Implement logic to update the node data in Strapi/React Flow state
        onClose(); // Close panel after submit (optional)
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-md flex flex-col" side="right">
                <SheetHeader className="px-6 pt-6">
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-grow px-6 py-4">
                   {nodeData ? (
                       <PropertyForm
                           nodeType={nodeData.type}
                           initialValues={nodeData.properties || {}} // Pass existing properties
                           onSubmit={handleFormSubmit}
                       />
                   ) : (
                       <div className="flex items-center justify-center h-full text-muted-foreground">
                           <p>No node selected.</p>
                       </div>
                   )}
                </ScrollArea>

                <SheetFooter className="px-6 pb-6 pt-4 border-t">
                    <SheetClose asChild>
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                    </SheetClose>
                    {/* Conditionally render save button only if form is present */}
                    {nodeData && (
                        <Button type="submit" form="property-form">Save Changes</Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
