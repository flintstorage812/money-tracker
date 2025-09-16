# Overview

MoneyTracker is a personal finance management application built as a mobile-first web app. It provides users with comprehensive financial tracking capabilities including transaction management, savings goals, bill tracking, and financial insights through an intuitive dashboard. The application uses a full-stack TypeScript architecture with React frontend and Express backend, designed to help users take control of their finances through easy-to-use mobile interfaces.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend uses React with TypeScript, built with Vite for fast development and bundling. The architecture follows a component-based design with:

- **UI Framework**: Radix UI components with shadcn/ui for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Mobile-First Design**: Responsive layout optimized for mobile devices with bottom navigation

The client architecture separates concerns with dedicated directories for components, pages, hooks, and utilities. Path aliases are configured for clean imports (@/ for client src, @shared for shared types).

## Backend Architecture
The backend uses Express.js with TypeScript in ESM format, providing RESTful API endpoints:

- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: Replit Auth integration with session-based authentication
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **API Structure**: Resource-based routes for transactions, savings goals, bills, and user data
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Request Logging**: Custom middleware for API request logging and monitoring

## Data Storage
The application uses PostgreSQL as the primary database with Drizzle ORM providing:

- **Schema Definition**: Centralized schema in shared directory for type safety
- **Migration Management**: Drizzle Kit for database schema migrations
- **Connection Pooling**: Neon serverless PostgreSQL with connection pooling
- **Data Models**: Users, transactions, savings goals, bills, and sessions tables
- **Type Safety**: Generated TypeScript types from database schema

## Authentication & Authorization
Authentication is handled through Replit's OAuth integration:

- **OAuth Flow**: OpenID Connect with Replit as identity provider
- **Session Management**: Secure HTTP-only cookies with PostgreSQL session store
- **Authorization**: Route-level protection with authentication middleware
- **User Management**: Automatic user creation and profile management

## Key Design Patterns
- **Repository Pattern**: Storage layer abstraction for database operations
- **Service Layer**: Business logic separated from route handlers
- **Type-First Development**: Shared TypeScript types between client and server
- **Mobile-First UI**: Bottom navigation and card-based layouts optimized for mobile
- **Form Validation**: Zod schemas shared between frontend and backend
- **Error Boundaries**: Proper error handling and user feedback

# External Dependencies

## Core Framework Dependencies
- **React 18**: Frontend framework with hooks and modern patterns
- **Express.js**: Backend web framework for Node.js
- **TypeScript**: Type safety across the entire stack
- **Vite**: Build tool and development server for frontend

## Database & ORM
- **PostgreSQL**: Primary database (configured for Neon serverless)
- **Drizzle ORM**: Type-safe ORM with PostgreSQL driver
- **@neondatabase/serverless**: Serverless PostgreSQL connection driver

## Authentication
- **Replit Auth**: OAuth integration with OpenID Connect
- **Passport.js**: Authentication middleware with OpenID strategy
- **express-session**: Session management middleware
- **connect-pg-simple**: PostgreSQL session store

## UI & Styling
- **Radix UI**: Headless UI component primitives
- **shadcn/ui**: Pre-built component library based on Radix
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Font Awesome**: Additional icons via CDN

## State Management & Data Fetching
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **Zod**: Schema validation and type inference

## Development & Build Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database migration and introspection tool
- **PostCSS**: CSS processing with Tailwind integration

## Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development environment banner