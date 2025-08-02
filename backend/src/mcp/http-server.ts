import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";
import { initializeDataService } from "../services/data-service.js";
import { BaseMangaAiMcpServer } from "./base-server.js";

export class MangaAiHttpMcpServer extends BaseMangaAiMcpServer {
  private app: express.Application;
  private port: number;
  private transports: { [sessionId: string]: StreamableHTTPServerTransport } =
    {};

  constructor(port: number = 3001) {
    super();
    this.port = port;
    this.app = express();
    this.setupExpressMiddleware();
    this.setupHttpTransport();
  }

  private async initializeServices() {
    // Initialize the data service first
    await initializeDataService();
  }

  private setupExpressMiddleware() {
    // Configure CORS to expose the custom session header
    this.app.use(
      cors({
        origin: "http://localhost:9002", // Adjust this to your client origin
        exposedHeaders: ["mcp-session-id"],
        credentials: true,
      })
    );
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  }

  private setupHttpTransport() {
    // Health check endpoint
    this.app.get("/health", (req: express.Request, res: express.Response) => {
      res.json({ status: "ok", server: "manga-ai-mcp-http-server" });
    });

    // Handle POST requests for client-to-server communication
    this.app.post("/mcp", async (req, res) => {
      // Check for existing session ID
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (sessionId && this.transports[sessionId]) {
        // Reuse existing transport
        transport = this.transports[sessionId];
        console.log(`🔄 Reusing session: ${sessionId}`);
      } else if (!sessionId && isInitializeRequest(req.body)) {
        // New initialization request
        const newSessionId = randomUUID();
        console.log(`🆕 Creating new session: ${newSessionId}`);

        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => newSessionId,
          onsessioninitialized: (sessionId) => {
            // Store the transport by session ID
            this.transports[sessionId] = transport;
            console.log(`✅ Session initialized: ${sessionId}`);
          },
          // DNS rebinding protection is disabled by default for backwards compatibility
          // enableDnsRebindingProtection: true,
          // allowedHosts: ['127.0.0.1'],
        });

        // Clean up transport when closed
        transport.onclose = () => {
          if (transport.sessionId) {
            console.log(`🧹 Cleaning up session: ${transport.sessionId}`);
            delete this.transports[transport.sessionId];
          }
        };

        // Connect to the MCP server
        await this.server.connect(transport);

        // Set the session ID in the response header
        res.setHeader("mcp-session-id", newSessionId);
      } else {
        // Invalid request
        console.log(
          `❌ Invalid request - sessionId: ${sessionId}, isInitialize: ${isInitializeRequest(
            req.body
          )}`
        );
        res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "Bad Request: No valid session ID provided",
          },
          id: null,
        });
        return;
      }

      // Handle the request
      await transport.handleRequest(req, res, req.body);
    });

    // Reusable handler for GET and DELETE requests
    const handleSessionRequest = async (
      req: express.Request,
      res: express.Response
    ) => {
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      if (!sessionId || !this.transports[sessionId]) {
        res.status(400).send("Invalid or missing session ID");
        return;
      }

      const transport = this.transports[sessionId];
      await transport.handleRequest(req, res);
    };

    // Handle GET requests for server-to-client notifications via SSE
    this.app.get("/mcp", handleSessionRequest);

    // Handle DELETE requests for session termination
    this.app.delete("/mcp", handleSessionRequest);
  }

  async run() {
    // Initialize services first
    await this.initializeServices();

    // Start the HTTP server
    this.app.listen(this.port, () => {
      console.error(`Manga AI MCP HTTP Server running on port ${this.port}`);
      console.error(`Health check: http://localhost:${this.port}/health`);
      console.error(
        `MCP endpoint available at: http://localhost:${this.port}/mcp`
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
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3010;
  const server = new MangaAiHttpMcpServer(port);
  server.run().catch(console.error);
}
