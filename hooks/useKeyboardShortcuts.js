"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Keys that should NOT trigger shortcuts when the user is typing
function isTyping() {
  const tag = document.activeElement?.tagName;
  const contentEditable = document.activeElement?.contentEditable === "true";
  return ["INPUT", "TEXTAREA", "SELECT"].includes(tag) || contentEditable;
}

export function useKeyboardShortcuts({ slug, onShowHelp }) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e) {
      // Never fire if user is typing
      if (isTyping()) return;
      // Never fire with modifier keys (Ctrl, Cmd, Alt)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key) {
        case "n":
        case "N":
          e.preventDefault();
          router.push(`/${slug}/invoices/new`);
          break;
        case "c":
        case "C":
          e.preventDefault();
          router.push(`/${slug}/customers`);
          break;
        case "p":
        case "P":
          e.preventDefault();
          router.push(`/${slug}/products`);
          break;
        case "d":
        case "D":
          e.preventDefault();
          router.push(`/${slug}/dashboard`);
          break;
        case "s":
        case "S":
          e.preventDefault();
          router.push(`/${slug}/settings`);
          break;
        case "/":
          // Handled inside GlobalSearch component directly
          break;
        case "?":
          e.preventDefault();
          onShowHelp?.();
          break;
        default:
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [slug, router, onShowHelp]);
}
