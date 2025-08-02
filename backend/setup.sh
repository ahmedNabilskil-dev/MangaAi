#!/bin/bash

# MangaAI Backend Development Setup Script

echo "🚀 Setting up MangaAI Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ and try again."
    exit 1
fi

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the backend directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration before starting the server."
else
    echo "✅ .env file already exists."
fi

# Create logs directory
mkdir -p logs

echo "✅ Backend setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Run 'npm run mcp:http' to start the MCP server (in another terminal)"
echo ""
echo "Available commands:"
echo "- npm run dev          # Start development server"
echo "- npm run build        # Build for production"
echo "- npm start            # Start production server"
echo "- npm run mcp:http     # Start MCP HTTP server"
echo "- npm run mcp:stdio    # Start MCP stdio server"
echo "- npm run lint         # Run linter"
echo "- npm run test         # Run tests"
