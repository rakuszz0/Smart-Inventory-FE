"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import type { User, ProfileUpdatePayload, ChangePasswordPayload } from "@/lib/types";

export function ProfileEditor() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(user);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  useEffect(() => {
    let active = true;
    api<User>("/auth/me", { token: localStorage.getItem("smart-inventory-token") ?? undefined })
      .then(data => { if (active) { setProfile(data); updateUser(data); } })
      .catch(() => undefined);
    return () => { active = false; };
  }, [updateUser]);

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

    try {
      const result = await api<User>("/auth/me", {
        method: "PATCH",
        token: localStorage.getItem("smart-inventory-token") ?? undefined,
        body: JSON.stringify(payload),
      });
      const next = { ...profile, ...result, fullname: result.fullname ?? payload.fullname ?? profile.fullname, email: result.email ?? payload.email ?? profile.email };
      setProfile(next);
      updateUser(next);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
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
      setMessage("All password fields are required.");
      setSaving(false);
      return;
    }
    if (new_password.length < 8) {
      setMessage("New password must be at least 8 characters.");
      setSaving(false);
      return;
    }
    if (new_password !== confirm_password) {
      setMessage("New passwords do not match.");
      setSaving(false);
      return;
    }

    try {
      await api<{ message: string }>("/auth/change-password", {
        method: "POST",
        token: localStorage.getItem("smart-inventory-token") ?? undefined,
        body: JSON.stringify({ current_password, new_password, confirm_password } satisfies ChangePasswordPayload),
      });
      setMessage("Password changed successfully.");
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to change password.");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return null;

  return (
    <div className="animate-enter max-w-2xl">
      <p className="text-xs font-semibold text-blue-600">ACCOUNT SETTINGS</p>
      <h1 className="mt-1 text-2xl font-bold">My Profile</h1>
      <p className="mt-2 text-sm text-slate-500">Manage your personal information and security.</p>

      {/* User info card */}
      <div className="mt-7 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-linear-to-br from-indigo-400 to-blue-600 text-lg font-bold text-white">
            {profile.fullname.split(" ").map(part => part[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-lg">{profile.fullname}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold capitalize text-blue-600">
                {profile.role.replace("_", " ")}
              </span>
              {profile.is_active !== false && (
                <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mt-6 flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          onClick={() => { setActiveTab("profile"); setMessage(""); }}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${activeTab === "profile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Edit Profile
        </button>
        <button
          onClick={() => { setActiveTab("password"); setMessage(""); }}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${activeTab === "password" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Change Password
        </button>
      </div>

      {message && (
        <p className={`mt-5 rounded-lg px-3 py-2 text-sm ${message.toLowerCase().includes("success") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {message}
        </p>
      )}

      {/* Profile form */}
      {activeTab === "profile" && (
        <form onSubmit={submitProfile} className="mt-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-800">Personal Information</h2>
          <p className="mt-1 text-xs text-slate-400">Update your profile details. Leave a field empty to keep it unchanged.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Full name" name="fullname" defaultValue={profile.fullname} />
            <Field label="Email address" name="email" type="email" defaultValue={profile.email} />
            <Field label="Phone number" name="phone" type="tel" defaultValue={profile.phone ?? ""} placeholder="e.g. +628123456789" />
            <Field label="Gender" name="gender" defaultValue={profile.gender ?? ""} placeholder="Male / Female" />
            <Field label="Date of Birth" name="date_of_birth" type="date" defaultValue={profile.date_of_birth ?? ""} />
            <div className="sm:col-span-2">
              <Field label="Address" name="address" defaultValue={profile.address ?? ""} placeholder="Your address" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60">
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      )}

      {/* Password form */}
      {activeTab === "password" && (
        <form onSubmit={submitPassword} className="mt-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-800">Change Password</h2>
          <p className="mt-1 text-xs text-slate-400">Enter your current password and a new password.</p>
          <div className="mt-5 space-y-5">
            <Field label="Current password" name="current_password" type="password" placeholder="Enter current password" required />
            <Field label="New password" name="new_password" type="password" placeholder="At least 8 characters" required />
            <Field label="Confirm new password" name="confirm_password" type="password" placeholder="Re-enter new password" required />
          </div>
          <div className="mt-6 flex justify-end">
            <button disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60">
              {saving ? "Saving..." : "Change password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</span>
      <input
        {...props}
        className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-50"
      />
    </label>
  );
}

