"use client";

import { useEffect } from "react";

/**
 * Route-level error boundary for the locale segment.
 *
 * Catches unexpected runtime errors thrown while rendering the page (e.g. a
 * render-time crash). In-component failures from server actions are handled by
 * the components themselves; this boundary is the safety net for everything
 * else. Kept dependency-free and English-only so it can render even when i18n
 * or theme providers are degraded.
 *
 * Next 16 prop: `unstable_retry` re-fetches and re-renders the segment (better
 * than the older `reset`, which only clears error state without refetching).
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // In production, `error.message` is a generic digest-keyed string; this
    // log still surfaces the full object to server logs via the client.
    console.error("[chromattic] route error boundary:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-heading text-7xl font-extrabold text-muted-foreground">
        Oops
      </p>
      <h1 className="font-heading mt-4 text-2xl font-bold">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        An unexpected error occurred while rendering this page. Please try
        again.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}
