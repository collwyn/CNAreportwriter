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
git commit -m "feat: Complete CNA incident report app with AI-powered generation

- Implemented multi-step form with navigation and validation
- Added AI-powered report generation using OpenAI GPT-4o
- Created single paragraph first-person narrative format
- Added automatic date/time insertion based on device settings
- Changed supervisor notification to radio selection (Yes/No)
- Updated database schema (nurse_actions → supervisor_notified)
- Added multi-language translation support (6 languages)
- Implemented PostgreSQL persistence with Drizzle ORM
- Added comprehensive form validation and error handling
- Created responsive design with Tailwind CSS and Shadcn/UI
- Added proper documentation (README.md, DEPLOYMENT_GUIDE.md)"

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