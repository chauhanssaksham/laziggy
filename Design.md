# Laziggy Design System

> **Editorial, with a chat bubble in its pocket.**
> The product is a conversation. The site should feel like one too — but the kind of conversation that gets quoted in a magazine.

---

## Design philosophy

Laziggy lives inside WhatsApp. The landing page is the *only* surface where we get to set tone before users hand the product 30 seconds of attention. So it has to do two things at once:

1. **Feel like a real opinion**, not a SaaS template. Editorial weight, big type, asymmetric composition, a strong point of view about effort and laziness.
2. **Feel like a chat**, because that's what the product is. Chat bubbles aren't decoration — they're the layout primitive that recurs through hero, steps, and CTA.

Anti-references (what we are not):
- Glassmorphism, gradient meshes, generic AI-product hero layouts.
- Centered everything. Card-grid feature lists. "Trusted by" logo bars.
- Stock 3D blobs, isometric phones, app-store mockup frames.

References (the energy):
- New York Magazine cover typography.
- A WhatsApp thread you'd screenshot and send to a friend.
- A handwritten grocery list pinned to a fridge.

---

## Color system

A two-key palette (paper + ink) with three accent roles. Restraint is the point.

### Core

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#F2EEE5` | Default page background. Warm cream, just off-white. |
| `--paper-2` | `#E8E2D5` | Inset surfaces, dividers, soft cards. |
| `--ink` | `#0E0E0C` | Primary text. Near-black, slightly warm. |
| `--ink-2` | `#3A3833` | Secondary text. |
| `--ink-3` | `#7A766E` | Tertiary / metadata. |
| `--chalk` | `#FFFFFF` | Chat bubble fills, pure white surfaces inside dark sections. |

### Accents

| Token | Hex | Role |
|---|---|---|
| `--moss` | `#0E3B2C` | Deep editorial green. Used for hero dark blocks, manifesto section, accent type. **The brand color.** |
| `--moss-2` | `#1A5740` | Hover / lighter moss. |
| `--lime` | `#D8F26A` | Bright "fresh produce" highlight. Used sparingly — pull-quotes, key emphasis spans, the in-bubble cart highlight. |
| `--whatsapp` | `#25D366` | **Only** on the WhatsApp CTA button. Nowhere else. Brand recognition is the point. |
| `--saffron` | `#E89B4C` | Warm accent for occasional emphasis (numerals, dot motifs). Use rarely. |

### Why these choices

- **Moss, not WhatsApp green, as the brand color.** WhatsApp green at scale reads as messaging-app skin. Moss reads as considered. We borrow the *family* (green) for psychological continuity but pick a hue that belongs in a magazine, not a chat app. The actual WhatsApp green is reserved exclusively for the CTA — when you see it, you know what it does.
- **Lime as a single accent.** One bright color, used in 3–4 places total, becomes a signature. Spread it everywhere and it becomes noise.
- **Cream paper, not white.** White is hospital. Cream is fridge-magnet, paperback-novel, friend's-kitchen.

---

## Typography

Two typefaces. One mono for chat metadata.

| Family | Role |
|---|---|
| **Fraunces** (variable, opsz 9–144) | Display headings, pull-quotes, anything that's *art*. Use the optical-size axis aggressively — large headings get high opsz for the "fancy" cuts, small italics get low opsz for warmth. |
| **Inter** | Body, UI, navigation, captions. |
| **JetBrains Mono** | Chat metadata, timestamps, "voice note 0:14", section labels with a dot prefix. Used for *texture*, not for code. |

### Type scale

| Use | Class | Notes |
|---|---|---|
| Hero headline | `text-[clamp(3rem,9vw,7.5rem)]` Fraunces 500, `tracking-[-0.03em]`, leading 0.92 | Massive. Set tight. |
| Section headline | `text-[clamp(2rem,5vw,4.5rem)]` Fraunces 500 | Editorial weight. |
| Pull-quote | Fraunces italic, 500–600, leading 1.1 | Used in manifesto + transitions. |
| Body large | `text-lg md:text-xl` Inter 400 | Hero subhead. |
| Body | `text-base` Inter 400 | Default. |
| Meta / label | `text-[11px] uppercase tracking-[0.18em]` Inter 500 OR JetBrains Mono | Section markers, chat timestamps. |

### Italic discipline

Italics are emphasis, not decoration. Italicize *user voice* — `"my usual milk"`, `"ingredients for biryani"` — and *manifesto verbs*. Don't italicize headings just to look pretty.

---

## The chat-bubble primitive

This is the recurring structural element. Three variants:

1. **Inbound (user → Laziggy).** White fill (`--chalk`), ink text, rounded-3xl with a tail on the *right* edge. Cast a soft shadow.
2. **Outbound (Laziggy → user).** Moss fill (`--moss`), paper text, rounded-3xl with a tail on the *left* edge.
3. **System / cart preview.** Paper-2 fill, ink text, rounded-2xl, no tail. Used for the "your cart is ready" inline preview.

Tails: a pure CSS triangle absolutely positioned on the bottom corner. Don't fake with SVG.

Bubbles wrap content; they're not just background. A pull-quote can *be* a chat bubble. The hero demo is a stack of bubbles. The three steps are bubbles in alternating alignment. The CTA card is a bubble.

---

## Layout principles

- **Asymmetric.** Default to a 12-column grid where content lives in 7–8 columns offset, not 12 columns centered. Mobile collapses to single column with deliberate hangs (e.g., timestamp metadata floats outside the bubble).
- **Generous but not cavernous.** Section padding is `py-20 md:py-28`, not `py-40`. Editorial pages breathe but don't yawn.
- **Vertical rhythm by ratio, not by step.** Heading → body gap is always tighter than body → next-section gap. Use 8 / 16 / 32 / 64 / 96 px buckets.
- **Hard color blocks.** Use full-bleed dark moss sections as section breaks — like a magazine spread flipping from cream to dark and back. This replaces the need for divider lines.

---

## Motion

- Reveal-on-scroll fade-up stays (existing `Reveal` component is good).
- Chat bubbles can stagger in (50–80ms between bubbles in the hero stack).
- One subtle ambient motion: the WhatsApp CTA button has a soft glow pulse. **No other ambient animation.**
- Honor `prefers-reduced-motion` everywhere — already wired.

---

## Components

| Component | Purpose |
|---|---|
| `<Bubble variant="in" \| "out" \| "system">` | The layout primitive. |
| `<ChatTimestamp>` | Mono timestamp + read receipts. |
| `<SectionLabel>` | Mono dot-prefix label (`· the manifesto`). |
| `<WhatsAppCTA>` | The only green button on the site. |
| `<Reveal>` | Existing. Keep. |

---

## Voice as visual

Copy is locked, but the *display* of copy is part of the design:

- Quotes from the user (their own voice) appear in **white chat bubbles** in the hero, italic Fraunces.
- The manifesto "we're not building a chatbot" line — strike-through stays, but in lime instead of accent.
- The numerals in the three steps are big, saffron, hung in the margin (or floated) — like a magazine list.

---

## What we deliberately don't do

- No gradients on text. (The current copper text-gradient is removed.)
- No glow-pulse on anything except the WhatsApp CTA.
- No card grids. No feature trios in three even columns. Steps are vertical and staggered.
- No "as seen on" or "trusted by" rows. We have no logos to show and pretending otherwise is the SaaS smell.
- No emoji decorations in copy.
- No drop shadows on text. Single-layer, considered shadows on bubbles only.
