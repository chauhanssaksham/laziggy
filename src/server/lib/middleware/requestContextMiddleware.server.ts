/**
 * Root-level middleware: populates per-request AsyncLocalStorage context.
 *
 * Every log line, metric event, and captured exception within the request's
 * async scope can read `getContext()` to pull requestId, anonymousId, route,
 * and any domain attrs pushed into `extra` by downstream handlers — no prop
 * drilling through service layers.
 *
 * Wire in `src/root.tsx` so it applies to every request (pages, API routes,
 * resource routes). Orthogonal to RR7's `context` / `createContext`: this
 * middleware uses ALS for ambient deep-access context, while RR7's context
 * is the right tool for parameter-threaded route-local values.
 *
 * Design doc: DOCS/observability-and-error-handling.md
 */

import type { MiddlewareFunction } from "react-router";
import { httpRequestContextProvider } from "../context/HttpRequestContextProvider.server";

export const requestContextMiddleware: MiddlewareFunction<Response> =
    async ({ request }, next) => {
        return httpRequestContextProvider.provide(request, next);
    };
