"use client";

import Script from "next/script";
import { useState } from "react";
import { api } from "@/lib/api";
import { Icon } from "@/components/ui/icons";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: () => void;
          onPending?: () => void;
          onError?: () => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

type InitiatePaymentResponse = {
  token?: string;
  snap_token?: string;
  redirect_url?: string;
};

export function MidtransCheckout() {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const isProduction =
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

  async function pay() {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("smart-inventory-token") ?? undefined;
      const result = await api<InitiatePaymentResponse>("/payments/initiate", {
        method: "POST",
        token,
        body: JSON.stringify({ transaction_id: "TRX-2024-001245" }),
      });

      const snapToken = result.token ?? result.snap_token;

      if (snapToken && window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: () => setMessage("Pembayaran berhasil diproses."),
          onPending: () => setMessage("Menunggu pembayaran Anda."),
          onError: () => setMessage("Pembayaran gagal. Silakan coba lagi."),
          onClose: () => setMessage("Jendela pembayaran ditutup."),
        });
      } else if (result.redirect_url) {
        window.location.assign(result.redirect_url);
      } else {
        setMessage("Backend belum mengirim Snap token pembayaran.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Tidak dapat memulai pembayaran."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src={
          isProduction
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js"
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />

      <section className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold text-slate-800">
            Selesaikan pembayaran transaksi
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Pembayaran aman melalui Midtrans Sandbox.
          </p>
        </div>

        <button
          disabled={!ready || loading}
          onClick={pay}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          <Icon name="card" className="h-4 w-4" />
          {loading
            ? "Memuat..."
            : ready
              ? "Bayar dengan Midtrans"
              : "Menyiapkan pembayaran..."}
        </button>
      </section>

      {message && (
        <p className="mb-5 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
          {message}
        </p>
      )}
    </>
  );
}

