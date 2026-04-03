"use client";

import React, { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import UserList from "./userList";
import UserDetailDialogue from "./userDetailDialogue";

export default function UsersView() {
  const { users, loading, error, deleteUser } = useAdmin();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleDelete = async (id: string) => {
    await deleteUser(id);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mt-1">Customer Accounts</h1>
      </div>

      <UserList
        users={users}
        loading={loading}
        error={error}
        onView={setSelectedUser}
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
    </>
  );
}
