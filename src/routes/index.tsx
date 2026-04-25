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

                        <a
                            href={WHATSAPP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25d366] hover:bg-[#1ea356] text-white text-sm font-medium transition"
                        >
                            <WhatsAppIcon className="w-4 h-4" />
                            Try Laziggy now
                        </a>

                        <p className="text-xs text-muted-foreground mt-4">
                            Live in beta · real human replies
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

            {/* The insight */}
            <section className="px-6 py-32 md:py-40 max-w-5xl mx-auto">
                <div className="max-w-2xl">
                    <Reveal>
                        <p className="font-display text-3xl md:text-5xl leading-[1.15] tracking-tight mb-12">
                            You know what you want before you{" "}
                            <em className="text-primary not-italic font-medium">even</em>{" "}
                            open Instamart.
                        </p>
                    </Reveal>

                    <Reveal delay={180}>
                        <p className="font-display italic text-xl md:text-2xl text-muted-foreground leading-relaxed mb-12 pl-6 border-l-2 border-primary/30">
                            But it still takes{" "}
                            <span className="not-italic font-semibold text-foreground tracking-tight">
                                5 minutes
                            </span>{" "}
                            to build the cart.
                        </p>
                    </Reveal>

                    <Reveal delay={360}>
                        <p className="font-display text-2xl md:text-4xl leading-[1.2]">
                            With <em className="text-primary font-medium">Laziggy</em>, you
                            can do it in <em className="font-medium">one message</em>.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* Manifesto pull-quote */}
            <section className="px-6 py-24 md:py-32 max-w-5xl mx-auto">
                <div className="relative pl-8 md:pl-14 border-l border-primary/40">
                    <Reveal>
                        <div className="flex items-center gap-3 mb-10">
                            <span className="text-[11px] uppercase tracking-[0.32em] text-primary font-medium">
                                The manifesto
                            </span>
                            <span className="text-primary/60 text-lg leading-none">❦</span>
                        </div>
                    </Reveal>

                    <blockquote className="font-display text-3xl md:text-5xl lg:text-6xl leading-[1.12] tracking-tight">
                        <Reveal delay={180}>
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
                        </Reveal>
                        <Reveal delay={360}>
                            <p className="italic font-medium">
                                We&rsquo;re building the lowest-effort path to a grocery
                                order.
                            </p>
                        </Reveal>
                    </blockquote>

                    <Reveal delay={540}>
                        <div className="mt-12 flex items-center gap-3">
                            <span className="w-10 h-px bg-border" />
                            <span className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                                Laziggy
                            </span>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Three steps */}
            <section className="px-6 py-32 md:py-40 max-w-5xl mx-auto">
                <Reveal>
                    <div className="text-[11px] uppercase tracking-[0.32em] text-primary font-medium mb-14">
                        Three steps
                    </div>
                </Reveal>

                <div className="space-y-14 md:space-y-20 max-w-2xl">
                    <Reveal>
                        <div>
                            <h3 className="font-display text-2xl md:text-4xl leading-[1.2] mb-4">
                                1.{" "}
                                <em className="text-primary not-italic font-medium">
                                    Send a message.
                                </em>
                            </h3>
                            <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-display">
                                Type or talk.{" "}
                                <em>&ldquo;Milk, pasta, the usual snacks.&rdquo;</em> No
                                formatting.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={180}>
                        <div>
                            <h3 className="font-display text-2xl md:text-4xl leading-[1.2] mb-4">
                                2.{" "}
                                <em className="text-primary not-italic font-medium">
                                    The cart appears.
                                </em>
                            </h3>
                            <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-display">
                                Right brands. Right quantities. Under a minute.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={360}>
                        <div>
                            <h3 className="font-display text-2xl md:text-4xl leading-[1.2] mb-4">
                                3.{" "}
                                <em className="text-primary not-italic font-medium">
                                    Tap confirm.
                                </em>
                            </h3>
                            <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-display">
                                One tap. Native Swiggy checkout. No app to install.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-6 py-32 md:py-40 max-w-3xl mx-auto text-center">
                <Reveal>
                    <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
                        Stop searching.
                    </h2>
                </Reveal>
                <Reveal delay={180}>
                    <h2 className="font-display italic font-medium text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-primary mt-2">
                        Just message Laziggy.
                    </h2>
                </Reveal>

                <Reveal delay={360}>
                    <div className="mt-14">
                        <a
                            href={WHATSAPP_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#25d366] hover:bg-[#1ea356] text-white font-medium text-base transition"
                        >
                            <WhatsAppIcon className="w-[18px] h-[18px]" />
                            Try Laziggy now
                        </a>
                    </div>
                </Reveal>

                <Reveal delay={540}>
                    <p className="text-xs text-muted-foreground mt-4">
                        Live in beta · real human replies
                    </p>
                </Reveal>
            </section>

            <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
                © Laziggy · Built for lazy brilliance
            </footer>
        </main>
    );
}
