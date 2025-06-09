"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UploadCloud, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react"; // Added useEffect

interface FileUploadProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange"
  > {
  onFileChange: (file: File | null | string) => void; // Allow passing string URL back
  label?: string;
  accept?: string; // e.g., "image/*,application/pdf"
  currentFile?: string | File | null; // New prop to show existing file/url
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    { onFileChange, label, accept, className, disabled, currentFile, ...props },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const [displayFileName, setDisplayFileName] = useState<string | null>(null);

    // Effect to update display name when currentFile prop changes
    useEffect(() => {
      if (currentFile instanceof File) {
        setDisplayFileName(currentFile.name);
      } else if (typeof currentFile === "string") {
        // Display the last part of the URL or the full string if not a URL
        try {
          const url = new URL(currentFile);
          setDisplayFileName(url.pathname.split("/").pop() || currentFile);
        } catch {
          setDisplayFileName(currentFile); // Display as is if not a valid URL
        }
      } else {
        setDisplayFileName(null);
      }
    }, [currentFile]);

    const handleButtonClick = () => {
      (ref || (internalRef as any)).current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files ? event.target.files[0] : null;
      if (file) {
        setDisplayFileName(file.name);
        onFileChange(file); // Pass the File object up
      }
      // Reset input value to allow re-uploading the same file
      event.target.value = "";
    };

    const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation(); // Prevent triggering the file input again
      setDisplayFileName(null);
      onFileChange(null); // Indicate clearing
      if ((ref || (internalRef as any)).current) {
        (ref || (internalRef as any)).current.value = "";
      }
    };

    return (
      <div className={cn("flex flex-col space-y-1 w-full", className)}>
        {label && (
          <span className="text-xs text-muted-foreground">{label}</span>
        )}{" "}
        {/* Adjusted label size */}
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={disabled}
            className="flex-grow justify-start text-left font-normal text-muted-foreground hover:text-foreground h-8 text-xs" // Adjusted size and text
          >
            <UploadCloud className="mr-2 h-3 w-3" /> {/* Adjusted icon size */}
            {displayFileName ? (
              <span className="truncate">{displayFileName}</span>
            ) : (
              "Choose or Upload File..."
            )}
          </Button>
          {displayFileName && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleClear}
              disabled={disabled}
              aria-label="Clear file"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Input
          ref={ref || internalRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
          disabled={disabled}
          {...props}
        />
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";

export { FileUpload };
