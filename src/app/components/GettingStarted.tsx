"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";


export default function HelpModalButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Help Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-[60] rounded-full bg-blue-600 px-4 py-2 text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="getting-started-modal"
      >
        Help
      </button>

      {open && <HelpModal onClose={() => setOpen(false)} />}
    </>
  );
}

function HelpModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Close on ESC key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Basic focus handling: move focus to close button when opened
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  // Close if clicking the backdrop (but not when clicking inside the dialog)
  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="getting-started-title"
      id="getting-started-modal"
      onMouseDown={onBackdropClick}
      ref={dialogRef}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl outline-none">
        
        {/* Close button */}
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h2 id="getting-started-title" className="mb-3 text-xl font-semibold text-gray-900">
          Getting Started with PulseCheck
        </h2>

        {/* Body: simple informational list */}
        <div className="space-y-3 text-sm text-gray-700">
          <p className="text-gray-600">A quick guide to your first great status summary:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <span className="font-medium">Paste in your notes</span> — Copy your raw meeting notes, bullet points, or free-write your thoughts and paste them into the prompt box.
            </li>
            <li>
              <span className="font-medium">Select your status type</span> — Wins, Risks, Blockers, Dependencies, Next Steps.
            </li>
            <li>
              <span className="font-medium">Choose a tone</span> — pick the voice that fits your audience.
            </li>
            <li>
              <span className="font-medium">Generate your summary</span> — click <span className="whitespace-nowrap">“Generate”</span> on the dashboard.
            </li>
            <li>
              <span className="font-medium">Copy to clipboard</span> — use the copy button to copy the output and share in Slack/Email/Docs.
            </li>
          </ol>

          <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
            Tip: You can optionally set <span className="font-medium">Team</span> and <span className="font-medium">Timeframe</span> for more tailored output.
          </div>
        </div>
      </div>
    </div>
  );
}
