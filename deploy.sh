#!/bin/bash

# Deployment script for frontend
# This script handles the build process with proper error handling

set -e  # Exit on any error

echo "🚀 Starting frontend deployment..."

# Check if we're in the client directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the client directory."
    exit 1
fi

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "❌ Error: pnpm is not installed. Please install pnpm first."
    echo "   npm install -g pnpm"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies with pnpm..."
pnpm install

# Set production environment
export NODE_ENV=production
export NEXT_PUBLIC_ENVIRONMENT=production

# Build the application
echo "🏗️  Building application..."
pnpm run build

echo "✅ Frontend build completed successfully!"

# Optional: Start the application
if [ "$1" = "--start" ]; then
    echo "🚀 Starting application..."
    pnpm start
fi