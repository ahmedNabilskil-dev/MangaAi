// Test MCP client functionality
const baseUrl = "http://localhost:3001";
let sessionId = null;
let requestId = 1;

async function sendRequest(method, params = {}) {
  if (!sessionId && method !== "initialize") {
    await initialize();
  }

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
  };

  if (sessionId) {
    headers["mcp-session-id"] = sessionId;
  }

  const response = await fetch(`${baseUrl}/mcp`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: requestId++,
      method,
      params,
    }),
  });

  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}`);
    console.error("Response headers:", Object.fromEntries(response.headers.entries()));
    const errorText = await response.text();
    console.error("Response body:", errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Extract session ID from headers for initialize requests
  if (method === "initialize") {
    const newSessionId = response.headers.get("mcp-session-id");
    if (newSessionId) {
      sessionId = newSessionId;
      console.log("✅ Session ID extracted:", sessionId);
    } else {
      console.log("⚠️  No session ID in headers, using default");
      sessionId = "default";
    }
  }

  const text = await response.text();
  console.log("Raw response:", text);
  
  // Parse SSE response
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.substring(6));
      if (data.error) {
        throw new Error(data.error.message || 'MCP error');
      }
      return data.result;
    }
  }
  
  throw new Error("No valid response received");
}

async function initialize() {
  console.log("Initializing MCP session...");
  const result = await sendRequest("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "test-client",
      version: "1.0.0",
    },
  });
  
  console.log("✅ Session initialized:", result);
  console.log("✅ Session ID set to:", sessionId);
  return result;
}

async function testTools() {
  console.log("\n=== Testing Tools ===");
  const tools = await sendRequest("tools/list");
  console.log("Available tools:", tools.tools?.map(t => t.name) || []);
  return tools;
}

async function testPrompts() {
  console.log("\n=== Testing Prompts ===");
  const prompts = await sendRequest("prompts/list");
  console.log("Available prompts:", prompts.prompts?.map(p => p.name) || []);
  return prompts;
}

async function testStoryGeneration() {
  console.log("\n=== Testing Story Generation Prompt ===");
  try {
    const result = await sendRequest("prompts/get", {
      name: "story-generation",
      arguments: {
        user_input: "A cyberpunk manga about emotions as currency",
        target_audience: "young-adult",
        preferred_genre: "sci-fi"
      }
    });
    console.log("Story generation result:", result);
    return result;
  } catch (error) {
    console.error("Story generation failed:", error);
    return null;
  }
}

async function testCreateProject() {
  console.log("\n=== Testing Create Project Tool ===");
  try {
    const result = await sendRequest("tools/call", {
      name: "createProject",
      arguments: {
        title: "Test Manga",
        description: "A test manga project",
        genre: "action",
        targetAudience: "teen"
      }
    });
    console.log("Create project result:", result);
    return result;
  } catch (error) {
    console.error("Create project failed:", error);
    return null;
  }
}

// Run tests
async function runTests() {
  try {
    await initialize();
    await testTools();
    await testPrompts();
    await testStoryGeneration();
    await testCreateProject();
  } catch (error) {
    console.error("Test failed:", error);
  }
}

runTests();
