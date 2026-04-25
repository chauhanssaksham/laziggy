import { useEffect, useRef, type ReactNode } from "react";

type Props = {
    children: ReactNode;
    delay?: number;
    className?: string;
};

/**
 * Wraps children in a scroll-triggered fade-up reveal.
 *
 * - Server-side: renders fully visible (no flash for no-JS users).
 * - On client mount: data-reveal="pending" is set, hiding it with CSS.
 * - When scrolled into view: data-reveal="visible" triggers the transition.
 * - Honors prefers-reduced-motion (skip animation entirely).
 *
 * Animation is CSS-driven; this component only flips the data attribute.
 * Styles live in index.css under [data-reveal="pending"] / [data-reveal="visible"].
 */
export function Reveal({ children, delay = 0, className = "" }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Don't animate if user prefers reduced motion.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        // Set pending state on hydration only — server-rendered HTML stays visible
        // for no-JS users; once JS runs, the IntersectionObserver flips it visible
        // when the element enters the viewport.
        el.dataset.reveal = "pending";

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        (entry.target as HTMLElement).dataset.reveal = "visible";
                        observer.unobserve(entry.target);
                    }
                }
            },
            { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={className} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
}
