"use client";

import React, { useState } from "react";
import { useResource } from "../../hooks/useResource";
import * as service from "../../services/adminService";
import UserList from "./userList";
import UserDetailDialogue from "./userDetailDialogue";
import UserWishlistDialogue from "./userWishlistDialogue";

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

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await service.deleteUser(id);
        refresh();
      } catch (err: any) {
        alert("Failed to delete user");
      }
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mt-1">Customer Accounts</h1>
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
    </>
  );
}
