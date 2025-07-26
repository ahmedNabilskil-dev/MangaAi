import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { initializeDataService } from "../services/data-service.js";
import { BaseMangaAiMcpServer } from "./base-server.js";

export class MangaAiMcpServer extends BaseMangaAiMcpServer {
  constructor() {
    super();
  }

  async run() {
    // Initialize the data service first
    await initializeDataService();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Manga AI MCP Server running on stdio");
  }
}

// Start the server
const server = new MangaAiMcpServer();
server.run().catch(console.error);
