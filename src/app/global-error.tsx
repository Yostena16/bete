"use client";

import { useEffect } from "react";

/**
 * Root error boundary. Must define its own html/body because it replaces the
 * root layout when something fails above the locale shell.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh bg-[#eef1ef] text-[#061f20] antialiased">
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-3 px-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Something broke
          </h1>
          <p className="text-sm text-[#3c5150]">
            Try again. If it keeps happening, come back in a few minutes.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-lg bg-[#0c3a3c] px-4 py-2.5 text-sm font-medium text-[#eef1ef]"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
