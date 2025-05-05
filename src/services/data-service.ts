// src/services/data-service.ts
'use server'; // Mark this module as potentially running server-side

import type { IDataService } from './data-service.interface';
import { dexieDataService } from './dexie-service';
import { inMemoryDataService } from './in-memory-service';

// --- Configuration ---
// Change this variable to switch between data service implementations.
// Use environment variables in a real application.
const ACTIVE_SERVICE_TYPE: 'dexie' | 'in-memory' = 'dexie'; // or 'in-memory'

// --- Service Instance ---
let activeDataService: IDataService;

if (ACTIVE_SERVICE_TYPE === 'dexie') {
    activeDataService = dexieDataService;
    console.log("Using DexieDataService");
} else {
    activeDataService = inMemoryDataService;
    console.log("Using InMemoryDataService");
}

// --- Export the active service instance ---
// This ensures the rest of the application imports from here
// and doesn't need to know the specific implementation being used.
export const dataService = activeDataService;

// --- Re-export specific functions for convenience ---
// This allows imports like `import { getProject } from '@/services/data-service'`

// --- Project ---
export const getAllProjects = dataService.getAllProjects.bind(dataService);
export const getProject = dataService.getProject.bind(dataService);
export const createProject = dataService.createProject.bind(dataService);
export const updateProject = dataService.updateProject.bind(dataService);
export const deleteProject = dataService.deleteProject.bind(dataService);
export const getDefaultProject = dataService.getDefaultProject.bind(dataService);

// --- Chapter ---
export const createChapter = dataService.createChapter.bind(dataService);
export const updateChapter = dataService.updateChapter.bind(dataService);
export const deleteChapter = dataService.deleteChapter.bind(dataService);
export const getChapterForContext = dataService.getChapterForContext.bind(dataService);

// --- Scene ---
export const createScene = dataService.createScene.bind(dataService);
export const updateScene = dataService.updateScene.bind(dataService);
export const deleteScene = dataService.deleteScene.bind(dataService);
export const getSceneForContext = dataService.getSceneForContext.bind(dataService);

// --- Panel ---
export const createPanel = dataService.createPanel.bind(dataService);
export const updatePanel = dataService.updatePanel.bind(dataService);
export const deletePanel = dataService.deletePanel.bind(dataService);
export const assignCharacterToPanel = dataService.assignCharacterToPanel.bind(dataService);
export const removeCharacterFromPanel = dataService.removeCharacterFromPanel.bind(dataService);
export const getPanelForContext = dataService.getPanelForContext.bind(dataService);

// --- Dialogue ---
export const createPanelDialogue = dataService.createPanelDialogue.bind(dataService);
export const updatePanelDialogue = dataService.updatePanelDialogue.bind(dataService);
export const deletePanelDialogue = dataService.deletePanelDialogue.bind(dataService);
export const getPanelDialogueForContext = dataService.getPanelDialogueForContext.bind(dataService);

// --- Character ---
export const getAllCharacters = dataService.getAllCharacters.bind(dataService);
export const getCharacter = dataService.getCharacter.bind(dataService);
export const createCharacter = dataService.createCharacter.bind(dataService);
export const updateCharacter = dataService.updateCharacter.bind(dataService);
export const deleteCharacter = dataService.deleteCharacter.bind(dataService);
export const getCharacterForContext = dataService.getCharacterForContext.bind(dataService);

// --- Initialization (call if needed, depends on service) ---
export const initializeDataService = dataService.initialize?.bind(dataService);
// Example: Call initializeDataService() at application startup if required by the active service.
