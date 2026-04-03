"use client";

import React, { useEffect, useState } from "react";
import { getAllOrders, getOrderPayments } from "../../services/adminService";
import ProtectedRoute from "../ProtectedRoute";
import { useAdmin } from "../../context/AdminContext";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { DashboardSkeleton } from "../skeletonLoader/commonSkeleton";
import StatsGrid from "./statsGrid";
import RecentOrder from "./recentOrder";
import PaymentHistory from "./paymentHistory";

interface Order {
    _id: string;
    user: { name: string; email: string; phone?: string };
    totalAmount: number;
    status: string;
    paymentStatus: string;
    shippingAddress: {
        fullName: string;
        phone: string;
        address: string;
        pinCode: string;
    };
    items: Array<{ name: string; quantity: number; price: number }>;
    createdAt: string;
}

interface Payment {
    _id: string;
    razorpayPaymentId: string;
    totalAmount: number;
    createdAt: string;
}

export default function DashboardView() {
    const { products, users, loading: adminLoading } = useAdmin();
    const { theme } = useTheme();
    const { token, authenticated } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!authenticated || !token) return;
        try {
            const [ordRes, payRes] = await Promise.all([
                getAllOrders(),
                getOrderPayments()
            ]);
            setOrders(ordRes);
            setPayments(payRes);
        } catch (err) {
            console.error("Dashboard fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authenticated && token) {
            fetchData();
        }
    }, [authenticated, token]);

    const totalRevenue = payments.reduce((acc, curr) => acc + curr.totalAmount, 0);

    const pageWrapper = "bg-background text-foreground";
    const sectionWrapper = "bg-card shadow-lg border border-transparent dark:border-border-theme";

    return (
        <>
            {(loading || adminLoading) ? (
                <DashboardSkeleton />
            ) : (
                <>
                    <StatsGrid
                        totalRevenue={totalRevenue}
                        ordersCount={orders.length}
                        productsCount={products.length}
                        usersCount={users.length}
                    />

                    <div className="mt-10 grid gap-8 lg:grid-cols-2">
                        <RecentOrder orders={orders} sectionWrapper={sectionWrapper} />
                        <PaymentHistory payments={payments} sectionWrapper={sectionWrapper} />
                    </div>
                </>
            )}
        </>

    );
}
