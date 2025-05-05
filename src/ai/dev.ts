// Import ALL tool files to register them with Genkit (agents might still use them)
import '@/ai/tools/creation-tools';
import '@/ai/tools/fetch-tools';
import '@/ai/tools/update-tools';
import '@/ai/tools/delete-tools';
// TODO: Add import '@/ai/tools/image-tools'; when created

// Import agent flow files
import '@/ai/flows/worldbuilder-flow';
import '@/ai/flows/plot-weaver-flow';
import '@/ai/flows/character-architect-flow';
import '@/ai/flows/panel-dialogue-flow';

// Import utility flow files (can be called by orchestrator or agents)
import '@/ai/flows/summarize-content.ts';
import '@/ai/flows/brainstorm-character-ideas.ts';

// Import the main orchestration flow LAST (or ensure it imports the agents)
import '@/ai/flows/orchestration-flow.ts';

// Remove imports for deleted/refactored flows
// import '@/ai/flows/create-chapter-from-prompt.ts'; // Logic moved or handled by agents
// import '@/ai/flows/update-entity-flow.ts'; // Logic moved or handled by agents