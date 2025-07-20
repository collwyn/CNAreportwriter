# CNA Genius - Healthcare Documentation Platform

## Overview
CNA Genius is a comprehensive healthcare documentation platform designed for Certified Nursing Assistants (CNAs). The platform features two main tools:

1. **Incident Report Generator** - Streamlines the creation of professional incident reports with AI assistance, converting form data into grammatically correct, first-person narrative reports with multi-language support.

2. **ADL Tracker** - A new Activities of Daily Living tracking system that allows CNAs to quickly document patient care activities, assistance levels, and generate AI-powered daily summaries for Medicare compliance.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with Shadcn/UI component library for consistent design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for robust form management

### Backend Architecture
- **Runtime**: Node.js with Express.js TypeScript server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **AI Integration**: OpenAI GPT-4o for report generation and multi-language translation
- **Session Management**: Express sessions with PostgreSQL store

### Data Storage Solutions
- **Primary Database**: PostgreSQL for persistent storage of incident reports and user data
- **ORM**: Drizzle ORM with TypeScript for database schema management and queries
- **Connection Pool**: Neon serverless PostgreSQL for scalable database connections

## Key Components

### Multi-Step Form Interface
- Progressive form with 6 steps for comprehensive data collection
- Form validation at each step with error handling
- Navigation between steps with progress indication
- Auto-population of date/time based on device settings

### AI-Powered Report Generation
- Integration with OpenAI GPT-4o for intelligent report creation
- Single paragraph, first-person narrative format
- Grammatically correct professional incident reports
- Context-aware content generation based on form inputs

### Multi-Language Support
- Support for 6 languages: English, Spanish, French, Chinese, Haitian Kreyol, Tagalog
- Real-time translation of generated reports
- Language-specific UI translations
- Automatic language detection and switching

### Database Schema
- **Users table**: Authentication and user management
- **Reports table**: Complete incident report storage including generated text
- Fields include CNA details, patient information, incident specifics, and actions taken
- Proper handling of optional fields (patient statements)

## Data Flow

1. **Form Submission**: User completes multi-step form with incident details
2. **Validation**: Client-side validation using Zod schemas
3. **AI Processing**: Form data sent to OpenAI GPT-4o for report generation
4. **Database Storage**: Generated report and form data stored in PostgreSQL
5. **Translation**: Optional real-time translation to target language
6. **Display**: Generated report displayed with copy/print functionality

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o model for report generation and translation
- Configured with appropriate prompts for medical incident reporting context
- Error handling for API failures and rate limiting

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database
- Connection pooling for scalable database access
- Migration management through Drizzle Kit

### UI Components
- **Shadcn/UI**: Component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for consistent iconography

## Deployment Strategy

### Environment Configuration
- **Development**: Local development with hot reload via Vite
- **Production**: Build process creates optimized static assets and server bundle
- Environment variables for database URL and OpenAI API key
- Secure session management with connect-pg-simple

### Build Process
- Frontend: Vite builds optimized React application
- Backend: ESBuild bundles TypeScript server code
- Database: Drizzle migrations for schema management
- Static assets served from Express in production

### Database Migrations
- Schema changes managed through Drizzle Kit
- Version-controlled migration files
- Safe deployment with rollback capabilities

## Recent Changes
- January 14, 2025: Integrated ADL (Activities of Daily Living) Tracker System
  - Added complete database schema for patients, ADL categories, entries, and daily summaries
  - Created patient management system with care level tracking (skilled, assisted, independent)
  - Implemented quick ADL entry form with mobile-optimized interface
  - Built navigation system allowing users to switch between incident reports and ADL tracking
  - Added 6 default ADL categories: Bathing, Dressing, Eating, Mobility, Toileting, Communication
  - Pre-populated database with sample patients for development and testing
  - Created patient selector component with search functionality
  - Integrated with existing authentication and rate limiting systems
  - Maintained consistency with existing UI design patterns using Shadcn/UI

- January 13, 2025: Added comprehensive feedback analytics tracking system
  - Analytics tracking for feedback form views and submissions
  - Database schema updated with feedback analytics table
  - New analytics dashboard section showing conversion rates and form effectiveness
  - Real-time tracking of user interactions with feedback forms
  - Enhanced admin dashboard with analytics insights including 7-day trends
  - Generated sample analytics data: 15 views, 8 submissions (53.3% conversion rate)

- January 13, 2025: Added comprehensive feedback collection system
  - Multi-question feedback form with 5-star ratings for usefulness, ease of use, and satisfaction
  - Text fields for most helpful features and suggested improvements
  - Optional additional comments section
  - Backend storage of feedback data with IP tracking for analytics
  - Thank you confirmation message after submission
  - Database schema updated to include feedback table

- January 02, 2025: Added IP-based rate limiting system
  - Implemented 5 reports per day limit per IP address
  - Added real-time usage tracking and display
  - Enhanced error handling for rate limit violations
  - Added remaining generations counter in UI
  - Alert system shows when daily limit is hit with reset time
  - Removed public budget visibility for privacy

## Changelog
- July 06, 2025. Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.