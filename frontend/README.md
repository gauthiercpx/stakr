# Stakr Frontend (Vite + React)

## Overview

This is the frontend application for **Stakr**.

- Build tool: **Vite**
- UI: **React**
- Language: **TypeScript**

In local development, the frontend runs on Vite's dev server (default: `http://localhost:5173`).
In production (Docker/Azure), the frontend is built and served by the backend container via `/`.

## Project structure

```
frontend/
  src/
  public/
  index.html
  vite.config.ts
  package.json
```

## Requirements

- Node.js 20+
- npm

## Install

```powershell
cd frontend
npm install
```

## Run (dev)

```powershell
cd frontend
npm run dev
```

## Build

```powershell
cd frontend
npm run build
```

The build output goes to `frontend/dist/`.

## API configuration

During development, the frontend should call the backend API at `http://localhost:8000`.

Depending on how `api` is implemented (e.g. `src/api/client.ts`), you typically configure it using an environment variable:

- `VITE_API_URL=http://localhost:8000`

If you don't use env vars yet, you can hardcode it in the API client for now and improve later.

## Docker / Production

You normally don't run a separate frontend container.
The root `Dockerfile` builds the frontend and copies `dist/` into the backend image at `/app/static`.

See `../README.md` for Docker usage.

## Manual deployment (Azure Container Registry)

This project currently uses a manual ACR flow for the frontend image.

### Login to ACR

```powershell
az acr login --name stakrregistry
```

### Build & tag the image (set API URL)

> Replace `vX` with the version you want to publish (e.g. `v2`) to ensure the platform pulls the new image.

```powershell
docker build -t stakrregistry.azurecr.io/stakr-frontend:vX --build-arg VITE_API_URL="https://api.stakr.me" ./frontend
```

### Push the image

```powershell
docker push stakrregistry.azurecr.io/stakr-frontend:vX
```

## Versioning

Frontend and backend are deployed independently, so version them independently.

You can still use SemVer for your own release notes (`X.Y.Z`), but the current CD flow does **not** rely on git tags.

## CD (automatic ACR push)

The GitHub Actions workflow builds and pushes the frontend image to ACR when:
- a commit is pushed/merged to `main`, and
- something under `frontend/` changed.

### Required GitHub secrets

- `ACR_LOGIN_SERVER` (example: `stakrregistry.azurecr.io`)
- `ACR_USERNAME`
- `ACR_PASSWORD`

### Image tags published

- `stakr-frontend:sha-<full git sha>` (immutable)
- `stakr-frontend:latest`
