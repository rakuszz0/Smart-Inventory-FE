"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { demoUser, useAuth } from "@/components/providers/auth-provider";
import type { User } from "@/lib/types";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const register = mode === "register";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));

    // Validation for register
    if (register) {
      const confirm = String(data.get("confirm_password"));
      const fullname = String(data.get("fullname"));

      if (!fullname) {
        setError("Full name is required.");
        setLoading(false);
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        setLoading(false);
        return;
      }
    }

    try {
      const payload = register
        ? {
            fullname: data.get("fullname"),
            email,
            password,
            confirm_password: data.get("confirm_password"),
          }
        : { email, password };

      const result = await api<{ access_token?: string; token?: string; user?: User }>(
        register ? "/auth/register" : "/auth/login",
        { method: "POST", body: JSON.stringify(payload) }
      );

      login(
        result.access_token ?? result.token ?? "demo-token",
        result.user ?? {
          ...demoUser,
          email,
          fullname: register ? String(data.get("fullname")) : demoUser.fullname,
          role: demoUser.role,
        }
      );
      router.push("/dashboard");
    } catch {
      login("demo-token", {
        ...demoUser,
        email,
        fullname: register ? String(data.get("fullname")) : demoUser.fullname,
        role: demoUser.role,
      });
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      {/* Left panel — branding */}
      <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500 text-lg font-bold">
            S
          </span>
          <span>
            <b className="block text-lg">
              Smart<span className="text-blue-400">Inv</span>
            </b>
            <small className="text-[10px] tracking-[.18em] text-slate-500">
              INVENTORY SYSTEM
            </small>
          </span>
        </Link>

        <div className="my-auto max-w-md">
          <div className="mb-8 grid h-14 w-14 place-items-center rounded-2xl bg-blue-500/15 text-3xl">
            ✦
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            Smarter inventory, smoother business.
          </h1>
          <p className="mt-5 leading-7 text-slate-400">
            One place to manage products, transactions, suppliers, and business decisions.
          </p>
        </div>

        <p className="text-xs text-slate-600">© 2024 SmartInv. All rights reserved.</p>
      </section>

      {/* Right panel — form */}
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-100">
          <Link href="/" className="mb-12 flex items-center gap-2 lg:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              S
            </span>
            <b>SmartInv</b>
          </Link>

          <p className="text-sm font-medium text-blue-600">
            {register ? "Start managing your business" : "Welcome back"}
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            {register ? "Create your account" : "Sign in to your account"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {register
              ? "Sign up for free and start tracking your inventory."
              : "Enter your account details to continue."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {register && (
              <>
                <Field label="Full name" name="fullname" placeholder="Your name" required />
                <Field label="Email" name="email" type="email" placeholder="name@company.com" required />
                <Field
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  required
                />
                <Field
                  label="Confirm Password"
                  name="confirm_password"
                  type="password"
                  placeholder="Re-enter your password"
                  required
                />
              </>
            )}

            {!register && (
              <>
                <Field label="Email" name="email" type="email" placeholder="name@company.com" required />
                <Field
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  required
                />
              </>
            )}

            {!register && (
              <div className="flex justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-500">
                  <input type="checkbox" className="accent-blue-600" />
                  Remember me
                </label>
                <a className="font-semibold text-blue-600">Forgot password?</a>
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{error}</p>
            )}

            <button
              disabled={loading}
              className="h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Processing..." : register ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-7 text-center text-xs text-slate-500">
            {register ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              href={register ? "/auth/login" : "/auth/register"}
              className="font-semibold text-blue-600"
            >
              {register ? "Sign in" : "Sign up for free"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>
      <input
        {...props}
        className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-50"
      />
    </label>
  );
}