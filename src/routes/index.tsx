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
                                &ldquo;milk, pasta, ingredients for a burger, and my usual
                                ice-cream.&rdquo;
                            </em>{" "}
                            It curates the cart. You tap confirm. No app, no list, no scrolling.
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

            <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
                © Laziggy · Built for lazy brilliance
            </footer>
        </main>
    );
}
