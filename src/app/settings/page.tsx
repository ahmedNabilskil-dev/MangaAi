"use client";

import SidebarItem from "@/components/side-item/SideItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  BookMarked,
  BookOpen,
  Home,
  Image as ImageIcon,
  Key,
  Menu,
  Save,
  Settings,
  Settings2,
  Shield,
  Sparkles,
  Text,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const SettingsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("text");
  const [textSettings, setTextSettings] = useState({
    provider: "gemini",
    apiKey: "",
    model: "gemini-2.0-flash",
    temperature: 0.7,
  });
  const [imageSettings, setImageSettings] = useState({
    provider: "gemini",
    apiKey: "",
    model: "gemini-2.0-flash-preview-image-generation",
  });

  const [imgbbSettings, setImgbbSettings] = useState({
    apiKey: "",
  });

  // Load settings from localStorage on client-side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTextSettings({
        provider: localStorage.getItem("provider") || "gemini",
        apiKey: localStorage.getItem("api-key") || "",
        model: localStorage.getItem("model") || "gemini-2.0-flash",
        temperature: localStorage.getItem("temperature")
          ? Number(localStorage.getItem("temperature"))
          : 0.7,
      });

      setImageSettings({
        provider: localStorage.getItem("image-provider") || "gemini",
        apiKey: localStorage.getItem("image-api-key") || "",
        model:
          localStorage.getItem("image-model") ||
          "gemini-2.0-flash-preview-image-generation",
      });
      setImgbbSettings({
        apiKey: localStorage.getItem("image_hosting_api_key") || "",
      });
    }
  }, []);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("provider", textSettings.provider);
      localStorage.setItem("model", textSettings.model);
      localStorage.setItem("api-key", textSettings.apiKey);
      localStorage.setItem("temperature", String(textSettings.temperature));

      localStorage.setItem("image-provider", imageSettings.provider);
      localStorage.setItem("image-model", imageSettings.model);
      localStorage.setItem("image-api-key", imageSettings.apiKey);

      localStorage.setItem("image_hosting_api_key", imgbbSettings.apiKey);
      window.location.reload();
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-hidden">
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
            isActive={false}
            isSidebarOpen={isSidebarOpen}
            href="/projects"
          />
          <SidebarItem
            icon={<Settings className="h-5 w-5" />}
            text="Settings"
            isActive={true}
            isSidebarOpen={isSidebarOpen}
            href="/settings"
          />
          <SidebarItem
            icon={<BookOpen className="h-5 w-5" />}
            text="Documentation"
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
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background Image with dark overlay - Matches home page */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.png" // Same image as home page
            alt="Manga creation background"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/50" />{" "}
          {/* Matching overlay */}
        </div>

        {/* Animated background elements - Matches home page */}
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

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-20 w-full max-w-4xl"
        >
          <Card className="bg-gray-900/80 backdrop-blur-lg border-gray-700 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
                  <Settings2 className="h-8 w-8 text-pink-400" />
                  AI Configuration
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Manga AI</span>
                  <Sparkles className="h-5 w-5 text-pink-400" />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-gray-800 border border-gray-700">
                  <TabsTrigger
                    value="text"
                    className="data-[state=active]:bg-pink-600 data-[state=active]:text-white"
                  >
                    <Text className="mr-2 h-4 w-4" />
                    Text Generation
                  </TabsTrigger>
                  <TabsTrigger
                    value="imgbb"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Image Hosting
                  </TabsTrigger>
                </TabsList>

                {/* Text Generation Settings */}
                <TabsContent value="text" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label
                          htmlFor="text-provider"
                          className="text-gray-300 mb-2 flex items-center"
                        >
                          <Key className="h-4 w-4 mr-2" />
                          AI Provider
                        </Label>
                        <Select
                          value={textSettings.provider}
                          onValueChange={(value) =>
                            setTextSettings({
                              ...textSettings,
                              provider: value,
                            })
                          }
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="gemini">Gemini</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label
                          htmlFor="text-model"
                          className="text-gray-300 mb-2"
                        >
                          AI Model
                        </Label>
                        <Select
                          value={textSettings.model}
                          onValueChange={(value) =>
                            setTextSettings({ ...textSettings, model: value })
                          }
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="gemini-2.0-flash">
                              gemini-2.0-flash
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="text-api-key"
                        className="text-gray-300 mb-2 flex items-center"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        API Key
                      </Label>
                      <Input
                        id="text-api-key"
                        type="password"
                        value={textSettings.apiKey}
                        onChange={(e) =>
                          setTextSettings({
                            ...textSettings,
                            apiKey: e.target.value,
                          })
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Enter your API key"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Your API key is stored locally and never sent to our
                        servers.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Need help getting an API key?{" "}
                        <a
                          href="https://manga-ai.vercel.app/documentation"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-400 hover:underline"
                        >
                          View our setup guide
                        </a>
                      </p>
                    </div>
                  </motion.div>
                </TabsContent>

                {/* Image Generation Settings */}
                <TabsContent value="image" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label
                          htmlFor="image-provider"
                          className="text-gray-300 mb-2 flex items-center"
                        >
                          <Key className="h-4 w-4 mr-2" />
                          AI Provider
                        </Label>
                        <Select
                          value={imageSettings.provider}
                          onValueChange={(value) =>
                            setImageSettings({
                              ...imageSettings,
                              provider: value,
                            })
                          }
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="gemini">Gemini</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label
                          htmlFor="image-model"
                          className="text-gray-300 mb-2"
                        >
                          AI Model
                        </Label>
                        <Select
                          value={imageSettings.model}
                          onValueChange={(value) =>
                            setImageSettings({ ...imageSettings, model: value })
                          }
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="gemini-2.0-flash-preview-image-generation">
                              gemini-2.0-flash-preview-image-generation
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="image-api-key"
                        className="text-gray-300 mb-2 flex items-center"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        API Key
                      </Label>
                      <Input
                        id="image-api-key"
                        type="password"
                        value={imageSettings.apiKey}
                        onChange={(e) =>
                          setImageSettings({
                            ...imageSettings,
                            apiKey: e.target.value,
                          })
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Enter your API key"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Your API key is stored locally and never sent to our
                        servers.
                      </p>
                    </div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="imgbb" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label
                          htmlFor="imgbb-provider"
                          className="text-gray-300 mb-2 flex items-center"
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Provider
                        </Label>
                        <Input
                          id="imgbb-provider"
                          value="ImgBB"
                          disabled
                          className="bg-gray-800 border-gray-700 text-gray-400"
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="imgbb-model"
                          className="text-gray-300 mb-2"
                        >
                          Service
                        </Label>
                        <Input
                          id="imgbb-model"
                          value="Image Hosting API"
                          disabled
                          className="bg-gray-800 border-gray-700 text-gray-400"
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="imgbb-api-key"
                        className="text-gray-300 mb-2 flex items-center"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        API Key
                      </Label>
                      <Input
                        id="imgbb-api-key"
                        type="password"
                        value={imgbbSettings.apiKey}
                        onChange={(e) =>
                          setImgbbSettings({
                            ...imgbbSettings,
                            apiKey: e.target.value,
                          })
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Enter your ImgBB API key"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Your API key is stored locally and never sent to our
                        servers.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        You can get a free API key from ImgBB.{" "}
                        <a
                          href="https://api.imgbb.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          Get your API key here
                        </a>
                      </p>
                    </div>
                  </motion.div>
                </TabsContent>
              </Tabs>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex justify-end"
              >
                <Button
                  onClick={handleSave}
                  size="lg"
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-6 px-8 rounded-full shadow-lg hover:shadow-xl transition-all group"
                >
                  <Save className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Save Settings
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
