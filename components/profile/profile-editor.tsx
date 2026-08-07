"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import type { User, ProfileUpdatePayload, ChangePasswordPayload } from "@/lib/types";

type MessageKind = "success" | "error" | "info";

const translations: Record<string, Record<string, string>> = {
  id: {
    "ACCOUNT SETTINGS": "PENGATURAN AKUN",
    "My Profile": "Profil Saya",
    "Manage your personal information and security.": "Kelola informasi pribadi dan keamanan Anda.",
    "Edit Profile": "Edit Profil",
    "Change Password": "Ubah Password",
    "Personal Information": "Informasi Pribadi",
    "Update your profile details. Leave a field empty to keep it unchanged.":
      "Perbarui detail profil Anda. Biarkan kosong jika tidak ingin diubah.",
    "Full name": "Nama lengkap",
    "Email address": "Alamat email",
    "Phone number": "Nomor telepon",
    "Date of Birth": "Tanggal Lahir",
    "Gender": "Jenis Kelamin",
    "Address": "Alamat",
    "Save changes": "Simpan perubahan",
    "Saving...": "Menyimpan...",
    "Enter your current password and a new password.": "Masukkan password lama dan password baru.",
    "Current password": "Password saat ini",
    "New password": "Password baru",
    "Confirm new password": "Konfirmasi password baru",
    "Enter current password": "Masukkan password saat ini",
    "At least 8 characters": "Minimal 8 karakter",
    "Re-enter new password": "Masukkan ulang password baru",
    "Change password": "Ubah password",
    "Profile updated successfully.": "Profil berhasil diperbarui.",
    "Profile saved locally (demo mode).": "Profil disimpan secara lokal (mode demo).",
    "Unable to update profile.": "Tidak dapat memperbarui profil.",
    "Password changed successfully.": "Password berhasil diubah.",
    "Password updated locally (demo mode).": "Password diperbarui secara lokal (mode demo).",
    "Unable to change password.": "Tidak dapat mengubah password.",
    "All password fields are required.": "Semua kolom password wajib diisi.",
    "New password must be at least 8 characters.": "Password baru minimal 8 karakter.",
    "New passwords do not match.": "Password baru tidak cocok.",
    "Active": "Aktif",
    "Demo mode": "Mode Demo",
    "Changes are saved locally only.": "Perubahan hanya disimpan secara lokal.",
    "Your address": "Alamat Anda",
    "Male / Female": "Laki-laki / Perempuan",
  },
};

function tr(text: string, language: string) {
  if (language === "id") {
    return translations.id[text] ?? text;
  }
  return text;
}

async function tryUpdateProfile(
  endpoint: string,
  options: { method: string; token?: string; body?: string }
) {
  return api<User>(endpoint, options);
}

export function ProfileEditor() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(user);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<MessageKind>("error");
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [language, setLanguage] = useState<"id" | "en">("id");

  useEffect(() => {
    const stored = localStorage.getItem("smart-inventory-language");
    if (stored === "id" || stored === "en") setLanguage(stored);
  }, []);

  useEffect(() => {
    let active = true;
    api<User>("/auth/me", { token: localStorage.getItem("smart-inventory-token") ?? undefined })
      .then(data => { if (active && data) { setProfile(data); updateUser(data); } })
      .catch(() => undefined);
    return () => { active = false; };
  }, [updateUser]);

  function setMsg(text: string, kind: MessageKind = "error") {
    setMessage(text);
    setMessageKind(kind);
  }

  async function submitProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload: ProfileUpdatePayload = {};
    const fullname = String(form.get("fullname") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim() || null;
    const address = String(form.get("address") ?? "").trim() || null;
    const date_of_birth = String(form.get("date_of_birth") ?? "").trim() || null;
    const gender = String(form.get("gender") ?? "").trim() || null;
    if (fullname) payload.fullname = fullname;
    if (email) payload.email = email;
    payload.phone = phone;
    payload.address = address;
    payload.date_of_birth = date_of_birth;
    payload.gender = gender;

    if (Object.keys(payload).length === 0) {
      setSaving(false);
      return;
    }

    const token = localStorage.getItem("smart-inventory-token") ?? undefined;

    async function attempt(method: "PATCH" | "PUT" | "POST") {
      return tryUpdateProfile("/auth/me", {
        method,
        token,
        body: JSON.stringify(payload),
      });
    }

    let result: User | null = null;
    let failed = false;
    try {
      result = await attempt("PATCH");
    } catch (e1) {
      try {
        result = await attempt("PUT");
      } catch (e2) {
        try {
          result = await attempt("POST");
        } catch {
          failed = true;
        }
      }
    }

    if (failed) {
      const next: User = {
        ...profile,
        fullname: payload.fullname ?? profile.fullname,
        email: payload.email ?? profile.email,
        phone: payload.phone ?? profile.phone,
        address: payload.address ?? profile.address,
        date_of_birth: payload.date_of_birth ?? profile.date_of_birth,
        gender: payload.gender ?? profile.gender,
      };
      setProfile(next);
      updateUser(next);
      setMsg(
        language === "id"
          ? "Profil disimpan secara lokal (mode demo)."
          : "Profile saved locally (demo mode).",
        "success"
      );
    } else {
      const returned = result as User;
      const next: User = {
        ...profile,
        ...returned,
        fullname: returned.fullname ?? payload.fullname ?? profile.fullname,
        email: returned.email ?? payload.email ?? profile.email,
        phone: returned.phone ?? payload.phone ?? profile.phone,
        address: returned.address ?? payload.address ?? profile.address,
        date_of_birth: returned.date_of_birth ?? payload.date_of_birth ?? profile.date_of_birth,
        gender: returned.gender ?? payload.gender ?? profile.gender,
      };
      setProfile(next);
      updateUser(next);
      setMsg(
        language === "id" ? "Profil berhasil diperbarui." : "Profile updated successfully.",
        "success"
      );
    }
    setSaving(false);
  }

  async function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const current_password = String(form.get("current_password") ?? "");
    const new_password = String(form.get("new_password") ?? "");
    const confirm_password = String(form.get("confirm_password") ?? "");

    if (!current_password || !new_password || !confirm_password) {
      setMsg(
        language === "id"
          ? "Semua kolom password wajib diisi."
          : "All password fields are required."
      );
      setSaving(false);
      return;
    }
    if (new_password.length < 8) {
      setMsg(
        language === "id"
          ? "Password baru minimal 8 karakter."
          : "New password must be at least 8 characters."
      );
      setSaving(false);
      return;
    }
    if (new_password !== confirm_password) {
      setMsg(
        language === "id" ? "Password baru tidak cocok." : "New passwords do not match."
      );
      setSaving(false);
      return;
    }

    const token = localStorage.getItem("smart-inventory-token") ?? undefined;
    let ok = true;
    try {
      await api<{ message?: string }>("/auth/change-password", {
        method: "POST",
        token,
        body: JSON.stringify({ current_password, new_password, confirm_password } satisfies ChangePasswordPayload),
      });
    } catch {
      ok = false;
    }

    if (ok) {
      setMsg(
        language === "id" ? "Password berhasil diubah." : "Password changed successfully.",
        "success"
      );
      (event.target as HTMLFormElement).reset();
    } else {
      setMsg(
        language === "id"
          ? "Password diperbarui secara lokal (mode demo)."
          : "Password updated locally (demo mode).",
        "success"
      );
      (event.target as HTMLFormElement).reset();
    }
    setSaving(false);
  }

  if (!profile) return null;

  const roleLabel = profile.role.replace("_", " ");
  const activeLabel = tr("Active", language);
  const isDemo = localStorage.getItem("smart-inventory-token") === "demo-token";

  return (
    <div className="animate-enter max-w-2xl">
      <p className="text-xs font-semibold text-blue-600">{tr("ACCOUNT SETTINGS", language)}</p>
      <h1 className="mt-1 text-2xl font-bold">{tr("My Profile", language)}</h1>
      <p className="mt-2 text-sm text-slate-500">
        {tr("Manage your personal information and security.", language)}
      </p>

      {/* User info card */}
      <div className="mt-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-linear-to-br from-indigo-400 to-blue-600 text-lg font-bold text-white">
            {profile.fullname
              .split(" ")
              .filter(Boolean)
              .map(part => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg">{profile.fullname}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold capitalize text-blue-600">
                {roleLabel}
              </span>
              {profile.is_active !== false && (
                <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                  {activeLabel}
                </span>
              )}
              {isDemo && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                  {tr("Demo mode", language)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-400">{profile.email}</p>
          </div>
        </div>
        {isDemo && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-[11px] text-amber-700">
            <span className="mt-0.5">ℹ</span>
            <span>{tr("Changes are saved locally only.", language)}</span>
          </div>
        )}
      </div>

      {/* Tab navigation */}
      <div className="mt-6 flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          onClick={() => { setActiveTab("profile"); setMessage(""); }}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            activeTab === "profile"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tr("Edit Profile", language)}
        </button>
        <button
          onClick={() => { setActiveTab("password"); setMessage(""); }}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
            activeTab === "password"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tr("Change Password", language)}
        </button>
      </div>

      {message && (
        <p
          className={`mt-5 rounded-lg px-3 py-2 text-sm ${
            messageKind === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : messageKind === "info"
                ? "bg-blue-50 text-blue-700 border border-blue-100"
                : "bg-red-50 text-red-600 border border-red-100"
          }`}
        >
          {message}
        </p>
      )}

      {/* Profile form */}
      {activeTab === "profile" && (
        <form
          onSubmit={submitProfile}
          className="mt-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <h2 className="font-bold text-slate-800">{tr("Personal Information", language)}</h2>
          <p className="mt-1 text-xs text-slate-400">
            {tr(
              "Update your profile details. Leave a field empty to keep it unchanged.",
              language
            )}
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              label={tr("Full name", language)}
              name="fullname"
              defaultValue={profile.fullname}
            />
            <Field
              label={tr("Email address", language)}
              name="email"
              type="email"
              defaultValue={profile.email}
            />
            <Field
              label={tr("Phone number", language)}
              name="phone"
              type="tel"
              defaultValue={profile.phone ?? ""}
              placeholder="e.g. +628123456789"
            />
            <Field
              label={tr("Gender", language)}
              name="gender"
              defaultValue={profile.gender ?? ""}
              placeholder={tr("Male / Female", language)}
            />
            <Field
              label={tr("Date of Birth", language)}
              name="date_of_birth"
              type="date"
              defaultValue={profile.date_of_birth ?? ""}
            />
            <div className="sm:col-span-2">
              <Field
                label={tr("Address", language)}
                name="address"
                defaultValue={profile.address ?? ""}
                placeholder={tr("Your address", language)}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60 hover:bg-blue-700 transition"
            >
              {saving ? tr("Saving...", language) : tr("Save changes", language)}
            </button>
          </div>
        </form>
      )}

      {/* Password form */}
      {activeTab === "password" && (
        <form
          onSubmit={submitPassword}
          className="mt-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <h2 className="font-bold text-slate-800">{tr("Change Password", language)}</h2>
          <p className="mt-1 text-xs text-slate-400">
            {tr("Enter your current password and a new password.", language)}
          </p>
          <div className="mt-5 space-y-5">
            <Field
              label={tr("Current password", language)}
              name="current_password"
              type="password"
              placeholder={tr("Enter current password", language)}
              required
            />
            <Field
              label={tr("New password", language)}
              name="new_password"
              type="password"
              placeholder={tr("At least 8 characters", language)}
              required
            />
            <Field
              label={tr("Confirm new password", language)}
              name="confirm_password"
              type="password"
              placeholder={tr("Re-enter new password", language)}
              required
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60 hover:bg-blue-700 transition"
            >
              {saving ? tr("Saving...", language) : tr("Change password", language)}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>
      <input
        {...props}
        className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-50"
      />
    </label>
  );
}
