"use client";

import SidebarItem from "@/components/side-item/SideItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMcpClient } from "@/hooks/use-mcp-client";
import { cleanOrphanedData, deleteProject } from "@/services/data-service";
import { mcpClient } from "@/services/mcp-client";
import { MangaProject } from "@/types/entities";
import { MangaStatus } from "@/types/enums";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookMarked,
  BookOpen,
  Edit3,
  Filter,
  Home,
  Key,
  Link,
  Loader2,
  Menu,
  MoreVertical,
  Plus,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const ProjectsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mangaIdea, setMangaIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [projects, setProjects] = useState<MangaProject[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    genre: "",
    status: "",
  });
  const { actions } = useMcpClient();
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    // TODO: Implement readResource in MCP client
    // const { contents } = await actions.readResource("manga://projects");
    // setProjects(JSON.parse(contents[0].text));
    setProjects([]); // Temporary fallback
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Extract unique genres and statuses for filters
  const genres = [...new Set(projects.map((project) => project.genre))];
  const statuses = [...new Set(projects.map((project) => project.status))];

  // Filter projects based on search query and active filters
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      searchQuery === "" ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.genre?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre =
      activeFilters.genre === "" || project.genre === activeFilters.genre;

    const matchesStatus =
      activeFilters.status === "" || project.status === activeFilters.status;

    return matchesSearch && matchesGenre && matchesStatus;
  });

  const openDialog = () => {
    setIsDialogOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setMangaIdea("");
  };

  const router = useRouter();

  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);

  // Updated handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mangaIdea.trim()) return;

    // Check if API key exists in localStorage
    const apiKey = localStorage.getItem("api-key");

    if (!apiKey) {
      setIsApiKeyDialogOpen(true);
      return;
    }

    setIsGenerating(true);
    try {
      // Check if MCP server is available for project creation
      const isConnected = await mcpClient.checkConnection();

      if (isConnected) {
        // Dynamically import ChatAdapterFactory to avoid circular deps
        const { ChatAdapterFactory } = await import("@/ai/adapters/factory");
        const geminiAdapter = ChatAdapterFactory.getAdapter("gemini", apiKey);
        if (!geminiAdapter) throw new Error("Gemini adapter not found");

        // Use MCP story-generation prompt to create the project concept
        const promptTemplate = await mcpClient.getPromptTemplate(
          "story-generation",
          {
            user_input: mangaIdea,
            target_audience: "young-adult", // Could be made configurable
            preferred_genre: "", // Could be made configurable
          }
        );

        // Get MCP create-project tool definition
        const mcpToolsRaw = await mcpClient.getProjectCreationTools();
        const mcpTools = mcpToolsRaw.map((tool) => ({
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
          execute: async (args: any) => {
            const { mcpClient } = await import("@/services/mcp-client");
            return await mcpClient.callTool(tool.name, args);
          },
        }));

        // Send the prompt using the Gemini adapter and MCP tools
        const messages = [{ role: "user" as const, content: promptTemplate }];
        const params = {
          model: "gemini-2.0-flash",
          systemPrompt: `You are an elite manga creator and narrative worldbuilder with expertise in both Eastern and Western storytelling traditions. Your task is to develop a structured, professional-grade blueprint for a compelling, original manga project that will be stored in our database.
  
  This is Phase 1 of our manga production pipeline. You are building this project from scratch based on the user's ideas, genre preferences, or inspiration.
  
  ## OUTPUT REQUIREMENTS
  Your output MUST strictly align with our MangaProject entity structure for direct database integration. Include ALL required fields with detailed, creative content.
  
  ## PROJECT COMPONENTS
  
  🧩 Core Concept & Metadata
  - title: A distinctive, memorable title that encapsulates the core concept and appeals to the target audience.
  - description: A concise yet comprehensive overview of the entire manga concept (150-200 words).
  - concept: The bold, original premise that defines what makes this story special and distinguishes it from similar works.
  - genre: The primary genre classification with potential subgenres (e.g., psychological shonen, dark fantasy seinen).
  - targetAudience: MUST be one of ["children", "teen", "young-adult", "adult"].
  - artStyle: Suggest a specific visual aesthetic that enhances the narrative (reference existing artists/styles if helpful).
  - tags: An array of precise keywords for searchability (8-12 tags).
  
  🌍 Worldbuilding (worldDetails object)
  - summary: A rich overview of the world's unique elements and what makes it captivating (150 words).
  - history: Key historical events, eras, and turning points that shaped the world and affect the present story.
  - society: In-depth details on cultures, social structures, belief systems, political dynamics, or power hierarchies.
  - uniqueSystems: Comprehensive explanation of special systems (magic, technology, supernatural abilities, laws) that define life in this world and their narrative implications.
  
  🎭 Themes, Motifs & Symbols
  - themes: Array of sophisticated central themes with depth and nuance (e.g., the corruption of power, sacrifice vs. selfishness).
  - motifs: Array of recurring visual/narrative patterns that reinforce themes (e.g., broken mirrors, cherry blossoms).
  - symbols: Array of key symbols with layered meanings relevant to character development or world concepts.
  
  🧩 Plot Framework (plotStructure object)
  - incitingIncident: The catalyst event that disrupts the status quo and launches the protagonist's journey.
  - plotTwist: A major revelation or shift that fundamentally alters the protagonist's path or understanding.
  - climax: The peak dramatic moment of the first major arc with high emotional stakes.
  - resolution: The current resolution (even if temporary) that sets up future developments.
  
  
  ## CREATION STANDARDS
  1. Originality: Develop genuinely fresh concepts while understanding genre traditions
  2. Emotional Depth: Create a world and story that can sustain complex emotional narratives
  3. Visual Potential: Consider how concepts translate to visual storytelling
  4. Internal Consistency: Maintain logical coherence in all worldbuilding elements
  5. Narrative Hooks: Build in compelling mysteries and questions that drive reader engagement
  6. Cultural Sensitivity: Develop respectful, nuanced cultural elements
  7. Commercial Viability: Balance artistic vision with market awareness
  
  Approach this as a professional manga intellectual property with franchise potential — emotionally resonant, narratively sophisticated, and visually distinctive.
  `,
          context: {
            outputSchema: {
              type: "object",
              properties: {
                projectId: {
                  type: "string",
                  description: "The ID of the created manga project.",
                },
              },
              required: ["projectId"],
            },
          },
        };
        const responseMessages = await geminiAdapter.send(
          messages,
          mcpTools,
          params,
          true
        );
        // Get the assistant's response text (should include projectId)
        const assistantMsg = responseMessages.find(
          (m) => m.role === "assistant"
        );
        let projectId = "";
        if (
          assistantMsg &&
          typeof assistantMsg.content === "object" &&
          assistantMsg.content?.response?.result?.projectId
        ) {
          projectId = assistantMsg.content.response.result.projectId;
        } else if (assistantMsg && typeof assistantMsg.content === "string") {
          // Try to extract projectId from text if possible
          const match = assistantMsg.content.match(
            /projectId\s*[:=]\s*['"]?(\w+)['"]?/i
          );
          if (match) projectId = match[1];
        }
        if (projectId) {
          router.push(`/manga-flow/${projectId}`);
        } else {
          throw new Error("Project creation failed: No projectId returned");
        }
      } else {
        // Fallback: Create a simple project reference and navigate
        console.warn("MCP server not available, using simple navigation");
        const projectId = `project-${Date.now()}`;

        // Store the manga idea for later use
        localStorage.setItem(`manga-idea-${projectId}`, mangaIdea);

        // Navigate to the manga creation interface
        router.push(`/manga-flow/${projectId}`);
      }
    } catch (error) {
      console.error("Failed to create manga project:", error);

      // Fallback navigation on error
      const projectId = `project-${Date.now()}`;
      localStorage.setItem(`manga-idea-${projectId}`, mangaIdea);
      router.push(`/manga-flow/${projectId}`);
    } finally {
      setIsGenerating(false);
      closeDialog();
    }
  };

  const closeApiKeyDialog = () => {
    setIsApiKeyDialogOpen(false);
  };

  const handleFilterToggle = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
  };

  const applyFilter = (type: "genre" | "status", value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [type]: prev[type] === value ? "" : value,
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      genre: "",
      status: "",
    });
    setIsFilterMenuOpen(false);
  };

  // Action handlers
  const handleReadManga = (projectId: string) => {
    router.push(`/manga-reader/${projectId}`);
  };

  const handleEditProject = (projectId: string) => {
    router.push(`/manga-flow/${projectId}`);
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    projectId: "",
    projectTitle: "",
  });
  const handleDeleteClick = (projectId: string, projectTitle: string) => {
    setDeleteConfirmation({
      isOpen: true,
      projectId,
      projectTitle,
    });
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProject(deleteConfirmation.projectId);
      localStorage.removeItem(`messages-${deleteConfirmation.projectId}`);
      await fetchProjects();
      setDeleteConfirmation({
        isOpen: false,
        projectId: "",
        projectTitle: "",
      });
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      projectId: "",
      projectTitle: "",
    });
  };

  const [clean, setClean] = useState(false);

  const handleClean = async () => {
    setClean(true);
    await cleanOrphanedData();
    setClean(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-hidden">
      {/* Sidebar */}
      <motion.div
        initial={{ width: isSidebarOpen ? 240 : 80 }}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full bg-gray-900/80 backdrop-blur-md flex flex-col border-r border-gray-700"
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              Manga AI
            </h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-white hover:bg-gray-700"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 mt-6">
          <SidebarItem
            icon={<Home className="h-5 w-5" />}
            text="Home"
            isActive={false}
            isSidebarOpen={isSidebarOpen}
            href="/"
          />
          <SidebarItem
            icon={<BookMarked className="h-5 w-5" />}
            text="Projects"
            isActive={true}
            isSidebarOpen={isSidebarOpen}
            href="/projects"
          />
          <SidebarItem
            icon={<Settings className="h-5 w-5" />}
            text="Settings"
            isActive={false}
            isSidebarOpen={isSidebarOpen}
            href="/settings"
          />
          <SidebarItem
            icon={<BookOpen className="h-5 w-5" />}
            text="Setup Api Key Guide"
            isActive={false}
            isSidebarOpen={isSidebarOpen}
            href="/documentation"
          />
          <SidebarItem
            icon={<Shield className="h-5 w-5" />}
            text="Terms"
            isActive={false}
            isSidebarOpen={isSidebarOpen}
            href="/terms"
          />
        </nav>

        {isSidebarOpen && (
          <div className="p-4 text-sm text-gray-400">
            <p>AI Manga Generator</p>
            <p className="text-xs mt-1">v1.0.0</p>
          </div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 relative overflow-hidden">
        {/* Background Image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.png"
            alt="Manga creation background"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden z-10">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/5"
              style={{
                width: Math.random() * 200 + 50,
                height: Math.random() * 200 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50],
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        {/* Page Content */}
        <div className="relative z-20 flex flex-col h-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
          >
            <div className="flex items-center gap-3">
              <BookMarked className="h-8 w-8 text-pink-400" />
              <h1 className="text-3xl font-bold text-white">
                Your Manga Projects
              </h1>
              <Sparkles className="h-5 w-5 text-pink-400" />
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="pl-10 pr-4 py-2 w-full bg-gray-800/80 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  className="bg-gray-800/80 border-gray-700 text-white hover:bg-gray-700"
                  onClick={handleFilterToggle}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {(activeFilters.genre || activeFilters.status) && (
                    <span className="ml-2 w-2 h-2 bg-pink-500 rounded-full"></span>
                  )}
                </Button>
                {isFilterMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-30"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-white font-medium">Filters</h3>
                        <button
                          onClick={clearFilters}
                          className="text-xs text-pink-400 hover:text-pink-300"
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-gray-400 text-sm mb-2">Genre</h4>
                        <div className="flex flex-wrap gap-2">
                          {genres.map((genre) => (
                            <button
                              key={genre}
                              onClick={() => applyFilter("genre", genre!)}
                              className={`px-2 py-1 text-xs rounded-full ${
                                activeFilters.genre === genre
                                  ? "bg-pink-600 text-white"
                                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              }`}
                            >
                              {genre}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-gray-400 text-sm mb-2">Status</h4>
                        <div className="flex flex-wrap gap-2">
                          {statuses.map((status) => (
                            <button
                              key={status}
                              onClick={() => applyFilter("status", status)}
                              className={`px-2 py-1 text-xs rounded-full ${
                                activeFilters.status === status
                                  ? "bg-pink-600 text-white"
                                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              <Button
                className="bg-pink-600 hover:bg-pink-700"
                onClick={openDialog}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
              <Button onClick={handleClean} disabled={clean}>
                clean Projects
              </Button>
            </div>
          </motion.div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-12 w-12 text-pink-400 animate-spin" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6"
            >
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <motion.div key={index}>
                    <Card className="bg-gray-900/80 backdrop-blur-md border-gray-700 overflow-hidden hover:shadow-lg hover:shadow-pink-500/20 transition-all h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={project.coverImageUrl || "/images/hero-bg.png"}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                          <div className="flex justify-between items-end">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-1">
                                {project.title}
                              </h3>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                project.status === MangaStatus.PUBLISHED
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {project.status}
                            </span>
                          </div>
                        </div>

                        {/* Action Dropdown */}
                        <AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-2 right-2"
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 bg-white hover:bg-gray-700/80 text-gray-800 hover:text-white"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-800 border-gray-700 w-48">
                                <DropdownMenuItem
                                  className="flex items-center gap-2 hover:bg-gray-700 cursor-pointer"
                                  onClick={() => handleReadManga(project.id)}
                                >
                                  <BookOpen className="h-4 w-4" />
                                  <span>Read Manga</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 hover:bg-gray-700 cursor-pointer"
                                  onClick={() => handleEditProject(project.id)}
                                >
                                  <Edit3 className="h-4 w-4" />
                                  <span>Edit Project</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2 hover:bg-red-500/20 text-red-400 cursor-pointer"
                                  onClick={() =>
                                    handleDeleteClick(project.id, project.title)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete Project</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      <CardContent className="p-4 flex-1">
                        <p className="text-gray-300 mb-4 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-medium px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                            {project.genre}
                          </span>
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 border-t border-gray-800">
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Sparkles className="h-3 w-3 text-pink-400" />
                              {project.likeCount} likes
                            </span>
                            <span>{project.viewCount} views</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Updated:{" "}
                            {new Date(project.updatedAt)?.toDateString()}
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20">
                  <Search className="h-16 w-16 text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">
                    No projects found
                  </h3>
                  <p className="text-gray-400 mb-6 text-center max-w-md">
                    We couldn't find any projects matching your search criteria.
                    Try adjusting your filters or create a new project.
                  </p>
                  <Button
                    className="bg-pink-600 hover:bg-pink-700"
                    onClick={openDialog}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Project
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* New Project Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && closeDialog()}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-pink-400" />
                  Create New Manga Project
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeDialog}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <Label htmlFor="manga-idea" className="text-gray-300 mb-2">
                    Describe your manga idea
                  </Label>
                  <Textarea
                    ref={inputRef}
                    id="manga-idea"
                    rows={5}
                    className="w-full bg-gray-700 border-gray-600 text-white focus-visible:ring-pink-500 my-4"
                    placeholder="Example: A cyberpunk world where emotions are traded as currency, following a smuggler who accidentally gets infected with the rarest emotion..."
                    value={mangaIdea}
                    onChange={(e) => setMangaIdea(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-pink-600 hover:bg-pink-700 gap-2"
                    disabled={!mangaIdea.trim() || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Create Project
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmation.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-400" />
                  Delete Project
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cancelDelete}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mb-6">
                <p className="text-gray-300">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-white">
                    "{deleteConfirmation.projectTitle}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="border-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProject}
                  className="bg-red-600 hover:bg-red-700 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isApiKeyDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && closeApiKeyDialog()}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-red-400" />
                  API Key Required
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeApiKeyDialog}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  You need to configure your API key before generating manga
                  content.
                </p>
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                  <p className="text-red-200 text-sm">
                    Please add your Gemini API key in the settings to continue.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="ghost"
                  onClick={closeApiKeyDialog}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Link href="/settings">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Settings className="h-4 w-4 mr-2" />
                    Go to Settings
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;
