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

            <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-10 px-3 py-1 rounded-full border border-border">
                    Coming soon · Early access
                </div>

                <h1 className="text-5xl md:text-7xl font-display font-medium leading-[1.05] mb-6">
                    Instamart,
                    <br />
                    <span className="text-gradient">on WhatsApp.</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
                    Tell Laziggy what you want —{" "}
                    <em>
                        &ldquo;milk, pasta, ingredients for a burger, and something for
                        roaches.&rdquo;
                    </em>{" "}
                    It curates the cart. You tap confirm. No app, no list, no scrolling.
                </p>

                <form
                    className="w-full max-w-md flex flex-col sm:flex-row gap-2"
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
                    No spam. One email when we launch.
                </p>
            </section>

            <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
                © Laziggy · Built for lazy brilliance
            </footer>
        </main>
    );
}
