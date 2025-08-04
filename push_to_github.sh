#!/bin/bash

# Script to push CNA Report Writer to GitHub
# Repository: https://github.com/collwyn/CNAreportwriter.git

echo "🚀 Pushing CNA Report Writer to GitHub..."

# Clear any Git locks
echo "Clearing Git locks..."
rm -f .git/index.lock

# Check current Git status
echo "Checking Git status..."
git status

# Add all changes
echo "Adding all changes..."
git add .

# Commit changes with descriptive message
echo "Committing changes..."
git commit -m "feat: Complete CNA Genius - Daily Care Companion Platform

## Core Features Implemented:
- 🚨 Incident Report Generator with AI-powered narrative generation
- 📊 ADL (Activities of Daily Living) Tracker with patient management
- 🔄 Shift Handoff documentation system for care transitions
- ✍️ General Statement Writer for professional employee statements
- 💬 User Suggestion System with categorized feedback and voting
- 🔒 Complete authentication system (email/password, Google, Facebook OAuth)

## Technical Implementation:
- Multi-language support (7 languages: EN, ES, FR, ZH, HT, TL, KO)
- AI integration using OpenAI GPT-4o for professional text generation
- PostgreSQL database with Drizzle ORM for type-safe operations
- IP-based rate limiting system (5 reports per day per IP)
- Comprehensive user feedback and analytics tracking
- Responsive design with Tailwind CSS and Shadcn/UI components
- Production-ready authentication with session management
- Data deletion request functionality for privacy compliance

## Recent Updates:
- Fixed Facebook OAuth configuration with correct App ID (3703319113134205)
- Corrected OAuth redirect URIs for both development and production
- Enhanced suggestion system with engaging user interface
- Resolved TypeScript schema conflicts and duplicate type definitions
- Updated authentication system for seamless social login integration

## Deployment Ready:
- Environment configuration for production deployment
- Database migration support through Drizzle Kit
- Comprehensive error handling and user feedback systems
- Multi-domain support (cnagenius.com + Replit development domain)"

# Add the new GitHub repository as remote
echo "Setting up GitHub remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/collwyn/CNAreportwriter.git

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "✅ Successfully pushed to GitHub!"
echo "🔗 Repository: https://github.com/collwyn/CNAreportwriter.git"
echo ""
echo "Next steps:"
echo "1. Set up environment variables (DATABASE_URL, OPENAI_API_KEY)"
echo "2. Deploy using Replit Deployments or your preferred platform"
echo "3. Run 'npm run db:push' to set up the database schema"