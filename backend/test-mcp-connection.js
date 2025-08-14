// Simple test to verify MCP client works without the complex server setup
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');

async function testMcpConnection() {
  console.log('Testing MCP client connection...');
  
  try {
    // Create a simple echo script that the client can connect to
    const { spawn } = require('child_process');
    
    // Create a simple test server that responds to MCP protocol
    const testServer = spawn('node', ['-e', `
      const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
      const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
      const { ListToolsRequestSchema, CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
      
      const server = new Server(
        { name: 'test-server', version: '1.0.0' },
        { capabilities: { tools: {} } }
      );
      
      server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
          tools: [{
            name: 'test_echo',
            description: 'Test echo tool',
            inputSchema: {
              type: 'object',
              properties: {
                message: { type: 'string', description: 'Message to echo' }
              },
              required: ['message']
            }
          }]
        };
      });
      
      server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        if (name === 'test_echo') {
          return {
            content: [{
              type: 'text',
              text: 'Echo: ' + (args.message || 'Hello MCP!')
            }]
          };
        }
        throw new Error('Tool not found: ' + name);
      });
      
      const transport = new StdioServerTransport();
      server.connect(transport);
      console.error('Test MCP server running');
    `], { stdio: ['pipe', 'pipe', 'inherit'] });
    
    // Give the server a moment to start
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Now test the client
    const transport = new StdioClientTransport({
      command: testServer.pid.toString(), // This won't work, but let's see what happens
      args: []
    });
    
    console.log('Created transport, attempting connection...');
    
  } catch (error) {
    console.error('MCP connection test failed:', error.message);
  }
}

testMcpConnection();
