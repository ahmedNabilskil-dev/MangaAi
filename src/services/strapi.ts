/**
 * Represents a project in the Strapi CMS.
 */
export interface StrapiProject {
  id: number;
  title: string;
  // Add other relevant fields as needed
}

/**
 * Represents a chapter in the Strapi CMS.
 */
export interface StrapiChapter {
  id: number;
  title: string;
  projectId: number; // Reference to the project it belongs to
  // Add other relevant fields as needed
}

/**
 * Represents a scene in the Strapi CMS.
 */
export interface StrapiScene {
  id: number;
  title: string;
  chapterId: number; // Reference to the chapter it belongs to
  // Add other relevant fields as needed
}

/**
 * Represents an image in the Strapi CMS.
 */
export interface StrapiImage {
  id: number;
  url: string;
  sceneId: number; // Reference to the scene it belongs to
  // Add other relevant fields as needed
}

/**
 * Creates a new project in Strapi.
 * @param project The project data to create.
 * @returns A promise that resolves to the created StrapiProject.
 */
export async function createProject(project: Omit<StrapiProject, 'id'>): Promise<StrapiProject> {
  // TODO: Implement the API call to Strapi to create a project.
  // Replace the dummy data with actual API call.
  console.log('Creating project in Strapi:', project);
  return { id: 1, title: project.title };
}

/**
 * Creates a new chapter in Strapi.
 * @param chapter The chapter data to create.
 * @returns A promise that resolves to the created StrapiChapter.
 */
export async function createChapter(chapter: Omit<StrapiChapter, 'id'>): Promise<StrapiChapter> {
  // TODO: Implement the API call to Strapi to create a chapter.
  // Replace the dummy data with actual API call.
  console.log('Creating chapter in Strapi:', chapter);
  return { id: 1, title: chapter.title, projectId: chapter.projectId };
}

/**
 * Creates a new scene in Strapi.
 * @param scene The scene data to create.
 * @returns A promise that resolves to the created StrapiScene.
 */
export async function createScene(scene: Omit<StrapiScene, 'id'>): Promise<StrapiScene> {
  // TODO: Implement the API call to Strapi to create a scene.
  // Replace the dummy data with actual API call.
  console.log('Creating scene in Strapi:', scene);
  return { id: 1, title: scene.title, chapterId: scene.chapterId };
}

/**
 * Creates a new image in Strapi.
 * @param image The image data to create.
 * @returns A promise that resolves to the created StrapiImage.
 */
export async function createImage(image: Omit<StrapiImage, 'id'>): Promise<StrapiImage> {
  // TODO: Implement the API call to Strapi to create an image.
  // Replace the dummy data with actual API call.
  console.log('Creating image in Strapi:', image);
  return { id: 1, url: image.url, sceneId: image.sceneId };
}
