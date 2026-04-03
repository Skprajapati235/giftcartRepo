"use client";

import React from "react";
import Card from "./card";

interface StatsGridProps {
  totalRevenue: number;
  ordersCount: number;
  productsCount: number;
  usersCount: number;
}

export default function StatsGrid({
  totalRevenue,
  ordersCount,
  productsCount,
  usersCount,
}: StatsGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        title="Revenue"
        value={`₹${totalRevenue.toLocaleString()}`}
        subtitle="Successful payments"
      />
      <Card title="Orders" value={ordersCount} subtitle="Orders placed" />
      <Card title="Products" value={productsCount} subtitle="Active listings" />
      <Card title="Users" value={usersCount} subtitle="Customers" />
    </div>
  );
}
