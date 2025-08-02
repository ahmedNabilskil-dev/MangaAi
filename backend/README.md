# MangaAI Backend

A comprehensive backend service for the MangaAI application built with Node.js, Express, and TypeScript.

## Features

- **RESTful API**: Clean, well-structured REST endpoints
- **Authentication**: JWT-based authentication with Supabase integration
- **Credit System**: Token-based credit management for AI operations
- **AI Services**: Integrated AI text and image generation
- **MCP Server**: Model Context Protocol server for tool execution
- **Database**: Supabase integration with Postgres
- **Payment**: Stripe integration for credit purchases
- **Logging**: Comprehensive logging with Winston
- **Security**: Helmet, CORS, rate limiting, and validation
- **Type Safety**: Full TypeScript implementation

## Architecture

```
backend/
├── src/
│   ├── ai/                 # AI adapters and types
│   │   ├── adapters/       # AI provider adapters (Gemini, etc.)
│   │   └── types.ts        # AI-related type definitions
│   ├── config/             # Configuration management
│   ├── controllers/        # Request handlers (future expansion)
│   ├── mcp/                # Model Context Protocol server
│   │   ├── prompts/        # MCP prompt templates
│   │   ├── base-server.ts  # Base MCP server class
│   │   ├── http-server.ts  # HTTP MCP server
│   │   ├── server.ts       # Stdio MCP server
│   │   └── tool-registry.ts # Tool registration and execution
│   ├── middleware/         # Express middleware
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic services
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
├── logs/                   # Application logs
├── package.json
├── tsconfig.json
└── README.md
```

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Google AI API key
- Stripe account (for payments)

### Installation

1. **Clone and navigate to backend directory:**

```bash
cd backend
npm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_AI_API_KEY`
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
- Other configuration as needed

3. **Start development server:**

```bash
npm run dev
```

4. **Start MCP server (in another terminal):**

```bash
npm run mcp:http
```

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Health Check

- `GET /api/health` - Server health status
- `GET /api/health/status` - Detailed server status

### Authentication

- `POST /api/auth/login` - User login (integrate with frontend)
- `POST /api/auth/logout` - User logout

### Credits

- `GET /api/credits` - Get user credit balance and history
- `POST /api/credits/deduct` - Deduct credits for operations
- `POST /api/credits/estimate` - Estimate credits for operations
- `GET /api/credits/history` - Get credit transaction history

### AI Services

- `POST /api/ai/text` - Generate text using AI
- `POST /api/ai/image` - Generate images using AI
- `POST /api/ai/estimate` - Estimate credits for AI operations

### MCP (Model Context Protocol)

- `GET /api/mcp/tools` - List available MCP tools
- `POST /api/mcp/tools/:toolName` - Execute MCP tool
- `GET /api/mcp/prompts` - List available MCP prompts
- `POST /api/mcp/prompts/:promptName` - Get MCP prompt
- `GET /api/mcp/status` - MCP server connection status

### Webhooks

- `POST /api/webhooks/stripe` - Stripe webhook handler

## Services

### AI Service

Handles AI operations including text and image generation with credit management.

```typescript
import { aiService } from "./services/ai";

const result = await aiService.generateText(userId, messages, params);
```

### Credit Manager

Manages credit calculations and deductions.

```typescript
import { getCreditCost } from "./services/credit-manager";

const credits = getCreditCost("textGeneration", { tokens: 1000 });
```

### Database Service

Handles all database operations with Supabase.

```typescript
import { databaseService } from "./services/database";

const user = await databaseService.getUser(userId);
```

### MCP Client

Communicates with MCP servers for tool execution.

```typescript
import { mcpClient } from "./services/mcp-client";

const tools = await mcpClient.getTools();
const result = await mcpClient.callTool("story-generation", args);
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run test` - Run tests
- `npm run mcp:stdio` - Start MCP server in stdio mode
- `npm run mcp:http` - Start MCP server in HTTP mode

### Adding New Routes

1. Create route file in `src/routes/`
2. Add route to `src/app.ts`
3. Add authentication middleware if needed

### Adding New Services

1. Create service file in `src/services/`
2. Export service instance
3. Use in routes or other services

### Adding New MCP Tools

1. Register tool in `src/mcp/tool-registry.ts`
2. Implement tool handler
3. Test with MCP client

## Configuration

All configuration is managed through environment variables. See `.env.example` for all available options.

Key configurations:

- **PORT**: Server port (default: 3001)
- **NODE_ENV**: Environment (development/production)
- **DATABASE_URL**: Database connection
- **SUPABASE\_\***: Supabase configuration
- **GOOGLE_AI_API_KEY**: Google AI API key
- **STRIPE\_\***: Stripe configuration
- **JWT_SECRET**: JWT signing secret

## Security

- Helmet for security headers
- CORS configuration
- Rate limiting
- JWT authentication
- Input validation
- Environment variable validation

## Logging

Winston logger with different levels:

- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console output in development

## Testing

```bash
npm run test
npm run test:watch
```

## Deployment

### Docker (Future)

```bash
docker build -t mangaai-backend .
docker run -p 3001:3001 mangaai-backend
```

### PM2 (Recommended)

```bash
pm2 start dist/server.js --name mangaai-backend
```

## Contributing

1. Follow TypeScript best practices
2. Use proper error handling
3. Add logging for important operations
4. Write tests for new features
5. Update documentation

## License

MIT License
