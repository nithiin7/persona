"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

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
      <body>
        <div
          style={{
            height: "100vh",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily:
              "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: "360px",
              padding: "0 24px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  height: "24px",
                  width: "24px",
                  borderRadius: "6px",
                  backgroundColor: "#111827",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Persona
              </span>
            </div>

            <p
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#111827",
                marginBottom: "8px",
              }}
            >
              Something went wrong
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                marginBottom: "32px",
                lineHeight: "1.5",
              }}
            >
              A critical error occurred. Please try reloading the page.
            </p>

            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "12px",
                backgroundColor: "#111827",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
              }}
            >
              <RotateCcw size={14} />
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
