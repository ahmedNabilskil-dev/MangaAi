"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Activity,
  Bookmark,
  BookOpen,
  Edit,
  Heart,
  Settings,
  Share2,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const sampleUser: UserProfile = {
  id: "mangaka-akira",
  username: "MangakaAkira",
  email: "akira@manga-creators.jp",
  avatarUrl: "/images/avatars/1.jpg",
  bio: "Professional manga artist specializing in cyberpunk and sci-fi genres. Creator of 'Neon Ghost' series.",
  stats: {
    projects: 12,
    followers: 8562,
    following: 42,
    likes: 12453,
  },
  projects: [
    {
      id: "proj-neon-ghost",
      title: "Neon Ghost",
      description:
        "A digital ghost hunter navigates the augmented reality underworld of 2099 Tokyo.",
      coverImage: "/images/projects/2.jpg",
      updatedAt: "2023-11-18",
      isAiGenerated: false,
    },
    {
      id: "proj-cyber-shinobi",
      title: "Cyber Shinobi",
      description:
        "Nanotech-enhanced ninjas battle corporate overlords in this action-packed series.",
      coverImage: "/images/projects/3.jpg",
      updatedAt: "2023-10-05",
      isAiGenerated: true,
    },
    {
      id: "proj-tokyo-ghoul",
      title: "Tokyo Ghoul: Rebirth",
      description:
        "A reimagining of the classic series with next-gen artwork and expanded lore.",
      coverImage: "/images/projects/4.jpg",
      updatedAt: "2023-09-22",
      isAiGenerated: false,
    },
    {
      id: "proj-quantum-ronin",
      title: "Quantum Ronin",
      description:
        "A time-displaced samurai wields a plasma katana across multiple timelines.",
      coverImage: "/images/projects/quantum-ronin.jpg",
      updatedAt: "2023-08-15",
      isAiGenerated: true,
    },
  ],
  activity: [
    {
      id: "act-001",
      type: "creation",
      user: "You",
      action: "published new chapter for",
      target: "Neon Ghost",
      time: "2 hours ago",
    },
    {
      id: "act-002",
      type: "like",
      user: "CyberArtFan99",
      action: "liked your project",
      target: "Cyber Shinobi",
      time: "1 day ago",
    },
    {
      id: "act-003",
      type: "comment",
      user: "MangaMaster",
      action: "commented on",
      target: "Tokyo Ghoul: Rebirth",
      time: "3 days ago",
    },
    {
      id: "act-004",
      type: "creation",
      user: "You",
      action: "started new project",
      target: "Quantum Ronin",
      time: "1 week ago",
    },
  ],
};

const ProfilePage = ({ user = sampleUser }: { user: UserProfile }) => {
  const [activeTab, setActiveTab] = useState("projects");
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(user.avatarUrl);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Glowing Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-pink-900/15 rounded-full blur-3xl"></div>
      </div>

      {/* Profile Header */}
      <div className="relative z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            {/* Avatar with Anime-style Badge */}
            <div className="relative group">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-800 shadow-xl">
                <Image
                  src={profileImage || "/images/default-avatar.jpg"}
                  alt={`${user.username}'s profile`}
                  fill
                  className="object-cover"
                />
                <div className="absolute -bottom-2 -right-2 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Creator
                </div>
              </div>
              {isEditing && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <label className="cursor-pointer p-3 bg-pink-600/90 rounded-full hover:bg-pink-500 transition-all shadow-lg">
                    <Edit className="h-5 w-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"
                  >
                    {user.username}
                  </motion.h1>
                  <p className="text-gray-400 mt-2 max-w-lg">{user.bio}</p>

                  {/* Manga-style Stats */}
                  <div className="flex gap-6 mt-6">
                    {[
                      {
                        icon: <BookOpen className="h-5 w-5 text-pink-400" />,
                        value: user.stats.projects,
                        label: "Works",
                      },
                      {
                        icon: <Heart className="h-5 w-5 text-pink-400" />,
                        value: user.stats.followers,
                        label: "Followers",
                      },
                      {
                        icon: <User className="h-5 w-5 text-pink-400" />,
                        value: user.stats.following,
                        label: "Following",
                      },
                      {
                        icon: <Star className="h-5 w-5 text-pink-400" />,
                        value: user.stats.likes,
                        label: "Likes",
                      },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center"
                      >
                        <div className="flex items-center gap-2">
                          {stat.icon}
                          <div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-gray-400">
                              {stat.label}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="gap-2 border-gray-700 hover:bg-gray-800/50"
                  >
                    <Edit className="h-4 w-4" />
                    {isEditing ? "Save Profile" : "Edit Profile"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manga-style Tab Navigation */}
      <div className="relative z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { name: "Projects", icon: <BookOpen className="h-5 w-5" /> },
              { name: "Library", icon: <Bookmark className="h-5 w-5" /> },
              { name: "Activity", icon: <Activity className="h-5 w-5" /> },
              { name: "Settings", icon: <Settings className="h-5 w-5" /> },
            ].map((tab) => (
              <button
                key={tab.name}
                className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.name.toLowerCase()
                    ? "border-pink-400 text-pink-400"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
                onClick={() => setActiveTab(tab.name.toLowerCase())}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {activeTab === "projects" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {user.projects.map((project) => (
              <motion.div
                key={project.id}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Card className="bg-gray-800/50 border-gray-700 hover:border-pink-400/30 transition-all h-full flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                    {project.isAiGenerated && (
                      <div className="absolute top-2 right-2 bg-pink-600/90 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg">
                        <Sparkles className="h-3 w-3" /> AI
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mt-2">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs text-gray-500">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-pink-400"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-purple-400"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === "library" && (
          <div className="text-center py-16">
            <Bookmark className="h-16 w-16 text-gray-700 mx-auto" />
            <h3 className="text-xl font-medium text-gray-400 mt-4">
              Your library is empty
            </h3>
            <p className="text-gray-600 mt-2">
              Bookmark projects to find them here later
            </p>
            <Button className="mt-4 bg-pink-600 hover:bg-pink-700 gap-2">
              <Sparkles className="h-4 w-4" /> Explore Projects
            </Button>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            {user.activity.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring" }}
              >
                <Card className="bg-gray-800/50 border-gray-700 p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          activity.type === "like"
                            ? "bg-pink-900/30 text-pink-400"
                            : activity.type === "comment"
                            ? "bg-blue-900/30 text-blue-400"
                            : "bg-purple-900/30 text-purple-400"
                        }`}
                      >
                        {activity.type === "like" ? (
                          <Heart className="h-5 w-5" />
                        ) : activity.type === "comment" ? (
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        ) : (
                          <Sparkles className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-gray-200">
                          {activity.user}
                        </span>{" "}
                        <span className="text-gray-400">{activity.action}</span>{" "}
                        <span className="font-medium text-pink-400">
                          {activity.target}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "settings" && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">Profile Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2 text-gray-300">
                  <User className="h-5 w-5 text-pink-400" /> Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      defaultValue={user.username}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Bio
                    </label>
                    <textarea
                      defaultValue={user.bio}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2 text-gray-300">
                  <Settings className="h-5 w-5 text-blue-400" /> Preferences
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="dark-mode"
                      name="dark-mode"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label
                      htmlFor="dark-mode"
                      className="ml-2 block text-sm text-gray-300"
                    >
                      Dark Mode
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="notifications"
                      name="notifications"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label
                      htmlFor="notifications"
                      className="ml-2 block text-sm text-gray-300"
                    >
                      Email Notifications
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button className="bg-pink-600 hover:bg-pink-700">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Types
interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  stats: {
    projects: number;
    followers: number;
    following: number;
    likes: number;
  };
  projects: {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    updatedAt: string;
    isAiGenerated: boolean;
  }[];
  activity: {
    id: string;
    type: "like" | "comment" | "creation";
    user: string;
    action: string;
    target: string;
    time: string;
  }[];
}

export default ProfilePage;
