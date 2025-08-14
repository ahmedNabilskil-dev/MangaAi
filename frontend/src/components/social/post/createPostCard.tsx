import { Globe, Image, Lock, MapPin, Send, Smile, Users } from "lucide-react";
import React, { useState } from "react";

interface CreatePostCardProps {
  onSubmit?: (
    content: string,
    visibility: "public" | "friends" | "private"
  ) => void;
}

const CreatePostCard: React.FC<CreatePostCardProps> = ({ onSubmit }) => {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<
    "public" | "friends" | "private"
  >("public");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    if (onSubmit) {
      onSubmit(content, visibility);
    }

    // Simulate API call
    setTimeout(() => {
      setContent("");
      setIsSubmitting(false);
    }, 1000);
  };

  const visibilityOptions = [
    {
      value: "public",
      icon: Globe,
      label: "Public",
      description: "Anyone can see",
    },
    {
      value: "friends",
      icon: Users,
      label: "Friends",
      description: "Friends only",
    },
    { value: "private", icon: Lock, label: "Private", description: "Only you" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex gap-4">
          {/* User Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-md ring-2 ring-white/30 flex-shrink-0">
            <span>ME</span>
          </div>

          <div className="flex-1">
            {/* Text Input */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Share your thoughts, ideas, or discoveries..."
                className="w-full p-4 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 focus:bg-white min-h-[120px]"
                disabled={isSubmitting}
              />

              {/* Character Count */}
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {content.length}/1000
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                {/* Media Buttons */}
                <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Image className="w-4 h-4" />
                  <span className="text-sm font-medium">Photo</span>
                </button>

                <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                  <Smile className="w-4 h-4" />
                  <span className="text-sm font-medium">Emoji</span>
                </button>

                <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Location</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Visibility Selector */}
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {visibilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Post Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Posting..." : "Post"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostCard;
