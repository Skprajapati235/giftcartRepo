"use client";

import React, { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus as updateOrderStatusApi } from "../../services/adminService";
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await getAllOrders();
      setOrders(response);
    } catch (error) {
      console.error("Fetch orders failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatusApi(orderId, newStatus);
      fetchOrders();
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
        onUpdateStatus={updateStatus}
      />
    </>
  );
}
