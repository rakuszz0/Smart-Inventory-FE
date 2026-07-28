import { Icon } from "@/components/ui/icons";

export default function Page() {
  return (
    <div className="animate-enter">
      <p className="text-xs font-semibold text-violet-600">SMART INTELLIGENCE</p>
      <h1 className="mt-1 text-2xl font-bold">Prediksi Kebutuhan Stok</h1>
      <p className="mt-2 text-sm text-slate-500">
        Analisis AI berdasarkan pola penjualan dan inventori terkini.
      </p>

      {/* Hero + stats */}
      <section className="mt-7 grid gap-5 lg:grid-cols-3">
        <article className="rounded-2xl bg-linear-to-br from-violet-600 to-blue-600 p-6 text-white lg:col-span-2">
          <Icon name="sparkles" className="h-7 w-7 text-violet-200" />
          <h2 className="mt-8 text-xl font-bold">84% tingkat akurasi prediksi</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-blue-100">
            AI menemukan 12 produk yang diperkirakan membutuhkan pengadaan dalam 14 hari ke depan.
          </p>
          <button className="mt-6 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-blue-600">
            Lihat rekomendasi
          </button>
        </article>

        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Produk perlu perhatian</p>
          <b className="mt-2 block text-4xl">12</b>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-3/4 rounded-full bg-amber-400" />
          </div>
          <p className="mt-2 text-xs text-amber-600">6 produk berisiko stok habis</p>
        </article>
      </section>

      {/* Trend chart */}
      <section className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold">Tren permintaan produk</h2>
            <p className="mt-1 text-xs text-slate-400">Perkiraan 30 hari mendatang</p>
          </div>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
            Diperbarui hari ini
          </span>
        </div>

        <div className="mt-8 flex h-58 items-end gap-2">
          {[24, 33, 28, 46, 51, 47, 62, 58, 69, 81, 75, 90, 87, 96].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-linear-to-t from-violet-500 to-blue-400"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

