import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseJsonValues } from "@/server/infra/config/config-helpers.server";
import { ProcessEnvPropertySource } from "@/server/infra/config/sources/ProcessEnvPropertySource.server";
import { ConfigProvider } from "@/server/infra/config/provider/ConfigProvider.server";
import { TTLCache } from "@/server/infra/cache/TTLCache.server";
import type { IPropertySource } from "@/server/infra/config/sources/IPropertySource.server";
import type { ServerConfig } from "@/server/infra/config/config-schema.server";

// =============================================================================
// parseJsonValues
// =============================================================================

describe("parseJsonValues", () => {
    it("parses JSON array strings", () => {
        const map: Record<string, unknown> = { items: '["a","b","c"]' };
        parseJsonValues(map);
        expect(map.items).toEqual(["a", "b", "c"]);
    });

    it("parses JSON object strings", () => {
        const map: Record<string, unknown> = { obj: '{"x":1,"y":2}' };
        parseJsonValues(map);
        expect(map.obj).toEqual({ x: 1, y: 2 });
    });

    it("parses JSON booleans", () => {
        const map: Record<string, unknown> = { flag: "true", off: "false" };
        parseJsonValues(map);
        expect(map.flag).toBe(true);
        expect(map.off).toBe(false);
    });

    it("parses JSON numbers", () => {
        const map: Record<string, unknown> = { n: "42" };
        parseJsonValues(map);
        expect(map.n).toBe(42);
    });

    it("leaves non-JSON strings unchanged", () => {
        const map: Record<string, unknown> = { secret: "s3cr3t", url: "https://x.com" };
        parseJsonValues(map);
        expect(map.secret).toBe("s3cr3t");
        expect(map.url).toBe("https://x.com");
    });

    it("leaves already-parsed values unchanged", () => {
        const map: Record<string, unknown> = { items: ["a", "b"], obj: { x: 1 } };
        parseJsonValues(map);
        expect(map.items).toEqual(["a", "b"]);
        expect(map.obj).toEqual({ x: 1 });
    });
});

// =============================================================================
// ProcessEnvPropertySource
// =============================================================================

describe("ProcessEnvPropertySource", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        // Start with empty env so local .env.local doesn't pollute the test
        process.env = {};
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("converts SCREAMING_SNAKE env vars to lowercase dot-keys", async () => {
        process.env["SUPABASE_SECRETKEY"] = "secret123";
        process.env["SESSION_HMACSECRET"] = "hmac456";
        process.env["AI_GEMINIKEY"] = "AIza...";

        const source = new ProcessEnvPropertySource();
        const result = await source.load();

        expect(result["supabase.secretkey"]).toBe("secret123");
        expect(result["session.hmacsecret"]).toBe("hmac456");
        expect(result["ai.geminikey"]).toBe("AIza...");
    });

    it("VITE_ vars land under client.* by construction", async () => {
        process.env["VITE_POSTHOG_KEY"] = "phc_abc";
        process.env["VITE_POSTHOG_HOST"] = "https://us.i.posthog.com";

        const source = new ProcessEnvPropertySource();
        const result = await source.load();

        expect(result["client.posthog.key"]).toBe("phc_abc");
        expect(result["client.posthog.host"]).toBe("https://us.i.posthog.com");
    });

    it("converts single-word env vars to lowercase", async () => {
        process.env["PATH"] = "/usr/bin";
        process.env["HOME"] = "/home/user";

        const source = new ProcessEnvPropertySource();
        const result = await source.load();

        expect(result["path"]).toBe("/usr/bin");
        expect(result["home"]).toBe("/home/user");
    });

    it("converts VERCEL_ENV and nested VERCEL_GIT_* keys", async () => {
        process.env["VERCEL_ENV"] = "production";
        process.env["VERCEL_GIT_COMMIT_SHA"] = "abc123";

        const source = new ProcessEnvPropertySource();
        const result = await source.load();

        expect(result["vercel.env"]).toBe("production");
        expect(result["vercel.git.commit.sha"]).toBe("abc123");
    });

    it("drops bare scalars that collide with a namespaced sibling (VERCEL + VERCEL_ENV)", async () => {
        // Vercel injects both VERCEL=1 and VERCEL_ENV=production.
        // The bare VERCEL would collide with vercel.env during unflatten.
        process.env["VERCEL"] = "1";
        process.env["VERCEL_ENV"] = "production";
        process.env["VERCEL_BRANCH_URL"] = "https://foo.vercel.app";

        const source = new ProcessEnvPropertySource();
        const result = await source.load();

        expect(result["vercel"]).toBeUndefined();  // dropped
        expect(result["vercel.env"]).toBe("production");
        expect(result["vercel.branch.url"]).toBe("https://foo.vercel.app");
    });

    it("drops intermediate scalars that collide with deeper namespaces (TERM_PROGRAM + TERM_PROGRAM_VERSION)", async () => {
        // Local terminals set TERM_PROGRAM=iTerm.app + TERM_PROGRAM_VERSION=3.5,
        // which would collide at term.program (scalar) vs term.program.version (namespace).
        process.env["TERM_PROGRAM"] = "iTerm.app";
        process.env["TERM_PROGRAM_VERSION"] = "3.5.0";

        const source = new ProcessEnvPropertySource();
        const result = await source.load();

        expect(result["term.program"]).toBeUndefined();  // dropped
        expect(result["term.program.version"]).toBe("3.5.0");
    });

    it("does not filter unknown env vars — schema strips them downstream", async () => {
        process.env["npm_package_name"] = "x";
        process.env["TURBO_CACHE"] = "1";

        const source = new ProcessEnvPropertySource();
        const result = await source.load();

        // Source emits them; schema will silently strip during validation.
        expect(result["npm.package.name"]).toBe("x");
        expect(result["turbo.cache"]).toBe("1");
    });
});

// =============================================================================
// ConfigProvider
// =============================================================================

describe("ConfigProvider", () => {
    const fakeEntries: Record<string, unknown> = {
        "client.supabase.url": "https://x",
        "client.posthog.key": "k",
        "client.posthog.host": "h",
        "supabase.secretkey": "s",
        "session.hmacsecret": "h",
        "ai.geminikey": "g",
    };

    function makeSource(entries = fakeEntries): IPropertySource {
        return { name: "test", load: vi.fn().mockResolvedValue(entries) };
    }

    it("throws if getConfig called before init", () => {
        const provider = new ConfigProvider([makeSource()]);
        expect(() => provider.getConfig()).toThrow(/not initialized/);
    });

    it("returns config synchronously after init", async () => {
        const provider = new ConfigProvider([makeSource()]);
        await provider.init();
        const config = provider.getConfig();
        expect(config.supabase.secretkey).toBe("s");
        expect(config.client.posthog.key).toBe("k");
    });

    it("returns client config subset", async () => {
        const provider = new ConfigProvider([makeSource()]);
        await provider.init();
        const client = provider.getClientConfig();
        expect(client.supabase.url).toBe("https://x");
        expect(client.posthog.key).toBe("k");
    });

    it("triggers background refresh after TTL expires", async () => {
        const source = makeSource();
        const provider = new ConfigProvider([source], new TTLCache<ServerConfig>(1));
        await provider.init();

        await new Promise(r => setTimeout(r, 10));

        provider.getConfig(); // triggers refresh

        // load() called twice: once for init, once for refresh
        await vi.waitFor(() => expect(source.load).toHaveBeenCalledTimes(2));
    });

    it("single-flight: only one refresh at a time", async () => {
        const source = makeSource();
        const provider = new ConfigProvider([source], new TTLCache<ServerConfig>(1));
        await provider.init();

        await new Promise(r => setTimeout(r, 10));

        for (let i = 0; i < 100; i++) {
            provider.getConfig();
        }

        await vi.waitFor(() => expect(source.load).toHaveBeenCalledTimes(2));
        // Only 2: init + one refresh, not 101
    });

    it("keeps last-known-good on refresh failure", async () => {
        const source: IPropertySource = {
            name: "test",
            load: vi.fn()
                .mockResolvedValueOnce(fakeEntries)                 // init succeeds
                .mockRejectedValueOnce(new Error("boom")),          // refresh fails
        };

        const provider = new ConfigProvider([source], new TTLCache<ServerConfig>(1));
        await provider.init();

        await new Promise(r => setTimeout(r, 10));

        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        provider.getConfig(); // triggers failing refresh
        await vi.waitFor(() => expect(source.load).toHaveBeenCalledTimes(2));

        // Still returns the original config
        expect(provider.getConfig().supabase.secretkey).toBe("s");
        consoleSpy.mockRestore();
    });
});
