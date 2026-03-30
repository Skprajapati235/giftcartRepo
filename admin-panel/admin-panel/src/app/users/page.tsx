"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Pagination from "../components/Pagination";
import { useAdmin } from "../context/AdminContext";

export default function UsersPage() {
  const { users, loading, error, deleteUser } = useAdmin();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        user.name?.toLowerCase().includes(normalizedSearch) ||
        user.email?.toLowerCase().includes(normalizedSearch) ||
        user.city?.toLowerCase().includes(normalizedSearch)
      ),
    [users, normalizedSearch]
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / 10));
  const currentUsers = filteredUsers.slice((currentPage - 1) * 10, currentPage * 10);

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteUser(id);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <ProtectedRoute>
      <main className="flex-1 p-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Users</p>
              {/* <h1 className="mt-2 text-3xl font-semibold">Registered users</h1>
              <p className="mt-2 text-sm text-slate-600">Review account information and membership.</p> */}
            </div>
          </div>

          <section className="rounded-3xl bg-white p-8 shadow-sm">
            {loading ? (
              <div className="rounded-3xl bg-slate-50 p-10 text-center text-slate-600">Loading users...</div>
            ) : error ? (
              <div className="rounded-3xl bg-rose-50 p-8 text-rose-700">{error}</div>
            ) : (
              <div>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">User accounts</h2>
                    <p className="mt-1 text-sm text-slate-600">Total users in the store.</p>
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search users"
                    className="w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                  />
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-slate-500">{filteredUsers.length} users found</span>
                  <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700">{users.length} total</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-max text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="px-3 py-3">Name</th>
                        <th className="px-3 py-3">Email</th>
                        <th className="px-3 py-3">City</th>
                        <th className="px-3 py-3">Created</th>
                        <th className="px-3 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((user) => (
                        <tr key={user._id} className="border-b border-slate-100">
                          <td className="px-3 py-4 font-medium text-slate-900">{user.name}</td>
                          <td className="px-3 py-4 text-slate-600">{user.email}</td>
                          <td className="px-3 py-4 text-slate-600">{user.city || "—"}</td>
                          <td className="px-3 py-4 text-slate-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-3 py-4">
                            <button
                              className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50"
                              disabled={deleting === user._id}
                              onClick={() => handleDelete(user._id)}
                            >
                              {deleting === user._id ? "Deleting..." : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </section>
      </main>
    </ProtectedRoute>
  );
}
