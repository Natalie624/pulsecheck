// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#ffffff", color: "#1a1a1a" }}
    >
      <div className="w-full max-w-xl px-6 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium mb-6"
          style={{
            backgroundColor: "rgba(0,0,0,0.05)",
            border: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: "#5a38e0" }}
          />
          <span>Page not found</span>
        </div>

        {/* 404 */}
        <h1
          className="text-7xl sm:text-8xl font-extrabold leading-snug static-gradient tracking-tight mb-4"
        >
          404
        </h1>

        {/* Message */}
        <p className="text-lg mb-8" style={{ color: "#555" }}>
          Can’t find that page. Let’s head back and generate something great.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: "#5a38e0",
              color: "#ffffff",
              boxShadow: "0 6px 20px rgba(90, 56, 224, 0.35)",
            }}
            aria-label="Go to homepage"
          >
            Go Home
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: "rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.08)",
              color: "#1a1a1a",
            }}
            aria-label="Go to dashboard"
          >
            Open Dashboard
          </Link>
        </div>

        {/* Divider */}
        <div
          className="mt-10 h-px w-full"
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)",
          }}
        />
      </div>
    </main>
  );
}
