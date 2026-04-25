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

import { Play } from "lucide-react";

export default function HomeIndex() {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col font-sans relative">
            {/* Paper grain overlay — adds subtle texture to the cream background */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 z-[60] opacity-[0.04] mix-blend-multiply"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
            />

            <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
                <div className="text-xl font-display font-semibold tracking-tight">Laziggy</div>
                <a
                    href="mailto:hello@laziggy.in"
                    className="text-sm text-muted-foreground hover:text-foreground transition"
                >
                    hello@laziggy.in
                </a>
            </nav>

            <section className="flex-1 flex items-center px-6 py-16 max-w-6xl mx-auto w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-12 md:gap-16 w-full">
                    {/* Copy column */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-8 px-3 py-1 rounded-full border border-border">
                            Coming soon · Early access
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-medium leading-[1.05] mb-6">
                            Instamart for the
                            <br />
                            <span className="text-gradient">super lazy.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0 mb-10 leading-relaxed">
                            Tell Laziggy what you want —{" "}
                            <em>
                                &ldquo;ingredients for biryani, kitchen towels, my usual
                                milk.&rdquo;
                            </em>{" "}
                            It builds the cart. You tap confirm. The lowest-effort grocery
                            order possible.
                        </p>

                        <form
                            className="w-full max-w-md mx-auto md:mx-0 flex flex-col sm:flex-row gap-2"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <input
                                type="email"
                                required
                                placeholder="you@example.com"
                                className="flex-1 px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
                            >
                                Get early access
                            </button>
                        </form>

                        <p className="text-xs text-muted-foreground mt-4">
                            First 500 sign-ups get lifetime free access. No spam.
                        </p>
                    </div>

                    {/* Demo video placeholder — replace with <video> once recorded */}
                    <div className="w-full max-w-[280px] mx-auto md:mx-0 md:flex-shrink-0">
                        <div
                            className="relative rounded-2xl overflow-hidden card-glow bg-gradient-brand-subtle border border-border"
                            style={{ aspectRatio: "9 / 16" }}
                        >
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
                                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center btn-glow">
                                    <Play className="w-7 h-7 text-primary-foreground fill-primary-foreground ml-0.5" />
                                </div>
                                <div className="text-center">
                                    <div className="text-foreground font-medium mb-1">Watch the demo</div>
                                    <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                                        30 sec · coming this week
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* № 01 — The insight */}
            <section className="relative px-6 py-32 md:py-40 max-w-5xl mx-auto overflow-hidden">
                {/* Ghost "5" — huge editorial numeral floating in the background */}
                <div
                    aria-hidden
                    className="absolute -right-8 md:-right-16 top-1/2 -translate-y-1/2 font-display italic font-medium leading-none pointer-events-none select-none"
                    style={{
                        fontSize: "clamp(20rem, 50vw, 40rem)",
                        color: "color-mix(in srgb, var(--color-brand-accent) 6%, transparent)",
                    }}
                >
                    5
                </div>

                <div className="relative max-w-2xl">
                    <div className="flex items-center gap-3 mb-12">
                        <span className="w-10 h-px bg-primary" />
                        <span className="text-[11px] uppercase tracking-[0.32em] text-primary font-medium">
                            № 01
                        </span>
                    </div>

                    <p className="font-display text-3xl md:text-5xl leading-[1.15] tracking-tight mb-12">
                        You know what you want before you{" "}
                        <em className="text-primary not-italic font-medium">even</em>{" "}
                        open Instamart.
                    </p>

                    <p className="font-display italic text-xl md:text-2xl text-muted-foreground leading-relaxed mb-12 pl-6 border-l-2 border-primary/30">
                        But it still takes{" "}
                        <span className="not-italic font-semibold text-foreground tracking-tight">
                            5 minutes
                        </span>{" "}
                        to build the cart.
                    </p>

                    <p className="font-display text-2xl md:text-4xl leading-[1.2]">
                        With{" "}
                        <em className="text-primary font-medium">Laziggy</em>, you
                        can do it in <em className="font-medium">one message</em>.
                    </p>
                </div>
            </section>

            {/* Manifesto pull-quote */}
            <section className="px-6 py-24 md:py-32 max-w-5xl mx-auto">
                <div className="relative pl-8 md:pl-14 border-l border-primary/40">
                    <div className="flex items-center gap-3 mb-10">
                        <span className="text-[11px] uppercase tracking-[0.32em] text-primary font-medium">
                            The manifesto
                        </span>
                        <span className="text-primary/60 text-lg leading-none">❦</span>
                    </div>

                    <blockquote className="font-display text-3xl md:text-5xl lg:text-6xl leading-[1.12] tracking-tight">
                        <p className="mb-6">
                            We&rsquo;re not building a{" "}
                            <span className="relative inline-block text-muted-foreground">
                                <span>chatbot</span>
                                <span
                                    aria-hidden
                                    className="absolute left-0 right-0 top-[55%] h-[3px] bg-primary/70 rotate-[-2deg] origin-center"
                                />
                            </span>
                            .
                        </p>
                        <p className="italic font-medium">
                            We&rsquo;re building the lowest-effort path to a grocery order.
                        </p>
                    </blockquote>

                    <div className="mt-12 flex items-center gap-3">
                        <span className="w-10 h-px bg-border" />
                        <span className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                            Laziggy
                        </span>
                    </div>
                </div>
            </section>

            <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
                © Laziggy · Built for lazy brilliance
            </footer>
        </main>
    );
}
