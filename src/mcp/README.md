# MangaAI MCP Server

This is a Model Context Protocol (MCP) server for the MangaAI project. It provides tools, resources, and prompts for creating and managing manga projects, characters, chapters, scenes, and panels.

## Features

### Tools

The server provides the following categories of tools:

#### Creation Tools

- `createProject` - Create a new manga project
- `createChapter` - Create a new chapter within a project
- `createScene` - Create a new scene within a chapter
- `createPanel` - Create a new panel within a scene
- `createCharacter` - Create a new character profile

#### Update Tools

- `updateProject` - Update project details
- `updateChapter` - Update chapter information
- `updateScene` - Update scene details
- `updatePanel` - Update panel content
- `updateCharacter` - Update character profile

#### Delete Tools

- `deleteProject` - Delete a project and all associated data
- `deleteChapter` - Delete a chapter and its scenes/panels
- `deleteScene` - Delete a scene and its panels
- `deletePanel` - Delete a panel and its dialogues
- `deleteCharacter` - Delete a character

#### Fetch Tools

- `getProject` - Retrieve project details
- `getChapter` - Retrieve chapter details
- `getScene` - Retrieve scene details
- `getPanel` - Retrieve panel details
- `getCharacter` - Retrieve character details
- `listProjects` - List all projects
- `listChaptersForProject` - List chapters for a project
- `listScenesForChapter` - List scenes for a chapter
- `listPanelsForScene` - List panels for a scene
- `listCharactersForProject` - List characters for a project

### Resources

The server provides access to manga data through URI-based resources:

- `manga://project/{id}` - Get project details
- `manga://chapter/{id}` - Get chapter details
- `manga://scene/{id}` - Get scene details
- `manga://panel/{id}` - Get panel details
- `manga://character/{id}` - Get character details
- `manga://project-structure/{id}` - Get complete project structure
- `manga://projects` - List all projects

### Prompts

Pre-built prompt templates for manga creation:

- `create-character` - Generate detailed character profiles
- `plan-chapter` - Create chapter outlines and scene breakdowns
- `develop-scene` - Create detailed scene content with panel breakdowns
- `create-panel` - Generate panel content and visual descriptions
- `build-world` - Develop world-building elements and settings

## Installation

1. Install dependencies:

```bash
npm install
```

2. Ensure the MCP TypeScript SDK is installed:

```bash
npm install @modelcontextprotocol/sdk
```

## Usage

### Running the Server

#### Standard MCP (stdio) Mode

```bash
npm run mcp:dev
```

#### HTTP Mode

```bash
npm run mcp:http
```

#### HTTP Mode with Auto-reload

```bash
npm run mcp:http:watch
```

#### Specify Custom Port for HTTP Mode

```bash
npm run mcp:http -- --port=3002
```

### HTTP Endpoints

When running in HTTP mode, the server provides:

- `GET /health` - Health check endpoint
- `POST /mcp` - Main MCP communication endpoint

Example HTTP request to list tools:

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/list",
    "params": {}
  }'
```

Example HTTP request to call a tool:

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "method": "tools/call",
    "params": {
      "name": "listProjects",
      "arguments": {
        "limit": 10
      }
    }
  }'
```

## Schema Conversion

The server uses Zod schemas from the main application and automatically converts them to JSON Schema format for MCP compatibility. This ensures type safety and consistency between the main application and the MCP server.

## File Structure

```
src/mcp/
├── base-server.ts           # Abstract base class with shared MCP functionality
├── server.ts                # Stdio MCP server implementation
├── http-server.ts           # HTTP MCP server implementation
├── server.ts               # Standard MCP server (stdio)
├── http-server.ts          # HTTP MCP server
├── utils/
│   └── schema-converter.ts # Zod to JSON Schema conversion
├── tools/
│   ├── creation-tools.ts   # Tools for creating manga content
│   ├── update-tools.ts     # Tools for updating content
│   ├── delete-tools.ts     # Tools for deleting content
│   └── fetch-tools.ts      # Tools for retrieving content
├── resources/
│   └── manga-resources.ts  # Resource handlers for manga data
└── prompts/
    └── manga-prompts.ts    # Prompt templates for manga creation
```

## Development

### Adding New Tools

1. Define the tool handler in the appropriate file under `tools/`
2. Add the tool definition to both `server.ts` and `http-server.ts`
3. Use the existing Zod schemas and convert them with `zodSchemaToMcpSchema()`

### Adding New Resources

1. Create a resource handler in `resources/manga-resources.ts`
2. Define the URI pattern and handler logic
3. Update the server to register the new resource

### Adding New Prompts

1. Add the prompt template to `prompts/manga-prompts.ts`
2. Define the prompt arguments and template content
3. Use Handlebars-style templating for dynamic content

## Error Handling

All tools return structured responses with error information when operations fail. The server includes comprehensive error handling and logging for debugging.

## TypeScript Support

The entire MCP server is written in TypeScript with full type safety. It leverages the existing type definitions from the main MangaAI application to ensure consistency.

## Contributing

When contributing to the MCP server:

1. Maintain type safety throughout
2. Use existing Zod schemas where possible
3. Follow the established error handling patterns
4. Add comprehensive documentation for new features
5. Test both stdio and HTTP modes
