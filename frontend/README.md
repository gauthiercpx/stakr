# Stakr Frontend (Vite + React)

The Stakr frontend is a lightweight React app (Vite + TypeScript) that talks to the Stakr API.

- Build tool: **Vite**
- UI: **React**
- Language: **TypeScript**

In local development, the frontend runs on Vite's dev server (default: `http://localhost:5173`).
In production, the frontend is deployed independently from the API.

---

## Technical

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

## Local development

Prefer Vite (`npm run dev`) + Docker Compose for the API/DB.
See the root `README.md`.

## Deployment

The frontend is deployed to **Cloudflare Pages**, which builds directly from
the Git repository -- there is no GitHub Actions workflow and no container
image involved.

| Setting          | Value              |
| ---------------- | ------------------ |
| Build command    | `npm run build`    |
| Build output     | `dist`             |
| Root directory   | `frontend`         |

Set `VITE_API_URL` to the backend URL (`https://api.stakr.me`) in the Pages
project's environment variables. It is read at build time, so changing it
requires a redeploy.

> The previous Azure flow (nginx image pushed to ACR and served by a
> `stakr-frontend` Container App) has been retired, along with
> `frontend/Dockerfile` and `.github/workflows/frontend-acr.yml`.

## Versioning

Frontend and backend are deployed independently, so version them independently.

You can still use SemVer for your own release notes (`X.Y.Z`), but the current CD flow does **not** rely on git tags.
