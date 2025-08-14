"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
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
import { apiRequest } from "@/lib/api-client";
import { deleteProject, getAllProjects } from "@/services/data-service";
import { useAuthStore } from "@/stores/auth-store";
import { useCreditStore } from "@/stores/credit-store";
import { MangaProject } from "@/types/entities";
import { MangaStatus } from "@/types/enums";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookMarked,
  BookOpen,
  Edit3,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const ProjectsPage = () => {
  const { user } = useAuthStore();
  const { loadCredits } = useCreditStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mangaIdea, setMangaIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [projects, setProjects] = useState<MangaProject[]>([]);
  const [activeFilters, setActiveFilters] = useState({
    genre: "",
    status: "",
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    const allProjects = await getAllProjects();
    console.log("Fetched projects:", allProjects);
    setProjects(allProjects);
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
    setErrorMessage("");
  };

  const router = useRouter();

  // Updated handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mangaIdea.trim()) return;

    setIsGenerating(true);
    setErrorMessage(""); // Clear any previous errors
    try {
      // Send only the manga idea - backend will generate structured project data
      const response = await apiRequest.post<{
        success: boolean;
        data: { _id: string };
      }>("/manga/projects", {
        mangaIdea: mangaIdea.trim(),
      });

      // Refresh credits to show updated balance
      await loadCredits();

      if (response.data?._id) {
        // Refresh projects list to show the new project
        await fetchProjects();
        // Navigate to the project's manga flow interface
        router.push(`/manga-flow/${response.data._id}`);
      } else {
        throw new Error("Project creation failed - no project ID returned");
      }
    } catch (error: any) {
      console.error("Failed to create manga project:", error);

      // Show the actual error message to the user using toast
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred while creating your manga project.";

      toast.error(errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setIsGenerating(false);
    }
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

  return (
    <AuthGuard>
      <div className="main-content bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
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

        {/* Main Content */}
        <div className="relative z-20 p-6">
          {/* Page Content */}
          <div className="flex flex-col h-full">
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
              </div>
            </motion.div>

            {/* Creative Loading State */}
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-center py-20"
              >
                <div className="text-center">
                  {/* Animated Manga Creation Scene */}
                  <div className="relative w-32 h-32 mx-auto mb-8">
                    {/* Main Circle */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    {/* Inner Elements */}
                    <motion.div
                      className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      animate={{
                        scale: [1.1, 1, 1.1],
                        rotate: [360, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    {/* Center Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Sparkles className="w-8 h-8 text-white" />
                      </motion.div>
                    </div>

                    {/* Floating Elements */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-white rounded-full"
                        style={{
                          top: `${
                            20 + Math.sin((i * 60 * Math.PI) / 180) * 40
                          }%`,
                          left: `${
                            20 + Math.cos((i * 60 * Math.PI) / 180) * 40
                          }%`,
                        }}
                        animate={{
                          scale: [0.5, 1, 0.5],
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>

                  {/* Loading Text */}
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-white mb-4"
                  >
                    Crafting Your Manga Universe
                  </motion.h3>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <motion.p
                      className="text-lg text-gray-300"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Loading your creative projects...
                    </motion.p>

                    {/* Animated Dots */}
                    <div className="flex justify-center space-x-2 mt-4">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-pink-400 rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
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
                                    onClick={() => handleReadManga(project._id)}
                                  >
                                    <BookOpen className="h-4 w-4" />
                                    <span>Read Manga</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 hover:bg-gray-700 cursor-pointer"
                                    onClick={() =>
                                      handleEditProject(project._id)
                                    }
                                  >
                                    <Edit3 className="h-4 w-4" />
                                    <span>Edit Project</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center gap-2 hover:bg-red-500/20 text-red-400 cursor-pointer"
                                    onClick={() =>
                                      handleDeleteClick(
                                        project._id,
                                        project.title
                                      )
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
                      We couldn't find any projects matching your search
                      criteria. Try adjusting your filters or create a new
                      project.
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
                {/* Error Message Display */}
                {errorMessage && (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-red-200 text-sm">
                      <X className="h-4 w-4" />
                      <span className="font-semibold">Error:</span>
                    </div>
                    <p className="text-red-200 text-sm mt-1">{errorMessage}</p>
                  </div>
                )}

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
                  <p className="text-gray-400 text-xs mt-2">
                    ✨ Our AI will automatically generate characters, plot
                    structure, world details, and more based on your idea!
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  {errorMessage && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setErrorMessage("")}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Clear Error
                    </Button>
                  )}
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
    </AuthGuard>
  );
};

export default ProjectsPage;
