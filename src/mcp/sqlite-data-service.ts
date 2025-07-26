// src/mcp/sqlite-data-service.ts
// Node.js SQLite data service adapter for MCP server
import type { IDataService } from "../services/data-service.interface.js";
import { sqliteDataService } from "../services/sqlite-service.js";

// Export the SQLite service for use in the MCP server
export const mcpDataService: IDataService = sqliteDataService;

// Initialize the database when the module is loaded
async function initializeDatabase() {
  try {
    await sqliteDataService.initialize();
    console.log("✅ SQLite database initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize SQLite database:", error);
    process.exit(1);
  }
}

// Initialize on module load
initializeDatabase();
