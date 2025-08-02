#!/bin/bash

echo "Testing MangaAI Database Migration Status..."
echo "==========================================="

# Test database health
echo "1. Checking database health..."
curl -s http://localhost:9002/api/health/database | python3 -m json.tool

echo -e "\n2. Testing chat API with anonymous user..."
curl -X POST http://localhost:9002/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-project-123",
    "message": "Hello, test message",
    "userId": "anonymous"
  }' | python3 -m json.tool

echo -e "\n==========================================="
echo "If you see errors above, please run the database migration!"
echo "Go to Supabase Dashboard → SQL Editor → Paste database-migration.sql → Run"
