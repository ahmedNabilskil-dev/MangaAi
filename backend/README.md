# MangaAI Backend

A NestJS-based backend API for the MangaAI application that provides AI-powered manga creation capabilities.

## Features

- **AI Integration**: Chat and image generation using multiple AI providers (Gemini, OpenAI)
- **Manga Management**: Complete CRUD operations for manga projects, characters, chapters, and scenes
- **User Authentication**: User profile management and authentication
- **Credit System**: Credit-based usage tracking and billing
- **Payment Processing**: Stripe integration for payment handling
- **Database**: Supabase integration for data persistence
- **API Documentation**: Swagger/OpenAPI documentation
- **Rate Limiting**: Built-in rate limiting and security

## Tech Stack

- **Framework**: NestJS
- **Database**: Supabase (PostgreSQL)
- **AI Providers**: Google Gemini, OpenAI
- **Payments**: Stripe
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project
- AI provider API keys (Gemini, OpenAI)
- Stripe account (for payments)

### Installation

1. Clone the repository and navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your actual configuration values:
   - Supabase URL and keys
   - AI provider API keys
   - Stripe configuration
   - Other required settings

4. Start the development server:
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3001`

### API Documentation

Once the server is running, you can access the Swagger documentation at:

```
http://localhost:3001/api-docs
```

## API Endpoints

### Health

- `GET /health` - Health check endpoint

### AI

- `POST /ai/chat` - Send chat messages to AI
- `POST /ai/generate-image` - Generate images using AI
- `GET /ai/status` - Get AI service status

### Authentication

- `POST /auth/create-user-profile` - Create user profile
- `GET /auth/user-profile/:userId` - Get user profile
- `POST /auth/update-user-profile/:userId` - Update user profile

### Manga Management

- `POST /manga/projects` - Create manga project
- `GET /manga/projects` - Get manga projects (with pagination)
- `GET /manga/projects/:id` - Get specific manga project
- `PUT /manga/projects/:id` - Update manga project
- `DELETE /manga/projects/:id` - Delete manga project
- `POST /manga/projects/:projectId/characters` - Create character
- `GET /manga/projects/:projectId/characters` - Get project characters
- `POST /manga/projects/:projectId/chapters` - Create chapter
- `GET /manga/projects/:projectId/chapters` - Get project chapters

### Credits

- `GET /credits/:userId` - Get user credits
- `POST /credits/deduct` - Deduct credits from user
- `POST /credits/calculate/text` - Calculate text generation cost
- `POST /credits/calculate/image` - Calculate image generation cost

### Payments

- `POST /payments/create-checkout-session` - Create Stripe checkout session
- `POST /payments/verify-payment` - Verify payment completion
- `POST /payments/webhooks` - Handle Stripe webhooks

## Project Structure

```
src/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── common/
│   └── types/                 # Shared type definitions
│       ├── ai.ts              # AI-related types
│       ├── entities.ts        # Database entity types
│       ├── enums.ts           # Enums and constants
│       └── utils.ts           # Utility types
└── modules/
    ├── ai/                    # AI service module
    │   ├── adapters/          # AI provider adapters
    │   ├── dto/               # Data transfer objects
    │   ├── ai.controller.ts   # AI endpoints
    │   ├── ai.module.ts       # AI module definition
    │   └── ai.service.ts      # AI business logic
    ├── auth/                  # Authentication module
    ├── credits/               # Credit management module
    ├── database/              # Database integration module
    ├── health/                # Health check module
    ├── manga/                 # Manga management module
    └── payments/              # Payment processing module
```

## Environment Variables

| Variable                    | Description                          | Required |
| --------------------------- | ------------------------------------ | -------- |
| `NODE_ENV`                  | Environment (development/production) | Yes      |
| `PORT`                      | Server port                          | Yes      |
| `FRONTEND_URL`              | Frontend URL for CORS                | Yes      |
| `SUPABASE_URL`              | Supabase project URL                 | Yes      |
| `SUPABASE_ANON_KEY`         | Supabase anonymous key               | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key            | Yes      |
| `GEMINI_API_KEY`            | Google Gemini API key                | Optional |
| `OPENAI_API_KEY`            | OpenAI API key                       | Optional |
| `STRIPE_SECRET_KEY`         | Stripe secret key                    | Optional |
| `STRIPE_WEBHOOK_SECRET`     | Stripe webhook secret                | Optional |

## Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode (with watch)
- `npm run start:debug` - Start in debug mode
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Development

### Adding New Modules

1. Generate a new module:

   ```bash
   nest generate module modules/your-module
   ```

2. Generate controller and service:

   ```bash
   nest generate controller modules/your-module
   nest generate service modules/your-module
   ```

3. Import the module in `app.module.ts`

### Database Operations

The application uses Supabase as the database. Database operations are handled through the `SupabaseService` in the database module.

### Adding AI Providers

To add a new AI provider:

1. Create an adapter in `src/modules/ai/adapters/`
2. Implement the `ChatAdapter` interface
3. Register the adapter in the `ChatAdapterFactory`

## Deployment

### Production Build

```bash
npm run build
npm run start:prod
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.
