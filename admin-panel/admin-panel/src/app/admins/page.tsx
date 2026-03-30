"use client";

import { useMemo, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAdmin } from "../context/AdminContext";

export default function AdminsPage() {
  const { admins, loading, error, deleteAdmin, updateAdmin } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState({ name: "", email: "", city: "" });

  const activeAdmin = useMemo(
    () => admins.find((admin) => admin._id === editingId) || null,
    [admins, editingId]
  );

  const startEdit = (admin: any) => {
    setEditingId(admin._id);
    setValues({
      name: admin.name || "",
      email: admin.email || "",
      city: admin.city || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setValues({ name: "", email: "", city: "" });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateAdmin(editingId, values);
    cancelEdit();
  };

  return (
    <ProtectedRoute>
      <main className="flex-1 p-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Admins</p>
              <h1 className="mt-2 text-3xl font-semibold">Admin accounts</h1>
              <p className="mt-2 text-sm text-slate-600">View, edit, or delete administrator accounts.</p>
            </div>
          </div>

          <section className="rounded-3xl bg-white p-8 shadow-sm">
            {loading ? (
              <div className="rounded-3xl bg-slate-50 p-10 text-center text-slate-600">Loading admins...</div>
            ) : error ? (
              <div className="rounded-3xl bg-rose-50 p-8 text-rose-700">{error}</div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">Admin user list</h2>
                  <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700">{admins.length} admins</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-max text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="px-3 py-3">Name</th>
                        <th className="px-3 py-3">Email</th>
                        <th className="px-3 py-3">City</th>
                        <th className="px-3 py-3">Role</th>
                        <th className="px-3 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin) => (
                        <tr key={admin._id} className="border-b border-slate-100">
                          <td className="px-3 py-4 font-medium text-slate-900">{admin.name}</td>
                          <td className="px-3 py-4 text-slate-600">{admin.email}</td>
                          <td className="px-3 py-4 text-slate-600">{admin.city || "—"}</td>
                          <td className="px-3 py-4 text-slate-600">{admin.role}</td>
                          <td className="px-3 py-4 space-x-2">
                            <button
                              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                              onClick={() => startEdit(admin)}
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                              onClick={() => deleteAdmin(admin._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {editingId && activeAdmin ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <h3 className="text-lg font-semibold text-slate-900">Edit admin</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <input
                        value={values.name}
                        onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                        placeholder="Name"
                      />
                      <input
                        value={values.email}
                        onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                        placeholder="Email"
                      />
                      <input
                        value={values.city}
                        onChange={(event) => setValues((prev) => ({ ...prev, city: event.target.value }))}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                        placeholder="City"
                      />
                    </div>
                    <div className="mt-5 flex gap-3">
                      <button
                        className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        onClick={saveEdit}
                      >
                        Save
                      </button>
                      <button
                        className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </main>
    </ProtectedRoute>
  );
}
