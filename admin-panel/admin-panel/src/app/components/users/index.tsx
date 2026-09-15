"use client";

import React, { useState } from "react";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/adminService";
import UserList from "./userList";
import UserDetailDialogue from "./userDetailDialogue";
import UserWishlistDialogue from "./userWishlistDialogue";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function UsersView() {
  const {
    data: users,
    loading,
    error,
    total,
    totalPages,
    params,
    onPageChange,
    onSearchChange,
    refresh
  } = useResource<any>(service.getUsers, "users");

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedWishlistUser, setSelectedWishlistUser] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await service.deleteUser(deleteId);
      refresh();
      setDeleteId(null);
    } catch (err: any) {
      alert("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Customer Accounts</h1>
      </div>

      <UserList
        users={users}
        loading={loading}
        total={total}
        totalPages={totalPages}
        currentPage={params.page}
        searchTerm={params.search}
        onPageChange={onPageChange}
        onSearchChange={onSearchChange}
        error={error}
        onView={setSelectedUser}
        onViewWishlist={setSelectedWishlistUser}
        onDelete={handleDelete}
      />

      {selectedUser && (
        <div className="pt-10">
          <UserDetailDialogue
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        </div>
      )}

      {selectedWishlistUser && (
        <UserWishlistDialogue
          user={selectedWishlistUser}
          onClose={() => setSelectedWishlistUser(null)}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </>
  );
}
