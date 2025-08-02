import dotenv from "dotenv";

dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;

  // Database
  databaseUrl: string;

  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;

  // AI
  googleAiApiKey: string;

  // Stripe
  stripeSecretKey: string;
  stripeWebhookSecret: string;

  // JWT
  jwtSecret: string;
  jwtExpiresIn: string;

  // CORS
  corsOrigins: string[];

  // MCP
  mcpServerPort: number;
  mcpClientUrl: string;

  // Logging
  logLevel: string;

  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3001", 10),

  // Database
  databaseUrl: process.env.DATABASE_URL || "./database/mangaai.db",

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  // AI
  googleAiApiKey: process.env.GOOGLE_AI_API_KEY || "",

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",

  // JWT
  jwtSecret: process.env.JWT_SECRET || "fallback-secret-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",

  // CORS
  corsOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost:9002",
  ],

  // MCP
  mcpServerPort: parseInt(process.env.MCP_SERVER_PORT || "3010", 10),
  mcpClientUrl: process.env.MCP_CLIENT_URL || "http://localhost:3010/mcp",

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
  rateLimitMaxRequests: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
    10
  ),
};

// Validate required environment variables
const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "GOOGLE_AI_API_KEY",
];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0 && config.nodeEnv === "production") {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

export { config };
