# 360Shopie Full-Stack Platform

Professional monorepo for the 360Shopie SaaS commerce platform.

## Stack
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: Prisma ORM with SQLite (default local) and optional PostgreSQL via Docker
- Runtime: npm workspaces

## Workspace Structure
- `apps/web` - frontend application
- `apps/api` - backend API service
- `docker-compose.yml` - local PostgreSQL container

## Quick Start
1. Install dependencies:
   - `npm install`
2. Prepare database:
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
   - `npm run prisma:seed`
3. Start frontend + backend:
   - `npm run dev`

Optional PostgreSQL mode:
- Update `DATABASE_URL` in `.env` to your PostgreSQL connection string.
- Ensure Docker or your PostgreSQL server is running.

## Default Demo Login
- Email: `aadhya@360shopie.com`
- Password: `Welcome@123`

## Local URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api/health
