import { describe, it, expect } from "vitest";
import { HttpRequestContextProvider } from "@/server/lib/context/HttpRequestContextProvider.server";

// =============================================================================
// Shared test helper — minimal Request-shaped mock.
//
// The vitest `happy-dom` environment strips the `Cookie` header on `Headers`
// construction (per fetch spec — Cookie is a forbidden request header in
// browsers). The extractors only ever call `request.headers.get(...)`, so
// this object is enough.
// =============================================================================

function makeRequest(headers: Record<string, string | undefined> = {}): Request {
    const lower: Record<string, string> = {};
    for (const k of Object.keys(headers)) {
        const v = headers[k];
        if (v !== undefined) lower[k.toLowerCase()] = v;
    }
    return {
        url: "https://example.com/api/test",
        headers: {
            get(name: string): string | null {
                return lower[name.toLowerCase()] ?? null;
            },
        },
    } as unknown as Request;
}

const provider = new HttpRequestContextProvider();

// =============================================================================
// extractOrMintRequestId — traceparent header parsing
// =============================================================================

const VALID_TRACEPARENT = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";

describe("extractOrMintRequestId — valid traceparent", () => {
    it("returns the span-id from a lowercase traceparent", () => {
        const req = makeRequest({ traceparent: VALID_TRACEPARENT });
        expect(provider.extractOrMintRequestId(req)).toBe("00f067aa0ba902b7");
    });

    it("normalizes uppercase span-id to lowercase (W3C §3.2.2.2)", () => {
        const req = makeRequest({
            traceparent: "00-4BF92F3577B34DA6A3CE929D0E0E4736-00F067AA0BA902B7-01",
        });
        expect(provider.extractOrMintRequestId(req)).toBe("00f067aa0ba902b7");
    });

    it("accepts mixed case", () => {
        const req = makeRequest({
            traceparent: "00-4Bf92F3577B34Da6A3Ce929D0E0E4736-00f067Aa0bA902B7-01",
        });
        expect(provider.extractOrMintRequestId(req)).toBe("00f067aa0ba902b7");
    });
});

describe("extractOrMintRequestId — falls back to UUID when traceparent is invalid", () => {
    it.each([
        { name: "missing header", headers: {} },
        { name: "empty string", headers: { traceparent: "" } },
        { name: "wrong number of parts", headers: { traceparent: "00-abc-def" } },
        { name: "unsupported version", headers: { traceparent: "ff-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01" } },
        { name: "trace-id too short", headers: { traceparent: "00-4bf92f-00f067aa0ba902b7-01" } },
        { name: "trace-id too long", headers: { traceparent: "00-4bf92f3577b34da6a3ce929d0e0e47369999-00f067aa0ba902b7-01" } },
        { name: "trace-id non-hex", headers: { traceparent: "00-zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz-00f067aa0ba902b7-01" } },
        { name: "span-id too short", headers: { traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067-01" } },
        { name: "span-id too long", headers: { traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7ffff-01" } },
        { name: "span-id non-hex", headers: { traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-zzzzzzzzzzzzzzzz-01" } },
        { name: "flags wrong length", headers: { traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-001" } },
        { name: "flags non-hex", headers: { traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-zz" } },
    ])("returns a minted UUID for $name", ({ headers }) => {
        const req = makeRequest(headers);
        const id = provider.extractOrMintRequestId(req);
        // RFC 4122 v4 UUID — the fallback path
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
});

// =============================================================================
// extractAnonymousId — PostHog cookie parsing
//
// Source of the anonymous ID is the PostHog JS SDK's cookie:
//   ph_<project-token>_posthog=<URL-encoded JSON with distinct_id>
// The browser attaches it to every same-origin request; server reads it.
// =============================================================================

/** Build a realistic PostHog cookie header with the given distinct_id. */
function postHogCookie(distinctId: string, token = "phc_abc123"): string {
    const payload = JSON.stringify({ distinct_id: distinctId, session_id: "s1" });
    return `ph_${token}_posthog=${encodeURIComponent(payload)}`;
}

describe("extractAnonymousId", () => {
    it("extracts distinct_id from a valid PostHog cookie", () => {
        const req = makeRequest({ cookie: postHogCookie("xyz-123-abc") });
        expect(provider.extractAnonymousId(req)).toBe("xyz-123-abc");
    });

    it("returns undefined when no cookie header at all", () => {
        expect(provider.extractAnonymousId(makeRequest())).toBeUndefined();
    });

    it("returns undefined when no PostHog cookie is present", () => {
        const req = makeRequest({ cookie: "some_user=usr_x; other=foo" });
        expect(provider.extractAnonymousId(req)).toBeUndefined();
    });

    it("ignores unrelated cookies and finds the PostHog one", () => {
        const req = makeRequest({
            cookie: `other=foo; some_user=usr_x; ${postHogCookie("anon-ph")}`,
        });
        expect(provider.extractAnonymousId(req)).toBe("anon-ph");
    });

    it("returns undefined when PostHog cookie value is malformed (not valid JSON)", () => {
        const req = makeRequest({ cookie: "ph_phc_abc_posthog=not%20json" });
        expect(provider.extractAnonymousId(req)).toBeUndefined();
    });

    it("returns undefined when PostHog cookie has no distinct_id field", () => {
        const payload = JSON.stringify({ session_id: "s1" });
        const req = makeRequest({
            cookie: `ph_phc_abc_posthog=${encodeURIComponent(payload)}`,
        });
        expect(provider.extractAnonymousId(req)).toBeUndefined();
    });

    it("returns undefined when distinct_id is not a string", () => {
        const payload = JSON.stringify({ distinct_id: 42 });
        const req = makeRequest({
            cookie: `ph_phc_abc_posthog=${encodeURIComponent(payload)}`,
        });
        expect(provider.extractAnonymousId(req)).toBeUndefined();
    });

    it("accepts UUID-format distinct_id (the PostHog default)", () => {
        const uuid = "018f7a3e-8b5c-7a3b-9d4e-abc123def456";
        const req = makeRequest({ cookie: postHogCookie(uuid) });
        expect(provider.extractAnonymousId(req)).toBe(uuid);
    });
});

// =============================================================================
// create() — end-to-end RequestContext composition
//
// Note: sessionId is deliberately NOT extracted here — see the "Deferred:
// session cookie unification" note in the design doc. Loaders push sessionId
// in via `addToContext` once they know the restaurantId.
// =============================================================================

describe("HttpRequestContextProvider.create", () => {
    it("returns a fully-populated context when all inputs are present", () => {
        const req = makeRequest({
            traceparent: VALID_TRACEPARENT,
            cookie: postHogCookie("anon_abc"),
        });
        const ctx = provider.create(req);
        expect(ctx.requestId).toBe("00f067aa0ba902b7");
        expect(ctx.anonymousId).toBe("anon_abc");
        expect(ctx.route).toBe("/api/test");
        expect(ctx.extra).toBeUndefined();
    });

    it("still produces a requestId when no traceparent (fallback to UUID)", () => {
        const ctx = provider.create(makeRequest());
        expect(ctx.requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it("does not extract sessionId from cookies (deferred — see design doc)", () => {
        const req = makeRequest({
            cookie: "some_session=sess_xyz:token",
        });
        const ctx = provider.create(req);
        expect(ctx.extra).toBeUndefined();
    });
});
