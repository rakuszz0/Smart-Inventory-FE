"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icons";
import { useAuth } from "@/components/providers/auth-provider";
import { useLanguage } from "@/components/providers/language-provider";
import type { Role } from "@/lib/types";

type Item = {
  href: string;
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
  roles?: Role[];
};

const items: Item[] = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/products", label: "Products", icon: "box", roles: ["admin", "staff"] },
  { href: "/suppliers", label: "Suppliers", icon: "truck", roles: ["admin", "staff"] },
  { href: "/customers", label: "Customers", icon: "users", roles: ["admin", "staff"] },
  { href: "/transactions", label: "Transactions", icon: "receipt" },
  { href: "/payments", label: "Payments", icon: "card" },
  { href: "/ai/forecast", label: "AI Intelligence", icon: "sparkles" },
  { href: "/admin/payments", label: "Admin", icon: "settings", roles: ["admin", "super_admin"] },
  { href: "/admin/users", label: "Users", icon: "users", roles: ["admin", "super_admin", "staff"] },
  { href: "/profile", label: "Profile", icon: "settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const indonesian: Record<string, string> = {
    Dashboard: "Dashboard",
    Products: "Produk",
    Suppliers: "Supplier",
    Customers: "Pelanggan",
    Transactions: "Transaksi",
    Payments: "Pembayaran",
    "AI Intelligence": "Intelligence AI",
    Admin: "Admin",
    Users: "Pengguna",
    Profile: "Profil",
  };

  const nav = (
    <nav className="mt-8 space-y-1">
      {items
        .filter(
          (item) => !item.roles || (!!user && item.roles.includes(user.role))
        )
        .map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              onClick={() => setOpen(false)}
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {t(item.label, indonesian[item.label])}
            </Link>
          );
        })}
    </nav>
  );

  const side = (
    <aside className="flex h-full w-68 flex-col bg-slate-950 px-4 py-6 text-white">
      <Link href="/dashboard" className="flex items-center gap-3 px-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500 font-bold">
          S
        </span>
        <span>
          <b className="block text-base tracking-tight">
            Smart<span className="text-blue-400">Inv</span>
          </b>
          <small className="text-[10px] tracking-[.18em] text-slate-500">
            INVENTORY SYSTEM
          </small>
        </span>
      </Link>

      {nav}

      <div className="mt-auto rounded-xl border border-slate-800 bg-slate-900/70 p-3">
        <p className="text-xs font-medium text-slate-300">
          {t("Need help?", "Butuh bantuan?")}
        </p>
        <p className="mt-1 text-[11px] leading-4 text-slate-500">
          {t(
            "Our team is ready to assist your business.",
            "Tim kami siap membantu bisnis Anda."
          )}
        </p>
        <button className="mt-3 text-xs font-semibold text-blue-400">
          {t("Open help center", "Buka pusat bantuan")} →
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* Desktop sidebar */}
      <div className="hidden fixed inset-y-0 left-0 z-30 lg:block">
        {side}
      </div>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/50"
          />
          <div className="relative h-full w-68">{side}</div>
        </div>
      )}

      {/* Main content area */}
      <div className="lg:pl-68">
        <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 text-slate-600 lg:hidden"
            >
              <Icon name="menu" className="h-6 w-6" />
            </button>

            <div className="relative hidden sm:block">
              <Icon
                name="search"
                className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
              />
              <input
                placeholder={t(
                  "Search products, customers...",
                  "Cari produk, pelanggan..."
                )}
                className="h-9 w-68 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              aria-label="Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "id")}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 outline-none"
            >
              <option value="en">EN</option>
              <option value="id">ID</option>
            </select>

            <button
              aria-label="Notifications"
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <Icon name="bell" className="h-5 w-5" />
              <i className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            <div className="hidden h-7 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-indigo-400 to-blue-600 text-xs font-bold text-white">
                {user?.fullname
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2) ?? "NP"}
              </div>
              <div className="hidden leading-tight sm:block">
                <p className="text-xs font-semibold">
                  {user?.fullname ?? "Nadia Pratama"}
                </p>
                <p className="text-[10px] capitalize text-slate-500">
                  {user?.role ?? "admin"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                router.push("/auth/login");
              }}
              title={t("Log out", "Keluar")}
              className="hidden rounded-lg p-2 text-slate-400 hover:bg-slate-100 sm:block"
            >
              <Icon name="logout" className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-7 lg:px-9">
          {children}
        </main>
      </div>
    </div>
  );
}

