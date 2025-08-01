"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  createLocationTemplate,
  createOutfitTemplate,
} from "@/services/data-service";
import { LocationTemplate, OutfitTemplate } from "@/types/entities";
import { MapPin, Palette, Plus, X } from "lucide-react";
import { useState } from "react";

// ============================================================================
// OUTFIT TEMPLATE FORM
// ============================================================================

interface OutfitTemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess?: (template: OutfitTemplate) => void;
}

export function OutfitTemplateForm({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}: OutfitTemplateFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    gender: "",
    ageGroup: "",
    season: "",
    style: "anime",
    tags: [] as string[],
    colorPalette: [] as string[],
    clothingItems: [] as string[],
  });
  const [newTag, setNewTag] = useState("");
  const [newColor, setNewColor] = useState("#000000");
  const [newClothingItem, setNewClothingItem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Validate required fields
      if (
        !formData.category ||
        !formData.gender ||
        !formData.ageGroup ||
        !formData.season
      ) {
        toast({
          title: "Validation Error",
          description:
            "Please fill in all required fields (category, gender, age group, season)",
          variant: "destructive",
        });
        return;
      }

      const template = await createOutfitTemplate({
        name: formData.name,
        description: formData.description,
        category: formData.category as
          | "casual"
          | "formal"
          | "traditional"
          | "fantasy"
          | "modern"
          | "vintage"
          | "futuristic"
          | "seasonal"
          | "special",
        gender: formData.gender as "male" | "female" | "unisex",
        ageGroup: formData.ageGroup as "child" | "teen" | "adult" | "elderly",
        season: formData.season as
          | "spring"
          | "summer"
          | "autumn"
          | "winter"
          | "all",
        style: "anime" as const,
        mangaProjectId: projectId,
        components: formData.clothingItems.map((item, index) => ({
          type:
            index === 0
              ? ("top" as const)
              : index === 1
              ? ("bottom" as const)
              : ("accessories" as const),
          item,
          isRequired: true,
        })),
        colorSchemes: formData.colorPalette.map((color, index) => ({
          name: `Color ${index + 1}`,
          primary: color,
        })),
        materials: ["cotton", "polyester"], // Default materials
        occasions: ["casual", "daily"], // Default occasions
        compatibility: {
          weather: ["sunny", "cloudy"],
          timeOfDay: ["morning", "afternoon"],
          activities: ["walking", "sitting"],
        },
        tags: formData.tags,
        isActive: true,
      });

      toast({
        title: "Success",
        description: `Outfit template "${template.name}" created successfully!`,
      });

      onSuccess?.(template);
      onClose();

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        gender: "",
        ageGroup: "",
        season: "",
        style: "",
        tags: [],
        colorPalette: [],
        clothingItems: [],
      });
    } catch (error) {
      console.error("Failed to create outfit template:", error);
      toast({
        title: "Error",
        description: "Failed to create outfit template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const addColor = () => {
    if (newColor && !formData.colorPalette.includes(newColor)) {
      setFormData((prev) => ({
        ...prev,
        colorPalette: [...prev.colorPalette, newColor],
      }));
    }
  };

  const removeColor = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      colorPalette: prev.colorPalette.filter((c) => c !== color),
    }));
  };

  const addClothingItem = () => {
    if (
      newClothingItem.trim() &&
      !formData.clothingItems.includes(newClothingItem.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        clothingItems: [...prev.clothingItems, newClothingItem.trim()],
      }));
      setNewClothingItem("");
    }
  };

  const removeClothingItem = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      clothingItems: prev.clothingItems.filter((i) => i !== item),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </div>
            Create Outfit Template
          </DialogTitle>
          <DialogDescription>
            Create a reusable outfit template that can be applied to characters
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., School Uniform, Casual Summer, Formal Dress"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the outfit style, when to use it, and any special features..."
                rows={3}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="party">Party</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="traditional">Traditional</SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, gender: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unisex">Unisex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ageGroup">Age Group</Label>
              <Select
                value={formData.ageGroup}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, ageGroup: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="teen">Teen</SelectItem>
                  <SelectItem value="adult">Adult</SelectItem>
                  <SelectItem value="elderly">Elderly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="season">Season</Label>
              <Select
                value={formData.season}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, season: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="summer">Summer</SelectItem>
                  <SelectItem value="autumn">Autumn</SelectItem>
                  <SelectItem value="winter">Winter</SelectItem>
                  <SelectItem value="all">All Seasons</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="style">Style</Label>
              <Select
                value={formData.style}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, style: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="vintage">Vintage</SelectItem>
                  <SelectItem value="elegant">Elegant</SelectItem>
                  <SelectItem value="cute">Cute</SelectItem>
                  <SelectItem value="cool">Cool</SelectItem>
                  <SelectItem value="gothic">Gothic</SelectItem>
                  <SelectItem value="punk">Punk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag (e.g., school, uniform, blue)"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <Label>Color Palette</Label>
            <div className="flex gap-2 mb-2">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-12 h-10 rounded border"
              />
              <Button type="button" onClick={addColor} size="sm">
                Add Color
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.colorPalette.map((color) => (
                <div
                  key={color}
                  className="flex items-center gap-1 bg-gray-100 rounded p-1"
                >
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs">{color}</span>
                  <button type="button" onClick={() => removeColor(color)}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Clothing Items */}
          <div>
            <Label>Clothing Items</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newClothingItem}
                onChange={(e) => setNewClothingItem(e.target.value)}
                placeholder="Add clothing item (e.g., white shirt, black skirt)"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addClothingItem())
                }
              />
              <Button type="button" onClick={addClothingItem} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.clothingItems.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeClothingItem(item)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// LOCATION TEMPLATE FORM
// ============================================================================

interface LocationTemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess?: (template: LocationTemplate) => void;
}

export function LocationTemplateForm({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}: LocationTemplateFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    environment: "",
    timeOfDay: "",
    weather: "",
    mood: "",
    tags: [] as string[],
    visualDetails: [] as string[],
    lightingConditions: "",
    soundscape: "",
  });
  const [newTag, setNewTag] = useState("");
  const [newVisualDetail, setNewVisualDetail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Validate required fields
      if (!formData.category) {
        toast({
          title: "Validation Error",
          description: "Please select a category for the location template",
          variant: "destructive",
        });
        return;
      }

      const template = await createLocationTemplate({
        name: formData.name,
        description: formData.description,
        category: formData.category as
          | "indoor"
          | "outdoor"
          | "urban"
          | "rural"
          | "fantasy"
          | "futuristic"
          | "historical"
          | "natural"
          | "architectural",
        style: "anime" as const,
        mangaProjectId: projectId,
        timeOfDay:
          (formData.timeOfDay as
            | "dawn"
            | "morning"
            | "noon"
            | "afternoon"
            | "evening"
            | "night"
            | "any") || "any",
        weather:
          (formData.weather as
            | "sunny"
            | "cloudy"
            | "rainy"
            | "stormy"
            | "snowy"
            | "foggy"
            | "any") || "any",
        mood:
          (formData.mood as
            | "peaceful"
            | "mysterious"
            | "energetic"
            | "romantic"
            | "tense"
            | "cheerful"
            | "somber") || "peaceful",
        cameraAngles: ["wide-shot", "medium-shot"], // Default camera angles
        props: formData.visualDetails || [], // Use visual details as props
        colors: ["#87CEEB", "#90EE90", "#DDA0DD"], // Default pleasant colors
        tags: formData.tags,
        isActive: true,
      });

      toast({
        title: "Success",
        description: `Location template "${template.name}" created successfully!`,
      });

      onSuccess?.(template);
      onClose();

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        environment: "",
        timeOfDay: "",
        weather: "",
        mood: "",
        tags: [],
        visualDetails: [],
        lightingConditions: "",
        soundscape: "",
      });
    } catch (error) {
      console.error("Failed to create location template:", error);
      toast({
        title: "Error",
        description: "Failed to create location template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const addVisualDetail = () => {
    if (
      newVisualDetail.trim() &&
      !formData.visualDetails.includes(newVisualDetail.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        visualDetails: [...prev.visualDetails, newVisualDetail.trim()],
      }));
      setNewVisualDetail("");
    }
  };

  const removeVisualDetail = (detail: string) => {
    setFormData((prev) => ({
      ...prev,
      visualDetails: prev.visualDetails.filter((d) => d !== detail),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            Create Location Template
          </DialogTitle>
          <DialogDescription>
            Create a reusable location template that can be applied to scenes
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., School Classroom, City Park, Cozy Cafe"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the location's atmosphere, purpose, and key features..."
                rows={3}
              />
            </div>
          </div>

          {/* Location Properties */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">Indoor</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="urban">Urban</SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="environment">Environment</Label>
              <Select
                value={formData.environment}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, environment: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="park">Park</SelectItem>
                  <SelectItem value="cafe">Cafe</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                  <SelectItem value="street">Street</SelectItem>
                  <SelectItem value="beach">Beach</SelectItem>
                  <SelectItem value="forest">Forest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="timeOfDay">Time of Day</Label>
              <Select
                value={formData.timeOfDay}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, timeOfDay: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dawn">Dawn</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="noon">Noon</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="midnight">Midnight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="weather">Weather</Label>
              <Select
                value={formData.weather}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, weather: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Weather" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunny">Sunny</SelectItem>
                  <SelectItem value="cloudy">Cloudy</SelectItem>
                  <SelectItem value="rainy">Rainy</SelectItem>
                  <SelectItem value="snowy">Snowy</SelectItem>
                  <SelectItem value="stormy">Stormy</SelectItem>
                  <SelectItem value="foggy">Foggy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="mood">Mood</Label>
              <Select
                value={formData.mood}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, mood: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peaceful">Peaceful</SelectItem>
                  <SelectItem value="energetic">Energetic</SelectItem>
                  <SelectItem value="romantic">Romantic</SelectItem>
                  <SelectItem value="mysterious">Mysterious</SelectItem>
                  <SelectItem value="tense">Tense</SelectItem>
                  <SelectItem value="cheerful">Cheerful</SelectItem>
                  <SelectItem value="melancholic">Melancholic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lighting and Sound */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lightingConditions">Lighting Conditions</Label>
              <Input
                id="lightingConditions"
                value={formData.lightingConditions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    lightingConditions: e.target.value,
                  }))
                }
                placeholder="e.g., soft natural light, dim warm lighting"
              />
            </div>
            <div>
              <Label htmlFor="soundscape">Soundscape</Label>
              <Input
                id="soundscape"
                value={formData.soundscape}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    soundscape: e.target.value,
                  }))
                }
                placeholder="e.g., birds chirping, busy traffic, quiet whispers"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag (e.g., quiet, crowded, historical)"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Visual Details */}
          <div>
            <Label>Visual Details</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newVisualDetail}
                onChange={(e) => setNewVisualDetail(e.target.value)}
                placeholder="Add visual detail (e.g., cherry blossom trees, marble columns)"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addVisualDetail())
                }
              />
              <Button type="button" onClick={addVisualDetail} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.visualDetails.map((detail) => (
                <Badge
                  key={detail}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {detail}
                  <button
                    type="button"
                    onClick={() => removeVisualDetail(detail)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
