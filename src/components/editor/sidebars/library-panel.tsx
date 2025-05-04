
'use client';

import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Square, MessageCircle, Image as ImageIcon, Type, Upload, LayoutTemplate, Minus, X } from 'lucide-react'; // Added X icon
import { useEditorStore } from '@/store/editor-store';
import type { ShapeConfig, PanelProps, BubbleProps, ImageShapeConfig, TextShapeConfig } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'; // Import Tooltip components


type Category = 'panels' | 'bubbles' | 'images' | 'text' | 'uploads' | null;

const LibraryPanel: React.FC = () => {
    const addShape = useEditorStore((state) => state.addShape);
    const [activeCategory, setActiveCategory] = useState<Category>(null);

    const createShape = (type: ShapeConfig['type']) => {
        // Base properties for Fabric.js
        const baseProps: Omit<ShapeConfig, 'id' | 'type' | 'props'> = {
        left: 50 + Math.random() * 150, // Initial position using left/top
        top: 50 + Math.random() * 150,
        width: type === 'bubble' || type === 'text' ? 150 : 200, // Initial dimensions
        height: type === 'bubble' || type === 'text' ? 80 : 150,
        angle: 0,
        scaleX: 1,
        scaleY: 1,
        fill: 'transparent', // Default fill
        stroke: 'black',     // Default stroke
        strokeWidth: 1,      // Default stroke width
        opacity: 1,
        visible: true,
        };

        let specificProps: ShapeConfig['props'] = {};
        let specificConfig: Partial<ShapeConfig> = {};

        // Add specific default props and config based on type
        switch (type) {
            case 'panel':
                specificConfig = {
                    fill: 'rgba(220, 220, 220, 0.5)',
                    stroke: 'black',
                    strokeWidth: 1,
                };
                specificProps = {} as PanelProps;
                break;
            case 'bubble':
                specificConfig = {
                    fill: 'white',
                    stroke: 'black',
                    strokeWidth: 1,
                    width: 150,
                    height: 80,
                };
                specificProps = {
                    text: 'New Bubble',
                    bubbleType: 'speech',
                    tailDirection: 'bottom',
                    fontSize: 14,
                    textColor: 'black',
                } as BubbleProps;
                break;
            case 'image':
                specificConfig = {
                    width: 150,
                    height: 100,
                    strokeWidth: 0,
                    fill: '#f0f0f0',
                    stroke: '#cccccc',
                };
                specificProps = {} as ImageShapeConfig['props'];
                specificConfig.src = 'https://picsum.photos/seed/placeholderimg/150/100';
                break;
            case 'text':
                specificConfig = {
                    width: 120,
                    height: 40,
                    strokeWidth: 0,
                    fill: 'black',
                };
                specificProps = {
                    text: 'New Text',
                    fontSize: 20,
                } as TextShapeConfig['props'];
                break;
            default:
                break;
        }

        const newShape: ShapeConfig = {
            id: uuidv4(),
            type: type,
            ...baseProps,
            ...specificConfig,
            props: specificProps,
        };
        addShape(newShape);
    };

    const handleCategoryClick = (category: Category) => {
        setActiveCategory(current => current === category ? null : category);
    };

    const renderCategoryContent = () => {
        switch (activeCategory) {
            case 'panels':
                return (
                    <div className="p-4 space-y-3">
                        <h4 className="font-semibold text-sm mb-2">Panel Templates</h4>
                        <Button variant="outline" className="w-full justify-start" onClick={() => createShape('panel')}>
                            <Square className="mr-2 h-4 w-4" /> Blank Panel
                        </Button>
                        {/* Add more panel template buttons here */}
                        <Button variant="outline" className="w-full justify-start" disabled>
                             <LayoutTemplate className="mr-2 h-4 w-4" /> 2x2 Grid (coming soon)
                        </Button>
                         <Button variant="outline" className="w-full justify-start" disabled>
                             <Minus className="mr-2 h-4 w-4 rotate-90" /> Vertical Split (coming soon)
                        </Button>
                    </div>
                );
            case 'bubbles':
                return (
                    <div className="p-4 space-y-3">
                        <h4 className="font-semibold text-sm mb-2">Speech Bubbles</h4>
                        <Button variant="outline" className="w-full justify-start" onClick={() => createShape('bubble')}>
                            <MessageCircle className="mr-2 h-4 w-4" /> Speech Bubble
                        </Button>
                        {/* Add more bubble types */}
                         <Button variant="outline" className="w-full justify-start" disabled>
                            <MessageCircle className="mr-2 h-4 w-4 opacity-50" /> Thought Bubble (coming soon)
                        </Button>
                    </div>
                );
             case 'images':
                return (
                    <div className="p-4 space-y-3">
                        <h4 className="font-semibold text-sm mb-2">Images</h4>
                        <Button variant="outline" className="w-full justify-start" onClick={() => createShape('image')}>
                            <ImageIcon className="mr-2 h-4 w-4" /> Placeholder Image
                        </Button>
                        {/* Add image library/upload functionality here */}
                        <p className="text-xs text-muted-foreground">User uploads coming soon.</p>
                    </div>
                );
            case 'text':
                return (
                    <div className="p-4 space-y-3">
                        <h4 className="font-semibold text-sm mb-2">Text</h4>
                        <Button variant="outline" className="w-full justify-start" onClick={() => createShape('text')}>
                            <Type className="mr-2 h-4 w-4" /> Add Text Box
                        </Button>
                         {/* Add font options etc. */}
                    </div>
                );
             case 'uploads':
                 return (
                    <div className="p-4 space-y-3">
                        <h4 className="font-semibold text-sm mb-2">Uploads</h4>
                        <Button variant="outline" className="w-full justify-start" disabled>
                             <Upload className="mr-2 h-4 w-4" /> Upload Image (coming soon)
                        </Button>
                        <p className="text-xs text-muted-foreground">Upload your own assets.</p>
                    </div>
                 );
            default:
                return (
                    <div className="p-4 flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground text-center">Select a category</p>
                    </div>
                );
        }
    };

    return (
        <aside className="h-full flex bg-card border-r border-border">
            {/* Primary Icon Navigation */}
            <TooltipProvider delayDuration={100}>
                 <nav className="w-16 h-full flex flex-col items-center py-4 border-r border-border shrink-0 space-y-2">
                     <NavButton
                         label="Panels"
                         icon={Square}
                         isActive={activeCategory === 'panels'}
                         onClick={() => handleCategoryClick('panels')}
                     />
                     <NavButton
                         label="Bubbles"
                         icon={MessageCircle}
                         isActive={activeCategory === 'bubbles'}
                         onClick={() => handleCategoryClick('bubbles')}
                     />
                     <NavButton
                         label="Images"
                         icon={ImageIcon}
                         isActive={activeCategory === 'images'}
                         onClick={() => handleCategoryClick('images')}
                     />
                     <NavButton
                         label="Text"
                         icon={Type}
                         isActive={activeCategory === 'text'}
                         onClick={() => handleCategoryClick('text')}
                     />
                      <Separator className="my-4 w-8" />
                      <NavButton
                         label="Uploads"
                         icon={Upload}
                         isActive={activeCategory === 'uploads'}
                         onClick={() => handleCategoryClick('uploads')}
                     />
                     {/* Add more category icons */}
                 </nav>
            </TooltipProvider>

            {/* Secondary Content Panel (conditionally rendered) */}
             <div
                className={cn(
                    "transition-all duration-300 ease-in-out overflow-hidden",
                    activeCategory ? "w-64 border-r border-border" : "w-0 border-r-0"
                )}
             >
                <div className="h-full w-64 flex flex-col"> {/* Fixed width inner container */}
                    {/* Optional Header for Secondary Panel */}
                    {activeCategory && (
                         <div className="p-3 border-b border-border flex items-center justify-between">
                           <h3 className="text-sm font-semibold text-muted-foreground capitalize">
                                {activeCategory}
                           </h3>
                           <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActiveCategory(null)}>
                             <X size={16} />
                           </Button>
                         </div>
                    )}
                    <ScrollArea className="flex-1">
                        {renderCategoryContent()}
                    </ScrollArea>
                 </div>
            </div>
        </aside>
    );
};

// Helper component for navigation buttons with tooltips
interface NavButtonProps {
    label: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, icon: Icon, isActive, onClick }) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="icon"
                    className={cn(
                        "h-10 w-10 rounded-lg", // Slightly larger and rounded
                        isActive ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={onClick}
                    aria-label={label}
                >
                    <Icon size={20} />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}>
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    );
};

export default LibraryPanel;

