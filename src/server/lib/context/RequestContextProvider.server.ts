/**
 * Port for building a `RequestContext` from some transport-specific source
 * AND running a block with that context in scope. The HTTP adapter
 * (`HttpRequestContextProvider`) is the only implementation today.
 *
 * Naming note: we call this a "Provider" the same way React's Context API
 * does — `provide(source, fn)` runs `fn` while the produced context is
 * live on AsyncLocalStorage. The "create" method stays on the interface
 * so callers that need the raw context (e.g. tests) can get one without
 * entering a scope.
 *
 * Shared `provide()` plumbing lives on the `BaseRequestContextProvider`
 * abstract class — every adapter inherits it for free; subclasses only
 * need to implement `create(source)`.
 *
 * For non-HTTP contexts — queue workers, CLI scripts, cron handlers —
 * subclass `BaseRequestContextProvider<YourSource>` and implement
 * `create(source)` against that source type.
 */

import type { RequestContext } from "./request-context.server";
import { runWithContext } from "./request-context.server";

export interface IRequestContextProvider<Source> {
    /** Build a `RequestContext` for the given source. No scope side-effects. */
    create(source: Source): RequestContext;

    /**
     * Build a `RequestContext` for `source` and run `fn` with it live on ALS.
     * Every `getContext()` call inside `fn` (or anything `fn` awaits) returns
     * the produced context. Returns whatever `fn` returns.
     */
    provide<T>(source: Source, fn: () => Promise<T>): Promise<T>;
}

/**
 * Shared base. Subclasses implement `create(source)`; `provide()` composes
 * `create()` with the ALS scope runner. Never instantiated directly.
 */
export abstract class BaseRequestContextProvider<Source>
    implements IRequestContextProvider<Source>
{
    abstract create(source: Source): RequestContext;

    provide<T>(source: Source, fn: () => Promise<T>): Promise<T> {
        return runWithContext(this.create(source), fn);
    }
}
