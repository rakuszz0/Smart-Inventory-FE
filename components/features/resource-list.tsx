"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { useLanguage } from "@/components/providers/language-provider";
import { api } from "@/lib/api";

type Resource =
  | "products"
  | "suppliers"
  | "customers"
  | "transactions"
  | "payments"
  | "admin-payments";
type Row = string[];

type ResourceConfig = {
  title: string;
  description: string;
  singular: string;
  icon: Parameters<typeof Icon>[0]["name"];
  columns: string[];
  data: string[][];
};

const config: Record<Resource, ResourceConfig> = {
  products: {
    title: "Produk",
    description: "Kelola katalog dan ketersediaan produk Anda.",
    singular: "Produk",
    icon: "box",
    columns: ["Produk", "SKU", "Kategori", "Stok", "Harga", "Status"],
    data: [
      ["Laptop Pro 14 inch", "ELC-001", "Elektronik", "12 unit", "Rp 18.500.000", "Stok rendah"],
      ["Mouse Wireless MX", "ACC-042", "Aksesoris", "18 unit", "Rp 450.000", "Stok rendah"],
      ["Keyboard Mechanical K2", "ACC-018", "Aksesoris", "56 unit", "Rp 1.250.000", "Tersedia"],
      ["Monitor 27 inch 4K", "ELC-013", "Elektronik", "8 unit", "Rp 5.900.000", "Stok rendah"],
    ],
  },
  suppliers: {
    title: "Supplier",
    description: "Kelola data supplier dan hubungan pasokan Anda.",
    singular: "Supplier",
    icon: "truck",
    columns: ["Nama Supplier", "Kontak", "Email", "Produk", "Status"],
    data: [
      ["PT Mitra Teknologi", "021 555 0198", "sales@mitratek.id", "46 produk", "Aktif"],
      ["CV Sumber Makmur", "0812 9900 1122", "info@sumbermakmur.id", "28 produk", "Aktif"],
      ["PT Elektronik Indonesia", "021 7788 4421", "partnership@elekind.id", "19 produk", "Aktif"],
    ],
  },
  customers: {
    title: "Pelanggan",
    description: "Kelola profil pelanggan dan aktivitas pembelian.",
    singular: "Pelanggan",
    icon: "users",
    columns: ["Pelanggan", "Kontak", "Email", "Total Transaksi", "Status"],
    data: [
      ["PT Maju Bersama", "0811 2345 678", "finance@majubersama.id", "48 transaksi", "Aktif"],
      ["Toko Berkah Jaya", "0821 8800 4433", "berkahjaya@email.id", "31 transaksi", "Aktif"],
      ["CV Nusantara Prima", "0813 9122 1044", "admin@nusantaraprima.id", "17 transaksi", "Aktif"],
    ],
  },
  transactions: {
    title: "Transaksi",
    description: "Pantau seluruh aktivitas pembelian dan penjualan.",
    singular: "Transaksi",
    icon: "receipt",
    columns: ["ID Transaksi", "Pihak Terkait", "Tipe", "Total", "Status", "Tanggal"],
    data: [
      ["TRX-2024-001248", "PT Maju Bersama", "Penjualan", "Rp 4.850.000", "Selesai", "Hari ini"],
      ["TRX-2024-001247", "CV Sinar Abadi", "Pembelian", "Rp 12.300.000", "Diproses", "Hari ini"],
      ["TRX-2024-001246", "Toko Berkah Jaya", "Penjualan", "Rp 2.675.000", "Selesai", "18 Jul 2024"],
    ],
  },
  payments: {
    title: "Pembayaran",
    description: "Lihat dan lacak status pembayaran transaksi Anda.",
    singular: "Pembayaran",
    icon: "card",
    columns: ["ID Pembayaran", "Transaksi", "Metode", "Jumlah", "Status", "Tanggal"],
    data: [
      ["PAY-002491", "TRX-2024-001248", "Bank Transfer", "Rp 4.850.000", "Berhasil", "Hari ini"],
      ["PAY-002490", "TRX-2024-001246", "QRIS", "Rp 2.675.000", "Berhasil", "18 Jul 2024"],
      ["PAY-002489", "TRX-2024-001245", "Virtual Account", "Rp 8.420.000", "Menunggu", "17 Jul 2024"],
    ],
  },
  "admin-payments": {
    title: "Manajemen Pembayaran",
    description: "Kelola, batalkan, atau refund pembayaran pelanggan.",
    singular: "Pembayaran",
    icon: "card",
    columns: ["ID Pembayaran", "Pelanggan", "Metode", "Jumlah", "Status", "Aksi"],
    data: [
      ["PAY-002491", "PT Maju Bersama", "Bank Transfer", "Rp 4.850.000", "Berhasil", ""],
      ["PAY-002489", "PT Teknologi Nusantara", "Virtual Account", "Rp 8.420.000", "Menunggu", ""],
      ["PAY-002485", "CV Karya Sejahtera", "Kartu Kredit", "Rp 1.250.000", "Refund", ""],
    ],
  },
};

const english: Record<string, string> = {
  Produk: "Products",
  Supplier: "Suppliers",
  Pelanggan: "Customers",
  Transaksi: "Transactions",
  Pembayaran: "Payments",
  "Manajemen Pembayaran": "Payment Management",
  "Kelola katalog dan ketersediaan produk Anda.":
    "Manage your product catalogue and availability.",
  "Kelola data supplier dan hubungan pasokan Anda.":
    "Manage supplier records and your supply relationships.",
  "Kelola profil pelanggan dan aktivitas pembelian.":
    "Manage customer profiles and purchasing activity.",
  "Pantau seluruh aktivitas pembelian dan penjualan.":
    "Track all purchase and sales activity.",
  "Lihat dan lacak status pembayaran transaksi Anda.":
    "View and track your transaction payment status.",
  "Kelola, batalkan, atau refund pembayaran pelanggan.":
    "Manage, cancel, or refund customer payments.",
  "Manajemen Data": "Data Management",
  Tambah: "Add",
  Cari: "Search",
  Menampilkan: "Showing",
  dari: "of",
  data: "records",
  "Stok rendah": "Low stock",
  Tersedia: "Available",
  Selesai: "Completed",
  Diproses: "Processing",
  Menunggu: "Pending",
  Berhasil: "Paid",
  Aktif: "Active",
  Penjualan: "Sale",
  Pembelian: "Purchase",
  "Hari ini": "Today",
  Aksesoris: "Accessories",
  Elektronik: "Electronics",
  unit: "units",
};

function tr(text: string, language: string) {
  if (language === "en") {
    return english[text] ?? text.replace("Kelola", "Manage").replace("Cari", "Search");
  }
  return text;
}

export function ResourceList({ resource }: { resource: Resource }) {
  const { language } = useLanguage();
  const item = config[resource];
  const createHref = resource === "admin-payments" ? "/payments" : `/${resource}/create`;
  const [rows, setRows] = useState<Row[]>(item.data);
  const [isSample, setIsSample] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const token = localStorage.getItem("smart-inventory-token") ?? undefined;
        const endpoint = resource === "admin-payments" ? "/admin/payments" : `/${resource}`;
        const result = await api<unknown>(endpoint, { token });
        const records = getRecords(result);
        const liveRows = records
          .map((record) => mapRecord(resource, record))
          .filter((row): row is Row => row !== null);

        if (active && liveRows.length) {
          setRows(liveRows);
          setIsSample(false);
        } else if (active) {
          setRows(item.data);
          setIsSample(true);
        }
      } catch {
        if (active) {
          setRows(item.data);
          setIsSample(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [resource, item.data]);

  return (
    <div className="animate-enter">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-blue-600">
            {tr("Manajemen Data", language)}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {tr(item.title, language)}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {tr(item.description, language)}
          </p>
        </div>

        {resource !== "admin-payments" && (
          <Link
            href={createHref}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20"
          >
            <Icon name="plus" className="h-4 w-4" />
            {tr("Tambah", language)} {tr(item.singular, language)}
          </Link>
        )}
      </div>

      {/* Table card */}
      <section className="mt-7 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
            />
            <input
              className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-blue-400"
              placeholder={`${tr("Cari", language)} ${tr(item.title, language).toLowerCase()}...`}
            />
          </div>

          <span
            className={`inline-flex items-center rounded-lg px-3 text-xs font-semibold ${
              isSample
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {loading
              ? "Loading…"
              : isSample
                ? language === "en"
                  ? "Sample data"
                  : "Data contoh"
                : language === "en"
                  ? "Live data"
                  : "Data langsung"}
          </span>

          <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600">
            <Icon name="filter" className="h-4 w-4" />
            Filter
          </button>

          <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600">
            <Icon name="download" className="h-4 w-4" />
            Export
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left">
            <thead className="bg-slate-50 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              <tr>
                {item.columns.map((c) => (
                  <th key={c} className="px-5 py-3.5">
                    {tr(c, language)}
                  </th>
                ))}
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row[0]}
                  className="border-t border-slate-100 text-xs hover:bg-slate-50/70"
                >
                  {row.map((cell, index) => (
                    <td key={`${cell}-${index}`} className="px-5 py-4">
                      {index === 0 ? (
                        <Link
                          href={`/${resource.replace("admin-", "")}/${i + 1}`}
                          className="font-semibold text-slate-700 hover:text-blue-600"
                        >
                          {cell}
                        </Link>
                      ) : index === row.length - 2 ? (
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            [
                              "Selesai",
                              "Berhasil",
                              "Aktif",
                              "Tersedia",
                              "completed",
                              "paid",
                              "active",
                              "available",
                            ].includes(cell.toLowerCase())
                              ? "bg-emerald-50 text-emerald-600"
                              : cell.toLowerCase() === "refund"
                                ? "bg-violet-50 text-violet-600"
                                : cell === "Stok rendah"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {tr(cell, language)}
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          {tr(cell, language)}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-5 py-4 text-slate-400">
                    <button aria-label="Options">
                      <Icon name="more" className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
          <span>
            {tr("Menampilkan", language)} 1–{rows.length} {tr("dari", language)}{" "}
            {rows.length} {tr("data", language)}
          </span>
          <div className="flex gap-1">
            <button className="rounded border border-slate-200 px-2 py-1">
              ‹
            </button>
            <button className="rounded bg-blue-600 px-2 py-1 text-white">
              1
            </button>
            <button className="rounded border border-slate-200 px-2 py-1">
              ›
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function getRecords(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value as Record<string, unknown>[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = [
      "items",
      "data",
      "results",
      "products",
      "suppliers",
      "customers",
      "transactions",
      "payments",
    ];
    for (const key of keys) {
      if (Array.isArray(record[key])) return record[key] as Record<string, unknown>[];
    }
  }
  return [];
}

function text(value: unknown, fallback = "—") {
  return value === undefined || value === null || value === ""
    ? fallback
    : String(value);
}

function money(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(number)
    : text(value);
}

function nested(source: Record<string, unknown>, key: string, fallback = "—") {
  const value = source[key];
  return value && typeof value === "object"
    ? text(
        (value as Record<string, unknown>).name ??
          (value as Record<string, unknown>).full_name ??
          (value as Record<string, unknown>).id,
        fallback
      )
    : text(value, fallback);
}

function mapRecord(resource: Resource, value: Record<string, unknown>): Row | null {
  if (!value || Object.keys(value).length === 0) return null;

  if (resource === "products") {
    return [
      text(value.name ?? value.product_name),
      text(value.sku ?? value.code),
      nested(value, "category"),
      text(value.stock ?? value.quantity ?? value.current_stock),
      money(value.price ?? value.selling_price ?? value.unit_price),
      text(value.status ?? "Available"),
    ];
  }
  if (resource === "suppliers") {
    return [
      text(value.name ?? value.company_name),
      text(value.phone ?? value.phone_number),
      text(value.email),
      text(value.products_count ?? value.product_count ?? "0 products"),
      text(value.status ?? "Active"),
    ];
  }
  if (resource === "customers") {
    return [
      text(value.name ?? value.full_name),
      text(value.phone ?? value.phone_number),
      text(value.email),
      text(value.total_transactions ?? value.transaction_count ?? "0 transactions"),
      text(value.status ?? "Active"),
    ];
  }
  if (resource === "transactions") {
    return [
      text(value.transaction_number ?? value.code ?? value.id),
      nested(value, "customer", nested(value, "supplier")),
      text(value.type ?? value.transaction_type),
      money(value.total_amount ?? value.total ?? value.amount),
      text(value.status),
      text(value.created_at ?? value.transaction_date),
    ];
  }

  return [
    text(value.payment_number ?? value.code ?? value.id),
    nested(value, "transaction"),
    text(value.payment_method ?? value.method),
    money(value.amount ?? value.total_amount),
    text(value.status),
    text(value.created_at ?? value.payment_date),
  ];
}

