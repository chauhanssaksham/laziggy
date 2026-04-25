import type { Route } from "./+types/auth.swiggy.callback";

export function meta() {
    return [
        { title: "OAuth callback — Laziggy" },
        { name: "robots", content: "noindex" },
    ];
}

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    return {
        hasCode: url.searchParams.has("code"),
        hasError: url.searchParams.has("error"),
        error: url.searchParams.get("error_description") || url.searchParams.get("error"),
    };
}

export default function SwiggyOAuthCallback({ loaderData }: Route.ComponentProps) {
    return (
        <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 font-sans">
            <div className="max-w-md text-center">
                <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-8 px-3 py-1 rounded-full border border-border">
                    OAuth Callback
                </div>

                <h1 className="text-3xl md:text-4xl font-display font-medium mb-4">
                    {loaderData.hasError
                        ? "Something went wrong"
                        : loaderData.hasCode
                          ? "Almost there"
                          : "You're a little early"}
                </h1>

                <p className="text-muted-foreground leading-relaxed mb-8">
                    {loaderData.hasError ? (
                        <>
                            Swiggy returned an error during sign-in
                            {loaderData.error ? (
                                <>
                                    {": "}
                                    <code className="text-foreground">{loaderData.error}</code>
                                </>
                            ) : (
                                "."
                            )}{" "}
                            Try again from your WhatsApp thread, or reach out to{" "}
                            <a
                                href="mailto:hello@laziggy.in"
                                className="text-primary hover:underline"
                            >
                                hello@laziggy.in
                            </a>
                            .
                        </>
                    ) : loaderData.hasCode ? (
                        <>
                            We received your authorization. The bot integration isn't live yet —
                            you're seeing this because Swiggy redirected here, but the WhatsApp
                            agent isn't taking orders yet. We'll email you the moment it does.
                        </>
                    ) : (
                        <>
                            This page is the destination of Swiggy's OAuth handshake — it
                            doesn't do anything on its own. If you got here on purpose, the
                            bot isn't live yet.{" "}
                            <a href="/" className="text-primary hover:underline">
                                Head back to the main page
                            </a>{" "}
                            and join the waitlist.
                        </>
                    )}
                </p>

                <a
                    href="/"
                    className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
                >
                    Back to laziggy.in
                </a>
            </div>
        </main>
    );
}
