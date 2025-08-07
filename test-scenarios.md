# Gemini Adapter Scenarios Coverage

## ✅ All Scenarios Now Covered:

### **Scenario 1: No Tools**

- **1a**: `tools=[]`, `outputSchema=null`, `callTool=any` → Normal text response
- **1b**: `tools=[]`, `outputSchema=present`, `callTool=any` → Structured JSON response
- **1c**: `tools=[]`, `outputSchema=present`, `callTool=true` → Structured JSON response (ignores callTool since no tools)

### **Scenario 2: Tools Present**

#### **2a: Force Tool Calling (`callTool=true`)**

- **2a1**: `tools=[...]`, `outputSchema=null`, `callTool=true` → Forces tool call, then normal text response
- **2a2**: `tools=[...]`, `outputSchema=present`, `callTool=true` → Forces tool call, then structured JSON response in recursive call

#### **2b: Optional Tool Calling (`callTool=false` or `undefined`)**

- **2b1**: `tools=[...]`, `outputSchema=null`, `callTool=false/undefined` → Tools available, normal text response
- **2b2**: `tools=[...]`, `outputSchema=present`, `callTool=false/undefined` → Tools available + structured JSON response
- **2b3**: AI can choose to call tools or not, and if it calls tools, it can continue recursively up to maxDepth

### **Scenario 3: Recursive Calls**

- **3a**: After tool execution with `callTool=true` → Next call has `tools=[]`, `callTool=false`, enables structured output
- **3b**: After tool execution with `callTool=false/undefined` → Next call keeps same configuration, allows more tool calls
- **3c**: Depth protection prevents infinite recursion (default maxDepth=3)

## Key Improvements Made:

1. **Clear separation of scenarios** - No more overlapping conditions
2. **Proper edge case handling** - `callTool=true` with no tools is handled gracefully
3. **Flexible tool availability** - Tools can be available without forcing their use
4. **Smart recursive behavior** - Different behavior based on original `callTool` value
5. **Comprehensive structured output** - Works in all appropriate scenarios

## Logic Flow:

```
Input: messages, tools, params, callTool, depth, maxDepth

1. Check depth limit
2. Prepare Gemini tools and contents
3. Determine scenario:

   NO TOOLS:
   - If outputSchema exists → Set structured output
   - Ignore callTool (no tools to call)

   TOOLS PRESENT:
   - If callTool=true → Force tool calling, no structured output yet
   - If callTool=false/undefined:
     - If outputSchema exists → Set structured output + tools available
     - If no outputSchema → Just tools available

4. Make API call
5. Handle response:
   - If tool calls → Execute tools and recurse with appropriate config
   - If no tool calls → Return response
```

This implementation now handles ALL possible combinations correctly!
