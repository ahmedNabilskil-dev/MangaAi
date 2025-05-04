'use client';

import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import Input for search
import { Square, MessageCircle, Image as ImageIcon, Type, Upload, LayoutTemplate, Minus, X, Search } from 'lucide-react'; // Added Search icon
import { useEditorStore } from '@/store/editor-store';
import type { ShapeConfig, PanelProps, BubbleProps, ImageShapeConfig, TextShapeConfig } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import Image from 'next/image'; // Import next/image for placeholders

type Category = 'panels' | 'bubbles' | 'images' | 'text' | 'uploads' | null;

// --- SVG Components for Previews ---

const SpeechBubblePreview: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-auto", className)}>
        <path d="M 10 10 C 5 10, 0 15, 0 20 V 50 C 0 55, 5 60, 10 60 H 30 L 40 75 L 50 60 H 90 C 95 60, 100 55, 100 50 V 20 C 100 15, 95 10, 90 10 Z" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2"/>
    </svg>
);

const ThoughtBubblePreview: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-auto", className)}>
        <ellipse cx="50" cy="35" rx="48" ry="28" fill="hsl(var(--card))" stroke="hsl(var(--foreground))" strokeWidth="2"/>
        <ellipse cx="25" cy="65" rx="6" ry="4" fill="hsl(var(--foreground))" />
        <ellipse cx="15" cy="72" rx="4" ry="3" fill="hsl(var(--foreground))" />
        <ellipse cx="8" cy="76" rx="2" ry="1.5" fill="hsl(var(--foreground))" />
    </svg>
);

const PanelPreview: React.FC<{ className?: string; type?: 'single' | 'grid' | 'vertical' }> = ({ className, type = 'single' }) => (
    <div className={cn("border-2 border-foreground/50 rounded w-full aspect-square flex items-center justify-center p-1 bg-card", className)}>
        {type === 'single' && <Square size={24} className="text-muted-foreground" />}
        {type === 'grid' && <LayoutTemplate size={24} className="text-muted-foreground" />}
        {type === 'vertical' && <Minus size={24} className="text-muted-foreground rotate-90" />}
    </div>
);

// --- Library Panel Component ---

const LibraryPanel: React.FC = () => {
    const addShape = useEditorStore((state) => state.addShape);
    const [activeCategory, setActiveCategory] = useState<Category>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const createShape = (type: ShapeConfig['type'], specificPropsOverride?: Partial<ShapeConfig['props']>) => {
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
                    bubbleType: specificPropsOverride?.bubbleType ?? 'speech', // Use override or default
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
                    fill: '#f0f0f0', // Placeholder background
                    stroke: '#cccccc',
                };
                 specificProps = {} as ImageShapeConfig['props'];
                 // Use a more relevant placeholder
                 specificConfig.src = `https://picsum.photos/seed/${uuidv4().substring(0,6)}/150/100`;
                break;
            case 'text':
                specificConfig = {
                    width: 120,
                    height: 40,
                    strokeWidth: 0,
                    fill: 'black', // Text color
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
            props: { ...specificProps, ...specificPropsOverride }, // Merge defaults with overrides
        };
        addShape(newShape);
    };

    const handleCategoryClick = (category: Category) => {
        setActiveCategory(current => current === category ? null : category);
        setSearchTerm(''); // Clear search on category change
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

     // Simple filtering logic (expand later if needed)
     const filterItems = (items: any[], key: string) => {
         if (!searchTerm) return items;
         return items.filter(item => item[key]?.toLowerCase().includes(searchTerm));
     };


    const renderCategoryContent = () => {
        // Placeholder items - replace with actual data source if needed
        const panelTemplates = [
            { key: 'single', label: 'Blank Panel', type: 'single', action: () => createShape('panel') },
            { key: 'grid', label: '2x2 Grid', type: 'grid', disabled: true },
            { key: 'vertical', label: 'Vertical Split', type: 'vertical', disabled: true },
        ];
        const bubbleTypes = [
             { key: 'speech', label: 'Speech Bubble', type: 'speech', action: () => createShape('bubble', { bubbleType: 'speech' }) },
             { key: 'thought', label: 'Thought Bubble', type: 'thought', action: () => createShape('bubble', { bubbleType: 'thought' }) },
            // { key: 'scream', label: 'Scream Bubble', type: 'scream', disabled: true },
        ];
         const imageItems = [
            { key: 'placeholder1', label: 'Placeholder 1', action: () => createShape('image'), src: 'https://picsum.photos/seed/img1/150/100', dataAiHint: 'landscape' },
            { key: 'placeholder2', label: 'Placeholder 2', action: () => createShape('image'), src: 'https://picsum.photos/seed/img2/150/100', dataAiHint: 'city street' },
            { key: 'placeholder3', label: 'Placeholder 3', action: () => createShape('image'), src: 'https://picsum.photos/seed/img3/150/100', dataAiHint: 'abstract pattern' },
         ];
        const textItems = [
             { key: 'textbox', label: 'Add Text Box', action: () => createShape('text') },
         ];
         const uploadItems = [
            { key: 'upload', label: 'Upload Image (soon)', disabled: true }
         ];

         const filteredPanels = filterItems(panelTemplates, 'label');
         const filteredBubbles = filterItems(bubbleTypes, 'label');
         const filteredImages = filterItems(imageItems, 'label');
         const filteredTexts = filterItems(textItems, 'label');
         const filteredUploads = filterItems(uploadItems, 'label');


        switch (activeCategory) {
            case 'panels':
                return (
                    <div className="grid grid-cols-2 gap-3 p-4">
                        {filteredPanels.map(panel => (
                            <Button
                                key={panel.key}
                                variant="outline"
                                className="h-auto flex flex-col p-2 space-y-1 items-center justify-center"
                                onClick={panel.action}
                                disabled={panel.disabled}
                            >
                                <PanelPreview type={panel.type as any} className="w-16 h-16 mb-1" />
                                <span className="text-xs text-center">{panel.label}</span>
                            </Button>
                        ))}
                    </div>
                );
            case 'bubbles':
                 return (
                    <div className="grid grid-cols-2 gap-3 p-4">
                        {filteredBubbles.map(bubble => (
                            <Button
                                key={bubble.key}
                                variant="outline"
                                className="h-auto flex flex-col p-2 space-y-1 items-center justify-center"
                                onClick={bubble.action}
                                disabled={bubble.disabled}
                            >
                                {bubble.type === 'speech' && <SpeechBubblePreview className="w-16 h-12 mb-1"/>}
                                {bubble.type === 'thought' && <ThoughtBubblePreview className="w-16 h-12 mb-1"/>}
                                {/* Add other bubble previews */}
                                <span className="text-xs text-center">{bubble.label}</span>
                            </Button>
                        ))}
                    </div>
                 );
             case 'images':
                 return (
                    <div className="grid grid-cols-2 gap-3 p-4">
                        {filteredImages.map(img => (
                             <Button
                                 key={img.key}
                                 variant="outline"
                                 className="h-auto flex flex-col p-1 items-center justify-center relative group overflow-hidden"
                                 onClick={img.action}
                                 disabled={img.disabled}
                             >
                                 <Image
                                      src={img.src}
                                      alt={img.label}
                                      width={100}
                                      height={75}
                                      className="object-cover rounded-sm group-hover:scale-105 transition-transform duration-200"
                                      data-ai-hint={img.dataAiHint}
                                  />
                                 {/* <span className="text-xs mt-1">{img.label}</span> */}
                             </Button>
                         ))}
                         <div className="col-span-2 text-xs text-muted-foreground text-center pt-2">
                            User uploads coming soon.
                        </div>
                    </div>
                 );
            case 'text':
                return (
                    <div className="p-4 space-y-3">
                        {filteredTexts.map(text => (
                             <Button key={text.key} variant="outline" className="w-full justify-start" onClick={text.action}>
                                <Type className="mr-2 h-4 w-4" /> {text.label}
                            </Button>
                        ))}
                    </div>
                );
             case 'uploads':
                 return (
                    <div className="p-4 space-y-3">
                         {filteredUploads.map(upload => (
                            <Button key={upload.key} variant="outline" className="w-full justify-start" disabled={upload.disabled}>
                                 <Upload className="mr-2 h-4 w-4" /> {upload.label}
                            </Button>
                         ))}
                         <p className="text-xs text-muted-foreground">Upload your own assets.</p>
                    </div>
                 );
            default:
                return (
                    <div className="p-4 flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground text-center">Select a category from the left</p>
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
                    {/* Search/Filter Header */}
                    {activeCategory && (
                         <div className="p-3 border-b border-border flex items-center gap-2">
                             {/* Title removed for more space, or keep it small */}
                             {/* <h3 className="text-xs font-semibold text-muted-foreground capitalize truncate">
                                 {activeCategory}
                             </h3> */}
                              <div className="relative flex-grow">
                                 <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                 <Input
                                     type="text"
                                     placeholder="Search..."
                                     className="pl-8 h-8 text-xs bg-input focus-visible:ring-primary"
                                     value={searchTerm}
                                     onChange={handleSearchChange}
                                 />
                              </div>

                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActiveCategory(null)}>
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