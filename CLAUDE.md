# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Client (React + Vite)
- **Development**: `cd Client && npm run dev`
- **Build**: `cd Client && npm run build`
- **Lint**: `cd Client && npm run lint`
- **Preview**: `cd Client && npm run preview`

### Server (Express.js)
- **Development**: `cd Server/src && node --watch-path=./ server.mjs`
- **Dependencies**: Express server requires PostgreSQL database running

### Database (PostgreSQL + Docker)
- **Start services**: `cd Server && docker compose up -d`
- **Access PostgreSQL shell**: `docker exec -it pg-local psql -U dev -d appdb`
- **PgAdmin**: Available on configured port after docker compose up

### Full Stack Development
Use the PowerShell script `dev.ps1` to start all services:
- **Standard**: `./dev.ps1` (starts Docker, API server, and Vite dev server)
- **With PSQL**: `./dev.ps1 -WithPsql` (also opens PostgreSQL shell)

## Architecture Overview

### Client Architecture (React)
- **Framework**: React 19 with Vite build system
- **Routing**: React Router DOM for SPA navigation
- **State Management**: Context API via `GameMetaProvider` for game metadata
- **Styling**: CSS modules with component-specific stylesheets
- **Pages**: Hero (landing), AddGameForm, Metrics, PlayerPage, GameFeedPage
- **Components**: Modular components in `/components` directory with CSS co-location

### Server Architecture (Express.js)
- **Framework**: Express.js with ES modules (.mjs)
- **Database**: PostgreSQL with connection pooling
- **API Structure**: RESTful API at `/api/v1` base path
- **Routing**: Modular routers (games, stats, cards)
- **Services**: Business logic separated into service layer
- **Controllers**: Request handling and response formatting
- **Database Layer**: Pool connections with transaction support (`pool.mjs`, `tx.mjs`)

### Key Service Integrations
- **Scryfall API**: Magic card data integration via `scryfallService.mjs`
- **Commander Service**: Card validation and commander data management
- **Game Service**: Game creation, player tracking, and winner assignment

### Database Schema
The application tracks Magic: The Gathering games with:
- Games table (date, turns, win condition, winner info)
- Players table (names, commanders, turn order)
- Commanders table (populated via Scryfall API)

### API Contract
RESTful API documented in `API-Contract.md`:
- `POST /api/v1/games` - Create new game records
- `GET /api/v1/stats/*` - Various statistics endpoints (players, commanders, colors)
- Commander and player statistics with optional filtering by name

## Development Notes

### Client Dependencies
- React 19 with React Router DOM for navigation
- Vite for development server and building
- ESLint for code linting

### Server Dependencies  
- Express.js for HTTP server
- pg (node-postgres) for PostgreSQL connectivity
- ES modules throughout (.mjs extensions)

### Directory Structure
- `Client/` - React frontend application
- `Server/` - Express.js backend API
- `Server/src/controllers/` - Request handlers
- `Server/src/services/` - Business logic
- `Server/src/routes/` - Route definitions
- `Server/src/db/` - Database connection and utilities
- `Server/src/tests/` - Test files and utilities