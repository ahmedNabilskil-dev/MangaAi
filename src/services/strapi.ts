import type { MangaProject, Chapter, Scene, Panel, PanelDialogue, Character } from '@/types/entities';

/**
 * Placeholder for Strapi API interaction.
 * Replace these functions with actual API calls to your Strapi backend.
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'; // Replace with your Strapi URL if needed
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN; // Ensure you have this in your .env

async function strapiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${STRAPI_URL}/api/${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        ...(options.headers || {}),
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json();
        console.error(`Strapi API Error (${response.status}) on ${endpoint}:`, errorData);
        throw new Error(`Strapi API request failed: ${response.statusText}`);
    }

     // Handle potential empty responses for methods like DELETE
     if (response.status === 204 || response.headers.get('content-length') === '0') {
         return null as T; // Or handle as appropriate for your use case
     }

    const data = await response.json();
    // Strapi often wraps data in a 'data' object, sometimes with 'attributes'
    return data.data || data;
}


// --- MangaProject Functions ---

/**
 * Creates a new project in Strapi.
 * @param projectData The project data to create (without id, createdAt, updatedAt).
 * @returns A promise that resolves to the created MangaProject (with Strapi structure).
 */
export async function createProject(projectData: Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'creator' | 'characters' | 'chapters' | 'messages'>): Promise<{ id: string, attributes: MangaProject }> {
  console.log('Creating project in Strapi:', projectData);
  // Adjust endpoint and payload structure according to your Strapi setup
  return strapiFetch<{ id: string, attributes: MangaProject }>('manga-projects', {
    method: 'POST',
    body: JSON.stringify({ data: projectData }),
  });
}

/**
 * Updates an existing project in Strapi.
 * @param id The ID of the project to update.
 * @param projectData The project data to update.
 * @returns A promise that resolves to the updated MangaProject.
 */
export async function updateProject(id: string, projectData: Partial<Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'creator' | 'characters' | 'chapters' | 'messages'>>): Promise<{ id: string, attributes: MangaProject }> {
    console.log(`Updating project ${id} in Strapi:`, projectData);
    return strapiFetch<{ id: string, attributes: MangaProject }>(`manga-projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data: projectData }),
    });
  }

// --- Chapter Functions ---

/**
 * Creates a new chapter in Strapi.
 * @param chapterData The chapter data to create.
 * @returns A promise that resolves to the created Chapter.
 */
export async function createChapter(chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'mangaProject' | 'scenes'>): Promise<{ id: string, attributes: Chapter }> {
  console.log('Creating chapter in Strapi:', chapterData);
   // Ensure mangaProjectId is mapped correctly for Strapi relation
   const payload = {
    ...chapterData,
    mangaProject: chapterData.mangaProjectId // Map to the relation field name in Strapi
};
delete (payload as any).mangaProjectId; // Remove the original field if needed

  return strapiFetch<{ id: string, attributes: Chapter }>('chapters', {
    method: 'POST',
    body: JSON.stringify({ data: payload }),
  });
}

/**
 * Updates an existing chapter in Strapi.
 * @param id The ID of the chapter to update.
 * @param chapterData The chapter data to update.
 * @returns A promise that resolves to the updated Chapter.
 */
export async function updateChapter(id: string, chapterData: Partial<Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'mangaProject' | 'scenes'>>): Promise<{ id: string, attributes: Chapter }> {
    console.log(`Updating chapter ${id} in Strapi:`, chapterData);
    const payload = { ...chapterData };
     if ('mangaProjectId' in payload) {
        payload.mangaProject = payload.mangaProjectId;
        delete (payload as any).mangaProjectId;
     }
    return strapiFetch<{ id: string, attributes: Chapter }>(`chapters/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data: payload }),
    });
}

// --- Scene Functions ---

/**
 * Creates a new scene in Strapi.
 * @param sceneData The scene data to create.
 * @returns A promise that resolves to the created Scene.
 */
export async function createScene(sceneData: Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'chapter' | 'panels'>): Promise<{ id: string, attributes: Scene }> {
    console.log('Creating scene in Strapi:', sceneData);
     // Ensure chapterId is mapped correctly for Strapi relation
     const payload = {
        ...sceneData,
        chapter: sceneData.chapterId // Map to the relation field name in Strapi
    };
    delete (payload as any).chapterId; // Remove the original field if needed
    return strapiFetch<{ id: string, attributes: Scene }>('scenes', {
        method: 'POST',
        body: JSON.stringify({ data: payload }),
    });
}

/**
 * Updates an existing scene in Strapi.
 * @param id The ID of the scene to update.
 * @param sceneData The scene data to update.
 * @returns A promise that resolves to the updated Scene.
 */
export async function updateScene(id: string, sceneData: Partial<Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'chapter' | 'panels'>>): Promise<{ id: string, attributes: Scene }> {
    console.log(`Updating scene ${id} in Strapi:`, sceneData);
     const payload = { ...sceneData };
     if ('chapterId' in payload) {
         payload.chapter = payload.chapterId;
         delete (payload as any).chapterId;
     }
    return strapiFetch<{ id: string, attributes: Scene }>(`scenes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data: payload }),
    });
}


// --- Panel Functions ---

/**
 * Creates a new panel in Strapi.
 * @param panelData The panel data to create.
 * @returns A promise that resolves to the created Panel.
 */
export async function createPanel(panelData: Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'scene' | 'dialogues' | 'characters'> & { sceneId: string }): Promise<{ id: string, attributes: Panel }> {
    console.log('Creating panel in Strapi:', panelData);
    // Ensure sceneId is mapped correctly for Strapi relation
    const payload = {
        ...panelData,
        scene: panelData.sceneId // Map to the relation field name in Strapi
    };
    delete (payload as any).sceneId; // Remove the original field if needed
    // Handle characters relation if needed (e.g., pass array of character IDs)

    return strapiFetch<{ id: string, attributes: Panel }>('panels', {
        method: 'POST',
        body: JSON.stringify({ data: payload }),
    });
}

/**
 * Updates an existing panel in Strapi.
 * @param id The ID of the panel to update.
 * @param panelData The panel data to update.
 * @returns A promise that resolves to the updated Panel.
 */
export async function updatePanel(id: string, panelData: Partial<Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'scene' | 'dialogues' | 'characters'>> & { sceneId?: string }): Promise<{ id: string, attributes: Panel }> {
    console.log(`Updating panel ${id} in Strapi:`, panelData);
     const payload = { ...panelData };
     if ('sceneId' in payload) {
         payload.scene = payload.sceneId;
         delete (payload as any).sceneId;
     }
    return strapiFetch<{ id: string, attributes: Panel }>(`panels/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data: payload }),
    });
}


// --- PanelDialogue Functions ---

/**
 * Creates a new panel dialogue in Strapi.
 * @param dialogueData The dialogue data to create.
 * @returns A promise that resolves to the created PanelDialogue.
 */
export async function createPanelDialogue(dialogueData: Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'panel' | 'speaker'> & { panelId: string, speakerId?: string }): Promise<{ id: string, attributes: PanelDialogue }> {
    console.log('Creating panel dialogue in Strapi:', dialogueData);
    // Ensure panelId and speakerId are mapped correctly for Strapi relations
    const payload = {
        ...dialogueData,
        panel: dialogueData.panelId,
        speaker: dialogueData.speakerId // Optional speaker relation
    };
    delete (payload as any).panelId;
    delete (payload as any).speakerId;

    return strapiFetch<{ id: string, attributes: PanelDialogue }>('panel-dialogues', { // Adjust endpoint if needed
        method: 'POST',
        body: JSON.stringify({ data: payload }),
    });
}

/**
 * Updates an existing panel dialogue in Strapi.
 * @param id The ID of the dialogue to update.
 * @param dialogueData The dialogue data to update.
 * @returns A promise that resolves to the updated PanelDialogue.
 */
export async function updatePanelDialogue(id: string, dialogueData: Partial<Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'panel' | 'speaker'>> & { panelId?: string, speakerId?: string }): Promise<{ id: string, attributes: PanelDialogue }> {
    console.log(`Updating panel dialogue ${id} in Strapi:`, dialogueData);
    const payload = { ...dialogueData };
     if ('panelId' in payload) {
         payload.panel = payload.panelId;
         delete (payload as any).panelId;
     }
     if ('speakerId' in payload) {
        payload.speaker = payload.speakerId;
        delete (payload as any).speakerId;
    }
    return strapiFetch<{ id: string, attributes: PanelDialogue }>(`panel-dialogues/${id}`, { // Adjust endpoint if needed
        method: 'PUT',
        body: JSON.stringify({ data: payload }),
    });
}

// --- Character Functions ---

/**
 * Creates a new character in Strapi.
 * @param characterData The character data to create.
 * @returns A promise that resolves to the created Character.
 */
export async function createCharacter(characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'mangaProject'> & { mangaProjectId: string }): Promise<{ id: string, attributes: Character }> {
    console.log('Creating character in Strapi:', characterData);
     // Ensure mangaProjectId is mapped correctly for Strapi relation
     const payload = {
        ...characterData,
        mangaProject: characterData.mangaProjectId // Map to the relation field name in Strapi
    };
    delete (payload as any).mangaProjectId; // Remove the original field if needed
    return strapiFetch<{ id: string, attributes: Character }>('characters', {
        method: 'POST',
        body: JSON.stringify({ data: payload }),
    });
}

/**
 * Updates an existing character in Strapi.
 * @param id The ID of the character to update.
 * @param characterData The character data to update.
 * @returns A promise that resolves to the updated Character.
 */
export async function updateCharacter(id: string, characterData: Partial<Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'mangaProject'>> & { mangaProjectId?: string }): Promise<{ id: string, attributes: Character }> {
    console.log(`Updating character ${id} in Strapi:`, characterData);
    const payload = { ...characterData };
     if ('mangaProjectId' in payload) {
         payload.mangaProject = payload.mangaProjectId;
         delete (payload as any).mangaProjectId;
     }
    return strapiFetch<{ id: string, attributes: Character }>(`characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data: payload }),
    });
}

// --- Placeholder functions for entities not directly mapped to simple nodes ---
// These might be needed for Genkit tools or other backend interactions

export interface StrapiUser {
    id: string; // or number depending on your Strapi setup
    username: string;
    email: string;
    // Add other relevant user fields
}

// Example: Get user data (replace with actual implementation)
export async function getUser(userId: string): Promise<StrapiUser | null> {
    console.log(`Fetching user ${userId} from Strapi`);
    // return strapiFetch<StrapiUser>(`users/${userId}`); // Adjust endpoint if needed
    return { id: userId, username: 'placeholder_user', email: 'user@example.com' }; // Placeholder
}
