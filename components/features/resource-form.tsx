"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icons";
import { useLanguage } from "@/components/providers/language-provider";
import { api } from "@/lib/api";

type Resource =
  | "products"
  | "suppliers"
  | "customers"
  | "transactions"
  | "payments";

type FieldType = "text" | "number" | "email" | "tel" | "date" | "select" | "textarea";

type FieldConfig = {
  name: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  suffix?: string;
};

type ResourceConfig = {
  title: string;
  singular: string;
  icon: Parameters<typeof Icon>[0]["name"];
  listHref: string;
  endpoint: string;
  fields: FieldConfig[];
};

const config: Record<Resource, ResourceConfig> = {
  products: {
    title: "Produk",
    singular: "Produk",
    icon: "box",
    listHref: "/products",
    endpoint: "/products",
    fields: [
      { name: "name", label: "Nama Produk", placeholder: "Contoh: Laptop Pro 14 inch", required: true },
      { name: "sku", label: "SKU / Kode", placeholder: "Contoh: ELC-001", required: true },
      { name: "category", label: "Kategori", placeholder: "Contoh: Elektronik", required: true },
      { name: "stock", label: "Stok", type: "number", placeholder: "0", required: true, suffix: "unit" },
      { name: "price", label: "Harga Jual", type: "number", placeholder: "0", required: true, suffix: "IDR" },
      { name: "cost", label: "Harga Modal", type: "number", placeholder: "0", suffix: "IDR" },
      { name: "description", label: "Deskripsi", type: "textarea", placeholder: "Deskripsi produk..." },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Tersedia", value: "Available" },
          { label: "Stok Rendah", value: "Low stock" },
          { label: "Habis", value: "Out of stock" },
          { label: "Tidak Aktif", value: "Inactive" },
        ],
      },
    ],
  },
  suppliers: {
    title: "Supplier",
    singular: "Supplier",
    icon: "truck",
    listHref: "/suppliers",
    endpoint: "/suppliers",
    fields: [
      { name: "name", label: "Nama Supplier / Perusahaan", placeholder: "Contoh: PT Mitra Teknologi", required: true },
      { name: "contact_person", label: "Nama Kontak", placeholder: "Contoh: Budi Santoso" },
      { name: "phone", label: "Nomor Telepon", type: "tel", placeholder: "Contoh: 021 555 0198", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "sales@mitratek.id" },
      { name: "address", label: "Alamat", type: "textarea", placeholder: "Alamat lengkap supplier" },
      { name: "tax_id", label: "NPWP", placeholder: "Contoh: 01.234.567.8-901.000" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Aktif", value: "Active" },
          { label: "Tidak Aktif", value: "Inactive" },
          { label: "Ditangguhkan", value: "Suspended" },
        ],
      },
    ],
  },
  customers: {
    title: "Pelanggan",
    singular: "Pelanggan",
    icon: "users",
    listHref: "/customers",
    endpoint: "/customers",
    fields: [
      { name: "name", label: "Nama Pelanggan", placeholder: "Contoh: PT Maju Bersama", required: true },
      { name: "phone", label: "Nomor Kontak", type: "tel", placeholder: "Contoh: 0811 2345 678", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "finance@majubersama.id" },
      { name: "address", label: "Alamat", type: "textarea", placeholder: "Alamat pelanggan" },
      { name: "customer_type", label: "Tipe Pelanggan", type: "select", options: [
        { label: "Perusahaan", value: "Company" },
        { label: "Individu", value: "Individual" },
        { label: "Reseller", value: "Reseller" },
      ]},
      { name: "tax_id", label: "NPWP", placeholder: "Contoh: 01.234.567.8-901.000" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Aktif", value: "Active" },
          { label: "Tidak Aktif", value: "Inactive" },
          { label: "VIP", value: "VIP" },
        ],
      },
    ],
  },
  transactions: {
    title: "Transaksi",
    singular: "Transaksi",
    icon: "receipt",
    listHref: "/transactions",
    endpoint: "/transactions",
    fields: [
      { name: "transaction_number", label: "ID Transaksi", placeholder: "Auto-generate jika dikosongkan" },
      { name: "type", label: "Tipe Transaksi", type: "select", required: true, options: [
        { label: "Penjualan", value: "Sale" },
        { label: "Pembelian", value: "Purchase" },
        { label: "Retur", value: "Return" },
      ]},
      { name: "party_id", label: "ID Pihak Terkait", placeholder: "ID Pelanggan / Supplier" },
      { name: "party_name", label: "Nama Pihak Terkait", placeholder: "Contoh: PT Maju Bersama" },
      { name: "date", label: "Tanggal Transaksi", type: "date" },
      { name: "total_amount", label: "Total", type: "number", placeholder: "0", required: true, suffix: "IDR" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Draft", value: "Draft" },
          { label: "Diproses", value: "Processing" },
          { label: "Selesai", value: "Completed" },
          { label: "Dibatalkan", value: "Cancelled" },
        ],
      },
      { name: "notes", label: "Catatan", type: "textarea", placeholder: "Catatan tambahan..." },
    ],
  },
  payments: {
    title: "Pembayaran",
    singular: "Pembayaran",
    icon: "card",
    listHref: "/payments",
    endpoint: "/payments",
    fields: [
      { name: "payment_number", label: "ID Pembayaran", placeholder: "Auto-generate jika dikosongkan" },
      { name: "transaction_id", label: "ID Transaksi", placeholder: "Contoh: TRX-2024-001248" },
      { name: "amount", label: "Jumlah Pembayaran", type: "number", placeholder: "0", required: true, suffix: "IDR" },
      { name: "payment_method", label: "Metode Pembayaran", type: "select", required: true, options: [
        { label: "Bank Transfer", value: "Bank Transfer" },
        { label: "Virtual Account", value: "Virtual Account" },
        { label: "QRIS", value: "QRIS" },
        { label: "Kartu Kredit", value: "Credit Card" },
        { label: "Tunai", value: "Cash" },
        { label: "E-Wallet", value: "E-Wallet" },
      ]},
      { name: "date", label: "Tanggal Pembayaran", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Menunggu", value: "Pending" },
          { label: "Berhasil", value: "Paid" },
          { label: "Gagal", value: "Failed" },
          { label: "Refund", value: "Refund" },
        ],
      },
      { name: "reference", label: "Referensi / Nomor Bukti", placeholder: "Contoh: BTRF-123456789" },
      { name: "notes", label: "Catatan", type: "textarea", placeholder: "Catatan pembayaran..." },
    ],
  },
};

const english: Record<string, string> = {
  "Kembali": "Back",
  "Tambah": "Add",
  "Edit": "Edit",
  "Simpan": "Save",
  "Menyimpan...": "Saving...",
  "Berhasil disimpan.": "Saved successfully.",
  "Gagal menyimpan.": "Failed to save.",
  "Nama Produk": "Product Name",
  "SKU / Kode": "SKU / Code",
  "Kategori": "Category",
  "Stok": "Stock",
  "Harga Jual": "Selling Price",
  "Harga Modal": "Cost Price",
  "Deskripsi": "Description",
  "Status": "Status",
  "Tersedia": "Available",
  "Stok Rendah": "Low stock",
  "Habis": "Out of stock",
  "Tidak Aktif": "Inactive",
  "Nama Supplier / Perusahaan": "Supplier / Company Name",
  "Nama Kontak": "Contact Person",
  "Nomor Telepon": "Phone Number",
  "Alamat": "Address",
  "NPWP": "Tax ID",
  "Aktif": "Active",
  "Ditangguhkan": "Suspended",
  "Nama Pelanggan": "Customer Name",
  "Nomor Kontak": "Contact Number",
  "Tipe Pelanggan": "Customer Type",
  "Perusahaan": "Company",
  "Individu": "Individual",
  "Reseller": "Reseller",
  "VIP": "VIP",
  "ID Transaksi": "Transaction ID",
  "Tipe Transaksi": "Transaction Type",
  "Penjualan": "Sale",
  "Pembelian": "Purchase",
  "Retur": "Return",
  "ID Pihak Terkait": "Related Party ID",
  "Nama Pihak Terkait": "Related Party Name",
  "Tanggal Transaksi": "Transaction Date",
  "Total": "Total",
  "Draft": "Draft",
  "Diproses": "Processing",
  "Selesai": "Completed",
  "Dibatalkan": "Cancelled",
  "Catatan": "Notes",
  "ID Pembayaran": "Payment ID",
  "Jumlah Pembayaran": "Payment Amount",
  "Metode Pembayaran": "Payment Method",
  "Bank Transfer": "Bank Transfer",
  "Virtual Account": "Virtual Account",
  "Kartu Kredit": "Credit Card",
  "Tunai": "Cash",
  "E-Wallet": "E-Wallet",
  "Tanggal Pembayaran": "Payment Date",
  "Menunggu": "Pending",
  "Berhasil": "Paid",
  "Gagal": "Failed",
  "Referensi / Nomor Bukti": "Reference / Receipt No.",
  "Produk": "Product",
  "Supplier": "Supplier",
  "Pelanggan": "Customer",
  "Transaksi": "Transaction",
  "Pembayaran": "Payment",
  "unit": "units",
};

function tr(text: string, language: string) {
  if (language === "en") {
    return english[text] ?? text;
  }
  return text;
}

export function ResourceForm({
  resource,
  mode = "create",
  recordId,
}: {
  resource: Resource;
  mode?: "create" | "edit";
  recordId?: string;
}) {
  const { language } = useLanguage();
  const router = useRouter();
  const item = config[resource];
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (mode !== "edit" || !recordId) return;
    let active = true;

    async function load() {
      try {
        const token = localStorage.getItem("smart-inventory-token") ?? undefined;
        const result = await api<Record<string, unknown>>(`${item.endpoint}/${recordId}`, { token });
        if (active) {
          setFormData(result);
        }
      } catch (e) {
        if (active) {
          setMessage(language === "en" ? "Failed to load data." : "Gagal memuat data.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [mode, recordId, item.endpoint, language]);

  function handleChange(name: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload: Record<string, unknown> = {};
    for (const field of item.fields) {
      const value = formData[field.name];
      if (field.required && (value === undefined || value === "" || value === null)) {
        setMessage(language === "en" ? `${tr(field.label, language)} is required.` : `${tr(field.label, language)} wajib diisi.`);
        setSaving(false);
        return;
      }
      if (value !== undefined && value !== "") {
        payload[field.name] = value;
      }
    }

    try {
      const token = localStorage.getItem("smart-inventory-token") ?? undefined;
      const endpoint = mode === "edit" && recordId
        ? `${item.endpoint}/${recordId}`
        : item.endpoint;
      const method = mode === "edit" ? "PATCH" : "POST";

      await api(endpoint, {
        method,
        token,
        body: JSON.stringify(payload),
      });

      setMessage(language === "en" ? "Saved successfully." : "Berhasil disimpan.");
      setTimeout(() => {
        router.push(item.listHref);
      }, 800);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : language === "en"
            ? "Failed to save."
            : "Gagal menyimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-enter max-w-3xl">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="animate-enter max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href={item.listHref}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          aria-label={tr("Kembali", language)}
        >
          <Icon name="arrow-left" className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs font-medium text-blue-600">
            {mode === "create" ? tr("Tambah", language) : tr("Edit", language)}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {mode === "create" ? tr("Tambah", language) : tr("Edit", language)} {tr(item.singular, language)}
          </h1>
        </div>
      </div>

      {message && (
        <p
          className={`mt-5 rounded-lg px-3 py-2 text-sm ${
            message.toLowerCase().includes("berhasil") || message.toLowerCase().includes("success")
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <form onSubmit={submit} className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <Icon name={item.icon} className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">{tr(item.title, language)}</h2>
            <p className="text-xs text-slate-400">
              {language === "en"
                ? "Fill in the fields below."
                : "Isi kolom di bawah ini."}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {item.fields.map((field) => {
            const value = formData[field.name] ?? "";
            const colSpan = field.type === "textarea" ? "sm:col-span-2" : "";
            return (
              <div key={field.name} className={colSpan}>
                <Field
                  label={tr(field.label, language)}
                  name={field.name}
                  type={field.type ?? "text"}
                  value={String(value ?? "")}
                  placeholder={field.placeholder}
                  required={field.required}
                  options={field.options?.map((o) => ({ label: tr(o.label, language), value: o.value }))}
                  suffix={field.suffix ? tr(field.suffix, language) : undefined}
                  onChange={(v) => handleChange(field.name, v)}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <Link
            href={item.listHref}
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            {tr("Kembali", language)}
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-60"
          >
            {saving
              ? language === "en" ? "Saving..." : "Menyimpan..."
              : tr("Simpan", language)}
          </button>
        </div>
      </form>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type: FieldType;
  value: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  suffix?: string;
  onChange: (value: string) => void;
};

function Field({ label, name, type, value, placeholder, required, options, suffix, onChange }: FieldProps) {
  const base =
    "h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-50";

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      <div className="relative">
        {type === "textarea" ? (
          <textarea
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="min-h-[110px] w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-50"
          />
        ) : type === "select" ? (
          <select
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={base}
          >
            <option value="">{placeholder ?? "-"}</option>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            name={name}
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={suffix ? `${base} pr-16` : base}
          />
        )}
        {suffix && type !== "textarea" && type !== "select" && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}
