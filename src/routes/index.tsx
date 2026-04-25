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
        <main className="min-h-screen bg-background text-foreground flex flex-col font-sans">
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
            <section className="px-6 py-24 md:py-32 max-w-2xl mx-auto text-center">
                <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-12">
                    № 01
                </div>
                <div className="font-display text-2xl md:text-4xl leading-[1.45] space-y-3">
                    <p>You know what you want before you even open Instamart.</p>
                    <p className="text-muted-foreground">
                        But it still takes 5 minutes to build the cart.
                    </p>
                    <p>
                        With <em>Laziggy</em>, you can do it in one message.
                    </p>
                </div>
            </section>

            {/* Manifesto pull-quote */}
            <section className="px-6 py-20 md:py-28 max-w-3xl mx-auto">
                <div className="relative">
                    <div
                        aria-hidden
                        className="absolute -top-10 md:-top-16 -left-2 font-display text-7xl md:text-9xl leading-none text-primary/20 select-none pointer-events-none"
                    >
                        &ldquo;
                    </div>
                    <div className="w-16 h-px bg-border mx-auto mb-10" />
                    <blockquote className="font-display italic font-medium text-3xl md:text-5xl lg:text-6xl leading-[1.15] text-center">
                        <p className="mb-4">We&rsquo;re not building a chatbot.</p>
                        <p>
                            We&rsquo;re building the lowest-effort path to a grocery order.
                        </p>
                    </blockquote>
                    <div className="w-16 h-px bg-border mx-auto mt-10" />
                    <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground text-center mt-6">
                        — Laziggy
                    </div>
                </div>
            </section>

            <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
                © Laziggy · Built for lazy brilliance
            </footer>
        </main>
    );
}
