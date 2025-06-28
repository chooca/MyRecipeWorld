# replit.md

## Overview

RecipeVault is a full-stack recipe management application that allows users to store, organize, and share their recipes. The application features a modern React frontend with Express.js backend, using PostgreSQL as the database with Drizzle ORM for type-safe database operations. The app integrates Replit's authentication system for user management and includes features like recipe creation, image uploads, favorites, and cooking history tracking.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom recipe-themed color palette
- **State Management**: TanStack Query (React Query) for server state and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Neon serverless connections
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit OAuth integration with session management
- **File Uploads**: Multer middleware for image handling
- **API Design**: RESTful endpoints with JSON responses

### Key Components

#### Database Schema
- **Users**: Stores user profile information (email, name, profile image)
- **Recipes**: Main recipe entity with metadata (title, description, prep/cook time, difficulty)
- **Cooking History**: Tracks when users cook recipes with optional notes
- **Favorites**: Many-to-many relationship for user recipe favorites
- **Sessions**: Required table for Replit Auth session storage

#### Authentication & Authorization
- Replit OAuth 2.0 integration using OpenID Connect
- Session-based authentication with PostgreSQL session store
- Route protection middleware for authenticated endpoints
- Automatic redirect handling for unauthorized access

#### File Management
- Local file storage in `uploads/` directory for recipe images
- 10MB file size limit with image type validation
- Static file serving for uploaded images
- Drag-and-drop image upload component

## Data Flow

1. **User Authentication**: Users authenticate via Replit OAuth, creating/updating user records
2. **Recipe Management**: CRUD operations for recipes with image upload support
3. **Social Features**: Users can favorite recipes and track cooking history
4. **Search & Discovery**: Recipe search by title with public/private visibility controls

## External Dependencies

### Production Dependencies
- **@neondatabase/serverless**: PostgreSQL connection pooling
- **@tanstack/react-query**: Client-side data fetching and caching
- **drizzle-orm**: Type-safe database ORM
- **passport**: Authentication middleware
- **multer**: File upload handling
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety across frontend and backend
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Backend bundling for production

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend development
- Express server with automatic restart via tsx
- Shared TypeScript configuration for consistent types
- Database migrations via Drizzle Kit

### Production Build
- Frontend: Vite production build with static asset optimization
- Backend: ESBuild bundle for Node.js deployment
- Environment: Expects DATABASE_URL and SESSION_SECRET variables
- Static assets served from Express with fallback to React app

### Database Management
- Schema defined in `shared/schema.ts` for type sharing
- Migrations generated in `migrations/` directory
- Push-based deployment with `drizzle-kit push`
- Connection pooling via Neon serverless driver

## Changelog

```
Changelog:
- June 28, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```