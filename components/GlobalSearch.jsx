"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Users, Package, X } from "lucide-react";
import { useParams } from "next/navigation";

const TYPE_ICONS = {
  invoice: FileText,
  customer: Users,
  product: Package,
};

const TYPE_LABELS = {
  invoice: "Invoice",
  customer: "Customer",
  product: "Product",
};

function typeHref(slug, result) {
  if (result.type === "invoice") return `/${slug}/invoices/${result.id}`;
  if (result.type === "customer") return `/${slug}/customers/${result.id}`;
  if (result.type === "product") return `/${slug}/products/${result.id}`;
  return "#";
}

export default function GlobalSearch() {
  const { slug } = useParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/${slug}/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
        setActive(-1);
      } finally {
        setLoading(false);
      }
    }, 220);
  }, [query, slug]);

  useEffect(() => {
    function handler(e) {
      if (!dropdownRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    function handler(e) {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  function handleKeyDown(e) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((p) => Math.min(p + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((p) => Math.max(p - 1, 0));
    }
    if (e.key === "Enter" && active >= 0) {
      const r = results[active];
      router.push(typeHref(slug, r));
      setOpen(false);
      setQuery("");
    }
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search… ( / )"
          className="h-9 pl-9 pr-8 w-40 sm:w-64 rounded-[var(--radius-input)] border text-sm transition-all focus:w-56 sm:focus:w-72 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          style={{
            borderColor: "var(--border-default)",
            background: "var(--bg-sunken)",
            color: "var(--text-primary)",
          }}
          aria-label="Global search"
          aria-expanded={open}
          aria-haspopup="listbox"
          role="combobox"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            aria-label="Clear search"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {open && (
        <div
          ref={dropdownRef}
          role="listbox"
          className="absolute top-full right-0 mt-1.5 w-80 max-w-[calc(100vw-2rem)] rounded-[var(--radius-card)] border overflow-hidden z-50"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-default)",
            boxShadow: "var(--shadow-dialog)",
          }}
        >
          {loading && (
            <div className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
              Searching…
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-4 py-6 text-sm text-center" style={{ color: "var(--text-muted)" }}>
              No results for <strong style={{ color: "var(--text-secondary)" }}>&quot;{query}&quot;</strong>
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="py-1">
              {results.map((r, i) => {
                const Icon = TYPE_ICONS[r.type];
                return (
                  <li key={`${r.type}-${r.id}`}>
                    <a
                      href={typeHref(slug, r)}
                      role="option"
                      aria-selected={active === i}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 transition-colors"
                      style={{
                        background: active === i ? "var(--bg-sunken)" : "transparent",
                        color: "var(--text-primary)",
                      }}
                      onMouseEnter={() => setActive(i)}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "var(--accent-light)" }}
                      >
                        <Icon size={14} style={{ color: "var(--accent)" }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.label}</p>
                        {r.sub && (
                          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                            {r.sub}
                          </p>
                        )}
                      </div>

                      {r.meta && (
                        <span className="text-xs font-medium flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
                          {r.meta}
                        </span>
                      )}

                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: "var(--bg-sunken)", color: "var(--text-muted)" }}
                      >
                        {TYPE_LABELS[r.type]}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          <div
            className="border-t px-3 py-2 flex items-center gap-3 text-[11px]"
            style={{ borderColor: "var(--border-subtle)", color: "var(--text-muted)" }}
          >
            <span>
              <kbd className="px-1 py-0.5 rounded bg-[var(--bg-sunken)] font-mono">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-[var(--bg-sunken)] font-mono">↵</kbd> open
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded bg-[var(--bg-sunken)] font-mono">Esc</kbd> close
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
