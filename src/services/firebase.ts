'use server';

import { db } from '@/lib/firebase.config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  type DocumentReference,
  type CollectionReference,
  writeBatch,
  collectionGroup,
  orderBy
} from 'firebase/firestore';
import type { MangaProject, Chapter, Scene, Panel, PanelDialogue, Character } from '@/types/entities';
import type { DeepPartial } from '@/types/utils'; // Assuming you have a DeepPartial utility type

// --- Firestore Collection References ---
const projectsCol = collection(db, 'projects') as CollectionReference<MangaProject>;
const chaptersCol = collection(db, 'chapters') as CollectionReference<Chapter>;
const scenesCol = collection(db, 'scenes') as CollectionReference<Scene>;
const panelsCol = collection(db, 'panels') as CollectionReference<Panel>;
const dialoguesCol = collection(db, 'dialogues') as CollectionReference<PanelDialogue>;
const charactersCol = collection(db, 'characters') as CollectionReference<Character>;

// --- Helper Functions ---

// Convert Firestore Timestamps to Dates in nested objects/arrays
function convertTimestampsToDates(data: any): any {
  if (data instanceof Timestamp) {
    return data.toDate();
  }
  if (Array.isArray(data)) {
    return data.map(convertTimestampsToDates);
  }
  if (typeof data === 'object' && data !== null) {
    const newData: any = {};
    for (const key in data) {
      newData[key] = convertTimestampsToDates(data[key]);
    }
    return newData;
  }
  return data;
}

// Fetch a document and convert timestamps
async function getDocWithDates<T>(docRef: DocumentReference): Promise<(T & { id: string }) | null> {
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = convertTimestampsToDates(docSnap.data());
    return { ...data, id: docSnap.id } as T & { id: string };
  } else {
    return null;
  }
}

// Fetch documents from a query and convert timestamps
async function getDocsWithDates<T>(colRefOrQuery: CollectionReference | any): Promise<(T & { id: string })[]> {
   const querySnapshot = await getDocs(colRefOrQuery);
   return querySnapshot.docs.map(doc => {
       const data = convertTimestampsToDates(doc.data());
       return { ...data, id: doc.id } as T & { id: string };
   });
}


// Prepare data for Firestore (convert Dates to Timestamps, remove undefined)
function prepareDataForFirestore(data: any): any {
  const cleanedData: any = {};
  for (const key in data) {
    const value = data[key];
    if (value !== undefined) { // Remove undefined fields
      if (value instanceof Date) {
        cleanedData[key] = Timestamp.fromDate(value);
      } else if (Array.isArray(value)) {
        cleanedData[key] = value.map(prepareDataForFirestore); // Recurse for arrays
      } else if (typeof value === 'object' && value !== null && !(value instanceof DocumentReference)) {
         // Recurse for nested objects, but not references
        cleanedData[key] = prepareDataForFirestore(value);
      } else {
        cleanedData[key] = value;
      }
    }
  }
  return cleanedData;
}


// --- MangaProject Functions ---

/** Gets all projects. */
export async function getAllProjects(): Promise<MangaProject[]> {
    console.log('Fetching all projects from Firestore');
    return getDocsWithDates<MangaProject>(projectsCol);
}

/** Gets a single project by ID, including nested data. */
export async function getProject(id: string): Promise<MangaProject | null> {
    console.log(`Fetching project ${id} from Firestore`);
    const projectRef = doc(db, 'projects', id);
    const project = await getDocWithDates<MangaProject>(projectRef);

    if (!project) return null;

    // Fetch related data - Firestore doesn't have deep population like Strapi
    // Chapters
    const chaptersQuery = query(chaptersCol, where('mangaProjectId', '==', id), orderBy('chapterNumber'));
    project.chapters = await getDocsWithDates<Chapter>(chaptersQuery);

     // Characters
     const charactersQuery = query(charactersCol, where('mangaProjectId', '==', id));
     project.characters = await getDocsWithDates<Character>(charactersQuery);


    // Fetch nested data for each chapter (Scenes, Panels, Dialogues)
    if (project.chapters) {
        for (const chapter of project.chapters) {
            const scenesQuery = query(scenesCol, where('chapterId', '==', chapter.id), orderBy('order'));
            chapter.scenes = await getDocsWithDates<Scene>(scenesQuery);

            if (chapter.scenes) {
                for (const scene of chapter.scenes) {
                    const panelsQuery = query(panelsCol, where('sceneId', '==', scene.id), orderBy('order'));
                    scene.panels = await getDocsWithDates<Panel>(panelsQuery);

                    if (scene.panels) {
                         for (const panel of scene.panels) {
                             const dialoguesQuery = query(dialoguesCol, where('panelId', '==', panel.id), orderBy('order'));
                             panel.dialogues = await getDocsWithDates<PanelDialogue>(dialoguesQuery);

                             // Fetch speaker data for dialogues (if speakerId exists)
                             if(panel.dialogues) {
                                 for(const dialogue of panel.dialogues) {
                                     if (dialogue.speakerId) {
                                         const speakerRef = doc(db, 'characters', dialogue.speakerId);
                                         dialogue.speaker = await getDocWithDates<Character>(speakerRef);
                                     }
                                 }
                             }
                             // Fetch character data for panels (if characterIds exist)
                             if (panel.characterIds && panel.characterIds.length > 0) {
                                 const charRefs = panel.characterIds.map(charId => doc(db, 'characters', charId));
                                 const charSnapshots = await Promise.all(charRefs.map(ref => getDoc(ref)));
                                 panel.characters = charSnapshots
                                     .filter(snap => snap.exists())
                                     .map(snap => ({ id: snap.id, ...convertTimestampsToDates(snap.data()) } as Character));
                             } else {
                                 panel.characters = [];
                             }
                         }
                    }
                }
            }
        }
    }


    return project;
}

/** Creates a new project in Firestore. */
export async function createProject(projectData: Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'chapters' | 'characters' | 'creator'>): Promise<MangaProject & { id: string }> {
  console.log('Creating project in Firestore:', projectData);
  const dataToSave = prepareDataForFirestore({
      ...projectData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
  });
  const docRef = await addDoc(projectsCol, dataToSave);
  return { ...projectData, id: docRef.id, createdAt: new Date(), updatedAt: new Date() }; // Return with generated ID and JS Dates
}


/** Updates an existing project in Firestore. */
export async function updateProject(id: string, projectData: DeepPartial<Omit<MangaProject, 'id' | 'createdAt' | 'updatedAt' | 'chapters' | 'characters' | 'creator'>>): Promise<void> {
    console.log(`Updating project ${id} in Firestore:`, projectData);
    const projectRef = doc(db, 'projects', id);
    const dataToUpdate = prepareDataForFirestore({
      ...projectData,
      updatedAt: Timestamp.now(), // Always update the timestamp
    });
    await updateDoc(projectRef, dataToUpdate);
}

/** Deletes a project and its subcollections by ID. */
export async function deleteProject(id: string): Promise<void> {
    console.log(`Deleting project ${id} and subcollections from Firestore`);
    const projectRef = doc(db, 'projects', id);
    const batch = writeBatch(db);

     // --- Delete nested data ---
     // This requires fetching all IDs first. Be mindful of large projects.

     // Delete Chapters and their children
     const chaptersQuery = query(chaptersCol, where('mangaProjectId', '==', id));
     const chaptersSnapshot = await getDocs(chaptersQuery);
     for (const chapterDoc of chaptersSnapshot.docs) {
         await deleteChapter(chapterDoc.id, batch); // Use batch deletion for chapters and their children
     }

      // Delete Characters associated with the project
     const charactersQuery = query(charactersCol, where('mangaProjectId', '==', id));
     const charactersSnapshot = await getDocs(charactersQuery);
     charactersSnapshot.forEach(doc => batch.delete(doc.ref));


    // Delete the project itself
    batch.delete(projectRef);

    await batch.commit();
    console.log(`Project ${id} deleted successfully.`);
}

// --- Chapter Functions ---

/** Creates a new chapter in Firestore. */
export async function createChapter(chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>): Promise<Chapter & { id: string }> {
  console.log('Creating chapter in Firestore:', chapterData);
   const dataToSave = prepareDataForFirestore({
       ...chapterData,
       createdAt: Timestamp.now(),
       updatedAt: Timestamp.now(),
   });
  const docRef = await addDoc(chaptersCol, dataToSave);
  return { ...chapterData, id: docRef.id, createdAt: new Date(), updatedAt: new Date() };
}

/** Updates an existing chapter in Firestore. */
export async function updateChapter(id: string, chapterData: DeepPartial<Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>>): Promise<void> {
    console.log(`Updating chapter ${id} in Firestore:`, chapterData);
    const chapterRef = doc(db, 'chapters', id);
    const dataToUpdate = prepareDataForFirestore({
      ...chapterData,
      updatedAt: Timestamp.now(),
    });
    await updateDoc(chapterRef, dataToUpdate);
}


/** Deletes a chapter and its subcollections (scenes, panels, dialogues) by ID. */
export async function deleteChapter(id: string, existingBatch?: any): Promise<void> {
    console.log(`Deleting chapter ${id} and subcollections from Firestore`);
    const chapterRef = doc(db, 'chapters', id);
    const batch = existingBatch || writeBatch(db);

    // Delete Scenes and their children
    const scenesQuery = query(scenesCol, where('chapterId', '==', id));
    const scenesSnapshot = await getDocs(scenesQuery);
    for (const sceneDoc of scenesSnapshot.docs) {
        await deleteScene(sceneDoc.id, batch); // Recursive delete with batch
    }

    // Delete the chapter itself
    batch.delete(chapterRef);

    // Commit only if not part of a larger batch
    if (!existingBatch) {
        await batch.commit();
        console.log(`Chapter ${id} deleted successfully.`);
    }
}


// --- Scene Functions ---

/** Creates a new scene in Firestore. */
export async function createScene(sceneData: Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'panels'>): Promise<Scene & { id: string }> {
    console.log('Creating scene in Firestore:', sceneData);
     const dataToSave = prepareDataForFirestore({
        ...sceneData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    const docRef = await addDoc(scenesCol, dataToSave);
    return { ...sceneData, id: docRef.id, createdAt: new Date(), updatedAt: new Date() };
}

/** Updates an existing scene in Firestore. */
export async function updateScene(id: string, sceneData: DeepPartial<Omit<Scene, 'id' | 'createdAt' | 'updatedAt' | 'panels'>>): Promise<void> {
    console.log(`Updating scene ${id} in Firestore:`, sceneData);
    const sceneRef = doc(db, 'scenes', id);
    const dataToUpdate = prepareDataForFirestore({
      ...sceneData,
      updatedAt: Timestamp.now(),
    });
    await updateDoc(sceneRef, dataToUpdate);
}

/** Deletes a scene and its subcollections (panels, dialogues) by ID. */
export async function deleteScene(id: string, existingBatch?: any): Promise<void> {
    console.log(`Deleting scene ${id} and subcollections from Firestore`);
    const sceneRef = doc(db, 'scenes', id);
    const batch = existingBatch || writeBatch(db);

     // Delete Panels and their children
    const panelsQuery = query(panelsCol, where('sceneId', '==', id));
    const panelsSnapshot = await getDocs(panelsQuery);
    for (const panelDoc of panelsSnapshot.docs) {
        await deletePanel(panelDoc.id, batch); // Recursive delete with batch
    }

    // Delete the scene itself
    batch.delete(sceneRef);

    if (!existingBatch) {
        await batch.commit();
         console.log(`Scene ${id} deleted successfully.`);
    }
}


// --- Panel Functions ---

/** Creates a new panel in Firestore. */
export async function createPanel(panelData: Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'dialogues' | 'characters'>): Promise<Panel & { id: string }> {
    console.log('Creating panel in Firestore:', panelData);
    const dataToSave = prepareDataForFirestore({
        ...panelData,
        // Ensure characterIds is an array if provided, otherwise default to empty
        characterIds: Array.isArray(panelData.characterIds) ? panelData.characterIds : [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    const docRef = await addDoc(panelsCol, dataToSave);
    // Return data includes empty arrays for relations initially
    return { ...panelData, id: docRef.id, characterIds: dataToSave.characterIds, dialogues: [], characters: [], createdAt: new Date(), updatedAt: new Date() };
}

/** Updates an existing panel in Firestore. */
export async function updatePanel(id: string, panelData: DeepPartial<Omit<Panel, 'id' | 'createdAt' | 'updatedAt' | 'dialogues' | 'characters'>>): Promise<void> {
    console.log(`Updating panel ${id} in Firestore:`, panelData);
    const panelRef = doc(db, 'panels', id);
    const dataToUpdate = prepareDataForFirestore({
        ...panelData,
         // Ensure characterIds is handled correctly during updates
        ...(panelData.characterIds && { characterIds: Array.isArray(panelData.characterIds) ? panelData.characterIds : [] }),
        updatedAt: Timestamp.now(),
    });
    await updateDoc(panelRef, dataToUpdate);
}

/** Deletes a panel and its subcollections (dialogues) by ID. */
export async function deletePanel(id: string, existingBatch?: any): Promise<void> {
    console.log(`Deleting panel ${id} and subcollections from Firestore`);
    const panelRef = doc(db, 'panels', id);
    const batch = existingBatch || writeBatch(db);

     // Delete Dialogues
    const dialoguesQuery = query(dialoguesCol, where('panelId', '==', id));
    const dialoguesSnapshot = await getDocs(dialoguesQuery);
    dialoguesSnapshot.forEach(doc => batch.delete(doc.ref));

    // Delete the panel itself
    batch.delete(panelRef);

     if (!existingBatch) {
        await batch.commit();
        console.log(`Panel ${id} deleted successfully.`);
    }
}


// --- PanelDialogue Functions ---

/** Creates a new panel dialogue in Firestore. */
export async function createPanelDialogue(dialogueData: Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'speaker'>): Promise<PanelDialogue & { id: string }> {
    console.log('Creating panel dialogue in Firestore:', dialogueData);
     const dataToSave = prepareDataForFirestore({
        ...dialogueData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    const docRef = await addDoc(dialoguesCol, dataToSave);
     // Fetch speaker data if speakerId exists
    let speakerData = null;
    if (dialogueData.speakerId) {
        const speakerRef = doc(db, 'characters', dialogueData.speakerId);
        speakerData = await getDocWithDates<Character>(speakerRef);
    }
    return { ...dialogueData, id: docRef.id, speaker: speakerData, createdAt: new Date(), updatedAt: new Date() };
}

/** Updates an existing panel dialogue in Firestore. */
export async function updatePanelDialogue(id: string, dialogueData: DeepPartial<Omit<PanelDialogue, 'id' | 'createdAt' | 'updatedAt' | 'speaker'>>): Promise<void> {
    console.log(`Updating panel dialogue ${id} in Firestore:`, dialogueData);
    const dialogueRef = doc(db, 'dialogues', id);
     const dataToUpdate = prepareDataForFirestore({
      ...dialogueData,
      updatedAt: Timestamp.now(),
    });
    await updateDoc(dialogueRef, dataToUpdate);
}

/** Deletes a dialogue by ID. */
export async function deletePanelDialogue(id: string): Promise<void> {
    console.log(`Deleting dialogue ${id} from Firestore`);
    const dialogueRef = doc(db, 'dialogues', id);
    await deleteDoc(dialogueRef);
     console.log(`Dialogue ${id} deleted successfully.`);
}


// --- Character Functions ---

/** Gets all characters (optionally filtered by project). */
export async function getAllCharacters(projectId?: string): Promise<Character[]> {
    console.log(`Fetching all characters${projectId ? ` for project ${projectId}` : ''} from Firestore`);
    const q = projectId
      ? query(charactersCol, where('mangaProjectId', '==', projectId))
      : charactersCol;
    return getDocsWithDates<Character>(q);
}

/** Gets a single character by ID. */
export async function getCharacter(id: string): Promise<Character | null> {
    console.log(`Fetching character ${id} from Firestore`);
    const charRef = doc(db, 'characters', id);
    return getDocWithDates<Character>(charRef);
}

/** Creates a new character in Firestore. */
export async function createCharacter(characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character & { id: string }> {
    console.log('Creating character in Firestore:', characterData);
     const dataToSave = prepareDataForFirestore({
        ...characterData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    const docRef = await addDoc(charactersCol, dataToSave);
    return { ...characterData, id: docRef.id, createdAt: new Date(), updatedAt: new Date() };
}


/** Updates an existing character in Firestore. */
export async function updateCharacter(id: string, characterData: DeepPartial<Omit<Character, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    console.log(`Updating character ${id} in Firestore:`, characterData);
    const charRef = doc(db, 'characters', id);
    const dataToUpdate = prepareDataForFirestore({
      ...characterData,
      updatedAt: Timestamp.now(),
    });
    await updateDoc(charRef, dataToUpdate);
}

/** Deletes a character by ID. Also removes references from Panels. */
export async function deleteCharacter(id: string): Promise<void> {
    console.log(`Deleting character ${id} from Firestore and removing panel references`);
    const charRef = doc(db, 'characters', id);
    const batch = writeBatch(db);

    // Find panels referencing this character
    const panelsQuery = query(panelsCol, where('characterIds', 'array-contains', id));
    const panelsSnapshot = await getDocs(panelsQuery);

    // Remove the characterId from each panel's array
    panelsSnapshot.forEach(panelDoc => {
        const panelData = panelDoc.data() as Panel;
        const updatedCharacterIds = (panelData.characterIds || []).filter(charId => charId !== id);
        batch.update(panelDoc.ref, { characterIds: updatedCharacterIds });
    });

     // Find dialogues referencing this character as speaker
    const dialoguesQuery = query(dialoguesCol, where('speakerId', '==', id));
    const dialoguesSnapshot = await getDocs(dialoguesQuery);
    dialoguesSnapshot.forEach(dialogueDoc => {
        batch.update(dialogueDoc.ref, { speakerId: null }); // Set speakerId to null
    });

    // Delete the character itself
    batch.delete(charRef);

    await batch.commit();
    console.log(`Character ${id} deleted and references removed successfully.`);
}


// --- Utility Function for Panel-Character Assignment ---

/** Assigns a character to a panel in Firestore (updates array). */
export async function assignCharacterToPanel(panelId: string, characterId: string): Promise<void> {
    console.log(`Assigning character ${characterId} to panel ${panelId}`);
    const panelRef = doc(db, 'panels', panelId);
    const panel = await getDocWithDates<Panel>(panelRef); // Fetch current panel

    if (!panel) {
        throw new Error(`Panel with ID ${panelId} not found.`);
    }

    const existingCharacterIds = panel.characterIds || [];
    // Add the new character ID if it's not already there
    const updatedCharacterIds = Array.from(new Set([...existingCharacterIds, characterId]));

    await updateDoc(panelRef, { characterIds: updatedCharacterIds, updatedAt: Timestamp.now() });
     console.log(`Character ${characterId} assigned to panel ${panelId}.`);
}

/** Removes a character from a panel in Firestore (updates array). */
export async function removeCharacterFromPanel(panelId: string, characterId: string): Promise<void> {
    console.log(`Removing character ${characterId} from panel ${panelId}`);
     const panelRef = doc(db, 'panels', panelId);
     const panel = await getDocWithDates<Panel>(panelRef); // Fetch current panel

     if (!panel) {
         throw new Error(`Panel with ID ${panelId} not found.`);
     }

    const updatedCharacterIds = (panel.characterIds || []).filter(id => id !== characterId);

    await updateDoc(panelRef, { characterIds: updatedCharacterIds, updatedAt: Timestamp.now() });
    console.log(`Character ${characterId} removed from panel ${panelId}.`);

}
