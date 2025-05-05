
// Import ALL tool files to register them with Genkit
import '@/ai/tools/creation-tools';
import '@/ai/tools/fetch-tools';
import '@/ai/tools/update-tools';
import '@/ai/tools/delete-tools';

// Import flow files
import '@/ai/flows/summarize-content.ts'; // Renamed from summarize-scene-panel
import '@/ai/flows/brainstorm-character-ideas.ts';
// import '@/ai/flows/create-chapter-from-prompt.ts'; // Creation handled by tools now
// import '@/ai/flows/update-entity-flow.ts'; // Update handled by tools now
import '@/ai/flows/orchestration-flow.ts'; // Import the main orchestration flow
