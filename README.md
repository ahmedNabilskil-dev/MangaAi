# 🎌 Manga AI - AI-Powered Manga Creation Platform

An advanced Next.js application for creating manga projects using AI, featuring Model Context Protocol (MCP) integration and direct Gemini SDK usage.

## ✨ Features

- **🎨 Project Creation**: AI-powered manga project generation using MCP prompts
- **💬 Interactive Chat Interface**: Content generation for characters, chapters, scenes, and panels
- **🔗 MCP Integration**: Advanced prompt and tool management via Model Context Protocol
- **⚡ Direct Gemini SDK**: High-performance AI integration without abstraction layers
- **📱 Responsive Design**: Modern UI with Framer Motion animations
- **🎯 Context-Aware**: Different tools/prompts for project creation vs. management

## 🚀 Quick Start

1. **Clone & Install**

   ```bash
   git clone <repository>
   cd MangaAi
   npm install
   ```

2. **Environment Setup**

   ```bash
   # Add to .env.local
   NEXT_PUBLIC_GOOGLE_API_KEY=your_gemini_api_key
   ```

3. **Start Development**

   ```bash
   npm run dev
   ```

4. **Start MCP Server** (Optional)
   ```bash
   # In a separate terminal
   cd src/mcp
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # React components
│   └── chat-interface/     # Chat-related components
├── hooks/                  # Custom React hooks
├── services/               # API services (MCP, Gemini)
├── mcp/                    # Model Context Protocol server
└── types/                  # TypeScript definitions
```

## 🔧 Architecture

- **Frontend**: Next.js 15 with TypeScript
- **AI Integration**: Direct Gemini SDK (@google/genai)
- **MCP Server**: localhost:3001 for advanced prompt management
- **Database**: Dexie (IndexedDB) for local storage
- **Styling**: Tailwind CSS with shadcn/ui components

## 📖 Documentation

- [Final Analysis Report](FINAL_ANALYSIS_REPORT.md) - Complete system analysis
- [MCP Integration Summary](MCP_INTEGRATION_SUMMARY.md) - MCP implementation details
- [Implementation Logs](docs/implementation-logs/) - Development history

## 🎯 Usage

1. **Create Project**: Use home page to generate manga concepts
2. **Manage Content**: Navigate to project chat interface for content generation
3. **AI Assistance**: Leverage context-aware prompts for different content types

## 🛠️ Development

- Built with modern React patterns and TypeScript
- Context-aware MCP integration
- Optimized bundle sizes and performance
- Comprehensive error handling and fallbacks
