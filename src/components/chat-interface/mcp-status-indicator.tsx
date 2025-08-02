/**
 * MCP Status Indicator Component
 * Shows connection status and provides controls for MCP server
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMcpClient } from "@/hooks/use-mcp-client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle, RefreshCw, WifiOff } from "lucide-react";

interface McpStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function McpStatusIndicator({
  className,
  showDetails = false,
}: McpStatusIndicatorProps) {
  const { state: mcpState, actions: mcpActions } = useMcpClient("chat");

  const getStatusInfo = () => {
    if (mcpState.isLoading) {
      return {
        icon: RefreshCw,
        color: "text-yellow-400",
        bgColor: "bg-yellow-900/30",
        borderColor: "border-yellow-400/30",
        label: "Loading...",
        description: "Loading MCP status",
      };
    }

    if (!mcpState.isConnected) {
      return {
        icon: WifiOff,
        color: "text-red-400",
        bgColor: "bg-red-900/30",
        borderColor: "border-red-400/30",
        label: "Disconnected",
        description: "MCP server not available",
      };
    }

    return {
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-900/30",
      borderColor: "border-green-400/30",
      label: "Connected",
      description: `Connected with ${mcpState.tools.length} tools and ${mcpState.prompts.length} prompts`,
    };
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  if (!showDetails) {
    // Compact indicator
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all",
                statusInfo.bgColor,
                statusInfo.borderColor,
                className
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Icon
                className={cn("w-4 h-4", statusInfo.color, {
                  "animate-spin": mcpState.isLoading,
                })}
              />
              <span className={cn("text-sm font-medium", statusInfo.color)}>
                MCP
              </span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">{statusInfo.label}</p>
              <p className="text-xs text-gray-400 mt-1">
                {statusInfo.description}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed indicator
  return (
    <motion.div
      className={cn(
        "p-4 rounded-lg border",
        statusInfo.bgColor,
        statusInfo.borderColor,
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-lg",
              mcpState.isConnected ? "bg-green-600/20" : "bg-red-600/20"
            )}
          >
            <Icon
              className={cn("w-5 h-5", statusInfo.color, {
                "animate-spin": mcpState.isLoading,
              })}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">MCP Server</h3>
              <Badge
                variant={mcpState.isConnected ? "default" : "destructive"}
                className="text-xs"
              >
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {statusInfo.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => mcpActions.refreshStatus()}
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white"
            disabled={mcpState.isLoading}
          >
            <RefreshCw
              className={cn("w-4 h-4", {
                "animate-spin": mcpState.isLoading,
              })}
            />
          </Button>
        </div>
      </div>

      {mcpState.isConnected && (
        <motion.div
          className="mt-4 grid grid-cols-3 gap-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {mcpState.tools.length}
            </div>
            <div className="text-xs text-gray-400">Tools</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {mcpState.prompts.length}
            </div>
            <div className="text-xs text-gray-400">Prompts</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
