# **App Name**: MangaVerse AI

## Core Features:

- Full-Page Visual Editor: A visual editor using React Flow that occupies the entire page, with a chatbox docked at the bottom center. Nodes are drag-and-droppable with auto-connect functionality.
- Gemini-Powered Chat Assistant: A chatbox powered by Gemini AI that allows users to request content creation and project modification using high-level tools. Gemini acts as a tool orchestrator, delegating tasks to functions such as `createChapter`, `createScene`, and `createCharacter`.
- Dynamic Properties Panel: A dynamic properties panel on the right sidebar that displays editable fields for each node type. This panel uses custom components and React Hook Form to allow for the creation of any field type. Uses custom components and promotes component reuse for consistency.

## Style Guidelines:

- Use a vibrant color palette inspired by manga and anime art. Soft pastels contrasted with bold, saturated colors for a visually engaging experience.
- The React Flow canvas will take up the entire screen, creating an immersive experience. The chatbox will be docked at the bottom center in a compact and easily accessible manner. The properties panel will be a sidebar on the right.
- Use custom icons for each node type in React Flow, and these icons should be consistent with the manga/anime theme.
- Subtle animations for node connections, property panel transitions, and chatbox interactions to improve user engagement.
- Accent: Use a bright magenta (#FF00FF) for interactive elements and highlights to draw attention.