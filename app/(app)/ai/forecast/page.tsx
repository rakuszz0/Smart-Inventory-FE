"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { api } from "@/lib/api";

type ForecastPoint = { day?: number | string; date?: string; demand?: number; forecast?: number; value?: number };
type ProductRec = { id?: string | number; product_id?: string | number; name?: string; sku?: string; stock?: number; current_stock?: number; min_stock?: number; recommended_qty?: number; quantity?: number; reason?: string; priority?: "critical" | "high" | "medium" | "low" | string };
type AnomalyItem = { id?: string | number; transaction_id?: string | number; product?: string; product_name?: string; expected?: number; actual?: number; detected_at?: string; severity?: "critical" | "high" | "medium" | "low" | string; type?: string };

const defaultForecast: ForecastPoint[] = [
  { day: 1, forecast: 24 }, { day: 2, forecast: 33 }, { day: 3, forecast: 28 },
  { day: 4, forecast: 46 }, { day: 5, forecast: 51 }, { day: 6, forecast: 47 },
  { day: 7, forecast: 62 }, { day: 8, forecast: 58 }, { day: 9, forecast: 69 },
  { day: 10, forecast: 81 }, { day: 11, forecast: 75 }, { day: 12, forecast: 90 },
  { day: 13, forecast: 87 }, { day: 14, forecast: 96 },
];

const defaultRecommendations: ProductRec[] = [
  { id: 1, name: "Laptop Pro 14 inch", sku: "ELC-001", current_stock: 12, min_stock: 25, recommended_qty: 40, priority: "critical", reason: "Stok habis dalam 7 hari" },
  { id: 2, name: "Mouse Wireless MX", sku: "ACC-042", current_stock: 18, min_stock: 30, recommended_qty: 60, priority: "high", reason: "Tren permintaan naik 18%" },
  { id: 3, name: "Keyboard Mechanical K2", sku: "ACC-018", current_stock: 56, min_stock: 25, recommended_qty: 0, priority: "low", reason: "Stok masih aman" },
  { id: 4, name: "Monitor 27 inch 4K", sku: "ELC-013", current_stock: 8, min_stock: 15, recommended_qty: 25, priority: "critical", reason: "Lead time supplier 14 hari" },
];

const defaultAnomalies: AnomalyItem[] = [
  { id: 1, product: "Laptop Pro 14 inch", expected: 20, actual: 15, severity: "high", type: "Kekurangan stok", detected_at: "Hari ini" },
  { id: 2, product: "Mouse Wireless MX", expected: 40, actual: 38, severity: "medium", type: "Penjualan di bawah rata-rata", detected_at: "Kemarin" },
];

function pick<T>(list: unknown): T[] {
  if (Array.isArray(list)) return list as T[];
  if (list && typeof list === "object") {
    const obj = list as Record<string, unknown>;
    const candidates = ["data", "items", "results", "forecast", "recommendations", "products", "anomalies", "list"];
    for (const k of candidates) {
      if (Array.isArray(obj[k])) return obj[k] as T[];
    }
  }
  return [];
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<ForecastPoint[]>(defaultForecast);
  const [accuracy, setAccuracy] = useState<number>(84);
  const [attentionCount, setAttentionCount] = useState<number>(12);
  const [criticalCount, setCriticalCount] = useState<number>(6);
  const [recommendations, setRecommendations] = useState<ProductRec[]>(defaultRecommendations);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>(defaultAnomalies);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("smart-inventory-token") ?? undefined;

    async function load() {
      setLoading(true);
      try {
        const [fRes, rRes, aRes] = await Promise.allSettled([
          api<unknown>("/ai/forecast/1", { token }).catch(() => null),
          api<unknown>("/ai/recommendation/1", { token }).catch(() => null),
          api<unknown>("/ai/anomaly", { token }).catch(() => null),
        ]);

        if (!active) return;

        const fList = fRes.status === "fulfilled" ? pick<ForecastPoint>(fRes.value) : [];
        if (fList.length) {
          setForecast(fList);
        }

        const rList = rRes.status === "fulfilled" ? pick<ProductRec>(rRes.value) : [];
        if (rList.length) {
          setRecommendations(rList);
          const attention = rList.filter(r => String(r.priority ?? "").toLowerCase() !== "low" && Number(r.recommended_qty ?? 0) > 0).length;
          const critical = rList.filter(r => String(r.priority ?? "").toLowerCase() === "critical").length;
          if (attention) setAttentionCount(attention);
          if (critical) setCriticalCount(critical);
        }

        const aList = aRes.status === "fulfilled" ? pick<AnomalyItem>(aRes.value) : [];
        if (aList.length) {
          setAnomalies(aList);
        }

        const meta =
          (fRes.status === "fulfilled" && fRes.value && typeof fRes.value === "object"
            ? (fRes.value as Record<string, unknown>)
            : null);
        if (meta && typeof meta.accuracy === "number") setAccuracy(Math.round(meta.accuracy * 100) > 100 ? meta.accuracy : meta.accuracy);

        if (fList.length || rList.length || aList.length) {
          setIsLive(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, []);

  const maxVal = Math.max(...forecast.map(p => Number(p.forecast ?? p.demand ?? p.value ?? 0)), 1);

  return (
    <div className="animate-enter space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-violet-600">SMART INTELLIGENCE</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Prediksi Kebutuhan Stok</h1>
          <p className="mt-2 text-sm text-slate-500">
            Analisis AI berdasarkan pola penjualan dan inventori terkini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-[11px] font-semibold ${
            loading ? "bg-slate-100 text-slate-500"
              : isLive ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}>
            {loading ? "Loading…" : isLive ? "Live AI data" : "Contoh data"}
          </span>
        </div>
      </div>

      {/* Hero + stats */}
      <section className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-2xl bg-linear-to-br from-violet-600 to-blue-600 p-6 text-white lg:col-span-2 shadow-lg shadow-blue-500/20">
          <Icon name="sparkles" className="h-7 w-7 text-violet-200" />
          <h2 className="mt-8 text-xl font-bold">{accuracy}% tingkat akurasi prediksi</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-blue-100">
            AI menemukan {attentionCount} produk yang diperkirakan membutuhkan pengadaan dalam 14 hari ke depan.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition"
          >
            Lihat daftar rekomendasi
            <Icon name="arrow" className="h-3.5 w-3.5" />
          </Link>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Produk perlu perhatian</p>
          <b className="mt-2 block text-4xl">{attentionCount}</b>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-amber-400"
              style={{ width: `${Math.min(95, Math.round((criticalCount / Math.max(attentionCount, 1)) * 100))}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-amber-600">{criticalCount} produk berisiko stok habis</p>
        </article>
      </section>

      {/* Trend chart */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold">Tren permintaan produk</h2>
            <p className="mt-1 text-xs text-slate-400">Perkiraan {forecast.length} hari mendatang</p>
          </div>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
            Diperbarui hari ini
          </span>
        </div>

        <div className="mt-8 flex h-58 items-end gap-2">
          {forecast.map((p, i) => {
            const v = Number(p.forecast ?? p.demand ?? p.value ?? 0);
            const h = Math.max(6, Math.round((v / maxVal) * 100));
            return (
              <div key={i} className="group relative flex-1">
                <div
                  className="w-full rounded-t bg-linear-to-t from-violet-500 to-blue-400 transition group-hover:from-violet-600 group-hover:to-blue-500"
                  style={{ height: `${h}%` }}
                  title={`${p.date ?? p.day ?? `Hari ${i + 1}`}: ${v}`}
                />
                <div className="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-[10px] text-white group-hover:block whitespace-nowrap">
                  {p.date ?? p.day ?? `Hari ${i + 1}`} · <b>{v}</b>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recommendations + Anomalies */}
      <section className="grid gap-5 xl:grid-cols-5">
        {/* Recommendations */}
        <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm xl:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold">Rekomendasi Pengadaan</h2>
              <p className="mt-1 text-xs text-slate-400">Prioritas berdasarkan prediksi AI</p>
            </div>
            <Link href="/products" className="text-xs font-semibold text-blue-600 hover:underline">
              Kelola produk →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recommendations.map((r, i) => {
              const name = r.name ?? `Produk ${i + 1}`;
              const sku = r.sku ?? "-";
              const stock = Number(r.current_stock ?? r.stock ?? 0);
              const min = Number(r.min_stock ?? 0);
              const qty = Number(r.recommended_qty ?? r.quantity ?? 0);
              const priority = String(r.priority ?? "medium").toLowerCase();
              const tone =
                priority === "critical" ? "bg-red-50 text-red-700 border-red-100"
                  : priority === "high" ? "bg-amber-50 text-amber-700 border-amber-100"
                  : priority === "low" ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-blue-50 text-blue-700 border-blue-100";
              return (
                <Link
                  key={r.id ?? i}
                  href={`/products/${r.product_id ?? r.id ?? i + 1}`}
                  className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-5"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                    <Icon name="box" className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">{name}</p>
                      <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone}`}>
                        {priority === "critical" ? "KRITIS" : priority === "high" ? "TINGGI" : priority === "low" ? "AMAN" : "SEDANG"}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                      {sku} · Stok: {stock} · Min: {min}
                    </p>
                    {r.reason && <p className="mt-1 truncate text-[11px] text-slate-500">{r.reason}</p>}
                  </div>
                  {qty > 0 && (
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">Rekomendasi</p>
                      <p className="text-base font-bold text-violet-600">+{qty}</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </article>

        {/* Anomaly detection */}
        <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold">Deteksi Anomali</h2>
              <p className="mt-1 text-xs text-slate-400">Pola mencurigakan ditemukan AI</p>
            </div>
            <Link href="/transactions" className="text-xs font-semibold text-blue-600 hover:underline">
              Lihat transaksi →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {anomalies.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">
                ✅ Tidak ada anomali terdeteksi.
              </div>
            )}
            {anomalies.map((a, i) => {
              const sev = String(a.severity ?? "medium").toLowerCase();
              const dotTone =
                sev === "critical" ? "bg-red-500"
                  : sev === "high" ? "bg-amber-500"
                  : sev === "low" ? "bg-emerald-500"
                  : "bg-blue-500";
              const pillTone =
                sev === "critical" ? "bg-red-50 text-red-700"
                  : sev === "high" ? "bg-amber-50 text-amber-700"
                  : sev === "low" ? "bg-emerald-50 text-emerald-700"
                  : "bg-blue-50 text-blue-700";
              return (
                <div key={a.id ?? i} className="flex items-start gap-3 px-5 py-4 transition hover:bg-slate-50">
                  <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotTone}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-xs font-semibold">{a.product ?? a.product_name ?? `Transaksi ${a.transaction_id ?? a.id ?? i + 1}`}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${pillTone}`}>
                        {a.type ?? (sev === "critical" ? "KRITIS" : sev === "high" ? "TINGGI" : sev === "low" ? "RINGAN" : "SEDANG")}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Ekspektasi <b>{a.expected ?? "-"}</b> · Realitas <b>{a.actual ?? "-"}</b>
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{a.detected_at ?? "-"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}
