"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { Search, Users, MoreHorizontal, Trash2, Mail, MapPin, Calendar } from "lucide-react";
import Pagination from "../Pagination";
import { TableSkeleton } from "../skeletonLoader/commonSkeleton";

interface UserListProps {
  users: any[];
  loading: boolean;
  error: string | null;
  onView: (user: any) => void;
  onDelete: (id: string) => void;
}

export default function UserList({ users, loading, error, onView, onDelete }: UserListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      setOpenMenuId(null);
      onDelete(id);
    }
  };

  return (
    <div className="bg-card rounded-[2rem] border border-border-theme shadow-lg overflow-hidden min-h-[500px]">
      <div className="p-6 border-b border-border-theme flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card relative z-10">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email or city..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border-theme bg-hover-theme text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-hover-theme px-4 py-3 rounded-2xl border border-border-theme">
            {filteredUsers.length} Users Found
          </div>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : error ? (
        <div className="p-20 text-center text-rose-500 font-bold">{error}</div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-20 text-center text-slate-400 italic">No users found.</div>
      ) : (
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="bg-th-bg text-[11px] font-bold uppercase tracking-widest text-slate-500 border-b border-border-theme">
                <th className="px-6 py-4 w-[30%] font-sans">Customer</th>
                <th className="px-6 py-4 w-[30%] font-sans">Email Address</th>
                <th className="px-6 py-4 w-[20%] font-sans">Location</th>
                <th className="px-6 py-4 w-[12%] font-sans">Joined</th>
                <th className="px-6 py-4 w-[8%] text-right font-sans">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-theme">
              {currentUsers.map((user) => (
                <tr key={user._id} className="hover:bg-hover-theme transition-colors group border-b border-border-theme/50">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-hover-theme flex items-center justify-center">
                        {(() => {
                          const profileImage = user.profilePic || user.image || user.avatar;
                          return profileImage ? (
                            <img src={profileImage} alt={user.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400">
                              <Users size={18} />
                            </div>
                          );
                        })()}
                      </div>
                      <span className="font-bold text-foreground">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Mail size={14} className="text-slate-300" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-500 text-sm capitalize">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-300" />
                      {user.city || "Not specified"}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold whitespace-nowrap">
                      <Calendar size={14} />
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === user._id ? null : user._id)}
                      className="p-2 text-slate-400 hover:text-slate-900 transition rounded-xl"
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {openMenuId === user._id && (
                      <div
                        ref={menuRef}
                        className="absolute right-6 top-14 w-44 bg-card rounded-2xl shadow-2xl border border-border-theme py-2 z-50 animate-in fade-in zoom-in duration-200"
                      >
                        <button
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-foreground hover:bg-hover-theme transition"
                          onClick={() => {
                            setOpenMenuId(null);
                            onView(user);
                          }}
                        >
                          View Profile
                        </button>
                        <div className="mx-2 my-1 border-t border-border-theme" />
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-500/10 transition"
                        >
                          <Trash2 size={16} />
                          Delete Account
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-6 border-t border-border-theme bg-card flex items-center justify-between">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Results {filteredUsers.length} Customers
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
