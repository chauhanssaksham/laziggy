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

import {
    Play,
    Check,
    CheckCheck,
    Mic,
    ArrowLeft,
    Phone,
    Video,
    MoreVertical,
    Smile,
    Paperclip,
    Camera,
    BadgeCheck,
    Pencil,
    X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
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
    variant = "whatsapp",
}: {
    label?: string;
    size?: "md" | "lg";
    /** Visual variant. `swiggy` swaps the green for Swiggy orange and drops
     *  the green pulse glow — used in the Builders Club address section. */
    variant?: "whatsapp" | "swiggy";
}) {
    const sizing =
        size === "lg"
            ? "px-7 py-3.5 text-base gap-2.5"
            : "px-5 py-2.5 text-sm gap-2";
    const colors =
        variant === "swiggy"
            ? "bg-[#FC8019] hover:bg-[#e08217]"
            : "bg-[color:var(--color-whatsapp)] hover:bg-[color:var(--color-whatsapp-hover)] btn-glow";
    return (
        <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center rounded-full text-white font-medium transition ${colors} ${sizing}`}
        >
            <WhatsAppIcon className={size === "lg" ? "w-[18px] h-[18px]" : "w-4 h-4"} />
            {label}
        </a>
    );
}

// ─── iPhone shell ──────────────────────────────────────────────────────────
//
// iPhone Pro-style frame. Renders any children inside the screen. Aspect ratio
// is locked to 9:19.5 (modern iPhone screen ratio) via the padding-bottom
// trick, which works reliably across browsers — the `aspect-ratio` CSS
// property is unreliable when flex children would otherwise push the box
// taller. Side buttons are positioned in % so they scale with the frame.

function IPhone({
    children,
    maxWidth = 300,
    scale = 1,
    className = "",
    screenStyle,
}: {
    children: ReactNode;
    /** Max rendered width in px. Height derives from the iPhone aspect ratio. */
    maxWidth?: number;
    /** Visual scale factor. Use this to shrink/grow the rendered phone without
     *  changing its internal proportions (text remains the right size relative
     *  to the phone). The layout box still reserves the un-scaled footprint. */
    scale?: number;
    className?: string;
    /** Inline style applied to the inner screen container — useful for setting
     *  font-family so it scopes to whatever the user puts on the screen. */
    screenStyle?: React.CSSProperties;
}) {
    return (
        <div
            className={`relative mx-auto ${className}`}
            style={{
                width: "100%",
                maxWidth: `${maxWidth}px`,
                transform: scale === 1 ? undefined : `scale(${scale})`,
                transformOrigin: "center",
            }}
        >
            {/* Outer titanium bezel */}
            <div
                className="relative rounded-[44px] p-[3px]"
                style={{
                    background:
                        "linear-gradient(145deg, #3a3a3c 0%, #1c1c1e 40%, #2c2c2e 100%)",
                    boxShadow:
                        "0 30px 60px -20px rgba(14,14,12,0.4), 0 12px 24px -10px rgba(14,14,12,0.25), inset 0 0 0 0.5px rgba(255,255,255,0.06)",
                }}
            >
                {/* Side buttons — positioned in % so they scale with the frame.
                    Anatomy: silenced switch + volume up + volume down on left,
                    sleep/wake on right (slightly lower than the volume rocker). */}
                <div
                    aria-hidden
                    className="absolute -left-[2px] w-[2px] rounded-l-sm"
                    style={{ background: "#1c1c1e", top: "13%", height: "3.2%" }}
                />
                <div
                    aria-hidden
                    className="absolute -left-[2px] w-[2px] rounded-l-sm"
                    style={{ background: "#1c1c1e", top: "19%", height: "5.5%" }}
                />
                <div
                    aria-hidden
                    className="absolute -left-[2px] w-[2px] rounded-l-sm"
                    style={{ background: "#1c1c1e", top: "26%", height: "5.5%" }}
                />
                <div
                    aria-hidden
                    className="absolute -right-[2px] w-[2px] rounded-r-sm"
                    style={{ background: "#1c1c1e", top: "20%", height: "8%" }}
                />

                {/* Inner screen — padding-bottom trick locks the aspect ratio
                    universally (Safari has flex+aspect-ratio bugs). */}
                <div
                    className="relative rounded-[40px] overflow-hidden bg-black"
                    style={{ paddingBottom: `${(19.5 / 9) * 100}%` }}
                >
                    <div
                        className="absolute inset-0 flex flex-col"
                        style={screenStyle}
                    >
                        {children}
                    </div>

                    {/* Dynamic Island — sits above content, on top of the screen. */}
                    <div
                        aria-hidden
                        className="absolute top-[1.4%] left-1/2 -translate-x-1/2 w-[34%] h-[3.5%] rounded-full bg-black z-30"
                        style={{ minHeight: "22px" }}
                    />
                </div>
            </div>
        </div>
    );
}

// ─── WhatsApp Business chat replica ────────────────────────────────────────
//
// Pixel-accurate replica of the modern (2023+) WhatsApp UI. Used as the hero
// demo so users immediately recognise the channel.
//
// Color reference (modern WhatsApp light theme):
//   header bg    #008069   (was #075E54 in the legacy theme)
//   chat bg      #EFEAE2   (with the doodle pattern)
//   outgoing     #D9FDD3   (pale mint, tail top-right)
//   incoming     #FFFFFF   (tail top-left)
//   read blue    #53BDEB   (double-tick when read)
//   meta text    #667781   (timestamps, statuses)
//   header text  #FFFFFF
//
// Font is system-ui to match what users actually see in WhatsApp on their
// own device. The chat is wrapped in `wa-root` to scope the font override.

const WA_OUTGOING = "#D9FDD3";
const WA_INCOMING = "#FFFFFF";

// The actual WhatsApp tail shape (extracted from WhatsApp Web's SVG).
function WaTail({ side, color }: { side: "left" | "right"; color: string }) {
    return (
        <svg
            width="8"
            height="13"
            viewBox="0 0 8 13"
            className="absolute top-0"
            style={{
                [side === "right" ? "right" : "left"]: "-7px",
                transform: side === "left" ? "scaleX(-1)" : undefined,
            }}
            aria-hidden
        >
            <path
                d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"
                fill={color}
            />
        </svg>
    );
}

function WaCheck({ read = true }: { read?: boolean }) {
    return (
        <CheckCheck
            className="w-[15px] h-[15px] flex-shrink-0"
            style={{ color: read ? "#53BDEB" : "#8696A0" }}
        />
    );
}

function WaMessage({
    side,
    children,
    time,
    read = true,
    tight = false,
    appearDelay,
}: {
    side: "in" | "out";
    children: ReactNode;
    time: string;
    read?: boolean;
    tight?: boolean;
    /** When set, the message starts hidden and pops in (WhatsApp style)
     *  after this many ms. Used to choreograph the hero chat sequence. */
    appearDelay?: number;
}) {
    const bg = side === "out" ? WA_OUTGOING : WA_INCOMING;
    const radius =
        side === "out"
            ? "rounded-[7.5px] rounded-tr-[0]"
            : "rounded-[7.5px] rounded-tl-[0]";
    return (
        <div
            className={`flex ${side === "out" ? "justify-end" : "justify-start"} ${appearDelay !== undefined ? "wa-appear" : ""}`}
            style={
                appearDelay !== undefined
                    ? { animationDelay: `${appearDelay}ms` }
                    : undefined
            }
        >
            <div
                className={`relative max-w-[88%] ${radius} ${tight ? "px-1.5 pt-1.5 pb-1" : "px-2 pt-1.5 pb-1"}`}
                style={{
                    background: bg,
                    boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)",
                }}
            >
                <WaTail side={side === "out" ? "right" : "left"} color={bg} />
                <div className="text-[14.2px] leading-[19px] text-[#111B21] pr-[54px]">
                    {children}
                </div>
                <div className="absolute right-[7px] bottom-[3px] flex items-center gap-1">
                    <span className="text-[11px] leading-[15px] text-[#667781]">
                        {time}
                    </span>
                    {side === "out" && <WaCheck read={read} />}
                </div>
            </div>
        </div>
    );
}

// WhatsApp typing indicator — incoming bubble with three pulsing dots.
// Shown before a Laziggy reply lands; mounts at `appearAt` and unmounts at
// `disappearAt` so the slot fully clears for the actual message. Driven by
// JS timers (not pure CSS) so the bubble truly leaves the layout instead of
// just fading — that way the next message takes its place cleanly.
function WaTyping({
    appearAt,
    disappearAt,
}: {
    appearAt: number;
    disappearAt: number;
}) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t1 = window.setTimeout(() => setVisible(true), appearAt);
        const t2 = window.setTimeout(() => setVisible(false), disappearAt);
        return () => {
            window.clearTimeout(t1);
            window.clearTimeout(t2);
        };
    }, [appearAt, disappearAt]);

    if (!visible) return null;

    return (
        <div className="flex justify-start wa-appear">
            <div
                className="relative rounded-[7.5px] rounded-tl-[0] px-3 py-2.5"
                style={{
                    background: WA_INCOMING,
                    boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)",
                }}
            >
                <WaTail side="left" color={WA_INCOMING} />
                <div className="flex items-center gap-1">
                    <span className="wa-typing-dot" style={{ animationDelay: "0s" }} />
                    <span
                        className="wa-typing-dot"
                        style={{ animationDelay: "0.2s" }}
                    />
                    <span
                        className="wa-typing-dot"
                        style={{ animationDelay: "0.4s" }}
                    />
                </div>
            </div>
        </div>
    );
}

// WhatsApp Business "Interactive Message" — body bubble + a divided stack
// of reply buttons rendered inside the same bubble container. This is a real
// WA Business pattern (max 3 reply buttons under text body / header).
type WaButton = {
    label: string;
    icon?: typeof Check;
};

function WaInteractive({
    side,
    body,
    buttons,
    time,
    read = true,
    appearDelay,
}: {
    side: "in" | "out";
    body: ReactNode;
    buttons: WaButton[];
    time: string;
    read?: boolean;
    appearDelay?: number;
}) {
    const bg = side === "out" ? WA_OUTGOING : WA_INCOMING;
    const radius =
        side === "out"
            ? "rounded-[7.5px] rounded-tr-[0]"
            : "rounded-[7.5px] rounded-tl-[0]";
    return (
        <div
            className={`flex ${side === "out" ? "justify-end" : "justify-start"} ${appearDelay !== undefined ? "wa-appear" : ""}`}
            style={
                appearDelay !== undefined
                    ? { animationDelay: `${appearDelay}ms` }
                    : undefined
            }
        >
            <div
                className={`relative max-w-[88%] overflow-hidden ${radius}`}
                style={{
                    background: bg,
                    boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)",
                }}
            >
                <WaTail side={side === "out" ? "right" : "left"} color={bg} />
                {/* Body */}
                <div className="px-2 pt-1.5 pb-1 text-[14.2px] leading-[19px] text-[#111B21]">
                    {body}
                    <div className="flex items-center justify-end gap-1 -mb-0.5 mt-0.5">
                        <span className="text-[11px] leading-[15px] text-[#667781]">
                            {time}
                        </span>
                        {side === "out" && <WaCheck read={read} />}
                    </div>
                </div>
                {/* Reply button stack */}
                <div className="bg-white">
                    {buttons.map((btn, i) => {
                        const Icon = btn.icon;
                        return (
                            <button
                                key={btn.label}
                                type="button"
                                className={`w-full flex items-center justify-center gap-1.5 py-2 text-[14px] font-medium ${i > 0 ? "border-t border-[#E9EDEF]" : ""}`}
                                style={{ color: "#00A884" }}
                            >
                                {Icon && (
                                    <Icon className="w-[15px] h-[15px]" strokeWidth={2.4} />
                                )}
                                {btn.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function WhatsAppDemo() {
    return (
        <IPhone
            maxWidth={300}
            scale={0.85}
            screenStyle={{
                fontFamily:
                    'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
        >
            {/* Status bar — wraps around the Dynamic Island */}
                    <div
                        className="relative flex items-center justify-between pt-[10px] pb-[4px] text-white text-[12px] font-semibold z-20"
                        style={{ background: "#008069" }}
                    >
                        <span className="pl-6 pr-2">9:41</span>
                        {/* spacer for the Dynamic Island */}
                        <span className="w-[100px] flex-shrink-0" />
                        <div className="flex items-center gap-1 pr-5 pl-2">
                            {/* signal */}
                            <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden>
                                <rect x="0" y="7" width="3" height="4" rx="0.5" />
                                <rect x="4.5" y="5" width="3" height="6" rx="0.5" />
                                <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" />
                                <rect x="13.5" y="0" width="3" height="11" rx="0.5" opacity="0.4" />
                            </svg>
                            {/* wifi */}
                            <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor" aria-hidden>
                                <path d="M7.5 1C4.7 1 2.2 2 .3 3.7l1.4 1.4C3.3 3.7 5.3 2.9 7.5 2.9s4.2.8 5.8 2.2l1.4-1.4C12.8 2 10.3 1 7.5 1zm0 3.5c-1.9 0-3.6.7-4.9 1.8l1.4 1.4c1-.8 2.2-1.3 3.5-1.3s2.5.5 3.5 1.3l1.4-1.4C11.1 5.2 9.4 4.5 7.5 4.5zm0 3.5c-1 0-1.9.4-2.6 1L7.5 11l2.6-2c-.7-.6-1.6-1-2.6-1z" />
                            </svg>
                            {/* battery */}
                            <svg width="25" height="11" viewBox="0 0 25 11" aria-hidden>
                                <rect x="0.5" y="0.5" width="22" height="10" rx="2.5" fill="none" stroke="currentColor" opacity="0.5" />
                                <rect x="2" y="2" width="19" height="7" rx="1" fill="currentColor" />
                                <rect x="23" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
                            </svg>
                        </div>
                    </div>

                    {/* Header bar */}
                <div
                    className="flex items-center gap-3 px-3 py-2.5 text-white"
                    style={{ background: "#008069" }}
                >
                    <ArrowLeft className="w-[22px] h-[22px] -mr-1" strokeWidth={2.2} />
                    <div className="w-10 h-10 rounded-full bg-[#DFE5E7] flex items-center justify-center text-[#008069] font-semibold text-[18px] flex-shrink-0">
                        L
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                            <span className="text-[16px] font-medium leading-tight truncate">
                                Laziggy
                            </span>
                            <BadgeCheck
                                className="w-[15px] h-[15px] flex-shrink-0"
                                fill="white"
                                style={{ color: "#008069" }}
                            />
                        </div>
                        <div className="text-[12.5px] leading-tight text-white/85">
                            online
                        </div>
                    </div>
                    <Video className="w-[22px] h-[22px]" strokeWidth={2} />
                    <Phone className="w-[19px] h-[19px]" strokeWidth={2.2} />
                    <MoreVertical className="w-[20px] h-[20px] -ml-1" strokeWidth={2} />
                </div>

                {/* Chat area with doodle background. min-h-0 lets the flex
                    child shrink so the iPhone aspect-ratio is preserved even
                    when content would otherwise push the screen taller. */}
                <div
                    className="relative px-3 py-3 space-y-1.5 flex-1 min-h-0 overflow-hidden"
                    style={{
                        background: "#EFEAE2",
                        backgroundImage:
                            "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='280' viewBox='0 0 280 280'%3E%3Cg fill='none' stroke='%23000' stroke-opacity='0.04' stroke-width='1.2'%3E%3Ccircle cx='40' cy='40' r='12'/%3E%3Cpath d='M70 30 q5 10 0 20 q-5 -10 0 -20z'/%3E%3Crect x='110' y='30' width='14' height='18' rx='1.5'/%3E%3Cpath d='M150 35 l8 -5 l8 5 v18 h-16z'/%3E%3Ccircle cx='200' cy='42' r='8'/%3E%3Cpath d='M225 30 c10 0 10 20 0 20 c-10 0 -10 -20 0 -20z'/%3E%3Cpath d='M30 90 q15 -8 30 0 t30 0'/%3E%3Cpath d='M115 85 l5 8 l-5 8 l-5 -8z'/%3E%3Ccircle cx='150' cy='95' r='6'/%3E%3Cpath d='M180 85 h20 v15 h-20z'/%3E%3Cpath d='M220 95 q-6 -8 0 -16 q6 8 0 16z'/%3E%3Ccircle cx='40' cy='150' r='10'/%3E%3Cpath d='M75 145 c0 -8 14 -8 14 0 c0 8 -14 8 -14 0z'/%3E%3Cpath d='M110 140 l10 0 l5 10 l-10 5 l-10 -5z'/%3E%3Ccircle cx='160' cy='150' r='7'/%3E%3Cpath d='M195 140 q10 5 0 20 q-10 -5 0 -20z'/%3E%3Cpath d='M230 145 h15 v12 h-15z'/%3E%3Cpath d='M30 200 q8 -10 16 0 t16 0'/%3E%3Ccircle cx='90' cy='205' r='8'/%3E%3Cpath d='M125 195 l8 10 l-8 10 l-8 -10z'/%3E%3Cpath d='M155 195 c10 0 10 20 0 20 c-10 0 -10 -20 0 -20z'/%3E%3Crect x='190' y='198' width='14' height='14' rx='2'/%3E%3Ccircle cx='235' cy='205' r='6'/%3E%3Cpath d='M50 250 q5 -8 10 0 q5 -8 10 0'/%3E%3Ccircle cx='110' cy='255' r='9'/%3E%3Cpath d='M150 248 l6 7 l-6 7 l-6 -7z'/%3E%3Cpath d='M185 248 h18 v14 h-18z'/%3E%3Cpath d='M225 255 q-8 -6 0 -14 q8 6 0 14z'/%3E%3C/g%3E%3C/svg%3E\")",
                        backgroundSize: "280px 280px",
                    }}
                >
                    {/* Date pill */}
                    <div className="flex justify-center pb-1.5">
                        <span
                            className="text-[12.5px] px-2.5 py-[3px] rounded-md text-[#54656F] font-medium"
                            style={{
                                background: "#FFFFFFCC",
                                boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)",
                            }}
                        >
                            TODAY
                        </span>
                    </div>

                    {/* Outgoing voice note */}
                    <WaMessage side="out" time="9:41" tight appearDelay={2800}>
                        <div className="flex items-center gap-2 py-0.5 min-w-[200px]">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-[#DFE5E7] flex items-center justify-center text-[#54656F] font-semibold text-[13px] flex-shrink-0">
                                    L
                                </div>
                                <Mic
                                    className="absolute -right-0.5 -bottom-0.5 w-3.5 h-3.5 p-0.5 rounded-full text-white"
                                    style={{ background: "#00A884" }}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <Play
                                        className="w-3.5 h-3.5 text-[#54656F] fill-[#54656F] flex-shrink-0"
                                    />
                                    <div className="flex-1 flex items-center h-1 rounded-full bg-[#B3BFC4] relative">
                                        <div
                                            className="absolute left-0 top-0 h-full rounded-full bg-[#54656F]"
                                            style={{ width: "0%" }}
                                        />
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
                                            style={{ background: "#00A884", left: "0%" }}
                                        />
                                    </div>
                                </div>
                                <div className="text-[10.5px] text-[#667781] mt-0.5">
                                    0:14
                                </div>
                            </div>
                        </div>
                    </WaMessage>

                    {/* Outgoing text */}
                    <WaMessage side="out" time="9:41" appearDelay={3700}>
                        can you place an order for biryani ingredients, kitchen
                        towels, my usual milk
                    </WaMessage>

                    {/* Typing indicator before "On it" — short pause (~500ms),
                        feels like a real bot acknowledging. */}
                    <WaTyping appearAt={3900} disappearAt={4400} />

                    {/* "On it" ack — quick incoming text. */}
                    <WaMessage side="in" time="9:41" appearDelay={4400}>
                        On it 🫡
                    </WaMessage>

                    {/* Typing indicator before the cart — long pause (~3s),
                        simulating the agent actually composing the cart
                        against the MCP. This is the key dramatic beat. */}
                    <WaTyping appearAt={4900} disappearAt={7400} />

                    {/* Interactive cart message — body text + reply buttons. */}
                    <WaInteractive
                        side="in"
                        time="9:42"
                        appearDelay={7400}
                        body={
                            <>
                                <div className="font-semibold text-[14.5px] text-[#111B21] mb-1">
                                    Your cart for biryani night
                                </div>
                                <div className="space-y-[3px]">
                                    {[
                                        "Basmati rice (India Gate, 1kg)",
                                        "Chicken curry-cut, 500g",
                                        "Amul milk, full cream × 2",
                                        "Kitchen towel rolls × 2",
                                    ].map((item) => (
                                        <div key={item} className="text-[13.5px] leading-snug">
                                            • {item}
                                        </div>
                                    ))}
                                    <div className="text-[12.5px] text-[#667781] italic">
                                        + 7 more items
                                    </div>
                                </div>
                                <div className="mt-2 pt-1.5 border-t border-[#E9EDEF] text-[13px] text-[#3B4A54]">
                                    <span className="font-semibold text-[#111B21]">Total ₹847</span>
                                    <span className="text-[#667781]"> · ETA 18 min</span>
                                </div>
                            </>
                        }
                        buttons={[
                            { label: "Place order", icon: Check },
                            { label: "Edit cart", icon: Pencil },
                            { label: "Cancel", icon: X },
                        ]}
                    />
                </div>

                {/* Input bar */}
                <div
                    className="flex items-center gap-2 px-2 py-1.5"
                    style={{ background: "#F0F2F5" }}
                >
                    <div
                        className="flex-1 flex items-center gap-2 rounded-full px-3 py-2"
                        style={{ background: "#FFFFFF" }}
                    >
                        <Smile className="w-[22px] h-[22px] text-[#54656F]" strokeWidth={1.8} />
                        <span className="flex-1 text-[15px] text-[#667781]">
                            Message
                        </span>
                        <Paperclip
                            className="w-[20px] h-[20px] text-[#54656F] -rotate-45"
                            strokeWidth={1.8}
                        />
                        <Camera className="w-[20px] h-[20px] text-[#54656F]" strokeWidth={1.8} />
                    </div>
                    <button
                        type="button"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ background: "#00A884" }}
                        aria-label="Send voice message"
                    >
                        <Mic className="w-[22px] h-[22px]" strokeWidth={2} />
                    </button>
                </div>

                    {/* iOS home indicator */}
                    <div
                        className="flex justify-center py-1.5"
                        style={{ background: "#F0F2F5" }}
                    >
                        <span
                            aria-hidden
                            className="block w-[110px] h-[5px] rounded-full bg-[#111B21]"
                        />
                    </div>
        </IPhone>
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
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
                            Tell Laziggy what you want — it builds the cart. You tap
                            confirm. Whatever you need, without the work.
                        </p>

                        <div
                            className="mount-fade-up-slow inline-block"
                            style={{ animationDelay: "2150ms" }}
                        >
                            <WhatsAppCTA size="lg" />
                        </div>
                    </div>

                    {/* WhatsApp Business chat replica — 5 cols. The phone
                        animates in alongside the subhead (1550ms) using the
                        regular (non-slow) mount-fade-up so it doesn't drag,
                        then chat messages cascade in inside it. By the time
                        the user finishes reading the copy, phone is settled
                        and messages have started landing. */}
                    <div
                        className="lg:col-span-5 flex justify-center mount-fade-up"
                        style={{ animationDelay: "1550ms" }}
                    >
                        <WhatsAppDemo />
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
                        {/* Setup line — small, sets up the stat block below. */}
                        <Reveal slow>
                            <p
                                className="font-display font-medium leading-[1.05] tracking-[-0.02em] mb-16 md:mb-20"
                                style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
                            >
                                <em className="italic font-medium text-[color:var(--color-lime)]">
                                    Before you even open
                                </em>{" "}
                                Instamart, you already know what you want.
                            </p>
                        </Reveal>

                        {/* Stat block — two big numerical headlines side by
                            side with an em-dash connector. The visual punch
                            of the section: 5 minutes vs. one message,
                            stripped to the numerals. */}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-10 md:gap-8 items-start max-w-[820px]">
                            <Reveal slow delay={320}>
                                <div>
                                    <div className="font-mono text-[11px] md:text-[12px] uppercase tracking-[0.18em] text-[color:var(--color-paper)]/55 mb-3">
                                        Building the cart yourself
                                    </div>
                                    <div
                                        className="font-display font-medium leading-[0.9] tracking-[-0.04em] text-[color:var(--color-paper)]/55"
                                        style={{ fontSize: "clamp(4rem, 10vw, 7rem)" }}
                                    >
                                        5
                                        <span
                                            className="font-mono uppercase tracking-[0.1em] ml-2 align-baseline"
                                            style={{ fontSize: "clamp(1rem, 1.6vw, 1.25rem)" }}
                                        >
                                            min
                                        </span>
                                    </div>
                                </div>
                            </Reveal>

                            {/* Connector — em-dash arrow on desktop, vertical
                                pipe on mobile (hidden on mobile actually,
                                stacking is cleaner without it) */}
                            <Reveal slow delay={460}>
                                <div
                                    aria-hidden
                                    className="hidden md:flex items-center justify-center pt-16 text-[color:var(--color-lime)]/70"
                                    style={{ fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}
                                >
                                    →
                                </div>
                            </Reveal>

                            <Reveal slow delay={640}>
                                <div>
                                    <div className="font-mono text-[11px] md:text-[12px] uppercase tracking-[0.18em] text-[color:var(--color-lime)] mb-3">
                                        With Laziggy
                                    </div>
                                    <div
                                        className="font-display font-medium leading-[0.9] tracking-[-0.04em] text-[color:var(--color-lime)]"
                                        style={{ fontSize: "clamp(4rem, 10vw, 7rem)" }}
                                    >
                                        1
                                        <span
                                            className="font-mono uppercase tracking-[0.1em] ml-2 align-baseline text-[color:var(--color-lime)]"
                                            style={{ fontSize: "clamp(1rem, 1.6vw, 1.25rem)" }}
                                        >
                                            message
                                        </span>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Manifesto (cream, big quote) ───────────────────── */}
            <section className="px-6 md:px-10 pt-24 md:pt-36 pb-20 md:pb-28 max-w-[1200px] mx-auto">
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
                                    We&rsquo;re building the laziest way to order anything.
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
            <section
                className="bg-[color:var(--color-paper-2)]"
                style={{
                    // Bleed past the page's max-width so the bg fills full
                    // width even though the section's content is constrained.
                }}
            >
                <div className="px-6 md:px-10 pt-20 md:pt-28 pb-24 md:pb-32 max-w-[1200px] mx-auto">
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
                                    step.side === "in" ? "md:flex-row-reverse md:text-right" : ""
                                }`}
                            >
                                <div className="flex-shrink-0 font-display font-medium text-[color:var(--color-saffron)] text-4xl md:text-5xl leading-none w-14 md:w-16">
                                    {step.n}
                                </div>
                                <div
                                    className={`flex-1 max-w-[640px] ${
                                        step.side === "in" ? "md:ml-auto" : ""
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
                </div>
            </section>

            {/* ─── To the Builders Club team — Swiggy address ─────── */}
            <section
                className="relative py-24 md:py-32 overflow-hidden"
                style={{
                    background: "var(--color-ink)",
                    color: "var(--color-paper-2)",
                }}
            >
                <div className="px-6 md:px-10 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-3">
                        <Reveal>
                            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em]">
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: "#FC8019" }}
                                />
                                <span style={{ color: "#FC8019" }}>P.S.</span>
                            </div>
                        </Reveal>
                    </div>

                    <div className="lg:col-span-9 lg:col-start-4">
                        <Reveal delay={120}>
                            <h2
                                className="font-display font-medium text-white leading-[1.05] tracking-[-0.02em] mb-12"
                                style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
                            >
                                To the{" "}
                                <span style={{ color: "#FC8019" }}>
                                    Swiggy Builders Club
                                </span>{" "}
                                team.
                            </h2>
                        </Reveal>

                        {/* Pre-paragraph margin note — small, italic, muted.
                            Reads as "hey, since you're here, here's a thought"
                            rather than launching straight into a thesis. */}
                        <Reveal delay={240}>
                            <p className="italic text-[14.5px] md:text-[15px] text-[color:var(--color-paper-2)]/55 mb-10">
                                One thing, while you&rsquo;re here.
                            </p>
                        </Reveal>

                        <div className="space-y-6 max-w-[640px] text-[17px] md:text-[18px] leading-[1.65] text-[color:var(--color-paper-2)]/85">
                            <Reveal delay={380}>
                                <p>
                                    Building a great product used to mean a team and a year
                                    of engineering. AI flattened it. Code is becoming a
                                    commodity. The remaining moat is{" "}
                                    <em
                                        className="not-italic font-medium"
                                        style={{ color: "#FC8019" }}
                                    >
                                        clarity and positioning
                                    </em>
                                    : knowing exactly what to build, why, for whom, and what
                                    not to build. Whoever has the sharpest{" "}
                                    <em
                                        className="not-italic font-medium"
                                        style={{ color: "#FC8019" }}
                                    >
                                        thesis
                                    </em>{" "}
                                    wins.
                                </p>
                            </Reveal>

                            <Reveal delay={520}>
                                <p>
                                    Laziggy is built with that clarity. The lowest-effort
                                    path to a grocery order — one WhatsApp message in, full
                                    Instamart cart out. Nothing else. One product, one
                                    channel, one user.
                                </p>
                            </Reveal>

                            <Reveal delay={120}>
                                <p>
                                    Humans don&rsquo;t just choose lower-effort paths — they
                                    get hooked on them. Laziggy is a faster door to Swiggy.
                                    Once the habit forms there, it stays.
                                </p>
                            </Reveal>

                            <Reveal delay={120}>
                                <p className="text-white">
                                    If that&rsquo;s the kind of partner you&rsquo;re looking
                                    for — let&rsquo;s talk.
                                </p>
                            </Reveal>
                        </div>

                        <Reveal delay={120}>
                            <div className="mt-8 mb-3">
                                <span
                                    aria-hidden
                                    className="block w-[80px] h-px"
                                    style={{ background: "#FC8019" }}
                                />
                            </div>
                            <div className="font-mono text-[12.5px] tracking-wide text-[color:var(--color-paper-2)]/75">
                                Saksham Chauhan · +91 78359 91160 · admin@laziggy.in
                            </div>
                        </Reveal>

                    </div>
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
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FC8019]" />
                    powered by Swiggy Instamart
                </div>
            </footer>
        </main>
    );
}
