/**
 * NEW MANGA CHAT INTERFACE ARCHITECTURE
 *
 * Design Philosophy: Claude-style chat interface with manga-specific side panels
 * - Primary focus on conversational AI workflow
 * - Side panels show manga components and structure
 * - Streamlined, distraction-free interface
 * - Progressive disclosure of complexity
 */

// ============================================================================
// LAYOUT ARCHITECTURE
// ============================================================================

/**
 * Main Layout Structure:
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                           Top Bar                                       │
 * │  [Project Name] [Status] [Export] [Settings]        [Theme] [Profile]  │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │          │                                                              │
 * │          │                                                              │
 * │   Side   │                   Chat Interface                            │
 * │  Panel   │                                                              │
 * │          │  ┌─────────────────────────────────────────────────────┐    │
 * │ ┌──────┐ │  │                                                     │    │
 * │ │Struct│ │  │           Chat Messages Area                       │    │
 * │ │ure   │ │  │                                                     │    │
 * │ └──────┘ │  │  User: Create a new character                      │    │
 * │ ┌──────┐ │  │  AI: I'll create a character for you...            │    │
 * │ │Templates│ │                                                     │    │
 * │ └──────┘ │  │                                                     │    │
 * │ ┌──────┐ │  └─────────────────────────────────────────────────────┘    │
 * │ │Images│ │  ┌─────────────────────────────────────────────────────┐    │
 * │ └──────┘ │  │  [Type your message...]              [Send] [📎] │    │
 * │          │  └─────────────────────────────────────────────────────┘    │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

// ============================================================================
// COMPONENT ARCHITECTURE
// ============================================================================

export interface NewMangaChatLayoutProps {
  projectId: string;
}

export interface SidePanelTab {
  id: string;
  name: string;
  icon: React.ComponentType;
  component: React.ComponentType<{ projectId: string }>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  type?: "text" | "image" | "component-created" | "component-updated";
  metadata?: {
    componentType?: "character" | "scene" | "chapter" | "panel";
    componentId?: string;
    action?: "created" | "updated" | "deleted";
  };
}

// ============================================================================
// SIDE PANEL COMPONENTS
// ============================================================================

/**
 * 1. PROJECT STRUCTURE PANEL
 * - Hierarchical tree view of manga components
 * - Click to focus/edit specific components
 * - Visual indicators for completion status
 * - Drag & drop reordering
 */
export interface ProjectStructurePanelProps {
  projectId: string;
  onComponentSelect: (componentId: string, type: string) => void;
}

/**
 * 2. TEMPLATE LIBRARY PANEL
 * - Browse outfit/location/pose/effect templates
 * - Preview thumbnails with quick actions
 * - Search and filter functionality
 * - Template usage tracking
 */
export interface TemplateLibraryPanelProps {
  projectId: string;
  onTemplateSelect: (templateId: string, type: string) => void;
}

/**
 * 3. GENERATED ASSETS PANEL
 * - All generated images and content
 * - Character portraits, location renders, panel images
 * - Grid view with metadata
 * - Quick regeneration actions
 */
export interface GeneratedAssetsPanelProps {
  projectId: string;
  onAssetAction: (assetId: string, action: string) => void;
}

/**
 * 4. EXPORT & SHARING PANEL
 * - Export options (PDF, CBZ, web)
 * - Sharing settings and links
 * - Publication status management
 * - Analytics and viewer stats
 */
export interface ExportSharingPanelProps {
  projectId: string;
}

// ============================================================================
// ENHANCED CHAT FEATURES
// ============================================================================

/**
 * Chat Enhancement Features:
 *
 * 1. CONTEXTUAL AWARENESS
 *    - Chat remembers current component being edited
 *    - Smart suggestions based on project state
 *    - Template recommendations
 *
 * 2. RICH MESSAGE TYPES
 *    - Text responses with markdown
 *    - Embedded component previews
 *    - Image generation results
 *    - Action confirmations
 *
 * 3. QUICK ACTIONS
 *    - Generate image from description
 *    - Create component from template
 *    - Regenerate with variations
 *    - Export current state
 *
 * 4. SMART CONTEXT MENU
 *    - Right-click components for chat actions
 *    - "Ask AI about this character"
 *    - "Generate variations of this scene"
 *    - "Improve this dialogue"
 */

export interface ChatContextActions {
  generateImage: (description: string) => Promise<void>;
  createComponent: (type: string, data: any) => Promise<void>;
  updateComponent: (id: string, updates: any) => Promise<void>;
  deleteComponent: (id: string, type: string) => Promise<void>;
  regenerateWithVariations: (id: string) => Promise<void>;
}

// ============================================================================
// RESPONSIVE BEHAVIOR
// ============================================================================

/**
 * Responsive Design Strategy:
 *
 * Desktop (1200px+):
 * - Full side panel (300px) + chat area
 * - All tabs visible simultaneously
 * - Rich preview capabilities
 *
 * Tablet (768px - 1199px):
 * - Collapsible side panel (overlay mode)
 * - Tab switching for different panels
 * - Optimized touch interactions
 *
 * Mobile (< 768px):
 * - Full-screen chat interface
 * - Bottom sheet for quick access to components
 * - Swipe gestures for navigation
 */

export interface ResponsiveBreakpoints {
  mobile: number; // < 768px
  tablet: number; // 768px - 1199px
  desktop: number; // >= 1200px
}

// ============================================================================
// PERFORMANCE OPTIMIZATIONS
// ============================================================================

/**
 * Performance Strategy:
 *
 * 1. VIRTUAL SCROLLING
 *    - Chat messages virtualized for long conversations
 *    - Component lists virtualized for large projects
 *
 * 2. LAZY LOADING
 *    - Side panel content loaded on demand
 *    - Images loaded progressively with placeholders
 *
 * 3. SMART CACHING
 *    - Template previews cached locally
 *    - Component states cached with invalidation
 *
 * 4. OPTIMISTIC UPDATES
 *    - UI updates immediately, sync in background
 *    - Rollback capability for failed operations
 */

// ============================================================================
// ACCESSIBILITY FEATURES
// ============================================================================

/**
 * Accessibility Implementation:
 *
 * 1. KEYBOARD NAVIGATION
 *    - Full keyboard support for all interactions
 *    - Logical tab order throughout interface
 *    - Keyboard shortcuts for common actions
 *
 * 2. SCREEN READER SUPPORT
 *    - Proper ARIA labels and descriptions
 *    - Live regions for chat updates
 *    - Semantic HTML structure
 *
 * 3. HIGH CONTRAST MODE
 *    - Support for system high contrast themes
 *    - Customizable color schemes
 *    - Reduced motion options
 *
 * 4. INTERNATIONALIZATION
 *    - RTL language support
 *    - Culturally appropriate manga conventions
 *    - Multi-language template library
 */

export interface AccessibilityOptions {
  highContrast: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  screenReader: boolean;
}

// ============================================================================
// INTEGRATION WITH EXISTING FLOWS
// ============================================================================

/**
 * Flow Integration Strategy:
 *
 * 1. PRESERVE EXISTING LOGIC
 *    - Keep all current AI flows unchanged
 *    - Maintain data service layer
 *    - Preserve template system
 *
 * 2. ENHANCE WITH CONTEXT
 *    - Pass side panel state to flows
 *    - Include selected component context
 *    - Add template suggestions to prompts
 *
 * 3. VISUAL FEEDBACK
 *    - Show flow progress in chat
 *    - Display generation status
 *    - Provide cancel/retry options
 *
 * 4. SMART SUGGESTIONS
 *    - AI suggests next logical steps
 *    - Template recommendations based on context
 *    - Completion percentage tracking
 */

export interface FlowIntegration {
  currentContext: {
    selectedComponent?: { id: string; type: string };
    activeTemplates: string[];
    projectProgress: number;
  };
  suggestions: Array<{
    action: string;
    description: string;
    confidence: number;
  }>;
}
