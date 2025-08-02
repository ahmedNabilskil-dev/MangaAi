import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import { config } from "./config/config";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { logger } from "./utils/logger";

// Route imports
import aiRoutes from "./routes/ai.routes";
import authRoutes from "./routes/auth.routes";
import creditRoutes from "./routes/credit.routes";
import healthRoutes from "./routes/health.routes";
import mcpRoutes from "./routes/mcp.routes";
import stripeRoutes from "./routes/stripe.routes";

// Initialize environment variables
dotenv.config();

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(
      cors({
        origin: config.corsOrigins,
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMaxRequests,
      message: "Too many requests from this IP, please try again later.",
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Logging
    this.app.use(
      morgan("combined", {
        stream: { write: (message) => logger.info(message.trim()) },
      })
    );
  }

  private initializeRoutes(): void {
    // Health check route (no auth required)
    this.app.use("/api/health", healthRoutes);

    // Authentication routes (no auth required)
    this.app.use("/api/auth", authRoutes);

    // Stripe webhook routes (no auth required, but verified via Stripe)
    this.app.use("/api/webhooks", stripeRoutes);

    // Protected routes
    this.app.use("/api/credits", authMiddleware, creditRoutes);
    this.app.use("/api/ai", authMiddleware, aiRoutes);
    this.app.use("/api/mcp", authMiddleware, mcpRoutes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(config.port, () => {
      logger.info(
        `🚀 MangaAI Backend Server is running on port ${config.port}`
      );
      logger.info(`📚 Environment: ${config.nodeEnv}`);
      logger.info(
        `🔗 Health check: http://localhost:${config.port}/api/health`
      );
    });
  }
}

export default App;
