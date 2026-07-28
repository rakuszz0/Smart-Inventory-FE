"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icons";

const stats = [
  { label: "Total Produk", value: "1,248", note: "+8.2%", icon: "box" as const, color: "blue" },
  { label: "Total Supplier", value: "86", note: "+3.4%", icon: "truck" as const, color: "violet" },
  { label: "Total Pelanggan", value: "2,441", note: "+12.5%", icon: "users" as const, color: "amber" },
  { label: "Transaksi Bulan Ini", value: "342", note: "+18.7%", icon: "receipt" as const, color: "emerald" },
];

const transactions = [
  ["TRX-2024-001248", "PT Maju Bersama", "Penjualan", "Rp 4.850.000", "Selesai", "10:42"],
  ["TRX-2024-001247", "CV Sinar Abadi", "Pembelian", "Rp 12.300.000", "Diproses", "09:18"],
  ["TRX-2024-001246", "Toko Berkah Jaya", "Penjualan", "Rp 2.675.000", "Selesai", "Kemarin"],
  ["TRX-2024-001245", "PT Teknologi Nusantara", "Pembelian", "Rp 8.420.000", "Menunggu", "Kemarin"],
];

const stock = [
  ["Laptop Pro 14 inch", "ELC-001", "12", "25", "Kritis"],
  ["Mouse Wireless MX", "ACC-042", "18", "30", "Rendah"],
  ["Keyboard Mechanical", "ACC-018", "22", "25", "Aman"],
  ["Monitor 27 inch 4K", "ELC-013", "8", "15", "Kritis"],
];

export function Dashboard() {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="animate-enter space-y-7">
      {/* Header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500">Selamat datang kembali, Nadia 👋</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="mt-1 text-xs text-slate-400">Pantau performa inventori bisnis Anda hari ini.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/transactions/create"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
          >
            <Icon name="plus" className="h-4 w-4" />
            Transaksi Baru
          </Link>
          <button className="rounded-lg border border-slate-200 bg-white px-3 text-slate-600">
            <Icon name="more" className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Stats cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl ${tones[stat.color as keyof typeof tones]}`}
              >
                <Icon name={stat.icon} className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                ↑ {stat.note}
              </span>
            </div>
            <p className="mt-5 text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
          </article>
        ))}
      </section>

      {/* Charts section */}
      <section className="grid gap-5 xl:grid-cols-5">
        {/* Sales chart */}
        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Penjualan & Pembelian</h2>
              <p className="mt-1 text-xs text-slate-400">Ringkasan 6 bulan terakhir</p>
            </div>
            <select className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-500 outline-none">
              <option>6 Bulan Terakhir</option>
            </select>
          </div>

          {/* Bar chart placeholder */}
          <div className="mt-6 flex h-56 items-end gap-3 px-2">
            {[35, 48, 40, 60, 55, 78, 65, 72, 84, 68, 92, 76].map((height, i) => (
              <div key={i} className="flex flex-1 items-end gap-1">
                <div
                  style={{ height: `${height}%` }}
                  className="w-1/2 rounded-t bg-blue-500"
                />
                <div
                  style={{ height: `${Math.max(18, height - (i % 3 ? 20 : 8))}%` }}
                  className="w-1/2 rounded-t bg-blue-100"
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-400">
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>Mei</span>
            <span>Jun</span>
            <span>Jul</span>
          </div>
        </article>

        {/* Order status */}
        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Status Pesanan</h2>
              <p className="mt-1 text-xs text-slate-400">Bulan ini</p>
            </div>
            <button className="text-xs font-semibold text-blue-600">Lihat detail</button>
          </div>

          <div className="mt-7 flex items-center justify-center gap-6">
            {/* Donut chart */}
            <div
              className="relative grid h-35 w-35 place-items-center rounded-full"
              style={{
                background:
                  "conic-gradient(#3b82f6 0 48%, #8b5cf6 48% 75%, #f59e0b 75% 90%, #e2e8f0 90% 100%)",
              }}
            >
              <div className="grid h-23 w-23 place-items-center rounded-full bg-white text-center">
                <b className="text-xl">342</b>
                <span className="-mt-1 text-[10px] text-slate-400">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 text-xs">
              {[
                ["Selesai", "164", "bg-blue-500"],
                ["Diproses", "92", "bg-violet-500"],
                ["Menunggu", "51", "bg-amber-400"],
                ["Dibatalkan", "35", "bg-slate-300"],
              ].map(([label, n, color]) => (
                <div className="flex w-27 items-center justify-between" key={label}>
                  <span className="flex items-center gap-2 text-slate-500">
                    <i className={`h-2 w-2 rounded-full ${color}`} />
                    {label}
                  </span>
                  <b>{n}</b>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      {/* Transactions & Stock section */}
      <section className="grid gap-5 xl:grid-cols-5">
        {/* Recent transactions */}
        <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm xl:col-span-3">
          <div className="flex items-center justify-between p-5">
            <div>
              <h2 className="font-bold">Transaksi Terbaru</h2>
              <p className="mt-1 text-xs text-slate-400">Aktivitas transaksi terkini</p>
            </div>
            <Link href="/transactions" className="text-xs font-semibold text-blue-600">
              Lihat semua
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-left">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-medium">ID Transaksi</th>
                  <th className="px-3 py-3 font-medium">Pelanggan / Supplier</th>
                  <th className="px-3 py-3 font-medium">Total</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(([id, name, type, total, status, time]) => (
                  <tr key={id} className="border-t border-slate-50 text-xs">
                    <td className="px-5 py-3.5">
                      <b className="block text-slate-700">{id}</b>
                      <span className="text-[10px] text-slate-400">{time}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="block font-medium">{name}</span>
                      <span className="text-[10px] text-slate-400">{type}</span>
                    </td>
                    <td className="px-3 py-3.5 font-semibold">{total}</td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                          status === "Selesai"
                            ? "bg-emerald-50 text-emerald-600"
                            : status === "Diproses"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      <Icon name="more" className="h-4 w-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {/* Low stock */}
        <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between p-5">
            <div>
              <h2 className="font-bold">Stok Menipis</h2>
              <p className="mt-1 text-xs text-slate-400">Perlu segera ditindaklanjuti</p>
            </div>
            <Link href="/products" className="text-xs font-semibold text-blue-600">
              Kelola stok
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {stock.map(([name, code, current, min, status]) => (
              <div className="flex items-center gap-3 px-5 py-3" key={code}>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500">
                  <Icon name="box" className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{name}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {code} · Min. stok: {min}
                  </p>
                </div>
                <div className="text-right">
                  <b
                    className={`text-xs ${
                      status === "Kritis"
                        ? "text-red-500"
                        : status === "Rendah"
                          ? "text-amber-500"
                          : "text-emerald-500"
                    }`}
                  >
                    {current} unit
                  </b>
                  <p className="mt-0.5 text-[10px] text-slate-400">{status}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

