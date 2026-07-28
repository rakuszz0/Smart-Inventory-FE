"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import type { Role, User, ProfileUpdatePayload } from "@/lib/types";

const samples: User[] = [
  { id: "usr-001", fullname: "Fajar Nugroho", email: "fajar@example.com", role: "user", is_active: true },
  { id: "usr-002", fullname: "Siti Rahma", email: "siti@example.com", role: "staff", is_active: true },
];

export function UserManager() {
  const { user, updateUser } = useAuth();
  const [users, setUsers] = useState<User[]>(samples);
  const [selected, setSelected] = useState<User | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    api<unknown>("/users", { token: localStorage.getItem("smart-inventory-token") ?? undefined })
      .then(value => {
        const list = Array.isArray(value) ? value : value && typeof value === "object"
          ? ((value as Record<string, unknown>).items ?? (value as Record<string, unknown>).data) : [];
        if (active && Array.isArray(list) && list.length) setUsers(list as User[]);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  // Role-based access:
  // - super_admin: can edit all users (including super_admin? no, only other super_admins can't be edited)
  // - admin: can edit admin's own profile + staff + user (not super_admin, not other admin)
  // - staff: can ONLY edit their own profile
  const canManage = (target: User) => {
    if (!user) return false;
    if (user.role === "super_admin") return target.id !== user.id && target.role !== "super_admin";
    if (user.role === "admin") return target.role !== "admin" && target.role !== "super_admin";
    if (user.role === "staff") return target.id === user.id;
    return false;
  };

  const canChangeRole = user?.role === "admin" || user?.role === "super_admin";

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !user) return;
    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {
      fullname: String(form.get("fullname") ?? ""),
      email: String(form.get("email") ?? ""),
    };
    const phone = String(form.get("phone") ?? "").trim() || null;
    const address = String(form.get("address") ?? "").trim() || null;
    const date_of_birth = String(form.get("date_of_birth") ?? "").trim() || null;
    const gender = String(form.get("gender") ?? "").trim() || null;
    payload.phone = phone;
    payload.address = address;
    payload.date_of_birth = date_of_birth;
    payload.gender = gender;

    if (canChangeRole) payload.role = String(form.get("role"));
    if (canChangeRole) {
      const isActive = form.get("is_active");
      payload.is_active = isActive === "true" || isActive === "on";
    }

    const endpoint = canChangeRole ? `/admin/users/${selected.id}` : `/users/${selected.id}`;

    try {
      const updated = await api<User>(endpoint, {
        method: "PUT",
        token: localStorage.getItem("smart-inventory-token") ?? undefined,
        body: JSON.stringify(payload),
      });

      const merged = {
        ...selected,
        ...updated,
        fullname: (updated.fullname ?? payload.fullname ?? selected.fullname) as string,
        email: (updated.email ?? payload.email ?? selected.email) as string,
        role: (updated.role ?? (payload.role as Role) ?? selected.role) as Role,
      };

      setUsers(current => current.map(item => item.id === selected.id ? merged : item));
      // If the edited user is the current user, update the auth context too
      if (selected.id === user.id) updateUser(merged);
      setSelected(null);
      setMessage("User updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update user.");
    }
  }

  // Block user role entirely
  if (!user || user.role === "user") {
    return <div className="rounded-xl bg-red-50 p-5 text-sm text-red-700">You are not authorized to manage users.</div>;
  }

  return (
    <div className="animate-enter">
      <p className="text-xs font-semibold text-blue-600">ADMINISTRATION</p>
      <h1 className="mt-1 text-2xl font-bold">User Management</h1>
      <p className="mt-2 text-sm text-slate-500">
        {canChangeRole
          ? "Manage users, edit profiles, and assign roles."
          : "You can only edit your own profile."}
      </p>

      {message && <p className="mt-5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{message}</p>}

      <section className="mt-7 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-400">
            <tr>
              <th className="px-5 py-3">USER</th>
              <th className="px-5 py-3">EMAIL</th>
              <th className="px-5 py-3">ROLE</th>
              <th className="px-5 py-3">STATUS</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(target => (
              <tr key={target.id} className="border-t border-slate-100">
                <td className="px-5 py-4 font-semibold">{target.fullname}</td>
                <td className="px-5 py-4 text-slate-500">{target.email}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-600">
                    {target.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${target.is_active !== false ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                    {target.is_active !== false ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {canManage(target)
                    ? <button onClick={() => setSelected(target)} className="font-semibold text-blue-600">Edit</button>
                    : <span className="text-xs text-slate-400">Restricted</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Edit modal */}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <form onSubmit={save} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">Edit user</h2>
                <p className="mt-1 text-xs text-slate-500">{selected.id}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="text-slate-400">✕</button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" name="fullname" defaultValue={selected.fullname} required />
                <Field label="Email" name="email" type="email" defaultValue={selected.email} required />
                <Field label="Phone" name="phone" type="tel" defaultValue={selected.phone ?? ""} placeholder="+628123456789" />
                <Field label="Gender" name="gender" defaultValue={selected.gender ?? ""} placeholder="Male / Female" />
                <Field label="Date of Birth" name="date_of_birth" type="date" defaultValue={selected.date_of_birth ?? ""} />
              </div>
              <Field label="Address" name="address" defaultValue={selected.address ?? ""} placeholder="Address" />

              {canChangeRole && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-slate-700">Role</span>
                    <select name="role" defaultValue={selected.role} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500">
                      <option value="user">User</option>
                      <option value="staff">Staff</option>
                      {user?.role === "super_admin" && <option value="admin">Admin</option>}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-slate-700">Account Status</span>
                    <select name="is_active" defaultValue={selected.is_active !== false ? "true" : "false"} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </label>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold">Cancel</button>
              <button className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">Save user</button>
            </div>
          </form>
        </div>
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
        className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
      />
    </label>
  );
}

