"use client";
import { X } from "lucide-react";
import { useEffect } from "react";

const SHORTCUTS = [
  { key: "N", description: "New Invoice" },
  { key: "D", description: "Go to Dashboard" },
  { key: "C", description: "Go to Customers" },
  { key: "P", description: "Go to Products" },
  { key: "S", description: "Go to Settings" },
  { key: "/", description: "Focus Search" },
  { key: "?", description: "Show this help" },
  { key: "Esc", description: "Close dialog / dropdown" },
];

export default function ShortcutsDialog({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="w-full max-w-sm rounded-[var(--radius-dialog)] overflow-hidden"
        style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-dialog)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <ul className="py-2">
          {SHORTCUTS.map(({ key, description }) => (
            <li key={key} className="flex items-center justify-between px-5 py-2.5">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {description}
              </span>
              <kbd
                className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold border"
                style={{
                  background: "var(--bg-sunken)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-primary)",
                }}
              >
                {key}
              </kbd>
            </li>
          ))}
        </ul>

        <div
          className="px-5 py-3 border-t text-xs text-center"
          style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
        >
          Shortcuts are disabled while typing in a field
        </div>
      </div>
    </div>
  );
}
