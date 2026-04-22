"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Clock3,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Wifi,
} from "lucide-react";
import { PAGE_META } from "@/lib/navigation";

interface TopNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export default function TopNav({
  user,
  sidebarCollapsed = false,
  onToggleSidebar,
}: TopNavProps) {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? {
    title: "xCloudVLMui",
    description: "",
    eyebrow: "Overview",
  };

  const [now, setNow] = useState("");
  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("zh-TW", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());
    setNow(fmt());
    const id = setInterval(() => setNow(fmt()), 60_000);
    return () => clearInterval(id);
  }, []);

  const initials = user?.name
    ? user.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()
    : "XC";

  return (
    <header className="relative z-10 flex h-16 shrink-0 items-center border-b border-white/8 bg-surface/70 px-3 backdrop-blur-xl sm:px-4 lg:px-5">
      {/* ── 左側：側欄切換 + 頁面標題 ───────────────────────────── */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300 lg:inline-flex"
          title={sidebarCollapsed ? "展開側欄" : "收合側欄"}
        >
          {sidebarCollapsed
            ? <PanelLeftOpen  className="h-3.5 w-3.5" />
            : <PanelLeftClose className="h-3.5 w-3.5" />
          }
        </button>

        <div className="hidden h-3.5 w-px bg-white/10 lg:block" />

        {/* eyebrow badge */}
        <span className="hidden shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
          {meta.eyebrow}
        </span>
        <span className="hidden text-xs text-slate-600 sm:block">/</span>

        {/* page title */}
        <h1 className="truncate text-base font-bold text-white">{meta.title}</h1>
      </div>

      {/* ── 中間彈性空白 ─────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── 右側：狀態徽章 + 用戶 ────────────────────────────────── */}
      <div className="flex items-center gap-2.5">
        {/* 狀態晶片 */}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.035] px-2.5 py-1 text-xs font-medium text-slate-400">
            <Wifi className="h-3 w-3 text-emerald-400" />
            Offline
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.035] px-2.5 py-1 text-xs font-medium text-slate-400">
            <Sparkles className="h-3 w-3 text-brand-300" />
            Edge AI
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.035] px-2.5 py-1 text-xs font-medium text-slate-400">
            <Clock3 className="h-3 w-3 text-accent-300" />
            {now}
          </span>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* 用戶 */}
        {user?.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={user.image}
            alt={user.name ?? "user"}
            className="h-7 w-7 rounded-lg border border-white/10 object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-brand-400/25 bg-brand-500/12 text-[10px] font-bold text-white">
            {initials}
          </div>
        )}
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-300 md:block">
          {user?.name ?? "操作員"}
        </span>

        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          title="登出"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
