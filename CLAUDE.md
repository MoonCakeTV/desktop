# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MooncakeTV (月饼 TV) is a Wails-based desktop application that combines a Go backend with a React TypeScript frontend. It's a media application with features for browsing, bookmarking, and managing media content with integrations to rating services like Douban, IMDB, and TMDB.

## Development Commands

### Primary Development

- `wails dev` - Start development server with hot reload
- `wails build` - Build production application
- `make dev` - Alias for `wails dev`
- `make mod` - Run `go mod tidy` to clean up Go dependencies

### Frontend Development (in frontend/ directory)

- `npm install` - Install frontend dependencies
- `npm run dev` - Start Vite development server
- `npm run build` - Build frontend (TypeScript compilation + Vite build)
- `npm run preview` - Preview built frontend

### Git Operations

- `make origin` - Push to origin remote with tags
- `make tea` - Push to tea remote with tags

## Architecture

### Backend (Go)

- **Entry Point**: `main.go` - Wails application setup with embedded frontend assets
- **App Structure**: `app.go` - Main App struct with database integration and lifecycle management
- **Database**: SQLite with migration support via `services/database.go`
- **Platform-specific app data paths**: Handles Windows (APPDATA), macOS (~/Library/Application Support), and Linux (XDG) conventions

### Frontend (React + TypeScript)

- **Router**: TanStack Router for file-based routing
- **UI Framework**: Extensive Radix UI components with Tailwind CSS
- **Video**: HLS.js and Video.js for media playback
- **State Management**: React hooks
- **Styling**: Tailwind CSS v4 with custom animations

### Database Schema

The application uses SQLite with the following main tables:

- `users` - User management
- `settings` - User preferences
- `medias` - Media content with rating data from multiple sources
- `bookmarks` - User media bookmarks
- `history` - User viewing history
- `mc_comments` - User comments on media

### Key Dependencies

- **Backend**: Wails v2, SQLite driver, platform-specific libraries
- **Frontend**: React 19, TanStack Router, Radix UI, Tailwind CSS, video players

## Project Structure

```
├── main.go              # Wails app entry point
├── app.go               # Main app logic and database integration
├── wails.json           # Wails configuration
├── services/            # Backend services (database, etc.)
├── migrations/          # SQL migration files
├── handlers/            # HTTP/API handlers (currently empty)
├── models/              # Data models (currently empty)
├── frontend/
│   ├── src/
│   │   ├── components/  # React components (ui/, douban/, sidebar/)
│   │   ├── routes/      # TanStack router routes
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility libraries
│   └── package.json     # Frontend dependencies
└── build/               # Build assets and configuration
```

## Development Notes

- The app initializes with platform-specific data directories for SQLite database storage
- Migration system tracks database schema changes via `migrations` table
- Frontend uses file-based routing with TanStack Router
- Embedded assets are handled via Go's embed directive
- The application name displays as "月饼 TV" (MooncakeTV in Chinese)
- delete the temporary mookcake-test executable after it's built
- we use shadcn ui components, and we already have every component installed, just use it , do not search it
