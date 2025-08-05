// src/services/supabase-data-service.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  Chapter,
  Character,
  LocationTemplate,
  MangaProject,
  OutfitTemplate,
  Panel,
  PanelDialogue,
  Scene,
} from "../types/entities";
import type { DeepPartial } from "../types/utils";
import type { IDataService } from "./data-service.interface";

// Database table type mapping
interface Database {
  public: {
    Tables: {
      manga_projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: string;
          initial_prompt: string | null;
          genre: string | null;
          art_style: string | null;
          cover_image_url: string | null;
          target_audience: string | null;
          world_details: any;
          concept: string | null;
          plot_structure: any;
          themes: string[] | null;
          motifs: string[] | null;
          symbols: string[] | null;
          tags: string[] | null;
          creator_id: string | null;
          messages: any;
          view_count: number;
          like_count: number;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["manga_projects"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["manga_projects"]["Insert"]
        >;
      };
      characters: {
        Row: {
          id: string;
          manga_project_id: string;
          name: string;
          age: number | null;
          gender: string | null;
          body_attributes: any;
          facial_attributes: any;
          hair_attributes: any;
          distinctive_features: string[] | null;
          physical_mannerisms: string[] | null;
          posture: string | null;
          style_guide: any;
          default_outfit_id: string | null;
          outfit_history: any;
          consistency_prompt: string | null;
          negative_prompt: string | null;
          role: string | null;
          brief_description: string | null;
          personality: string | null;
          abilities: string | null;
          backstory: string | null;
          img_url: string | null;
          traits: string[] | null;
          arcs: string[] | null;
          is_ai_generated: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["characters"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["characters"]["Insert"]>;
      };
      outfit_templates: {
        Row: {
          id: string;
          name: string;
          character_id: string;
          description: string;
          ai_prompt: string;
          category: string;
          season: string;
          is_default: boolean;
          tags: string[];
          image_url: string | null;
          manga_project_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["outfit_templates"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["outfit_templates"]["Insert"]
        >;
      };
      location_templates: {
        Row: {
          id: string;
          name: string;
          description: string;
          base_prompt: string;
          type: string;
          category: string;
          camera_angles: string[];
          tags: string[];
          image_url: string | null;
          manga_project_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["location_templates"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["location_templates"]["Insert"]
        >;
      };
      chapters: {
        Row: {
          id: string;
          manga_project_id: string;
          chapter_number: number;
          title: string;
          narrative: string | null;
          purpose: string | null;
          tone: string | null;
          key_characters: string[] | null;
          cover_image_url: string | null;
          is_ai_generated: boolean;
          is_published: boolean;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["chapters"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["chapters"]["Insert"]>;
      };
      scenes: {
        Row: {
          id: string;
          chapter_id: string;
          order_num: number;
          title: string;
          description: string | null;
          scene_context: any;
          is_ai_generated: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["scenes"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["scenes"]["Insert"]>;
      };
      panels: {
        Row: {
          id: string;
          scene_id: string;
          order_num: number;
          image_url: string | null;
          panel_context: any;
          negative_prompt: string | null;
          is_ai_generated: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["panels"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["panels"]["Insert"]>;
      };
      panel_characters: {
        Row: {
          id: string;
          panel_id: string;
          character_id: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["panel_characters"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["panel_characters"]["Insert"]
        >;
      };
      panel_dialogues: {
        Row: {
          id: string;
          panel_id: string;
          speaker_id: string | null;
          content: string;
          order_num: number;
          style: any;
          emotion: string | null;
          subtext_note: string | null;
          config: any;
          is_ai_generated: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["panel_dialogues"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["panel_dialogues"]["Insert"]
        >;
      };
    };
  };
}

class SupabaseDataService implements IDataService {
  private supabase: SupabaseClient<Database>;
  private readonly SUPABASE_URL = "https://zbstugrprjefmjwgtcbr.supabase.co";
  private readonly SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpic3R1Z3JwcmplZm1qd2d0Y2JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDgyNDAsImV4cCI6MjA2OTM4NDI0MH0.kV0rsqzWehTQkaFhlQR0mwG2okLIu-h3Yqe_3WGY4tw";
  constructor() {
    // Initialize Supabase client with service role key for backend operations
    this.supabase = createClient<Database>(
      this.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || this.SUPABASE_ANON_KEY
    );
  }

  // --- Project Methods ---
  async getAllProjects(): Promise<MangaProject[]> {
    const { data, error } = await this.supabase
      .from("manga_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return this.mapDbProjectsToEntities(data || []);
  }

  async getProject(id: string): Promise<MangaProject | null> {
    const { data: project, error: projectError } = await this.supabase
      .from("manga_projects")
      .select("*")
      .eq("id", id)
      .single();

    if (projectError || !project) return null;

    // Fetch related data
    const [
      { data: chapters },
      { data: characters },
      { data: outfitTemplates },
      { data: locationTemplates },
    ] = await Promise.all([
      this.supabase
        .from("chapters")
        .select("*")
        .eq("manga_project_id", id)
        .order("chapter_number"),
      this.supabase.from("characters").select("*").eq("manga_project_id", id),
      this.supabase
        .from("outfit_templates")
        .select("*")
        .eq("manga_project_id", id),
      this.supabase
        .from("location_templates")
        .select("*")
        .eq("manga_project_id", id),
    ]);

    const mappedProject = this.mapDbProjectToEntity(project);
    mappedProject.chapters = chapters
      ? this.mapDbChaptersToEntities(chapters)
      : [];
    mappedProject.characters = characters
      ? this.mapDbCharactersToEntities(characters)
      : [];
    mappedProject.outfitTemplates = outfitTemplates
      ? this.mapDbOutfitTemplatesToEntities(outfitTemplates)
      : [];
    mappedProject.locationTemplates = locationTemplates
      ? this.mapDbLocationTemplatesToEntities(locationTemplates)
      : [];

    // Load nested relations for chapters
    for (const chapter of mappedProject.chapters) {
      const { data: scenes } = await this.supabase
        .from("scenes")
        .select("*")
        .eq("chapter_id", chapter.id)
        .order("order_num");

      chapter.scenes = scenes ? this.mapDbScenesToEntities(scenes) : [];

      for (const scene of chapter.scenes) {
        const { data: panels } = await this.supabase
          .from("panels")
          .select(
            `
            *,
            panel_characters!inner (
              character_id,
              characters (*)
            )
          `
          )
          .eq("scene_id", scene.id)
          .order("order_num");

        scene.panels = panels ? this.mapDbPanelsToEntities(panels) : [];

        for (const panel of scene.panels) {
          const { data: dialogues } = await this.supabase
            .from("panel_dialogues")
            .select(
              `
              *,
              characters (*)
            `
            )
            .eq("panel_id", panel.id)
            .order("order_num");

          panel.dialogues = dialogues
            ? this.mapDbDialoguesToEntities(dialogues)
            : [];
        }
      }
    }

    return mappedProject;
  }

  async createProject(
    projectData: Omit<
      MangaProject,
      "id" | "createdAt" | "updatedAt" | "chapters" | "characters"
    >
  ): Promise<MangaProject> {
    const { data, error } = await this.supabase
      .from("manga_projects")
      .insert(this.mapEntityToDbProject(projectData as any))
      .select()
      .single();

    if (error) throw error;
    return this.mapDbProjectToEntity(data);
  }

  async updateProject(
    id: string,
    projectData: DeepPartial<
      Omit<
        MangaProject,
        "id" | "createdAt" | "updatedAt" | "chapters" | "characters"
      >
    >
  ): Promise<void> {
    const { error } = await this.supabase
      .from("manga_projects")
      .update(this.mapEntityToDbProject(projectData as any))
      .eq("id", id);

    if (error) throw error;
  }

  async deleteProject(id: string): Promise<any> {
    const { error } = await this.supabase
      .from("manga_projects")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  // --- Character Methods ---
  async listCharacters(projectId?: string): Promise<Character[]> {
    let query = this.supabase.from("characters").select("*");

    if (projectId) {
      query = query.eq("manga_project_id", projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return this.mapDbCharactersToEntities(data || []);
  }

  async getCharacter(id: string): Promise<Character | null> {
    const { data, error } = await this.supabase
      .from("characters")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapDbCharacterToEntity(data);
  }

  async createCharacter(
    characterData: Omit<Character, "id" | "createdAt" | "updatedAt">
  ): Promise<Character> {
    const { data, error } = await this.supabase
      .from("characters")
      .insert(this.mapEntityToDbCharacter(characterData))
      .select()
      .single();

    if (error) throw error;
    return this.mapDbCharacterToEntity(data);
  }

  async updateCharacter(
    id: string,
    characterData: DeepPartial<
      Omit<Character, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    const { error } = await this.supabase
      .from("characters")
      .update(this.mapEntityToDbCharacter(characterData as any))
      .eq("id", id);

    if (error) throw error;
  }

  async deleteCharacter(id: string): Promise<void> {
    // Remove character from panel_characters junction table first
    await this.supabase
      .from("panel_characters")
      .delete()
      .eq("character_id", id);

    // Set dialogues speaker_id to null where this character was the speaker
    await this.supabase
      .from("panel_dialogues")
      .update({ speaker_id: null })
      .eq("speaker_id", id);

    // Delete the character
    const { error } = await this.supabase
      .from("characters")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  getCharacterForContext = this.getCharacter;

  // --- Chapter Methods ---
  async createChapter(
    chapterData: Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
  ): Promise<Chapter> {
    const { data, error } = await this.supabase
      .from("chapters")
      .insert(this.mapEntityToDbChapter(chapterData as any))
      .select()
      .single();

    if (error) throw error;
    return this.mapDbChapterToEntity(data);
  }

  async updateChapter(
    id: string,
    chapterData: DeepPartial<
      Omit<Chapter, "id" | "createdAt" | "updatedAt" | "scenes">
    >
  ): Promise<void> {
    const { error } = await this.supabase
      .from("chapters")
      .update(this.mapEntityToDbChapter(chapterData as any))
      .eq("id", id);

    if (error) throw error;
  }

  async deleteChapter(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("chapters")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async getChapterForContext(id: string): Promise<Chapter | null> {
    return this.getChapter(id);
  }

  private async getChapter(id: string): Promise<Chapter | null> {
    const { data, error } = await this.supabase
      .from("chapters")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapDbChapterToEntity(data);
  }

  // --- Scene Methods ---
  async createScene(
    sceneData: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  ): Promise<Scene> {
    const { data, error } = await this.supabase
      .from("scenes")
      .insert(this.mapEntityToDbScene(sceneData))
      .select()
      .single();

    if (error) throw error;
    return this.mapDbSceneToEntity(data);
  }

  async updateScene(
    id: string,
    sceneData: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  ): Promise<void> {
    const { error } = await this.supabase
      .from("scenes")
      .update(this.mapEntityToDbScene(sceneData))
      .eq("id", id);

    if (error) throw error;
  }

  async deleteScene(id: string): Promise<void> {
    const { error } = await this.supabase.from("scenes").delete().eq("id", id);

    if (error) throw error;
  }

  async getSceneForContext(id: string): Promise<Scene | null> {
    const { data, error } = await this.supabase
      .from("scenes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapDbSceneToEntity(data);
  }

  // --- Panel Methods ---
  async createPanel(
    panelData: Omit<
      Panel,
      "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
    >
  ): Promise<Panel> {
    const { data, error } = await this.supabase
      .from("panels")
      .insert(this.mapEntityToDbPanel(panelData))
      .select()
      .single();

    if (error) throw error;
    return this.mapDbPanelToEntity(data);
  }

  async updatePanel(
    id: string,
    panelData: Omit<
      Panel,
      "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
    >
  ): Promise<void> {
    const { error } = await this.supabase
      .from("panels")
      .update(this.mapEntityToDbPanel(panelData))
      .eq("id", id);

    if (error) throw error;
  }

  async deletePanel(id: string): Promise<void> {
    const { error } = await this.supabase.from("panels").delete().eq("id", id);

    if (error) throw error;
  }

  async assignCharacterToPanel(
    panelId: string,
    characterId: string
  ): Promise<void> {
    // Check if already assigned
    const { data: existing } = await this.supabase
      .from("panel_characters")
      .select("id")
      .eq("panel_id", panelId)
      .eq("character_id", characterId)
      .single();

    if (!existing) {
      const { error } = await this.supabase
        .from("panel_characters")
        .insert({ panel_id: panelId, character_id: characterId });

      if (error) throw error;
    }
  }

  async removeCharacterFromPanel(
    panelId: string,
    characterId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from("panel_characters")
      .delete()
      .eq("panel_id", panelId)
      .eq("character_id", characterId);

    if (error) throw error;
  }

  async getPanelForContext(id: string): Promise<Panel | null> {
    const { data, error } = await this.supabase
      .from("panels")
      .select(
        `
        *,
        panel_characters!inner (
          character_id,
          characters (*)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapDbPanelToEntity(data);
  }

  // --- Dialogue Methods ---
  async createPanelDialogue(
    dialogueData: Omit<
      PanelDialogue,
      "id" | "createdAt" | "updatedAt" | "speaker"
    >
  ): Promise<PanelDialogue> {
    const { data, error } = await this.supabase
      .from("panel_dialogues")
      .insert(this.mapEntityToDbDialogue(dialogueData))
      .select()
      .single();

    if (error) throw error;
    return this.mapDbDialogueToEntity(data);
  }

  async updatePanelDialogue(
    id: string,
    dialogueData: DeepPartial<
      Omit<PanelDialogue, "id" | "createdAt" | "updatedAt" | "speaker">
    >
  ): Promise<void> {
    const { error } = await this.supabase
      .from("panel_dialogues")
      .update(this.mapEntityToDbDialogue(dialogueData as any))
      .eq("id", id);

    if (error) throw error;
  }

  async deletePanelDialogue(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("panel_dialogues")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async getPanelDialogueForContext(id: string): Promise<PanelDialogue | null> {
    const { data, error } = await this.supabase
      .from("panel_dialogues")
      .select(
        `
        *,
        characters (*)
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapDbDialogueToEntity(data);
  }

  // --- Template Methods ---

  // --- Outfit Templates ---
  async createOutfitTemplate(
    templateData: Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<OutfitTemplate> {
    const { data, error } = await this.supabase
      .from("outfit_templates")
      .insert(this.mapEntityToDbOutfitTemplate(templateData))
      .select()
      .single();

    if (error) throw error;
    return this.mapDbOutfitTemplateToEntity(data);
  }

  async getOutfitTemplate(id: string): Promise<OutfitTemplate | null> {
    const { data, error } = await this.supabase
      .from("outfit_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapDbOutfitTemplateToEntity(data);
  }

  async updateOutfitTemplate(
    id: string,
    templateData: DeepPartial<
      Omit<OutfitTemplate, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    const { error } = await this.supabase
      .from("outfit_templates")
      .update(this.mapEntityToDbOutfitTemplate(templateData as any))
      .eq("id", id);

    if (error) throw error;
  }

  async deleteOutfitTemplate(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("outfit_templates")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async listOutfitTemplates(filters?: {
    category?: string;
    gender?: string;
    ageGroup?: string;
    season?: string;
    style?: string;
    activeOnly?: boolean;
  }): Promise<OutfitTemplate[]> {
    let query = this.supabase.from("outfit_templates").select("*");

    if (filters?.activeOnly) {
      query = query.eq("is_active", true);
    }
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.gender) {
      query = query.eq("gender", filters.gender);
    }
    if (filters?.ageGroup) {
      query = query.eq("age_group", filters.ageGroup);
    }
    if (filters?.season) {
      query = query.eq("season", filters.season);
    }
    if (filters?.style) {
      query = query.eq("style", filters.style);
    }

    const { data, error } = await query;
    if (error) throw error;
    return this.mapDbOutfitTemplatesToEntities(data || []);
  }

  // --- Location Templates ---
  async createLocationTemplate(
    templateData: Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
  ): Promise<LocationTemplate> {
    const { data, error } = await this.supabase
      .from("location_templates")
      .insert(this.mapEntityToDbLocationTemplate(templateData))
      .select()
      .single();

    if (error) throw error;
    return this.mapDbLocationTemplateToEntity(data);
  }

  async getLocationTemplate(id: string): Promise<LocationTemplate | null> {
    const { data, error } = await this.supabase
      .from("location_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapDbLocationTemplateToEntity(data);
  }

  async updateLocationTemplate(
    id: string,
    templateData: DeepPartial<
      Omit<LocationTemplate, "id" | "createdAt" | "updatedAt">
    >
  ): Promise<void> {
    const { error } = await this.supabase
      .from("location_templates")
      .update(this.mapEntityToDbLocationTemplate(templateData as any))
      .eq("id", id);

    if (error) throw error;
  }

  async deleteLocationTemplate(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("location_templates")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async listLocationTemplates(filters?: {
    category?: string;
    timeOfDay?: string;
    weather?: string;
    mood?: string;
    style?: string;
    activeOnly?: boolean;
  }): Promise<LocationTemplate[]> {
    let query = this.supabase.from("location_templates").select("*");

    if (filters?.activeOnly) {
      query = query.eq("is_active", true);
    }
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }
    if (filters?.timeOfDay) {
      query = query.or(
        `time_of_day.eq.${filters.timeOfDay},default_time_of_day.eq.${filters.timeOfDay}`
      );
    }
    if (filters?.weather) {
      query = query.or(
        `weather.eq.${filters.weather},default_weather.eq.${filters.weather}`
      );
    }
    if (filters?.mood) {
      query = query.or(
        `mood.eq.${filters.mood},default_mood.eq.${filters.mood}`
      );
    }
    if (filters?.style) {
      query = query.eq("style", filters.style);
    }

    const { data, error } = await query;
    if (error) throw error;
    return this.mapDbLocationTemplatesToEntities(data || []);
  }

  // --- List Methods ---
  async listMangaProjects(): Promise<MangaProject[]> {
    return this.getAllProjects();
  }

  async listChapters(projectId: string): Promise<Chapter[]> {
    const { data, error } = await this.supabase
      .from("chapters")
      .select("*")
      .eq("manga_project_id", projectId)
      .order("chapter_number");

    if (error) throw error;
    return this.mapDbChaptersToEntities(data || []);
  }

  async listScenes(chapterId: string): Promise<Scene[]> {
    const { data, error } = await this.supabase
      .from("scenes")
      .select("*")
      .eq("chapter_id", chapterId)
      .order("order_num");

    if (error) throw error;
    return this.mapDbScenesToEntities(data || []);
  }

  async listPanels(sceneId: string): Promise<Panel[]> {
    const { data, error } = await this.supabase
      .from("panels")
      .select(
        `
        *,
        panel_characters!inner (
          character_id,
          characters (*)
        )
      `
      )
      .eq("scene_id", sceneId)
      .order("order_num");

    if (error) throw error;
    return this.mapDbPanelsToEntities(data || []);
  }

  async listPanelDialogues(panelId: string): Promise<PanelDialogue[]> {
    const { data, error } = await this.supabase
      .from("panel_dialogues")
      .select(
        `
        *,
        characters (*)
      `
      )
      .eq("panel_id", panelId)
      .order("order_num");

    if (error) throw error;
    return this.mapDbDialoguesToEntities(data || []);
  }

  async getAllChapters(): Promise<Chapter[]> {
    const { data, error } = await this.supabase.from("chapters").select("*");

    if (error) throw error;
    return this.mapDbChaptersToEntities(data || []);
  }

  async getAllScenes(): Promise<Scene[]> {
    const { data, error } = await this.supabase.from("scenes").select("*");

    if (error) throw error;
    return this.mapDbScenesToEntities(data || []);
  }

  async getAllPanels(): Promise<Panel[]> {
    const { data, error } = await this.supabase.from("panels").select(`
        *,
        panel_characters!inner (
          character_id,
          characters (*)
        )
      `);

    if (error) throw error;
    return this.mapDbPanelsToEntities(data || []);
  }

  async getAllPanelDialogues(): Promise<PanelDialogue[]> {
    const { data, error } = await this.supabase.from("panel_dialogues").select(`
        *,
        characters (*)
      `);

    if (error) throw error;
    return this.mapDbDialoguesToEntities(data || []);
  }

  async getAllCharacters(): Promise<Character[]> {
    const { data, error } = await this.supabase.from("characters").select("*");

    if (error) throw error;
    return this.mapDbCharactersToEntities(data || []);
  }

  // --- Initialization ---
  async initialize(): Promise<void> {
    // No specific initialization needed for Supabase
    // Connection is established when the client is created
  }

  // --- Mapping Methods ---
  private mapDbProjectToEntity(
    dbProject: Database["public"]["Tables"]["manga_projects"]["Row"]
  ): MangaProject {
    return {
      id: dbProject.id,
      title: dbProject.title,
      description: dbProject.description || undefined,
      status: dbProject.status as any,
      initialPrompt: dbProject.initial_prompt || undefined,
      genre: dbProject.genre || undefined,
      artStyle: dbProject.art_style || undefined,
      coverImageUrl: dbProject.cover_image_url || undefined,
      targetAudience: dbProject.target_audience as any,
      worldDetails: dbProject.world_details || undefined,
      concept: dbProject.concept || undefined,
      plotStructure: dbProject.plot_structure || undefined,
      themes: dbProject.themes || undefined,
      motifs: dbProject.motifs || undefined,
      symbols: dbProject.symbols || undefined,
      tags: dbProject.tags || undefined,
      creatorId: dbProject.creator_id || undefined,
      messages: dbProject.messages || undefined,
      viewCount: dbProject.view_count,
      likeCount: dbProject.like_count,
      published: dbProject.published,
      createdAt: new Date(dbProject.created_at),
      updatedAt: new Date(dbProject.updated_at),
      chapters: [],
      characters: [],
      outfitTemplates: [],
      locationTemplates: [],
    };
  }

  private mapDbProjectsToEntities(
    dbProjects: Database["public"]["Tables"]["manga_projects"]["Row"][]
  ): MangaProject[] {
    return dbProjects.map((project) => this.mapDbProjectToEntity(project));
  }

  private mapEntityToDbProject(
    entity: Partial<MangaProject>
  ): Partial<Database["public"]["Tables"]["manga_projects"]["Insert"]> {
    return {
      title: entity.title!,
      description: entity.description || null,
      status: entity.status as any,
      initial_prompt: entity.initialPrompt || null,
      genre: entity.genre || null,
      art_style: entity.artStyle || null,
      cover_image_url: entity.coverImageUrl || null,
      target_audience: entity.targetAudience as any,
      world_details: entity.worldDetails || {},
      concept: entity.concept || null,
      plot_structure: entity.plotStructure || {},
      themes: entity.themes || null,
      motifs: entity.motifs || null,
      symbols: entity.symbols || null,
      tags: entity.tags || null,
      creator_id: entity.creatorId || null,
      messages: entity.messages || [],
      view_count: entity.viewCount || 0,
      like_count: entity.likeCount || 0,
      published: entity.published || false,
    };
  }

  private mapDbCharacterToEntity(
    dbCharacter: Database["public"]["Tables"]["characters"]["Row"]
  ): Character {
    return {
      id: dbCharacter.id,
      mangaProjectId: dbCharacter.manga_project_id,
      name: dbCharacter.name,
      age: dbCharacter.age || undefined,
      gender: dbCharacter.gender || undefined,
      bodyAttributes: dbCharacter.body_attributes || undefined,
      facialAttributes: dbCharacter.facial_attributes || undefined,
      hairAttributes: dbCharacter.hair_attributes || undefined,
      distinctiveFeatures: dbCharacter.distinctive_features || undefined,
      physicalMannerisms: dbCharacter.physical_mannerisms || undefined,
      posture: dbCharacter.posture || undefined,
      styleGuide: dbCharacter.style_guide || undefined,
      defaultOutfitId: dbCharacter.default_outfit_id || undefined,
      outfitHistory: dbCharacter.outfit_history || undefined,
      consistencyPrompt: dbCharacter.consistency_prompt || undefined,
      negativePrompt: dbCharacter.negative_prompt || undefined,
      role: dbCharacter.role as any,
      briefDescription: dbCharacter.brief_description || undefined,
      personality: dbCharacter.personality || undefined,
      abilities: dbCharacter.abilities || undefined,
      backstory: dbCharacter.backstory || undefined,
      imgUrl: dbCharacter.img_url || undefined,
      traits: dbCharacter.traits || undefined,
      arcs: dbCharacter.arcs || undefined,
      isAiGenerated: dbCharacter.is_ai_generated,
      createdAt: new Date(dbCharacter.created_at),
      updatedAt: new Date(dbCharacter.updated_at),
    };
  }

  private mapDbCharactersToEntities(
    dbCharacters: Database["public"]["Tables"]["characters"]["Row"][]
  ): Character[] {
    return dbCharacters.map((character) =>
      this.mapDbCharacterToEntity(character)
    );
  }

  private mapEntityToDbCharacter(
    entity: Partial<Character>
  ): Partial<Database["public"]["Tables"]["characters"]["Insert"]> {
    return {
      manga_project_id: entity.mangaProjectId!,
      name: entity.name!,
      age: entity.age || null,
      gender: entity.gender || null,
      body_attributes: entity.bodyAttributes || {},
      facial_attributes: entity.facialAttributes || {},
      hair_attributes: entity.hairAttributes || {},
      distinctive_features: entity.distinctiveFeatures || null,
      physical_mannerisms: entity.physicalMannerisms || null,
      posture: entity.posture || null,
      style_guide: entity.styleGuide || {},
      default_outfit_id: entity.defaultOutfitId || null,
      outfit_history: entity.outfitHistory || [],
      consistency_prompt: entity.consistencyPrompt || null,
      negative_prompt: entity.negativePrompt || null,
      role: entity.role as any,
      brief_description: entity.briefDescription || null,
      personality: entity.personality || null,
      abilities: entity.abilities || null,
      backstory: entity.backstory || null,
      img_url: entity.imgUrl || null,
      traits: entity.traits || null,
      arcs: entity.arcs || null,
      is_ai_generated: entity.isAiGenerated || false,
    };
  }

  private mapDbChapterToEntity(
    dbChapter: Database["public"]["Tables"]["chapters"]["Row"]
  ): Chapter {
    return {
      id: dbChapter.id,
      mangaProjectId: dbChapter.manga_project_id,
      chapterNumber: dbChapter.chapter_number,
      title: dbChapter.title,
      narrative: dbChapter.narrative || "",
      purpose: dbChapter.purpose || undefined,
      tone: dbChapter.tone || undefined,
      keyCharacters: dbChapter.key_characters || undefined,
      coverImageUrl: dbChapter.cover_image_url || undefined,
      isAiGenerated: dbChapter.is_ai_generated || undefined,
      isPublished: dbChapter.is_published || undefined,
      viewCount: dbChapter.view_count || undefined,
      createdAt: new Date(dbChapter.created_at) || undefined,
      updatedAt: new Date(dbChapter.updated_at) || undefined,
      scenes: [],
    };
  }

  private mapDbChaptersToEntities(
    dbChapters: Database["public"]["Tables"]["chapters"]["Row"][]
  ): Chapter[] {
    return dbChapters.map((chapter) => this.mapDbChapterToEntity(chapter));
  }

  private mapEntityToDbChapter(
    entity: Partial<Chapter>
  ): Partial<Database["public"]["Tables"]["chapters"]["Insert"]> {
    return {
      manga_project_id: entity.mangaProjectId!,
      chapter_number: entity.chapterNumber!,
      title: entity.title!,
      narrative: entity.narrative || null,
      purpose: entity.purpose || null,
      tone: entity.tone || null,
      key_characters: entity.keyCharacters || null,
      cover_image_url: entity.coverImageUrl || null,
      is_ai_generated: entity.isAiGenerated || false,
      is_published: entity.isPublished || false,
      view_count: entity.viewCount || 0,
    };
  }

  private mapDbSceneToEntity(
    dbScene: Database["public"]["Tables"]["scenes"]["Row"]
  ): Scene {
    return {
      id: dbScene.id,
      chapterId: dbScene.chapter_id,
      order: dbScene.order_num,
      title: dbScene.title,
      description: dbScene.description || "",
      sceneContext: dbScene.scene_context || {},
      isAiGenerated: dbScene.is_ai_generated,
      createdAt: new Date(dbScene.created_at),
      updatedAt: new Date(dbScene.updated_at),
      panels: [],
    };
  }

  private mapDbScenesToEntities(
    dbScenes: Database["public"]["Tables"]["scenes"]["Row"][]
  ): Scene[] {
    return dbScenes.map((scene) => this.mapDbSceneToEntity(scene));
  }

  private mapEntityToDbScene(
    entity: Omit<Scene, "id" | "createdAt" | "updatedAt" | "panels">
  ): Database["public"]["Tables"]["scenes"]["Insert"] {
    return {
      chapter_id: entity.chapterId,
      order_num: entity.order,
      title: entity.title,
      description: entity.description || null,
      scene_context: entity.sceneContext || {},
      is_ai_generated: entity.isAiGenerated,
    };
  }

  private mapDbPanelToEntity(dbPanel: any): Panel {
    return {
      id: dbPanel.id,
      sceneId: dbPanel.scene_id,
      order: dbPanel.order_num,
      imageUrl: dbPanel.image_url || undefined,
      panelContext: dbPanel.panel_context || {},
      negativePrompt: dbPanel.negative_prompt || undefined,
      isAiGenerated: dbPanel.is_ai_generated,
      createdAt: new Date(dbPanel.created_at),
      updatedAt: new Date(dbPanel.updated_at),
      dialogues: [],
      characters:
        dbPanel.panel_characters?.map((pc: any) =>
          this.mapDbCharacterToEntity(pc.characters)
        ) || [],
    };
  }

  private mapDbPanelsToEntities(dbPanels: any[]): Panel[] {
    return dbPanels.map((panel) => this.mapDbPanelToEntity(panel));
  }

  private mapEntityToDbPanel(
    entity: Omit<
      Panel,
      "id" | "createdAt" | "updatedAt" | "dialogues" | "characters"
    >
  ): Database["public"]["Tables"]["panels"]["Insert"] {
    return {
      scene_id: entity.sceneId,
      order_num: entity.order,
      image_url: entity.imageUrl || null,
      panel_context: entity.panelContext || {},
      negative_prompt: entity.negativePrompt || null,
      is_ai_generated: entity.isAiGenerated,
    };
  }

  private mapDbDialogueToEntity(dbDialogue: any): PanelDialogue {
    return {
      id: dbDialogue.id,
      panelId: dbDialogue.panel_id,
      speakerId: dbDialogue.speaker_id,
      content: dbDialogue.content,
      order: dbDialogue.order_num,
      style: dbDialogue.style || undefined,
      emotion: dbDialogue.emotion || undefined,
      subtextNote: dbDialogue.subtext_note || undefined,
      config: dbDialogue.config || undefined,
      isAiGenerated: dbDialogue.is_ai_generated,
      createdAt: new Date(dbDialogue.created_at),
      updatedAt: new Date(dbDialogue.updated_at),
      speaker: dbDialogue.characters
        ? this.mapDbCharacterToEntity(dbDialogue.characters)
        : null,
    };
  }

  private mapDbDialoguesToEntities(dbDialogues: any[]): PanelDialogue[] {
    return dbDialogues.map((dialogue) => this.mapDbDialogueToEntity(dialogue));
  }

  private mapEntityToDbDialogue(
    entity: Partial<PanelDialogue>
  ): Partial<Database["public"]["Tables"]["panel_dialogues"]["Insert"]> {
    return {
      panel_id: entity.panelId!,
      speaker_id: entity.speakerId || null,
      content: entity.content!,
      order_num: entity.order!,
      style: entity.style || {},
      emotion: entity.emotion || null,
      subtext_note: entity.subtextNote || null,
      config: entity.config || {},
      is_ai_generated: entity.isAiGenerated || false,
    };
  }

  private mapDbOutfitTemplateToEntity(
    dbTemplate: Database["public"]["Tables"]["outfit_templates"]["Row"]
  ): OutfitTemplate {
    return {
      id: dbTemplate.id,
      name: dbTemplate.name,
      characterId: dbTemplate.character_id,
      description: dbTemplate.description,
      aiPrompt: dbTemplate.ai_prompt,
      category: dbTemplate.category as any,
      season: dbTemplate.season as any,
      isDefault: dbTemplate.is_default,
      tags: dbTemplate.tags || [],
      imageUrl: dbTemplate.image_url || undefined,
      mangaProjectId: dbTemplate.manga_project_id,
      createdAt: new Date(dbTemplate.created_at),
      updatedAt: new Date(dbTemplate.updated_at),
    };
  }

  private mapDbOutfitTemplatesToEntities(
    dbTemplates: Database["public"]["Tables"]["outfit_templates"]["Row"][]
  ): OutfitTemplate[] {
    return dbTemplates.map((template) =>
      this.mapDbOutfitTemplateToEntity(template)
    );
  }

  private mapEntityToDbOutfitTemplate(
    entity: Partial<OutfitTemplate>
  ): Partial<Database["public"]["Tables"]["outfit_templates"]["Insert"]> {
    return {
      name: entity.name!,
      character_id: entity.characterId!,
      description: entity.description!,
      ai_prompt: entity.aiPrompt!,
      category: entity.category as any,
      season: entity.season as any,
      is_default: entity.isDefault || false,
      tags: entity.tags || [],
      image_url: entity.imageUrl || null,
      manga_project_id: entity.mangaProjectId!,
    };
  }

  private mapDbLocationTemplateToEntity(
    dbTemplate: Database["public"]["Tables"]["location_templates"]["Row"]
  ): LocationTemplate {
    return {
      id: dbTemplate.id,
      name: dbTemplate.name,
      description: dbTemplate.description,
      basePrompt: dbTemplate.base_prompt,
      type: dbTemplate.type as any,
      category: dbTemplate.category as any,
      cameraAngles: (dbTemplate.camera_angles as any[]) || [],
      tags: dbTemplate.tags || [],
      imageUrl: dbTemplate.image_url || undefined,
      mangaProjectId: dbTemplate.manga_project_id,
      createdAt: new Date(dbTemplate.created_at),
      updatedAt: new Date(dbTemplate.updated_at),
    };
  }

  private mapDbLocationTemplatesToEntities(
    dbTemplates: Database["public"]["Tables"]["location_templates"]["Row"][]
  ): LocationTemplate[] {
    return dbTemplates.map((template) =>
      this.mapDbLocationTemplateToEntity(template)
    );
  }

  private mapEntityToDbLocationTemplate(
    entity: Partial<LocationTemplate>
  ): Partial<Database["public"]["Tables"]["location_templates"]["Insert"]> {
    return {
      name: entity.name!,
      description: entity.description!,
      base_prompt: entity.basePrompt!,
      type: entity.type as any,
      category: entity.category as any,
      camera_angles: entity.cameraAngles || [],
      tags: entity.tags || [],
      image_url: entity.imageUrl || null,
      manga_project_id: entity.mangaProjectId!,
    };
  }

  // === CHAT MESSAGES ===
  async createChatMessage(message: {
    id?: string; // Make ID optional - let database generate UUID if not provided
    projectId: string;
    userId?: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    messageType?: "text" | "image";
    imageUrl?: string;
    imageData?: string;
    metadata?: any;
  }): Promise<void> {
    const insertData: any = {
      project_id: message.projectId,
      user_id:
        message.userId && message.userId !== "anonymous"
          ? message.userId
          : null,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
      message_type: message.messageType || "text",
      image_url: message.imageUrl || null,
      image_data: message.imageData || null,
      metadata: message.metadata || {},
    };

    // Only include ID if provided, otherwise let database auto-generate
    if (message.id) {
      insertData.id = message.id;
    }

    const { error } = await this.supabase
      .from("chat_messages")
      .insert(insertData);

    if (error) {
      console.error("Error creating chat message:", error);
      throw new Error(`Failed to create chat message: ${error.message}`);
    }
  }

  async getChatMessages(
    projectId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<any[]> {
    const { limit = 50, offset = 0 } = options;

    const { data, error } = await this.supabase
      .from("chat_messages")
      .select("*")
      .eq("project_id", projectId)
      .order("timestamp", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching chat messages:", error);
      throw new Error(`Failed to fetch chat messages: ${error.message}`);
    }

    return data.map((row) => ({
      id: row.id,
      projectId: row.project_id,
      userId: row.user_id,
      role: row.role,
      content: row.content,
      timestamp: row.timestamp,
      type: row.message_type,
      imageUrl: row.image_url,
      imageData: row.image_data,
      metadata: row.metadata,
    }));
  }

  async getRecentChatMessages(
    projectId: string,
    limit: number = 10
  ): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("chat_messages")
      .select("*")
      .eq("project_id", projectId)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent chat messages:", error);
      throw new Error(`Failed to fetch recent chat messages: ${error.message}`);
    }

    // Return in chronological order (oldest first)
    return data.reverse().map((row) => ({
      id: row.id,
      projectId: row.project_id,
      userId: row.user_id,
      role: row.role,
      content: row.content,
      timestamp: row.timestamp,
      type: row.message_type,
      imageUrl: row.image_url,
      imageData: row.image_data,
      metadata: row.metadata,
    }));
  }

  // === USER MANAGEMENT ===
  async getUserById(userId: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      console.error("Error fetching user:", error);
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  async updateUserCredits(userId: string, credits: number): Promise<void> {
    const { error } = await this.supabase
      .from("users")
      .update({ credits, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user credits:", error);
      throw new Error(`Failed to update user credits: ${error.message}`);
    }
  }

  async createCreditTransaction(transaction: {
    id?: string; // Make ID optional - let database generate UUID if not provided
    userId: string;
    type: string;
    amount: number;
    operation: string;
    description: string;
    metadata?: any;
  }): Promise<void> {
    const insertData: any = {
      user_id: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      operation: transaction.operation,
      description: transaction.description,
      metadata: transaction.metadata || {},
    };

    // Only include ID if provided, otherwise let database auto-generate
    if (transaction.id) {
      insertData.id = transaction.id;
    }

    const { error } = await this.supabase
      .from("credit_transactions")
      .insert(insertData);

    if (error) {
      console.error("Error creating credit transaction:", error);
      throw new Error(`Failed to create credit transaction: ${error.message}`);
    }
  }
}

export const supabaseDataService = new SupabaseDataService();

// Initialize the service
supabaseDataService.initialize();
