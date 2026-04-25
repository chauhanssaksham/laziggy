export function meta() {
    return [
        { title: "Laziggy — Instamart, on WhatsApp" },
        {
            name: "description",
            content:
                "Tell Laziggy what you need. It builds the Instamart cart. You tap confirm. No app, no list, no scrolling.",
        },
    ];
}

import { Play, Check, CheckCheck, Mic } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "@/client/components/ui/Reveal";

// WhatsApp number in international format, no + or dashes.
// During beta this is the founder's personal WhatsApp — replies are manual
// until the bot is live. Swap to a Gupshup-managed business number once
// Builders Club access lands and the WhatsApp Business API is provisioned.
const WHATSAPP_NUMBER = "917835991160";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hey! Trying Laziggy.",
)}`;

// Inline WhatsApp logo (lucide doesn't ship brand icons). Single fill path,
// inherits color via currentColor.
function WhatsAppIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            aria-hidden="true"
        >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
    );
}

// ─── Layout primitives ──────────────────────────────────────────────────────

function Bubble({
    variant,
    children,
    className = "",
}: {
    variant: "in" | "out" | "system";
    children: ReactNode;
    className?: string;
}) {
    if (variant === "system") {
        return (
            <div
                className={`relative rounded-2xl border border-[color:var(--color-paper-2)] bg-[color:var(--color-paper-2)]/60 px-4 py-3 text-[color:var(--color-ink)] ${className}`}
            >
                {children}
            </div>
        );
    }

    if (variant === "out") {
        return (
            <div
                className={`relative rounded-3xl rounded-bl-md bg-[color:var(--color-moss)] text-[color:var(--color-paper)] px-5 py-3.5 bubble-shadow bubble-tail-out ${className}`}
            >
                {children}
            </div>
        );
    }

    return (
        <div
            className={`relative rounded-3xl rounded-br-md bg-[color:var(--color-chalk)] text-[color:var(--color-ink)] px-5 py-3.5 bubble-shadow bubble-tail-in ${className}`}
        >
            {children}
        </div>
    );
}

function MetaLine({ children }: { children: ReactNode }) {
    return (
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-3)] flex items-center gap-1.5">
            {children}
        </div>
    );
}

function SectionLabel({ children }: { children: ReactNode }) {
    return (
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink-3)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-saffron)]" />
            {children}
        </div>
    );
}

function WhatsAppCTA({
    label = "Try Laziggy now",
    size = "md",
}: {
    label?: string;
    size?: "md" | "lg";
}) {
    const sizing =
        size === "lg"
            ? "px-7 py-3.5 text-base gap-2.5"
            : "px-5 py-2.5 text-sm gap-2";
    return (
        <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center rounded-full bg-[color:var(--color-whatsapp)] hover:bg-[color:var(--color-whatsapp-hover)] text-white font-medium transition btn-glow ${sizing}`}
        >
            <WhatsAppIcon className={size === "lg" ? "w-[18px] h-[18px]" : "w-4 h-4"} />
            {label}
        </a>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function HomeIndex() {
    return (
        <main className="min-h-screen bg-[color:var(--color-paper)] text-[color:var(--color-ink)] font-sans relative overflow-hidden">
            {/* Paper grain overlay */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-multiply"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
            />

            {/* Nav */}
            <nav className="flex items-center justify-between px-6 md:px-10 py-6 max-w-[1200px] mx-auto w-full">
                <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[color:var(--color-whatsapp)] animate-pulse" />
                    <div className="font-display text-xl font-semibold tracking-tight">
                        Laziggy
                    </div>
                </div>
                <a
                    href="mailto:hello@laziggy.in"
                    className="font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink)] transition"
                >
                    hello@laziggy.in
                </a>
            </nav>

            {/* ─── Hero ──────────────────────────────────────────── */}
            <section className="px-6 md:px-10 pt-8 md:pt-16 pb-24 md:pb-32 max-w-[1200px] mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                    {/* Copy column — 7 cols, offset */}
                    <div className="lg:col-span-7 lg:pt-6">
                        <div
                            className="inline-flex items-center gap-2 mb-10 mount-fade-up-slow"
                            style={{ animationDelay: "350ms" }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-saffron)]" />
                            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-3)]">
                                Coming soon · Early access
                            </span>
                        </div>

                        <h1
                            className="font-display font-medium leading-[0.92] tracking-[-0.03em] mb-8 mount-fade-up-slow"
                            style={{
                                fontSize: "clamp(2.75rem, 8vw, 6.75rem)",
                                animationDelay: "950ms",
                            }}
                        >
                            Instamart
                            <br />
                            for the
                            <br />
                            <em className="italic font-medium">
                                <span className="lime-highlight">super lazy</span>
                                <span className="text-[color:var(--color-saffron)] not-italic">
                                    .
                                </span>
                            </em>
                        </h1>

                        <p
                            className="text-lg md:text-xl text-[color:var(--color-ink-2)] max-w-xl mb-10 leading-relaxed mount-fade-up-slow"
                            style={{ animationDelay: "1550ms" }}
                        >
                            Tell Laziggy what you want —{" "}
                            <em className="text-[color:var(--color-ink)]">
                                &ldquo;ingredients for biryani, kitchen towels, my usual
                                milk.&rdquo;
                            </em>{" "}
                            It builds the cart. You tap confirm. The lowest-effort grocery
                            order possible.
                        </p>

                        <div
                            className="mount-fade-up-slow inline-block"
                            style={{ animationDelay: "2150ms" }}
                        >
                            <WhatsAppCTA size="lg" />
                        </div>
                    </div>

                    {/* Chat thread column — 5 cols */}
                    <div className="lg:col-span-5 lg:pl-4">
                        <div className="relative max-w-[400px] mx-auto lg:mx-0 lg:ml-auto">
                            {/* Phone-frame-ish container, but no skeuomorphism */}
                            <div className="rounded-[28px] bg-[color:var(--color-paper-2)]/70 border border-[color:var(--color-brand-border)] p-5 md:p-6">
                                {/* Thread header */}
                                <div className="flex items-center justify-between mb-5 pb-4 border-b border-[color:var(--color-brand-border)]">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-[color:var(--color-moss)] flex items-center justify-center text-[color:var(--color-paper)] font-display font-semibold text-sm">
                                            L
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-[color:var(--color-ink)] leading-tight">
                                                Laziggy
                                            </div>
                                            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-whatsapp)]">
                                                online
                                            </div>
                                        </div>
                                    </div>
                                    <Play className="w-4 h-4 text-[color:var(--color-ink-3)] fill-[color:var(--color-ink-3)]" />
                                </div>

                                {/* Voice note bubble (inbound from user) */}
                                <div className="flex flex-col items-end gap-1 mb-4">
                                    <Bubble variant="in" className="min-w-[200px]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[color:var(--color-moss)] flex items-center justify-center text-[color:var(--color-paper)] flex-shrink-0">
                                                <Mic className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex-1 flex items-end gap-[2px] h-5">
                                                {[3, 7, 12, 9, 14, 10, 6, 11, 15, 8, 5, 9, 12, 7, 4].map(
                                                    (h, i) => (
                                                        <span
                                                            key={i}
                                                            className="w-[2px] rounded-full bg-[color:var(--color-ink-3)]"
                                                            style={{ height: `${h * 1.2}px` }}
                                                        />
                                                    ),
                                                )}
                                            </div>
                                            <span className="font-mono text-[10px] text-[color:var(--color-ink-3)]">
                                                0:14
                                            </span>
                                        </div>
                                    </Bubble>
                                    <MetaLine>
                                        9:42 <CheckCheck className="w-3 h-3 text-[color:var(--color-whatsapp)]" />
                                    </MetaLine>
                                </div>

                                {/* User text bubble */}
                                <div className="flex flex-col items-end gap-1 mb-5">
                                    <Bubble variant="in" className="max-w-[85%]">
                                        <p className="text-[15px] leading-snug font-display italic">
                                            ingredients for biryani, kitchen towels, my usual milk
                                        </p>
                                    </Bubble>
                                    <MetaLine>
                                        9:42 <CheckCheck className="w-3 h-3 text-[color:var(--color-whatsapp)]" />
                                    </MetaLine>
                                </div>

                                {/* Laziggy reply */}
                                <div className="flex flex-col items-start gap-1 mb-3">
                                    <Bubble variant="out" className="max-w-[88%]">
                                        <p className="text-[15px] leading-snug">
                                            On it. Cart in 22 seconds ↓
                                        </p>
                                    </Bubble>
                                </div>

                                {/* Cart preview (system) */}
                                <div className="flex flex-col items-start gap-1">
                                    <Bubble variant="system" className="w-full max-w-[88%]">
                                        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-3)] mb-2">
                                            Your cart · 11 items
                                        </div>
                                        <ul className="space-y-1.5 text-[13px] text-[color:var(--color-ink-2)]">
                                            {[
                                                ["Basmati rice (India Gate, 1kg)", "×1"],
                                                ["Chicken (curry-cut, 500g)", "×1"],
                                                ["Amul milk, full cream", "×2"],
                                                ["Kitchen towel roll", "×1"],
                                            ].map(([item, qty]) => (
                                                <li
                                                    key={item}
                                                    className="flex items-center justify-between gap-3"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Check className="w-3 h-3 text-[color:var(--color-moss)] flex-shrink-0" />
                                                        {item}
                                                    </span>
                                                    <span className="font-mono text-[10px] text-[color:var(--color-ink-3)]">
                                                        {qty}
                                                    </span>
                                                </li>
                                            ))}
                                            <li className="text-[12px] text-[color:var(--color-ink-3)] italic pt-1">
                                                + 7 more
                                            </li>
                                        </ul>
                                        <div className="mt-3 pt-3 border-t border-[color:var(--color-brand-border)] flex items-center justify-between">
                                            <span className="font-display text-base">Tap to confirm</span>
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-[color:var(--color-lime)] text-[color:var(--color-ink)] font-medium">
                                                ₹847
                                            </span>
                                        </div>
                                    </Bubble>
                                    <MetaLine>9:43 · via Swiggy Instamart</MetaLine>
                                </div>
                            </div>

                            {/* Hangs outside the card */}
                            <div className="absolute -top-3 -right-3 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[color:var(--color-ink)] text-[color:var(--color-paper)] font-mono text-[10px] uppercase tracking-[0.18em]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-lime)]" />
                                30-sec demo
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Insight (full-bleed dark moss) ─────────────────── */}
            <section className="bg-[color:var(--color-moss)] text-[color:var(--color-paper)] py-24 md:py-36">
                <div className="px-6 md:px-10 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-2">
                        <Reveal slow>
                            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-lime)] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-lime)]" />
                                01 · the insight
                            </div>
                        </Reveal>
                    </div>
                    <div className="lg:col-span-9 lg:col-start-4">
                        <Reveal slow>
                            <p
                                className="font-display font-medium leading-[1.05] tracking-[-0.02em] mb-12"
                                style={{ fontSize: "clamp(2rem, 5vw, 4.25rem)" }}
                            >
                                You know what you want{" "}
                                <em className="italic font-medium text-[color:var(--color-lime)]">
                                    before you even open
                                </em>{" "}
                                Instamart.
                            </p>
                        </Reveal>

                        <Reveal slow delay={320}>
                            <p className="font-display italic text-2xl md:text-3xl leading-snug text-[color:var(--color-paper)]/70 mb-12 pl-6 border-l-2 border-[color:var(--color-lime)]/60 max-w-2xl">
                                But it still takes{" "}
                                <span className="not-italic font-semibold text-[color:var(--color-paper)]">
                                    5 minutes
                                </span>{" "}
                                to build the cart.
                            </p>
                        </Reveal>

                        <Reveal slow delay={640}>
                            <p
                                className="font-display leading-[1.1] tracking-[-0.02em]"
                                style={{ fontSize: "clamp(1.75rem, 4vw, 3.25rem)" }}
                            >
                                With <em className="italic font-medium">Laziggy</em>, you
                                can do it in{" "}
                                <em className="italic font-medium text-[color:var(--color-lime)]">
                                    one message
                                </em>
                                .
                            </p>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ─── Manifesto (cream, big quote) ───────────────────── */}
            <section className="px-6 md:px-10 py-24 md:py-36 max-w-[1200px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-3">
                        <Reveal slow>
                            <SectionLabel>02 · the manifesto</SectionLabel>
                        </Reveal>
                    </div>

                    <div className="lg:col-span-9 lg:col-start-4">
                        <blockquote className="font-display tracking-[-0.02em]">
                            <Reveal slow>
                                <p
                                    className="leading-[1.08] mb-6"
                                    style={{ fontSize: "clamp(2.25rem, 6vw, 5rem)" }}
                                >
                                    We&rsquo;re not building a{" "}
                                    <span className="relative inline-block text-[color:var(--color-ink-3)]">
                                        <span>chatbot</span>
                                        <span
                                            aria-hidden
                                            className="absolute left-[-2%] right-[-2%] top-[55%] h-[5px] bg-[color:var(--color-lime)] rotate-[-2deg] origin-center rounded-full"
                                        />
                                    </span>
                                    .
                                </p>
                            </Reveal>
                            <Reveal slow delay={320}>
                                <p
                                    className="italic font-medium leading-[1.08]"
                                    style={{ fontSize: "clamp(2.25rem, 6vw, 5rem)" }}
                                >
                                    We&rsquo;re building the lowest-effort path to a grocery
                                    order.
                                </p>
                            </Reveal>
                        </blockquote>

                        <Reveal slow delay={640}>
                            <div className="mt-12 flex items-center gap-3">
                                <span className="w-10 h-px bg-[color:var(--color-ink-3)]" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--color-ink-3)]">
                                    Laziggy
                                </span>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ─── Three steps (chat-bubble alternating) ──────────── */}
            <section className="px-6 md:px-10 py-24 md:py-32 max-w-[1200px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
                    <div className="lg:col-span-3">
                        <Reveal slow>
                            <SectionLabel>03 · how it works</SectionLabel>
                        </Reveal>
                    </div>
                    <div className="lg:col-span-9 lg:col-start-4">
                        <Reveal slow>
                            <p
                                className="font-display leading-[1.05] tracking-[-0.02em]"
                                style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
                            >
                                Three steps. None of them you.
                            </p>
                        </Reveal>
                    </div>
                </div>

                <div className="space-y-10 md:space-y-14 max-w-[860px] mx-auto">
                    {[
                        {
                            n: "01",
                            head: "Send a message.",
                            body: 'Type or talk. "Milk, pasta, the usual snacks." No formatting.',
                            side: "in" as const,
                        },
                        {
                            n: "02",
                            head: "The cart appears.",
                            body: "Right brands. Right quantities. Under a minute.",
                            side: "out" as const,
                        },
                        {
                            n: "03",
                            head: "Tap confirm.",
                            body: "One tap. Native Swiggy checkout. No app to install.",
                            side: "in" as const,
                        },
                    ].map((step, i) => (
                        <Reveal key={step.n} slow delay={i * 320}>
                            <div
                                className={`flex items-start gap-5 md:gap-8 ${
                                    step.side === "out" ? "md:flex-row-reverse md:text-right" : ""
                                }`}
                            >
                                <div className="flex-shrink-0 font-display font-medium text-[color:var(--color-saffron)] text-4xl md:text-5xl leading-none w-14 md:w-16">
                                    {step.n}
                                </div>
                                <div
                                    className={`flex-1 max-w-[640px] ${
                                        step.side === "out" ? "md:ml-auto" : ""
                                    }`}
                                >
                                    <Bubble
                                        variant={step.side}
                                        className="inline-block max-w-full"
                                    >
                                        <h3 className="font-display text-2xl md:text-3xl leading-tight mb-1.5 italic font-medium">
                                            {step.head}
                                        </h3>
                                        <p
                                            className={`text-base md:text-lg leading-relaxed ${
                                                step.side === "out"
                                                    ? "text-[color:var(--color-paper)]/80"
                                                    : "text-[color:var(--color-ink-2)]"
                                            }`}
                                        >
                                            {step.body}
                                        </p>
                                    </Bubble>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* ─── Final CTA (full-bleed dark moss) ───────────────── */}
            <section className="bg-[color:var(--color-moss)] text-[color:var(--color-paper)] py-28 md:py-40 relative overflow-hidden">
                {/* Subtle lime arc in the background */}
                <div
                    aria-hidden
                    className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-[color:var(--color-moss-2)]/50 blur-3xl"
                />
                <div className="px-6 md:px-10 max-w-[1100px] mx-auto relative">
                    <Reveal slow>
                        <h2
                            className="font-display leading-[0.95] tracking-[-0.03em]"
                            style={{ fontSize: "clamp(2.75rem, 8vw, 6.5rem)" }}
                        >
                            Stop searching.
                        </h2>
                    </Reveal>
                    <Reveal slow delay={320}>
                        <h2
                            className="font-display italic font-medium leading-[0.95] tracking-[-0.03em] mt-1"
                            style={{ fontSize: "clamp(2.75rem, 8vw, 6.5rem)" }}
                        >
                            Just message{" "}
                            <span className="text-[color:var(--color-lime)]">Laziggy</span>
                            <span className="text-[color:var(--color-lime)] not-italic">
                                .
                            </span>
                        </h2>
                    </Reveal>

                    <Reveal slow delay={640}>
                        <div className="mt-12 md:mt-14 flex items-center gap-5">
                            <span
                                aria-hidden
                                className="hidden md:block w-12 h-px bg-[color:var(--color-lime)]/60"
                            />
                            <WhatsAppCTA size="lg" />
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 md:px-10 py-8 max-w-[1200px] mx-auto w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-3)]">
                    © Laziggy · Built for lazy brilliance
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-3)] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-whatsapp)]" />
                    powered by Swiggy Instamart
                </div>
            </footer>
        </main>
    );
}
