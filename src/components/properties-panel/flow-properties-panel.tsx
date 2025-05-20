"use client";

import { Button } from "@/components/ui/button";
import nodeFormConfig from "@/config/node-form-config";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  updateChapter,
  updateCharacter,
  updatePanelDialogue,
  updateProject,
  updateScene,
} from "@/services/data-service";
import { useVisualEditorStore } from "@/store/visual-editor-store";
import { type NodeType } from "@/types/nodes";
import type { DeepPartial } from "@/types/utils";
import { AnimatePresence, motion } from "framer-motion";
import { GripVertical, Loader2, Minus, PanelRightOpen, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PropertyForm from "./property-form";

type EntityType = "project" | "chapter" | "scene" | "dialogue" | "character";

interface FlowPropertiesPanelProps {
  selectedItemId: string | null;
  selectedItemType: NodeType | null;
}

const panelVariants = {
  open: {
    opacity: 1,
    height: "auto",
    width: "384px",
  },
  closed: {
    opacity: 1,
    height: "52px",
    width: "384px",
  },
};

export default function FlowPropertiesPanel({
  selectedItemId,
  selectedItemType,
}: FlowPropertiesPanelProps) {
  const { toast } = useToast();
  const refreshFlowData = useVisualEditorStore(
    (state) => state.refreshFlowData
  );
  const clearFlowNodeSelection = useVisualEditorStore(
    (state) => state.setSelectedNode
  );

  const [isMinimized, setIsMinimized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [itemData, setItemData] = useState<Record<string, any> | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const formId = useMemo(
    () => `flow-property-form-${selectedItemId ?? "none"}`,
    [selectedItemId]
  );

  // Fetch data when selected node changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedItemId || !selectedItemType) {
        setItemData(null);
        return;
      }

      setIsLoadingData(true);

      try {
        // Get node data from store
        const node = useVisualEditorStore
          .getState()
          .nodes.find((n) => n.id === selectedItemId);

        if (node?.data?.properties) {
          setItemData(node.data.properties);
        } else {
          console.warn(`Flow node data not found for ID: ${selectedItemId}`);
          toast({
            title: "Error",
            description: "Could not load node data.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching node data:", error);
        toast({
          title: "Error",
          description: "Failed to load node data.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [selectedItemId, selectedItemType, toast]);

  // Close panel handler
  const handleClose = () => {
    clearFlowNodeSelection(null);
    setItemData(null);
    setIsMinimized(false);
  };

  // Update function mapper
  const updateFunctions: Record<
    EntityType,
    (id: string, data: any) => Promise<void>
  > = {
    project: updateProject,
    chapter: updateChapter,
    scene: updateScene,
    dialogue: updatePanelDialogue,
    character: updateCharacter,
  };

  // Submit handler
  const handleSubmit = async (formData: any) => {
    if (!selectedItemId || !selectedItemType) {
      toast({
        title: "Error",
        description: "No node selected.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const updateFn = updateFunctions[selectedItemType as EntityType];

      if (updateFn) {
        await updateFn(selectedItemId, formData as DeepPartial<any>);

        toast({
          title: "Success",
          description: `${
            selectedItemType.charAt(0).toUpperCase() + selectedItemType.slice(1)
          } saved successfully.`,
        });

        // Refresh data
        refreshFlowData();
      } else {
        console.warn(`No update handler for node type: ${selectedItemType}`);
        toast({
          title: "Warning",
          description: `No update handler for type: ${selectedItemType}`,
        });
      }
    } catch (error: any) {
      console.error(`Error saving ${selectedItemType}:`, error);
      toast({
        title: "Error",
        description: `Failed to save: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Don't render if no item selected
  if (!selectedItemId) {
    return null;
  }

  const title = selectedItemType
    ? `${
        selectedItemType.charAt(0).toUpperCase() + selectedItemType.slice(1)
      } Properties`
    : "Properties";

  const description = selectedItemType
    ? `Edit properties for selected ${selectedItemType}.`
    : "Select an item to edit.";

  const ItemIcon = selectedItemType
    ? nodeFormConfig[selectedItemType as keyof typeof nodeFormConfig]?.icon ??
      null
    : null;

  return (
    <motion.div
      layout
      variants={panelVariants}
      initial={false}
      animate={isMinimized ? "closed" : "open"}
      className={cn(
        "bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col backdrop-blur-sm bg-opacity-95 dark:bg-opacity-80",
        isMinimized ? "max-h-[52px]" : "max-h-[calc(100vh-10rem)]"
      )}
      style={{ width: "384px" }}
    >
      {/* Panel Header */}
      <div
        className="properties-panel-drag-handle flex items-center justify-between px-4 py-2 border-b border-border bg-background/80 shrink-0 cursor-grab active:cursor-grabbing"
        style={{ height: "52px" }}
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
            onClick={handleClose}
            aria-label="Close Panel"
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Panel Content */}
      <AnimatePresence initial={false}>
        {!isMinimized && (
          <motion.div
            key="flow-panel-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col flex-grow min-h-0"
          >
            <div className="flex-grow px-4 py-3 overflow-y-auto">
              {isLoadingData ? (
                <div className="flex items-center justify-center h-full py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : selectedItemType && itemData ? (
                nodeFormConfig[
                  selectedItemType as keyof typeof nodeFormConfig
                ] ? (
                  <PropertyForm
                    key={formId}
                    nodeType={selectedItemType as keyof typeof nodeFormConfig}
                    initialValues={itemData}
                    onSubmit={handleSubmit}
                    isLoading={isSaving}
                    formId={formId}
                    config={nodeFormConfig}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">
                    <p>No form configuration for type: {selectedItemType}</p>
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground p-4 text-center">
                  <p>{description}</p>
                </div>
              )}
            </div>

            {/* Footer with action buttons */}
            <div className="px-4 pb-4 pt-3 border-t border-border mt-auto bg-background/80 flex justify-end gap-2 shrink-0">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSaving}
              >
                Close
              </Button>
              {selectedItemId &&
                itemData &&
                !isLoadingData &&
                nodeFormConfig[
                  selectedItemType as keyof typeof nodeFormConfig
                ] && (
                  <Button
                    type="submit"
                    form={formId}
                    disabled={isSaving || isLoadingData}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
