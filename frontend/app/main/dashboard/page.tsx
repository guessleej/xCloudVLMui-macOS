"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ElementType } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Cpu,
  Gauge,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Waves,
} from "lucide-react";
import EquipmentCard from "@/components/dashboard/equipment-card";
import EquipmentDetailDrawer from "@/components/dashboard/equipment-detail-drawer";
import VhsChart from "@/components/dashboard/vhs-chart";
import AnomalyFeed from "@/components/dashboard/anomaly-feed";
import PipelineFlow from "@/components/dashboard/pipeline-flow";
import { dashboardApi } from "@/lib/api";
import type { Alert, Equipment, EquipmentSummary, VhsTrendMeta } from "@/types";

const FALLBACK_EQUIP: Equipment[] = [];
const FALLBACK_SUMMARY: EquipmentSummary = { total: 0, normal: 0, warning: 0, critical: 0, offline: 0 };



function StatCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  detail: string;
  icon: ElementType;
}) {
  return (
    <div className="metric-card px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <p className="mt-1 font-display text-3xl font-semibold text-white">{value}</p>
          <p className="mt-0.5 text-xs leading-4 text-slate-400">{detail}</p>
        </div>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-950/35">
          <Icon className="h-3.5 w-3.5 text-accent-200" />
        </div>
      </div>
    </div>
  );
}

function getActionGuide(equipment: Equipment | null) {
  if (!equipment) {
    return {
      title: "尚未選擇設備",
      summary: "請從左側設備卡選擇目標設備，以檢視風險判讀與維護節奏。",
      nextStep: "待命中",
    };
  }

  if (equipment.status === "critical") {
    return {
      title: "立即停機檢查",
      summary: "偵測到高風險異常，建議立刻中止設備運轉，避免造成二次損傷。",
      nextStep: "P1 緊急維修工單",
    };
  }

  if (equipment.status === "warning") {
    return {
      title: "排入本日處置",
      summary: "設備已進入警戒區，請搭配 RAG 手冊與歷史工單安排預防性維護。",
      nextStep: "P2 預防維護任務",
    };
  }

  if (equipment.status === "offline") {
    return {
      title: "確認通訊與電源",
      summary: "設備目前不在線，先確認鏡頭、網路與邊緣節點是否正常連線。",
      nextStep: "通訊檢測",
    };
  }

  return {
    title: "維持巡檢節奏",
    summary: "目前健康分數穩定，建議繼續按排程巡檢並追蹤長期退化趨勢。",
    nextStep: "例行維護排程",
  };
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<EquipmentSummary>(FALLBACK_SUMMARY);
  const [equipment, setEquipment] = useState<Equipment[]>(FALLBACK_EQUIP);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [vhsMeta, setVhsMeta] = useState<VhsTrendMeta | null>(null);
  const [selected, setSelected] = useState<Equipment | null>(FALLBACK_EQUIP[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerEquipment, setDrawerEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const selectedIdRef = useRef<string | null>(FALLBACK_EQUIP[0]?.id ?? null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, eqRes, alertRes] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getEquipment(),
        dashboardApi.getAlerts(),
      ]);

      setSummary(sumRes.data as EquipmentSummary);
      setEquipment(eqRes.data as Equipment[]);
      setAlerts(alertRes.data as Alert[]);
      setLastUpdate(new Date());

      const equipmentData = eqRes.data as Equipment[];
      const nextSelected =
        equipmentData.find((item: Equipment) => item.id === selectedIdRef.current) ??
        equipmentData[0] ?? null;

      setSelected(nextSelected);
      selectedIdRef.current = nextSelected?.id ?? null;

      if (nextSelected) {
        const vhs = await dashboardApi.getVhsTrend(nextSelected.id);
        setVhsMeta(vhs.data as VhsTrendMeta);
      }
    } catch {
      /* 後端未就緒時保留 fallback */
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await dashboardApi.getAlerts();
      setAlerts(res.data as Alert[]);
    } catch {
      /* 保留目前清單 */
    }
  }, []);

  const handleResolveAlert = async (alertId: string) => {
    await dashboardApi.resolveAlert(alertId);
    await fetchAlerts();
  };

  const handleDeleteAlert = async (alertId: string) => {
    await dashboardApi.deleteAlert(alertId);
    await fetchAlerts();
  };

  const handleCreateAlert = async (payload: {
    equipment_id: string;
    equipment_name: string;
    level: string;
    message: string;
  }) => {
    await dashboardApi.createAlert(payload);
    await fetchAlerts();
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchVhsTrend = async (equipmentId: string) => {
    try {
      const vhs = await dashboardApi.getVhsTrend(equipmentId);
      setVhsMeta(vhs.data as VhsTrendMeta);
    } catch {
      /* 保留目前趨勢 */
    }
  };

  const handleSelectEquipment = async (item: Equipment) => {
    setSelected(item);
    selectedIdRef.current = item.id;
    await fetchVhsTrend(item.id);
  };

  const handleOpenDetail = (item: Equipment) => {
    setDrawerEquipment(item);
    setDrawerOpen(true);
  };

  const totalAlerts = alerts.filter((alert) => !alert.resolved).length;
  const actionGuide = getActionGuide(selected);

  return (
    <div className="space-y-3 pb-2">
      <EquipmentDetailDrawer
        equipment={drawerEquipment}
        alerts={alerts}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreateAlert={handleCreateAlert}
        onResolve={handleResolveAlert}
      />
      <section className="panel-grid overflow-hidden rounded-2xl p-4">
        <div className="relative z-10 grid gap-3 xl:grid-cols-[1.35fr_0.9fr]">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="section-kicker">Operations Snapshot</div>
              <h2 className="text-base font-bold text-white">製造設備維護戰情中心</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="signal-chip">
                <Cpu className="h-3.5 w-3.5 text-accent-300" />
                NVIDIA Jetson Series
              </span>
              <span className="signal-chip">
                <Camera className="h-3.5 w-3.5 text-brand-300" />
                RealSense + WebRTC 多源輸入
              </span>
              <span className="signal-chip">
                <Waves className="h-3.5 w-3.5 text-emerald-300" />
                3-5 秒推論節奏
              </span>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <MetricBlock
              label="未解決事件"
              value={`${totalAlerts}`}
              detail="依風險排序的即時異常清單"
            />
            <MetricBlock
              label="危急設備"
              value={`${summary.critical}`}
              detail="需優先停機或現場複檢"
            />
            <MetricBlock
              label="平均健康分數"
              value={`${averageVhs(equipment).toFixed(1)}`}
              detail="全場設備 VHS 綜合視角"
            />
            <MetricBlock
              label="最後同步"
              value={lastUpdate.toLocaleTimeString("zh-TW", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              detail="可隨時手動刷新資料"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="設備總數"
          value={summary.total}
          detail="目前納管中的設備節點總數"
          icon={Gauge}
        />
        <StatCard
          title="穩定運作"
          value={summary.normal}
          detail="VHS 維持在 70 分以上"
          icon={Sparkles}
        />
        <StatCard
          title="警戒中"
          value={summary.warning}
          detail="需要安排本日或本週維護"
          icon={AlertTriangle}
        />
        <StatCard
          title="危急 / 離線"
          value={`${summary.critical} / ${summary.offline}`}
          detail="需立即檢查設備或通訊狀態"
          icon={ShieldAlert}
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="panel-soft rounded-2xl p-3 sm:p-4">
          <div className="flex flex-col gap-3 border-b border-white/8 pb-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="section-kicker">Equipment Board</div>
              <h2 className="mt-1.5 text-sm font-semibold text-white">受監控設備</h2>
              <p className="mt-1 text-[11px] leading-4 text-slate-400">
                依設備健康狀態切換詳情，快速定位高風險節點與維保優先順序。
              </p>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="secondary-button"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              重新整理資料
            </button>
          </div>

          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {equipment.map((item) => (
              <EquipmentCard
                key={item.id}
                equipment={item}
                active={selected?.id === item.id}
                onClick={() => handleSelectEquipment(item)}
                onOpenDetail={() => handleOpenDetail(item)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="panel-soft rounded-2xl p-3 sm:p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="section-kicker">Selected Asset</div>
                <h2 className="mt-1.5 text-sm font-semibold text-white">
                  {selected?.name ?? "尚未選擇設備"}
                </h2>
                <p className="mt-1 text-[11px] leading-4 text-slate-400">
                  {selected?.location ?? "請從左側設備卡切換查看詳情。"}
                </p>
              </div>
              <div className="rounded-xl border border-white/8 bg-slate-950/35 px-3 py-2 text-right">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">VHS</p>
                <p className="font-display text-2xl font-semibold text-white">
                  {selected?.vhs_score?.toFixed(1) ?? "--"}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.035] p-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">優先建議</p>
              <p className="mt-1 text-sm font-semibold text-white">{actionGuide.title}</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-300">{actionGuide.summary}</p>
              <div className="mt-2 flex items-center justify-between rounded-xl border border-white/8 bg-slate-950/35 px-3 py-2">
                <span className="text-xs font-medium text-white">{actionGuide.nextStep}</span>
                <ArrowRight className="h-4 w-4 text-brand-300" />
              </div>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <CompactMetric label="設備型別" value={selected?.type ?? "--"} />
              <CompactMetric
                label="活躍警報"
                value={selected ? `${selected.active_alerts}` : "--"}
              />
              <CompactMetric
                label="最後巡檢"
                value={
                  selected?.last_inspection
                    ? new Date(selected.last_inspection).toLocaleTimeString("zh-TW", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--"
                }
              />
            </div>
          </div>

          <AnomalyFeed
            alerts={alerts}
            onResolve={handleResolveAlert}
            onDelete={handleDeleteAlert}
          />
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.28fr_0.72fr]">
        <VhsChart
          meta={vhsMeta}
          equipmentId={selected?.id ?? ""}
          equipmentName={selected?.name ?? ""}
          onRecorded={() => selected && fetchVhsTrend(selected.id)}
        />

        <PipelineFlow />
      </section>
    </div>
  );
}

function MetricBlock({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-white">{value}</p>
      <p className="mt-0.5 text-xs leading-4 text-slate-400">{detail}</p>
    </div>
  );
}

function CompactMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-slate-950/30 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function averageVhs(list: Equipment[]) {
  if (list.length === 0) return 0;
  return list.reduce((sum, item) => sum + (item.vhs_score ?? 0), 0) / list.length;
}
