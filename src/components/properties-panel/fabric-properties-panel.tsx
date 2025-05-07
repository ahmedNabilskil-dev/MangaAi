
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, PanelRightOpen, X, GripVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import PropertyForm from './property-form';
import { useEditorStore } from '@/store/editor-store'; // Import editor store for Fabric shapes
import type { ShapeConfig } from '@/types/editor';
import { cn } from '@/lib/utils';
import shapeFormConfig from '@/config/shape-form-config'; // Use specific config for shapes
import { Square, Image as ImageIcon, Type as TextIcon, MessageCircle } from 'lucide-react'; // Import icons

// Interface for Fabric Properties Panel Props
interface FabricPropertiesPanelProps {
    selectedItemId: string | null; // ID of the selected Fabric Shape
    selectedItemType: ShapeConfig['type'] | null; // Type of the selected Fabric shape
}

// Map Fabric shape types to icons
const shapeIconMap: Record<ShapeConfig['type'], React.ElementType> = {
    panel: Square,
    bubble: MessageCircle,
    image: ImageIcon,
    text: TextIcon,
};


const panelVariants = {
    open: {
        opacity: 1,
        height: 'auto', // Let content define height, constrained by max-h
        width: '320px', // Adjust width as needed for Fabric properties
        transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    closed: {
        opacity: 1,
        height: '52px', // Height when minimized
        width: '320px',
        transition: { type: 'spring', stiffness: 300, damping: 30 }
    }
};

// This panel specifically handles properties for Fabric.js shapes
export default function FabricPropertiesPanel({ selectedItemId, selectedItemType }: FabricPropertiesPanelProps) {
    const { toast } = useToast();
    const clearShapeSelection = useEditorStore((state) => state.setSelectedShapeId); // Use Fabric store action
    const updateFabricShape = useEditorStore((state) => state.updateShape); // Action for real-time updates (debounced in form)

    const [isMinimized, setIsMinimized] = useState(false);
    const [itemData, setItemData] = useState<Record<string, any> | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false); // Although likely instant for store data
    const formId = useMemo(() => `fabric-property-form-${selectedItemId ?? 'none'}`, [selectedItemId]);

    // Fetch data when selected Fabric shape changes
    useEffect(() => {
        const fetchData = () => {
            if (!selectedItemId || !selectedItemType) {
                setItemData(null);
                return;
            }

            setIsLoadingData(true); // Should be very brief
            setItemData(null);

            try {
                // Fetch Fabric shape data from store
                const shape = useEditorStore.getState().pages.flatMap(p => p.shapes).find(s => s.id === selectedItemId);
                if (shape) {
                    setItemData(shape); // Fabric shape object itself contains the properties
                } else {
                    console.warn(`Fabric shape data not found for ID: ${selectedItemId}`);
                    toast({ title: "Error", description: "Could not load canvas shape data.", variant: "destructive" });
                }
            } catch (error) {
                 console.error("Error fetching Fabric shape data:", error);
                 toast({ title: "Error", description: "Failed to load shape data.", variant: "destructive" });
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, [selectedItemId, selectedItemType, toast]);

    // Handle closing the panel (clearing Fabric shape selection)
    const handleClose = () => {
        console.log("Fabric properties panel close triggered.");
        clearShapeSelection(null);
        setItemData(null);
        setIsMinimized(false);
    };

    // Handle explicit form submission (final save, though updates might be real-time)
    const handleFinalSubmit = async (formData: any) => {
         if (!selectedItemId || !selectedItemType) {
            toast({ title: "Error", description: "No shape selected.", variant: "destructive" });
            return;
         }

         // The debounced update in PropertyForm likely handled most changes.
         // This explicit save can trigger any final persistence or actions if needed.
         console.log(`Final save triggered for Fabric Shape ${selectedItemType}:`, selectedItemId, "Data:", formData);
         // For Fabric, the updateShape action already updates the Zustand store.
         // If backend persistence were needed, it would happen here.
          try {
             // Example: Directly call updateFabricShape again to ensure latest state
             // updateFabricShape(selectedItemId, formData);

              toast({
                  title: "Success",
                  description: `${selectedItemType.charAt(0).toUpperCase() + selectedItemType.slice(1)} properties updated.`,
              });

          } catch (error: any) {
              console.error(`Error explicitly saving Fabric Shape ${selectedItemType}:`, error);
              toast({
                  title: "Error saving properties",
                  description: `Failed to save ${selectedItemType}: ${error.message || 'Unknown error'}`,
                  variant: "destructive",
              });
          }
    };

     // Conditional rendering based on item selection
     if (!selectedItemId) {
        // Do not render the panel if no item is selected
        return null;
     }

    const title = selectedItemType ? `${selectedItemType.charAt(0).toUpperCase() + selectedItemType.slice(1)} Properties` : 'Properties';
    const description = selectedItemType ? `Edit properties for selected ${selectedItemType}.` : 'Select an element on the canvas.';
    const ItemIcon = selectedItemType ? (shapeIconMap[selectedItemType] ?? Square) : Square; // Use shape icons


    return (
        // Panel itself is positioned by the parent layout (EditorLayout)
        <motion.div
            layout
            variants={panelVariants}
            initial={false}
            animate={isMinimized ? "closed" : "open"}
            className={cn(
                 "bg-card border-l border-border shadow-lg overflow-hidden flex flex-col backdrop-blur-sm bg-opacity-95 dark:bg-opacity-80 h-full", // Use h-full within flex layout
                 isMinimized ? "max-h-[52px]" : "" // Height control mostly via flex
            )}
            style={{ width: '320px' }} // Fixed width
        >
             {/* No drag handle needed if positioned by parent */}
            <div
                 className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/80 shrink-0"
                 style={{ height: '52px' }} // Fixed header height
            >
                <div className="flex items-center gap-2 text-muted-foreground">
                    {/* <GripVertical size={14} /> Optional handle if needed */}
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
                        onClick={handleClose}
                        aria-label="Close Panel"
                    >
                        <X size={16} />
                    </Button>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {!isMinimized && (
                    <motion.div
                        key="fabric-panel-content" // Unique key
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col flex-grow min-h-0 overflow-hidden" // Important for scroll area growth
                    >
                        <ScrollArea className="flex-grow px-4 py-3">
                            {isLoadingData ? (
                                <div className="flex items-center justify-center h-full py-10">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                             ) : selectedItemType && itemData ? (
                                 // Use shapeFormConfig for Fabric shapes
                                 shapeFormConfig[selectedItemType as keyof typeof shapeFormConfig] ? (
                                     <PropertyForm
                                         key={formId} // Use unique key
                                         nodeType={selectedItemType as keyof typeof shapeFormConfig} // Pass shape type
                                         initialValues={itemData}
                                         onSubmit={handleFinalSubmit} // Can be minimal if updates are real-time
                                         formId={formId}
                                         selectedShapeId={selectedItemId} // Pass ID for real-time updates
                                         config={shapeFormConfig} // Pass the shape config
                                     />
                                 ) : (
                                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">
                                        <p>No form configuration found for shape type: {selectedItemType}</p>
                                     </div>
                                 )
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">
                                    <p>{description}</p>
                                </div>
                            )}
                        </ScrollArea>

                         <div className="px-4 pb-4 pt-3 border-t border-border mt-auto bg-background/80 flex justify-end gap-2 shrink-0">
                            <Button variant="outline" onClick={handleClose}>
                                Close
                            </Button>
                             {/* Optional explicit Save button if needed */}
                            {/* {selectedItemId && itemData && !isLoadingData && shapeFormConfig[selectedItemType as keyof typeof shapeFormConfig] && (
                                <Button
                                    type="submit"
                                    form={formId}
                                >
                                    Save Changes
                                </Button>
                            )} */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
