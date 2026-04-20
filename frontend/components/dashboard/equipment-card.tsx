"use client";

import { AlertTriangle, Clock3, MapPin, ShieldAlert, ShieldCheck, Wrench } from "lucide-react";
import type { Equipment } from "@/types";

interface EquipmentCardProps {
  equipment: Equipment;
  active?: boolean;
  onClick?: () => void;
  onOpenDetail?: () => void;
}

const STATUS_CONFIG = {
  normal: {
    label: "穩定",
    badge: "status-pill status-pill-ok",
    icon: ShieldCheck,
    text: "text-emerald-300",
    bar: "from-emerald-400 to-accent-300",
  },
  warning: {
    label: "警戒",
    badge: "status-pill status-pill-warn",
    icon: AlertTriangle,
    text: "text-amber-200",
    bar: "from-amber-300 to-brand-300",
  },
  critical: {
    label: "危急",
    badge: "status-pill status-pill-danger",
    icon: ShieldAlert,
    text: "text-rose-200",
    bar: "from-rose-400 to-brand-300",
  },
  offline: {
    label: "離線",
    badge: "status-pill border-white/10 bg-white/[0.05] text-slate-300",
    icon: Clock3,
    text: "text-slate-300",
    bar: "from-slate-500 to-slate-300",
  },
};

function VhsBar({ score, gradient }: { score: number; gradient: string }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="mt-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Visual Health Score
        </span>
        <span className="font-display text-xl font-semibold text-white">
          {score.toFixed(1)}
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="absolute inset-y-0 left-[40%] w-px bg-white/10" />
        <div className="absolute inset-y-0 left-[70%] w-px bg-white/10" />
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function EquipmentCard({
  equipment,
  active = false,
  onClick,
  onOpenDetail,
}: EquipmentCardProps) {
  const config = STATUS_CONFIG[equipment.status] ?? STATUS_CONFIG.normal;
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={`group w-full rounded-2xl border p-3 text-left transition-all duration-300 ${
        active
          ? "border-accent-400/25 bg-accent-400/10 shadow-glow"
          : "border-white/8 bg-white/[0.035] hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={config.badge}>{config.label}</span>
            {equipment.active_alerts > 0 && (
              <span className="table-chip text-amber-100">
                {equipment.active_alerts} 項待處理
              </span>
            )}
          </div>
          <h3 className="mt-2 text-xs font-semibold text-white transition-colors group-hover:text-accent-100">
            {equipment.name}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
            {equipment.id}
          </p>
        </div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-slate-950/40 ${config.text}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="mt-2 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
        <div className="rounded-xl border border-white/8 bg-slate-950/30 px-2.5 py-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
            設備型別
          </p>
          <p className="mt-1 text-xs font-medium text-white">{equipment.type}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-slate-950/30 px-2.5 py-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
            維保建議
          </p>
          <p className="mt-1 text-xs font-medium text-white">
            {equipment.status === "critical"
              ? "立即停機檢查"
              : equipment.status === "warning"
                ? "排入本日維護"
                : equipment.status === "offline"
                  ? "確認通訊狀態"
                  : "維持例行巡檢"}
          </p>
        </div>
      </div>

      <VhsBar score={equipment.vhs_score ?? 0} gradient={config.bar} />

      <div className="mt-2 flex flex-col gap-2 border-t border-white/8 pt-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3 text-slate-500" />
          <span className="truncate">{equipment.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-3 w-3 text-slate-500" />
          <span>
            {equipment.last_inspection
              ? new Date(equipment.last_inspection).toLocaleString("zh-TW", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "尚未巡檢"}
          </span>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetail?.();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            onOpenDetail?.();
          }
        }}
        className="mt-2 flex items-center justify-between rounded-xl border border-brand-400/20 bg-brand-400/8 px-3 py-2 transition-colors hover:border-brand-400/40 hover:bg-brand-400/15 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Wrench className="h-3.5 w-3.5 text-brand-300" />
          <span className="text-xs font-medium text-brand-200">切換詳情面板</span>
        </div>
        <span className="text-xs uppercase tracking-[0.24em] text-brand-400">
          詳情 →
        </span>
      </div>
    </button>
  );
}
