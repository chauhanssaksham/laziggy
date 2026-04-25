# Project: Laziggy

> **Instamart for the super lazy.**
> One WhatsApp message. Curated cart. Tap confirm.

---

## The thesis

Swiggy Instamart is the rare app where users already know what they want before they open it. They're not browsing for inspiration — the fridge is empty, a recipe is planned, the daily restock is overdue. They open Instamart with **intent already in their head**.

But translating that intent into a cart still takes 4–5 minutes of search-find-add-repeat. Item by item. Brand by brand. Quantity by quantity. The thinking was already done; the *typing* is the friction.

**Laziggy collapses that translation step.** A user sends a single WhatsApp message — *"ingredients for biryani, kitchen towels, my usual milk"* — and an LLM-driven agent resolves the intents into SKUs, composes the cart via the Swiggy Instamart MCP, and hands back a curated cart for one-tap confirmation. The order completes through native Swiggy checkout.

The same cart, in 30 seconds instead of 5 minutes.

## Why this matters (the founding bet)

Humans default to whichever interface takes the least effort to achieve a goal. Once a 30-second path exists, the 5-minute one is abandoned — the same way Uber didn't beat taxis on price, it beat them on the friction of hailing.

Once the WhatsApp habit forms, users stop opening the Instamart app for restocks at all. They just text Laziggy.

## The manifesto

> *We're not building a chatbot. We're building the lowest-effort path to a grocery order.*

Everything in the product, the copy, and the design follows this. If a feature adds friction to the path between intent and confirmed cart, it doesn't ship. If it removes friction, it does.

---

## Target user

High-earning professionals in Bangalore and Hyderabad — the kind who don't bother checking the price of a ₹200 SKU before adding it. Time-constrained, decision-saturated, already heavy users of Instamart. They want orders done and gone. Voice messages drop the input cost further (15 seconds, eyes-free, on the walk from the Uber to the door).

Secondary users will follow as the channel matures, but every product decision is anchored to this primary archetype during the launch window.

---

## How the product works

Three steps, surfaced in WhatsApp:

1. **Send a message.** Type or talk. *"Milk, pasta, the usual snacks."* No formatting, no app to install.
2. **The cart appears.** The agent runs a tool-use loop over the Swiggy Instamart MCP — `search_products` → pick the best SKU (biased by stored brand preferences) → `update_cart` — until the full cart is composed or clarification is needed. Right brands, right quantities, under a minute.
3. **Tap confirm.** One tap. Native Swiggy checkout — Laziggy never touches cards or UPI. Order placed.

### Memory is the second hook

Laziggy remembers brand preferences (Amul vs. Mother Dairy), recurring purchases (the daily chocolate, the Friday cigarettes), and dietary defaults. Future orders complete with progressively less friction — and the agent can softly suggest items the user usually buys but forgot to mention, with explicit confirmation.

### Voice messages

WhatsApp voice notes are transcribed server-side. Lowers input effort to 15 seconds, hands-free.

---

## Why this benefits Swiggy

Three direct upsides. These are the lines that should appear in any pitch to Swiggy product, partnership, or business teams.

1. **AOV uplift.** Recipe-style and bulk intents — *"ingredients for biryani"*, *"weekly restock"*, *"everything for a dinner party of four"* — surface 8–15 SKUs from a single message vs. the typical 4–6 in a manual cart. Bigger baskets, no extra ad spend.

2. **Subtle private-label placement.** When a user says *"paneer"*, Laziggy can default to Swiggy's in-house brands (Noice, Supersonic) and ask before substituting. The user retains agency; the default tilts toward Swiggy's margin.

3. **Customer acquisition from Blinkit and Zepto.** Once the WhatsApp habit forms, switching cost rises sharply — the channel is no longer *"an app to download"* but *"a number that knows me."* Laziggy operates exclusively on Swiggy Instamart; users who adopt Laziggy lock into Swiggy's rails.

### Why this is a product, not a feature Swiggy should build internally

Swiggy could ship an in-app chatbot tomorrow. But users won't open the app if a faster path exists outside it — and WhatsApp is the faster path because it's already open. The channel is the moat; the interface is the product.

---

## Current state (April 2026)

- **Landing page is live** at `https://laziggy.in` — copy locked, design in iteration.
- **WhatsApp CTA is wired** to the founder's personal number (`+91 7835 991 160`) for the Wizard-of-Oz beta. Replies are manual until the bot is automated.
- **Swiggy Builders Club application is submitted** — awaiting MCP credentials. Once granted, the bot can move from manual to automated.
- **Demo video is the next visible gap** on the landing page (placeholder slot in the hero, vertical 9:16, ~30 seconds).

### Pre-launch open work

- Apple moonlighting clause review (founder is currently employed at Apple) — blocks any public Twitter/Instagram posting under the founder's identity until cleared.
- Gupshup BSP account + WhatsApp Business number registration (start in parallel with Builders Club wait).
- Cart-curation prompt iteration with mock SKU data, ahead of MCP access.

---

## Code architecture: server / shared / client

The `src/` directory is split into three top-level layers with strict import boundaries enforced by ESLint:

- **`src/server/`** — Server-only code (infra, middleware, future MCP client + agent). Cannot be imported from client code.
- **`src/shared/`** — Isomorphic types, schemas, pure logic. Importable from anywhere.
- **`src/client/`** — React components, hooks, browser-only utilities. Cannot be imported from server code.

See `.claude/coding-standards.md` (gitignored, lives on disk) for full rules.

## Routes

- `/` — landing page (`src/routes/index.tsx`)
- `/auth/swiggy/callback` — OAuth callback placeholder (`src/routes/auth.swiggy.callback.tsx`)

## Tech stack

- **Framework:** React Router 7 (Framework mode)
- **Hosting:** Vercel (preview + production deploys via GitHub integration)
- **Observability:** PostHog (client + server), Pino server logs, AsyncLocalStorage-backed request context, HTTP metrics middleware
- **Data (future):** Supabase (Postgres, RLS, encrypted at rest) for user preferences and conversation state once the bot ships
- **LLM (future):** Gemini 3 Pro / Claude for intent parsing and structured tool calls into the Swiggy Instamart MCP

## Infrastructure scaffolding

The repo ships with foundations that will be needed once the bot lands:

- Logger / metrics / exception sinks with PostHog backends
- Request context via AsyncLocalStorage (Spring `ThreadLocal` equivalent), three-ID correlation (distinctId / sessionId / requestId)
- Typed error hierarchy (`AppError` + subclasses)
- TTL + instrumented cache, storage upload helpers, geo utilities
- Config provider with env + Supabase property sources
- shadcn UI primitives (Button, Card, Select)

## Environment variables

```
VITE_SUPABASE_URL=...
SUPABASE_SECRETKEY=...
VITE_POSTHOG_KEY=...
VITE_POSTHOG_HOST=...
```

---

## Voice and tone (for any copy that ships on the public site)

- **Owns "lazy" without apology.** It's the brand promise, not a confession.
- **Specific over abstract.** *"My usual milk"* beats *"personalized preferences."* *"4–5 minutes"* beats *"too long."*
- **Plain-language insights, not jargon.** *"You know what you want before you even open Instamart"* — felt by users, quotable by PMs.
- **Declarative, no hedging.** *"Once that path exists, the longer one is abandoned"* — not *"we hope users will…"*
- **Sentences that sound like a friend texting**, not a marketing team.

If a sentence wouldn't land in a real conversation, it doesn't land here.

## What we deliberately don't ship

- *"AI-powered"*, *"revolutionary"*, *"game-changing"* in any heading.
- Generic SaaS gradient meshes, stock illustrations, or app-store-style mockups.
- Cookie banners or chat-widget intercepts.
- Multi-platform branching ("works on Blinkit + Zepto + Instamart") — focus is the product, expansion is later.
- Pricing copy until pricing is decided. Right now there is no pricing — the beta is free and personal.
