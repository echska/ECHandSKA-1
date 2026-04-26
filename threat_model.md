# Threat Model

## Project Overview

This project is a pnpm-workspace TypeScript monorepo for a personal memory archive called Nafsam. Production consists of a React + Vite frontend in `artifacts/nafsam` and an Express 5 API in `artifacts/api-server`. The site presents a public landing/login experience and is intended to restrict the underlying memories, media, and writings to authorized viewers.

Production assumptions for future scans:
- `NODE_ENV` is `production` in deployed environments.
- Platform TLS is managed by the deployment platform.
- `artifacts/mockup-sandbox` is development-only and should be ignored unless production reachability is demonstrated.

## Assets

- **Private memory content** -- photos, videos, audio, writings, captions, quotes, and related metadata associated with the archive. Exposure would disclose intimate personal material to unauthorized viewers.
- **Authentication material and session state** -- accepted riddle answers, session cookies, and the session-signing secret. Compromise would allow unauthorized access to the protected archive.
- **Application and deployment secrets** -- environment variables such as `NAFSAM_SESSION_SECRET`, `DATABASE_URL`, and any future third-party API credentials.
- **Archive privacy expectations** -- the expectation that “protected” pages and media are only available after successful server-side authorization, not merely hidden by the UI.

## Trust Boundaries

- **Browser to frontend bundle boundary** -- every visitor can download and inspect the public web bundle. Any sensitive text, media inventory, or gatekeeping material shipped in client assets should be treated as public.
- **Browser to API boundary** -- `/api/auth/*` and `/api/private/*` requests cross from an untrusted client into trusted backend code. All authentication and authorization decisions must be enforced server-side.
- **API to private filesystem boundary** -- `artifacts/api-server/private/` stores protected media and `content.json`. File-serving code on this boundary must prevent path traversal, cache leakage, and unauthenticated access.
- **Production to dev-only boundary** -- `artifacts/mockup-sandbox`, `scripts/`, and codegen/spec tooling are not production surfaces unless explicitly wired into deployment.

## Scan Anchors

- **Production entry points**: `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/auth.ts`, `artifacts/api-server/src/routes/private.ts`, `artifacts/nafsam/src/App.tsx`
- **Highest-risk code areas**: `artifacts/api-server/src/routes/auth.ts`, `artifacts/api-server/src/lib/session.ts`, `artifacts/api-server/src/routes/private.ts`, `artifacts/nafsam/src/pages/Login.tsx`, `artifacts/nafsam/src/i18n/translations.ts`, `artifacts/nafsam/src/data/videosData.ts`, `artifacts/nafsam/src/data/allPhotos.ts`
- **Public surfaces**: the frontend bundle and static assets under `artifacts/nafsam/dist/public`, `/api/healthz`, and `/api/auth/*`
- **Intended authenticated surfaces**: `/api/private/*` and frontend routes such as `/home`, `/moments`, `/photos`, `/songs`, `/videos`, and `/writings`
- **Dev-only areas to usually ignore**: `artifacts/mockup-sandbox/`, `scripts/`, `lib/api-spec/`

## Threat Categories

### Spoofing

The server must fail closed if production authentication configuration is incomplete. Accepted login answers must come from deployment configuration rather than hardcoded fallbacks, and the application must not expose exact accepted answers or materially equivalent hints to unauthenticated visitors. Session cookies must remain signed with a production-only secret and validated on every protected request.

### Tampering

The browser is untrusted and can alter route state, requests, and asset URLs. Authorization decisions for protected memories must remain on the server, and file-serving code must continue to canonicalize user-influenced paths before reading from the private filesystem.

### Information Disclosure

Protected memories must not be exposed through public frontend bundles, logs, error responses, or cache policy. Sensitive text, media inventories, and intimate captions should only be delivered after successful authorization, and private media responses should not remain retrievable from browser cache after logout or session expiry if the archive is intended to stay private on shared devices.

### Elevation of Privilege

A visitor must not be able to promote themselves from unauthenticated to authenticated by exploiting insecure defaults, client-side route guards, or predictable asset URLs. Any future backend endpoints that expose archive data must enforce authorization server-side and must not rely on the frontend to pre-filter access.