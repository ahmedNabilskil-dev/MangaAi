/**
 * MCP Prompt Selector Component
 * Allows users to browse and select MCP prompts for execution
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { McpPrompt, useMcpClient } from "@/hooks/use-mcp-client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Code,
  FileText,
  Image,
  Layers,
  Loader2,
  MessageCircle,
  Play,
  Search,
  Users,
  Wand2,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";

interface McpPromptSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onPromptExecute: (promptName: string, args?: any) => void;
  projectId: string;
}

const promptIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "character-generation": Users,
  "chapter-generation": FileText,
  "scene-generation": Layers,
  "panel-generation": Image,
  "character-update": Users,
  "chapter-update": FileText,
  "dialogue-generation": MessageCircle,
  "dialogue-update": MessageCircle,
  "scene-update": Layers,
  "panel-update": Image,
  "character-image": Users,
  "panel-image": Image,
  "outfit-template-update": Users,
  "location-image": Layers,
  "character-with-templates": Users,
};

export function McpPromptSelector({
  isOpen,
  onClose,
  onPromptExecute,
  projectId,
}: McpPromptSelectorProps) {
  const { state: mcpState, actions: mcpActions } = useMcpClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<McpPrompt | null>(null);
  const [promptArgs, setPromptArgs] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);

  // Filter prompts based on search term
  const filteredPrompts = useMemo(() => {
    if (!searchTerm.trim()) return mcpState.prompts;

    return mcpState.prompts.filter(
      (prompt) =>
        prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mcpState.prompts, searchTerm]);

  // Group prompts by category
  const groupedPrompts = useMemo(() => {
    const groups: Record<string, McpPrompt[]> = {
      generation: [],
      update: [],
      image: [],
      other: [],
    };

    filteredPrompts.forEach((prompt) => {
      if (prompt.name.includes("generation")) {
        groups.generation.push(prompt);
      } else if (prompt.name.includes("update")) {
        groups.update.push(prompt);
      } else if (prompt.name.includes("image")) {
        groups.image.push(prompt);
      } else {
        groups.other.push(prompt);
      }
    });

    return groups;
  }, [filteredPrompts]);

  const handlePromptSelect = useCallback(
    (prompt: McpPrompt) => {
      setSelectedPrompt(prompt);

      // Initialize prompt arguments with defaults
      const initialArgs: Record<string, string> = {
        projectId: projectId,
      };

      // Add any required arguments from the prompt definition
      prompt.arguments?.forEach((arg: any) => {
        if (!initialArgs[arg.name]) {
          initialArgs[arg.name] = "";
        }
      });

      setPromptArgs(initialArgs);
    },
    [projectId]
  );

  const handleExecutePrompt = async () => {
    if (!selectedPrompt || !mcpState.isConnected) return;

    try {
      setIsExecuting(true);

      // Use the promptArgs to populate the input, not execute immediately
      onPromptExecute(selectedPrompt.name, promptArgs);

      // Close the dialog after selecting
      onClose();
    } catch (error) {
      console.error("Error handling prompt:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleArgChange = useCallback((argName: string, value: string) => {
    setPromptArgs((prev) => ({
      ...prev,
      [argName]: value,
    }));
  }, []);

  const getPromptIcon = (promptName: string) => {
    const IconComponent = promptIcons[promptName] || Code;
    return IconComponent;
  };

  if (!mcpState.isConnected) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>MCP Prompts Unavailable</DialogTitle>
            <DialogDescription>
              The MCP server is not connected. Please check the connection and
              try again.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              MCP Prompts
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Select and execute Model Context Protocol prompts for advanced manga
            creation
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Panel - Prompt List */}
          <div className="flex-1 flex flex-col">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Prompt Groups */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {Object.entries(groupedPrompts).map(([category, prompts]) => {
                if (prompts.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                      {category} ({prompts.length})
                    </h3>
                    <div className="space-y-2">
                      {prompts.map((prompt) => {
                        const Icon = getPromptIcon(prompt.name);
                        return (
                          <motion.div
                            key={prompt.name}
                            className={cn(
                              "p-3 rounded-lg cursor-pointer transition-all border",
                              selectedPrompt?.name === prompt.name
                                ? "bg-purple-900/50 border-purple-400/50 shadow-lg shadow-purple-500/10"
                                : "bg-gray-800/50 border-gray-600/50 hover:border-purple-400/30 hover:bg-gray-800/70"
                            )}
                            onClick={() => handlePromptSelect(prompt)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                                <Icon className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white text-sm truncate">
                                  {prompt.name
                                    .replace(/-/g, " ")
                                    .replace(/\b\w/g, (l: string) =>
                                      l.toUpperCase()
                                    )}
                                </h4>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                  {prompt.description}
                                </p>
                                {prompt.arguments &&
                                  prompt.arguments.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {prompt.arguments
                                        .slice(0, 3)
                                        .map((arg) => (
                                          <Badge
                                            key={arg.name}
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {arg.name}
                                          </Badge>
                                        ))}
                                      {prompt.arguments.length > 3 && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          +{prompt.arguments.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel - Prompt Configuration */}
          {selectedPrompt && (
            <motion.div
              className="w-80 border-l border-gray-700 pl-4 flex flex-col"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Configure Prompt
                </h3>
                <p className="text-sm text-gray-400">
                  {selectedPrompt.description}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4">
                {selectedPrompt.arguments?.map((arg) => (
                  <div key={arg.name}>
                    <Label className="text-sm font-medium text-gray-300">
                      {arg.name
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str: string) => str.toUpperCase())}
                      {arg.required && (
                        <span className="text-red-400 ml-1">*</span>
                      )}
                    </Label>
                    {arg.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {arg.description}
                      </p>
                    )}
                    {Array.isArray(arg.enum) && arg.enum.length > 0 ? (
                      <div className="mt-2">
                        <select
                          value={promptArgs[arg.name] || ""}
                          onChange={(e) =>
                            handleArgChange(arg.name, e.target.value)
                          }
                          className="block w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-blue-500 focus:ring focus:ring-blue-500/50"
                        >
                          <option value="">Select {arg.name}...</option>
                          {arg.enum.map((option: string) => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : arg.name.toLowerCase().includes("description") ||
                      arg.name.toLowerCase().includes("input") ||
                      arg.name.toLowerCase().includes("content") ? (
                      <Textarea
                        value={promptArgs[arg.name] || ""}
                        onChange={(e) =>
                          handleArgChange(arg.name, e.target.value)
                        }
                        placeholder={`Enter ${arg.name}...`}
                        className="mt-2 bg-gray-800 border-gray-600 text-white"
                        rows={3}
                      />
                    ) : (
                      <Input
                        type="text"
                        value={promptArgs[arg.name] || ""}
                        onChange={(e) =>
                          handleArgChange(arg.name, e.target.value)
                        }
                        placeholder={`Enter ${arg.name}...`}
                        className="mt-2 bg-gray-800 border-gray-600 text-white"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-700">
                <Button
                  onClick={handleExecutePrompt}
                  disabled={isExecuting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Execute Prompt
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
