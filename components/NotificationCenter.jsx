"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, FileText, Users, Package } from "lucide-react";
import { useParams } from "next/navigation";
import { notificationLabel, notificationIcon, timeAgo } from "@/lib/notifications";

const ICON_MAP = { FileText, Users, Package, Bell };

export default function NotificationCenter() {
  const { slug } = useParams();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastSeen, setLastSeen] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(`billing-notif-seen-${slug}`) || "" : ""
  );
  const dropdownRef = useRef(null);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch(`/api/${slug}/notifications`);
      const data = await res.json();
      const list = data.notifications || [];
      setItems(list);
      setUnread(list.filter((n) => n.created_at > lastSeen).length);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    function handler(e) {
      if (!dropdownRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleOpen() {
    setOpen((v) => !v);
    if (!open && items.length > 0) {
      const ts = items[0].created_at;
      setLastSeen(ts);
      setUnread(0);
      localStorage.setItem(`billing-notif-seen-${slug}`, ts);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg transition-colors"
        style={{ color: "var(--text-secondary)" }}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-sunken)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
            style={{ background: "var(--danger)" }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1.5 w-80 max-w-[calc(100vw-2rem)] rounded-[var(--radius-card)] border z-50 overflow-hidden"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-default)",
            boxShadow: "var(--shadow-dialog)",
          }}
          role="dialog"
          aria-label="Notifications"
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Notifications
            </h3>
            {unread === 0 && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                All caught up
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 && (
              <div className="px-4 py-6 text-sm text-center" style={{ color: "var(--text-muted)" }}>
                Loading…
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="px-4 py-6 text-sm text-center" style={{ color: "var(--text-muted)" }}>
                No recent activity
              </div>
            )}
            {items.map((n, i) => {
              const iconName = notificationIcon(n.action);
              const Icon = ICON_MAP[iconName] || Bell;
              const isNew = n.created_at > lastSeen && i < unread;

              return (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 border-b transition-colors"
                  style={{
                    borderColor: "var(--border-subtle)",
                    background: isNew ? "var(--accent-light)" : "transparent",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "var(--bg-sunken)" }}
                  >
                    <Icon size={14} style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {notificationLabel(n.action, n.metadata)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                  {isNew && (
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: "var(--accent)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
