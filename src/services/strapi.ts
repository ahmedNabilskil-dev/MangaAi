import type { MangaProject, Chapter, Scene, Panel, PanelDialogue, Character } from '@/types/entities';

/**
 * Placeholder for Strapi API interaction.
 * Replace these functions with actual API calls to your Strapi backend.
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'; // Replace with your Strapi URL if needed
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN; // Ensure you have this in your .env

// Helper function to handle Strapi's data wrapping
function unwrapStrapiData<T>(response: any): T | T[] | null {
    if (!response) {
        return null;
    }
    if (Array.isArray(response.data)) {
        return response.data.map((item: { id: string | number; attributes: any; }) => ({ id: item.id, ...item.attributes })) as T[];
    } else if (response.data) {
        return { id: response.data.id, ...response.data.attributes } as T;
    }
    return response as T; // Return as is if no 'data' property found
}

async function strapiFetch<T>(endpoint: string, options: RequestInit = {}, queryParams?: Record<string, string>): Promise<T> {
    const queryString = queryParams ? `?${new URLSearchParams(queryParams).toString()}` : '';
    const url = `${STRAPI_URL}/api/${endpoint}${queryString}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
        ...(options.headers || {}),
    };

    // Ensure Authorization header is only added if token exists
    if (!STRAPI_API_TOKEN) {
        console.warn(`Strapi API token is missing. Requests to ${endpoint} might fail.`);
        delete headers['Authorization'];
    } else if (!headers['Authorization']) {
         headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
    }


    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: response.statusText };
        }
        console.error(`Strapi API Error (${response.status}) on ${url}:`, errorData);
        // Attempt to extract a more specific error message
        const message = errorData?.error?.message || errorData?.message || `Strapi API request failed: ${response.statusText}`;
        throw new Error(message);
    }

     // Handle potential empty responses for methods like DELETE or empty gets
     if (response.status === 204 || response.headers.get('content-length') === '0') {
         return null as T;
     }

    const rawData = await response.json();
    return unwrapStrapiData<T>(rawData); // Unwrap the data structure
}


// --- MangaProject Functions ---

/** Gets all projects. */
export async function getAllProjects(): Promise<MangaProject[]> {
    console.log('Fetching all projects from Strapi');
    // Add populate=* or specify relations if needed
    return strapiFetch<MangaProject[]>('manga-projects', { method: 'GET' }, { populate: 'deep,3' }); // Populate relations
}

/** Gets a single project by ID. */
export async function getProject(id: string): Promise<MangaProject | null> {
    console.log(`Fetching project ${id} from Strapi`);
     // Add populate=* or specify relations if needed
    return strapiFetch<MangaProject>(`manga-projects/${id}`, { method: 'GET' }, { populate: 'deep,3' });
}


/** Creates a new project in Strapi. */
export async function createProject(projectData: Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'creator' | 'characters' | 'chapters' | 'messages'>): Promise<MangaProject> {
  console.log('Creating project in Strapi:', projectData);
  return strapiFetch<MangaProject>('manga-projects', {
    method: 'POST',
    body: JSON.stringify({ data: projectData }),
  });
}

/** Updates an existing project in Strapi. */
export async function updateProject(id: string, projectData: Partial<Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'creator' | 'characters' | 'chapters' | 'messages'>>): Promise<MangaProject> {
    console.log(`Updating project ${id} in Strapi:`, projectData);
    return strapiFetch<MangaProject>(`manga-projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data: projectData }),
    });
}

/** Deletes a project by ID. */
export async function deleteProject(id: string): Promise<MangaProject | null> {
    console.log(`Deleting project ${id} from Strapi`);
    return strapiFetch<MangaProject>(`manga-projects/${id}`, { method: 'DELETE' });
}

// --- Chapter Functions ---

/** Gets all chapters (optionally filtered by project). */
export async function getAllChapters(projectId?: string): Promise<Chapter[]> {
    console.log(`Fetching all chapters${projectId ? ` for project ${projectId}` : ''} from Strapi`);
    const filters = projectId ? { filters: { mangaProject: { id: { $eq: projectId } } } } : {};
    return strapiFetch<Chapter[]>('chapters', { method: 'GET' }, { ...filters, populate: 'deep,2' }); // Populate scenes etc.
}

/** Gets a single chapter by ID. */
export async function getChapter(id: string): Promise<Chapter | null> {
    console.log(`Fetching chapter ${id} from Strapi`);
    return strapiFetch<Chapter>(`chapters/${id}`, { method: 'GET' }, { populate: 'deep,2' });
}

/** Creates a new chapter in Strapi. */
export async function createChapter(chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'mangaProject' | 'scenes'> & { mangaProjectId: string }): Promise<Chapter> {
  console.log('Creating chapter in Strapi:', chapterData);
   const payload = {
    ...chapterData,
    mangaProject: chapterData.mangaProjectId // Map to the relation field name in Strapi
    };
    delete (payload as any).mangaProjectId;

  return strapiFetch<Chapter>('chapters', {
    method: 'POST',
    body: JSON.stringify({ data: payload }),
  });
}

/** Updates an existing chapter in Strapi. */
export async function updateChapter(id: string, chapterData: Partial<Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'mangaProject' | 'scenes'>> & { mangaProjectId?: string }): Promise<Chapter> {
    console.log(`Updating chapter ${id} in Strapi:`, chapterData);
    const payload = { ...chapterData };
     if ('mangaProjectId' in payload && payload.mangaProjectId) {
        payload.mangaProject = payload.mangaProjectId;
     }
     delete (payload as any).mangaProjectId;
    return strapiFetch<Chapter>(`chapters/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data: payload }),
    });
}

/** Deletes a chapter by ID. */
export async function deleteChapter(id: string): Promise<Chapter | null> {
    console.log(`Deleting chapter ${id} from Strapi`);
    return strapiFetch<Chapter>(`chapters/${id}`, { method: 'DELETE' });
}


// --- Scene Functions ---

/** Gets all scenes (optionally filtered by chapter). */
export async function getAllScenes(chapterId?: string): Promise<Scene[]> {
    console.log(`Fetching all scenes${chapterId ? ` for chapter ${chapterId}` : ''} from Strapi`);
    const filters = chapterId ? { filters: { chapter: { id: { $eq: chapterId } } } } : {};
    return strapiFetch<Scene[]>('scenes', { method: 'GET' }, { ...filters, populate: 'deep,2' }); // Populate panels etc.
}

/** Gets a single scene by ID. */
export async function getScene(id: string): Promise<Scene | null> {
    console.log(`Fetching scene ${id} from Strapi`);
    return strapiFetch<Scene>(`scenes/${id}`, { method: 'GET' }, { populate: 'deep,2' });
}

/** Creates a new scene in Strapi. */
export async function createScene(sceneData: Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'chapter' | 'panels'> & { chapterId: string }): Promise<Scene> {
    console.log('Creating scene in Strapi:', sceneData);
     const payload = {
        ...sceneData,
        chapter: sceneData.chapterId // Map to the relation field name in Strapi
    };
    delete (payload as any).chapterId;
    return strapiFetch<Scene>('scenes', {
        method: 'POST',
        body: JSON.stringify({ data: payload }),
    });
}

/** Updates an existing scene in Strapi. */
export async function updateScene(id: string, sceneData: Partial<Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'chapter' | 'panels'>> & { chapterId?: string }): Promise<Scene> {
    console.log(`Updating scene ${id} in Strapi:`, sceneData);
     const payload = { ...sceneData };
     if ('chapterId' in payload && payload.chapterId) {
         payload.chapter = payload.chapterId;
     }
     delete (payload as any).chapterId;
    return strapiFetch<Scene>(`scenes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data: payload }),
    });
}

/** Deletes a scene by ID. */
export async function deleteScene(id: string): Promise<Scene | null> {
    console.log(`Deleting scene ${id} from Strapi`);
    return strapiFetch<Scene>(`scenes/${id}`, { method: 'DELETE' });
}


// --- Panel Functions ---

/** Gets all panels (optionally filtered by scene). */
export async function getAllPanels(sceneId?: string): Promise<Panel[]> {
    console.log(`Fetching all panels${sceneId ? ` for scene ${sceneId}` : ''} from Strapi`);
    const filters = sceneId ? { filters: { scene: { id: { $eq: sceneId } } } } : {};
    return strapiFetch<Panel[]>('panels', { method: 'GET' }, { ...filters, populate: 'deep,2' }); // Populate dialogues, characters
}

/** Gets a single panel by ID. */
export async function getPanel(id: string): Promise<Panel | null> {
    console.log(`Fetching panel ${id} from Strapi`);
    return strapiFetch<Panel>(`panels/${id}`, { method: 'GET' }, { populate: 'deep,2' });
}

/** Creates a new panel in Strapi. */
export async function createPanel(panelData: Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'scene' | 'dialogues' | 'characters'> & { sceneId: string; characterIds?: string[] }): Promise<Panel> {
    console.log('Creating panel in Strapi:', panelData);
    const payload = {
        ...panelData,
        scene: panelData.sceneId, // Map to the relation field name
        characters: panelData.characterIds || [] // Map character IDs for relation
    };
    delete (payload as any).sceneId;
    delete (payload as any).characterIds;

    return strapiFetch<Panel>('panels', {
        method: 'POST',
        body: JSON.stringify({ data: payload }),
    });
}

/** Updates an existing panel in Strapi. */
export async function updatePanel(id: string, panelData: Partial<Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'scene' | 'dialogues' | 'characters'>> & { sceneId?: string; characterIds?: string[] }): Promise<Panel> {
    console.log(`Updating panel ${id} in Strapi:`, panelData);
    const payload = { ...panelData };
    if ('sceneId' in payload && payload.sceneId) {
        payload.scene = payload.sceneId;
    }
    // Handle characters update (set or replace)
    if ('characterIds' in payload) {
        payload.characters = payload.characterIds || [];
    }
    delete (payload as any).sceneId;
    delete (payload as any).characterIds;

    return strapiFetch<Panel>(`panels/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data: payload }),
    });
}


/** Deletes a panel by ID. */
export async function deletePanel(id: string): Promise<Panel | null> {
    console.log(`Deleting panel ${id} from Strapi`);
    return strapiFetch<Panel>(`panels/${id}`, { method: 'DELETE' });
}

// --- PanelDialogue Functions ---

/** Gets all dialogues (optionally filtered by panel). */
export async function getAllPanelDialogues(panelId?: string): Promise<PanelDialogue[]> {
    console.log(`Fetching all dialogues${panelId ? ` for panel ${panelId}` : ''} from Strapi`);
    const filters = panelId ? { filters: { panel: { id: { $eq: panelId } } } } : {};
     // Adjust endpoint if needed (e.g., 'panel-dialogues')
    return strapiFetch<PanelDialogue[]>('panel-dialogues', { method: 'GET' }, { ...filters, populate: 'deep,1' });
}

/** Gets a single dialogue by ID. */
export async function getPanelDialogue(id: string): Promise<PanelDialogue | null> {
    console.log(`Fetching dialogue ${id} from Strapi`);
    // Adjust endpoint if needed
    return strapiFetch<PanelDialogue>(`panel-dialogues/${id}`, { method: 'GET' }, { populate: 'deep,1' });
}

/** Creates a new panel dialogue in Strapi. */
export async function createPanelDialogue(dialogueData: Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'panel' | 'speaker'> & { panelId: string, speakerId?: string }): Promise<PanelDialogue> {
    console.log('Creating panel dialogue in Strapi:', dialogueData);
    const payload = {
        ...dialogueData,
        panel: dialogueData.panelId,
        speaker: dialogueData.speakerId || null // Set speaker relation, allow null
    };
    delete (payload as any).panelId;
    delete (payload as any).speakerId;

    // Adjust endpoint if needed
    return strapiFetch<PanelDialogue>('panel-dialogues', {
        method: 'POST',
        body: JSON.stringify({ data: payload }),
    });
}

/** Updates an existing panel dialogue in Strapi. */
export async function updatePanelDialogue(id: string, dialogueData: Partial<Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'panel' | 'speaker'>> & { panelId?: string, speakerId?: string | null }): Promise<PanelDialogue> {
    console.log(`Updating panel dialogue ${id} in Strapi:`, dialogueData);
    const payload = { ...dialogueData };
     if ('panelId' in payload && payload.panelId) {
         payload.panel = payload.panelId;
     }
     if ('speakerId' in payload) { // Allow setting speaker to null
        payload.speaker = payload.speakerId;
     }
     delete (payload as any).panelId;
     delete (payload as any).speakerId;

    // Adjust endpoint if needed
    return strapiFetch<PanelDialogue>(`panel-dialogues/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data: payload }),
    });
}

/** Deletes a dialogue by ID. */
export async function deletePanelDialogue(id: string): Promise<PanelDialogue | null> {
    console.log(`Deleting dialogue ${id} from Strapi`);
    // Adjust endpoint if needed
    return strapiFetch<PanelDialogue>(`panel-dialogues/${id}`, { method: 'DELETE' });
}

// --- Character Functions ---

/** Gets all characters (optionally filtered by project). */
export async function getAllCharacters(projectId?: string): Promise<Character[]> {
    console.log(`Fetching all characters${projectId ? ` for project ${projectId}` : ''} from Strapi`);
    const filters = projectId ? { filters: { mangaProject: { id: { $eq: projectId } } } } : {};
    return strapiFetch<Character[]>('characters', { method: 'GET' }, { ...filters, populate: 'deep,1' });
}

/** Gets a single character by ID. */
export async function getCharacter(id: string): Promise<Character | null> {
    console.log(`Fetching character ${id} from Strapi`);
    return strapiFetch<Character>(`characters/${id}`, { method: 'GET' }, { populate: 'deep,1' });
}

/** Creates a new character in Strapi. */
export async function createCharacter(characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'mangaProject'> & { mangaProjectId: string }): Promise<Character> {
    console.log('Creating character in Strapi:', characterData);
     const payload = {
        ...characterData,
        mangaProject: characterData.mangaProjectId // Map to the relation field name
    };
    delete (payload as any).mangaProjectId;
    return strapiFetch<Character>('characters', {
        method: 'POST',
        body: JSON.stringify({ data: payload }),
    });
}

/** Updates an existing character in Strapi. */
export async function updateCharacter(id: string, characterData: Partial<Omit<Character, 'id' | 'createdAt' | 'updatedAt' | 'mangaProject'>> & { mangaProjectId?: string }): Promise<Character> {
    console.log(`Updating character ${id} in Strapi:`, characterData);
    const payload = { ...characterData };
     if ('mangaProjectId' in payload && payload.mangaProjectId) {
         payload.mangaProject = payload.mangaProjectId;
     }
     delete (payload as any).mangaProjectId;
    return strapiFetch<Character>(`characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ data: payload }),
    });
}

/** Deletes a character by ID. */
export async function deleteCharacter(id: string): Promise<Character | null> {
    console.log(`Deleting character ${id} from Strapi`);
    return strapiFetch<Character>(`characters/${id}`, { method: 'DELETE' });
}


// --- User Function (Example) ---
export interface StrapiUser {
    id: string; // or number depending on your Strapi setup
    username: string;
    email: string;
    // Add other relevant user fields
}

export async function getUser(userId: string): Promise<StrapiUser | null> {
    console.log(`Fetching user ${userId} from Strapi`);
    // return strapiFetch<StrapiUser>(`users/${userId}`); // Adjust endpoint
    // Replace with actual fetch or return mock data if auth isn't set up
     try {
        // Assuming Strapi's users-permissions plugin endpoint
        return await strapiFetch<StrapiUser>(`users/${userId}`);
      } catch (error) {
        console.error(`Failed to fetch user ${userId}:`, error);
        // Return null or a default user object if appropriate
        return null;
        // Example default:
        // return { id: userId, username: 'placeholder_user', email: 'user@example.com' };
      }
}

// --- Utility Function for Panel-Character Assignment ---

/** Assigns a character to a panel in Strapi (handles ManyToMany relation). */
export async function assignCharacterToPanel(panelId: string, characterId: string): Promise<Panel> {
    console.log(`Assigning character ${characterId} to panel ${panelId}`);
    // Fetch current panel to get existing character IDs
    const panel = await getPanel(panelId);
    if (!panel) {
        throw new Error(`Panel with ID ${panelId} not found.`);
    }
    const existingCharacterIds = panel.characters?.map(c => c.id) || [];
    // Add the new character ID if it's not already there
    const updatedCharacterIds = Array.from(new Set([...existingCharacterIds, characterId]));

    return updatePanel(panelId, { characterIds: updatedCharacterIds });
}

/** Removes a character from a panel in Strapi (handles ManyToMany relation). */
export async function removeCharacterFromPanel(panelId: string, characterId: string): Promise<Panel> {
    console.log(`Removing character ${characterId} from panel ${panelId}`);
    const panel = await getPanel(panelId);
     if (!panel) {
        throw new Error(`Panel with ID ${panelId} not found.`);
    }
    const updatedCharacterIds = (panel.characters || [])
        .map(c => c.id)
        .filter(id => id !== characterId);

    return updatePanel(panelId, { characterIds: updatedCharacterIds });
}
