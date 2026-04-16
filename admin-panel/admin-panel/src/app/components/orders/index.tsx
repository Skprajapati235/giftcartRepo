"use client";

import React, { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus as updateOrderStatusApi } from "../../services/adminService";
import { useResource } from "../../hooks/useResource";
import OrderList from "./orderList";

interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user: { name: string; email: string };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function OrdersView() {
  const {
    data: orders,
    loading,
    total,
    totalPages,
    params,
    onPageChange,
    onSearchChange,
    refresh
  } = useResource<Order>(getAllOrders, "orders");

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatusApi(orderId, newStatus);
      refresh();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  return (
    <>
      <div className="mb-8 items-end justify-between">
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Orders</h1>
      </div>
      <OrderList
        orders={orders}
        loading={loading}
        total={total}
        totalPages={totalPages}
        currentPage={params.page}
        searchTerm={params.search}
        onPageChange={onPageChange}
        onSearchChange={onSearchChange}
        onUpdateStatus={updateStatus}
      />
    </>
  );
}
