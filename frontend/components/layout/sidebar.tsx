"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Cpu,
  DatabaseZap,
  PanelLeftClose,
  PanelLeftOpen,
  Radar,
  ShieldCheck,
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/navigation";

const SYSTEM_STATUS = [
  { label: "Gemma 4 E4B",  meta: "128K Context",  tone: "ok",   icon: Cpu },
  { label: "SEGMA RAG",    meta: "手冊 / 工單",   tone: "warn", icon: DatabaseZap },
  { label: "WebRTC 通道",  meta: "現場巡檢",      tone: "ok",   icon: Radar },
];

const STATUS_DOT: Record<string, string> = {
  ok:   "bg-emerald-400",
  warn: "bg-amber-400",
  err:  "bg-rose-500 animate-pulse",
};

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`relative z-10 flex flex-col border-b border-white/8 bg-surface/80 backdrop-blur-xl transition-[width] duration-300 lg:min-h-screen lg:border-b-0 lg:border-r lg:border-white/8 ${
        collapsed ? "lg:w-[72px]" : "lg:w-[260px]"
      }`}
    >
      {/* ── Logo 標題列 ─────────────────────────────────────────── */}
      <div className={`flex h-11 shrink-0 items-center border-b border-white/8 ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            {/* X logo mark */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-brand-400/30 bg-brand-500/15">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                <path d="M19.5 4.5L4.5 19.5" stroke="rgba(255,255,255,0.3)" strokeWidth="5" strokeLinecap="round" />
                <path d="M4.5 4.5L12 12" stroke="white" strokeWidth="5" strokeLinecap="round" />
                <path d="M12 12L19.5 19.5" stroke="white" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white tracking-tight">xCloud<span className="text-brand-300">VLM</span></span>
          </div>
        )}

        {collapsed && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-400/30 bg-brand-500/15">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="M19.5 4.5L4.5 19.5" stroke="rgba(255,255,255,0.3)" strokeWidth="5" strokeLinecap="round" />
              <path d="M4.5 4.5L12 12" stroke="white" strokeWidth="5" strokeLinecap="round" />
              <path d="M12 12L19.5 19.5" stroke="white" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          className={`hidden h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300 lg:flex ${collapsed ? "absolute -right-3.5 top-2 border border-white/10 bg-surface/90 backdrop-blur-sm" : ""}`}
          title={collapsed ? "展開側欄" : "收合側欄"}
        >
          {collapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* ── 導航列表 ─────────────────────────────────────────────── */}
      <nav className={`flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2.5 py-2.5 ${collapsed ? "items-center" : ""}`}>
        {!collapsed && (
          <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-600">
            Navigation
          </p>
        )}
        {NAV_ITEMS.map(({ href, icon: Icon, label, sublabel, badge }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-label={label}
              className={`group flex items-center rounded-xl transition-all duration-150 ${
                collapsed
                  ? "h-11 w-11 justify-center"
                  : "gap-3 px-3 py-2.5"
              } ${
                isActive
                  ? "bg-accent-500/12 text-white ring-1 ring-accent-400/20"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              }`}
            >
              {/* icon */}
              <div className={`flex shrink-0 items-center justify-center rounded-lg transition-colors ${
                collapsed ? "h-8 w-8" : "h-8 w-8"
              } ${
                isActive
                  ? "bg-accent-500/20 text-accent-300"
                  : "text-slate-400 group-hover:text-slate-200"
              }`}>
                <Icon className="h-4 w-4" />
              </div>

              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold leading-tight">{label}</p>
                    <p className="mt-0.5 truncate text-[11px] leading-tight text-slate-500 group-hover:text-slate-400">
                      {sublabel}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                    isActive
                      ? "border-accent-400/30 bg-accent-500/10 text-accent-300"
                      : "border-white/8 bg-white/[0.03] text-slate-500"
                  }`}>
                    {badge}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Runtime 狀態面板 ─────────────────────────────────────── */}
      <div className={`shrink-0 border-t border-white/8 px-2.5 py-2.5 ${collapsed ? "" : ""}`}>
        {!collapsed && (
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-600">Runtime</p>
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400">Offline First</span>
            </div>
          </div>
        )}

        <div className={`flex flex-col gap-1.5 ${collapsed ? "items-center" : ""}`}>
          {SYSTEM_STATUS.map(({ label, meta, tone, icon: Icon }) => (
            <div
              key={label}
              title={collapsed ? `${label} · ${meta}` : undefined}
              className={`flex items-center rounded-lg border border-white/6 bg-white/[0.025] ${
                collapsed
                  ? "h-10 w-11 justify-center"
                  : "gap-2.5 px-3 py-2"
              }`}
            >
              {collapsed ? (
                <Icon className="h-4 w-4 text-slate-400" />
              ) : (
                <>
                  <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1 truncate text-[11px] text-slate-400">{label}</span>
                  <div className="flex items-center gap-1">
                    <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[tone] ?? STATUS_DOT.ok}`} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
