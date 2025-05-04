
'use client';

import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
    onFileChange: (file: File | null) => void;
    label?: string;
    accept?: string; // e.g., "image/*,application/pdf"
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
    ({ onFileChange, label = 'Upload File', accept, className, disabled, ...props }, ref) => {
        const internalRef = useRef<HTMLInputElement>(null);
        const [fileName, setFileName] = useState<string | null>(null);

        const handleButtonClick = () => {
            (ref || internalRef).current?.click();
        };

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files ? event.target.files[0] : null;
            if (file) {
                setFileName(file.name);
                onFileChange(file);
            } else {
                // Handle case where file selection is cancelled
                // setFileName(null); // Optionally clear name if cancelled
                // onFileChange(null);
            }
             // Reset input value to allow re-uploading the same file
             event.target.value = '';
        };

        const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
             event.stopPropagation(); // Prevent triggering the file input again
             setFileName(null);
             onFileChange(null);
             if ((ref || internalRef).current) {
                 (ref || internalRef).current.value = '';
             }
         };


        return (
            <div className={cn('flex flex-col space-y-1 w-full', className)}>
                 {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
                <div className="flex items-center space-x-2">
                     <Button
                         type="button"
                         variant="outline"
                         onClick={handleButtonClick}
                         disabled={disabled}
                         className="flex-grow justify-start text-left font-normal text-muted-foreground hover:text-foreground"
                     >
                         <UploadCloud className="mr-2 h-4 w-4" />
                         {fileName ? (
                             <span className="truncate">{fileName}</span>
                         ) : (
                             'Choose a file...'
                         )}
                     </Button>
                     {fileName && (
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

FileUpload.displayName = 'FileUpload';

export { FileUpload };
