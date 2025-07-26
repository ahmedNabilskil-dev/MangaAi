import cors from "cors";
import express from "express";
import { initializeDataService } from "../services/data-service.js";
import { BaseMangaAiMcpServer } from "./base-server.js";

export class MangaAiHttpMcpServer extends BaseMangaAiMcpServer {
  private app: express.Application;
  private port: number;

  constructor(port: number = 3001) {
    super();
    this.port = port;
    this.app = express();
    this.setupExpressMiddleware();
    this.setupExpressRoutes();
  }

  private async initializeServices() {
    // Initialize the data service first
    await initializeDataService();
  }

  private setupExpressMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  }

  private setupExpressRoutes() {
    // Health check endpoint
    this.app.get("/health", (req: express.Request, res: express.Response) => {
      res.json({ status: "ok", server: "manga-ai-mcp-http-server" });
    });

    // MCP endpoints
    this.app.post(
      "/mcp/tools/list",
      async (req: express.Request, res: express.Response) => {
        try {
          const response = await this.server.request(
            { method: "tools/list" },
            null as any
          );
          res.json(response);
        } catch (error) {
          res.status(500).json({
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    );

    this.app.post(
      "/mcp/tools/call",
      async (req: express.Request, res: express.Response) => {
        try {
          const { name, arguments: args } = req.body;
          const response = await this.server.request(
            { method: "tools/call", params: { name, arguments: args || {} } },
            null as any
          );
          res.json(response);
        } catch (error) {
          res.status(500).json({
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    );

    this.app.post(
      "/mcp/resources/list",
      async (req: express.Request, res: express.Response) => {
        try {
          const response = await this.server.request(
            { method: "resources/list" },
            null as any
          );
          res.json(response);
        } catch (error) {
          res.status(500).json({
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    );

    this.app.post(
      "/mcp/resources/read",
      async (req: express.Request, res: express.Response) => {
        try {
          const { uri } = req.body;
          const response = await this.server.request(
            { method: "resources/read", params: { uri } },
            null as any
          );
          res.json(response);
        } catch (error) {
          res.status(500).json({
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    );

    this.app.post(
      "/mcp/prompts/list",
      async (req: express.Request, res: express.Response) => {
        try {
          const response = await this.server.request(
            { method: "prompts/list" },
            null as any
          );
          res.json(response);
        } catch (error) {
          res.status(500).json({
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    );

    this.app.post(
      "/mcp/prompts/get",
      async (req: express.Request, res: express.Response) => {
        try {
          const { name, arguments: args } = req.body;
          const response = await this.server.request(
            { method: "prompts/get", params: { name, arguments: args || {} } },
            null as any
          );
          res.json(response);
        } catch (error) {
          res.status(500).json({
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    );

    // Error handler
    this.app.use(
      (
        error: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        console.error("Express error:", error);
        res.status(500).json({
          error: "Internal server error",
          message: error.message,
        });
      }
    );
  }

  async run() {
    // Initialize services first
    await this.initializeServices();

    // Start the HTTP server
    this.app.listen(this.port, () => {
      console.error(`Manga AI MCP HTTP Server running on port ${this.port}`);
      console.error(`Health check: http://localhost:${this.port}/health`);
      console.error(
        `MCP endpoints available at: http://localhost:${this.port}/mcp/*`
      );
    });

    // Keep the process alive
    return new Promise<void>(() => {
      // This promise never resolves, keeping the server running
    });
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
  const server = new MangaAiHttpMcpServer(port);
  server.run().catch(console.error);
}
