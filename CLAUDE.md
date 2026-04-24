# Project: Laziggy

## What This Is

Laziggy is a WhatsApp-native Instamart ordering agent for people who know what they want but hate building carts one SKU at a time.

Users describe intent in natural language — *"milk, pasta, ingredients for a burger, and something for roaches"* — and Laziggy resolves intents to SKUs, curates an Instamart cart, and places the order after user confirmation. All inside a WhatsApp thread.

**Focus:** Instamart only. Not Food, not Dineout. Instamart is intent-driven (users know what they need); chat UX collapses intent into one message. Food is discovery-driven and a poor fit for this interaction model.

## Current State

This repo currently hosts the **landing page only** (`laziggy.in`). The WhatsApp bot backend will live here or in a sibling package once Swiggy Builders Club access is approved.

## Tech Stack

- **Framework:** React Router 7 (Framework mode)
- **Styling:** Tailwind v4
- **Deployment:** Vercel
- **Observability:** PostHog (client + server), Pino server logs
- **Data (future):** Supabase for waitlist + user state

## Code Architecture: server / shared / client

The `src/` directory is split into three top-level layers with strict import boundaries enforced by ESLint:

- **`src/server/`** — Server-only code (infra, middleware). Cannot be imported from client.
- **`src/shared/`** — Isomorphic types, schemas, pure logic. Importable from anywhere.
- **`src/client/`** — React components, hooks, browser-only utilities. Cannot be imported from server code.

See `.claude/coding-standards.md` for full rules.

## Infrastructure

- **Observability:** logger / metrics / exception sinks with PostHog backends, request context via AsyncLocalStorage, HTTP metrics middleware, distinct-id propagation across client/server (see `DOCS/observability-and-error-handling.md`).
- **Infra:** Supabase client scaffolding, TTL + instrumented cache, storage upload helpers, geo utilities, config provider (env + Supabase property sources).
- **Shared lib:** error class hierarchy (`AppError`), format utilities, i18n scaffolding, object helpers, MIME types, constants.
- **UI primitives:** shadcn Button/Card/Select, CopyButton, VercelOptimizedImage.

## Routes

- `/` — landing page (`routes/index.tsx`)

## Environment Variables

```
VITE_SUPABASE_URL=...
SUPABASE_SECRET_KEY=...
VITE_POSTHOG_KEY=...
VITE_POSTHOG_HOST=...
```

## Next Steps (Post-Launch of Landing)

1. Submit Swiggy Builders Club application with `laziggy.in` live.
2. Embed demo video (Figma-mocked WhatsApp conversation → cart → confirm flow).
3. Wire waitlist email form to Supabase once launched.
4. Once Builders Club keys arrive: scaffold WhatsApp webhook route, Gupshup BSP integration, Swiggy Instamart MCP client.
