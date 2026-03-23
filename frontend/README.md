# Udens Filtri Frontend (Next.js + next-intl)

Production-ready Next.js storefront frontend for Udens Filtri with API-first data loading and cookie-based auth integration.

## Tech stack

- Next.js (App Router, standalone output)
- TypeScript
- Tailwind CSS
- `next-intl` localization (`lv`, `ru`, `en`)
- Cookie-based authentication (frontend prepared for Django backend)

## Prerequisites

- Node.js 20+
- npm 10+
- Docker + Docker Compose (for containerized run)

## Environment variables

Copy the template and adjust values:

```bash
cp .env.example .env.local
```

Important variable:

- `NEXT_PUBLIC_API_BASE_URL` — backend base URL used by the frontend API client.

Examples:

- Local backend on host machine: `http://localhost:8000`
- Backend service in the same Docker network: `http://backend:8000`

## Local development

```bash
npm install
npm run dev
```

App runs at: `http://localhost:3000`

## Production build (without Docker)

```bash
npm run build
npm run start
```

## Docker integration

This repository includes:

- `Dockerfile` multi-stage production build
- `docker-compose.yml` service definition

### 1) Configure env for Docker

```bash
cp .env.example .env
```

Set `NEXT_PUBLIC_API_BASE_URL` in `.env`.

If backend runs in another container on the same Docker network, use the backend service name, for example:

```env
NEXT_PUBLIC_API_BASE_URL=http://backend:8000
```

### 2) Build and start container

```bash
docker compose up -d --build
```

### 3) Open app

- `http://localhost:3000`

### 4) Stop

```bash
docker compose down
```

## Connecting frontend container to backend container

`docker-compose.yml` attaches the frontend to a named network (`udens-filtri-network` by default).

Use one of these patterns:

1. **Same compose project (recommended)**
   - Run backend and frontend in one compose file.
   - Set `NEXT_PUBLIC_API_BASE_URL` to `http://backend:8000` (where `backend` is backend service name).

2. **Different compose projects, shared network**
   - Reuse the same network name (`APP_NETWORK`) in both projects.
   - Ensure backend service is discoverable by its container/service DNS name.

3. **Backend on host machine**
   - Set API base URL to `http://host.docker.internal:8000`.
   - `extra_hosts` is already configured in `docker-compose.yml`.

## API integration notes

- Core request helper: `src/lib/api.ts`
- Catalog and data mapping helpers: `src/lib/catalog.ts`
- Auth API: `src/lib/auth/api.ts`

The frontend sends cookies (`credentials: include`) and supports CSRF header forwarding for compatible backends.

## Internationalization

Messages are in:

- `src/messages/lv.json`
- `src/messages/ru.json`
- `src/messages/en.json`

Locale routes:

- `/lv`
- `/ru`
- `/en`
