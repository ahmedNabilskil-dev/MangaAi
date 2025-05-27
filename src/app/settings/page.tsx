"use client";

import { SidebarItem } from "@/app/page";
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
import { useState } from "react";

const SettingsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("text");
  const [textSettings, setTextSettings] = useState({
    provider: "openai",
    apiKey: "",
    model: "gpt-4",
    temperature: 0.7,
  });
  const [imageSettings, setImageSettings] = useState({
    provider: "stability",
    apiKey: "",
    model: "stable-diffusion-xl",
    style: "manga",
  });

  const handleSave = () => {};

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
                    value="image"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Image Generation
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
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="anthropic">Anthropic</SelectItem>
                            <SelectItem value="cohere">Cohere</SelectItem>
                            <SelectItem value="mistral">Mistral</SelectItem>
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
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">
                              GPT-3.5 Turbo
                            </SelectItem>
                            <SelectItem value="claude-2">Claude 2</SelectItem>
                            <SelectItem value="mistral-7b">
                              Mistral 7B
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
                    </div>

                    <div>
                      <Label
                        htmlFor="text-temperature"
                        className="text-gray-300 mb-2"
                      >
                        Creativity (Temperature: {textSettings.temperature})
                      </Label>
                      <input
                        id="text-temperature"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={textSettings.temperature}
                        onChange={(e) =>
                          setTextSettings({
                            ...textSettings,
                            temperature: parseFloat(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Precise</span>
                        <span>Balanced</span>
                        <span>Creative</span>
                      </div>
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
                            <SelectItem value="stability">
                              Stability AI
                            </SelectItem>
                            <SelectItem value="openai">
                              OpenAI DALL-E
                            </SelectItem>
                            <SelectItem value="midjourney">
                              Midjourney
                            </SelectItem>
                            <SelectItem value="leonardo">
                              Leonardo AI
                            </SelectItem>
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
                            <SelectItem value="stable-diffusion-xl">
                              Stable Diffusion XL
                            </SelectItem>
                            <SelectItem value="dall-e-3">DALL-E 3</SelectItem>
                            <SelectItem value="midjourney-v5">
                              Midjourney V5
                            </SelectItem>
                            <SelectItem value="leonardo-vision">
                              Leonardo Vision
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

                    <div>
                      <Label
                        htmlFor="image-style"
                        className="text-gray-300 mb-2"
                      >
                        Manga Style
                      </Label>
                      <Select
                        value={imageSettings.style}
                        onValueChange={(value) =>
                          setImageSettings({ ...imageSettings, style: value })
                        }
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          <SelectItem value="shonen">Shonen</SelectItem>
                          <SelectItem value="shoujo">Shoujo</SelectItem>
                          <SelectItem value="seinen">Seinen</SelectItem>
                          <SelectItem value="josei">Josei</SelectItem>
                          <SelectItem value="mecha">Mecha</SelectItem>
                          <SelectItem value="fantasy">Fantasy</SelectItem>
                        </SelectContent>
                      </Select>
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
