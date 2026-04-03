"use client";

import React, { useEffect, useState } from "react";
import { getOrderPayments } from "../../services/adminService";
import PaymentList from "./paymentList";

interface Payment {
  _id: string;
  user: { name: string; email: string };
  totalAmount: number;
  razorpayPaymentId: string;
  createdAt: string;
  paymentStatus: string;
}

export default function PaymentsView() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const response = await getOrderPayments();
      setPayments(response);
    } catch (error) {
      console.error("Fetch payments failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <>
      <div className="mb-8 items-end justify-between">
        <h1 className="text-2xl font-bold text-foreground mt-1">Payment history</h1>
        <p className="mt-1 text-sm text-slate-500">Track successful transactions and payment IDs.</p>
      </div>

      <PaymentList payments={payments} loading={loading} />
    </>
  );
}
