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
import DashboardCharts from "./dashboardCharts";

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
    const [totalOrders, setTotalOrders] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!authenticated || !token) return;
        try {
            const [ordRes, payRes] = await Promise.all([
                getAllOrders({ limit: 50 }), // Get more for the charts
                getOrderPayments()
            ]);
            const ordersArray = ordRes.data || ordRes;
            setOrders(ordersArray);
            setTotalOrders(ordRes.total || (Array.isArray(ordRes) ? ordRes.length : 0));
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
                        ordersCount={totalOrders}
                        productsCount={products.length}
                        usersCount={users.length}
                    />

                    <DashboardCharts orders={orders} />

                    <div className="mt-10 grid gap-8 lg:grid-cols-2">
                        <RecentOrder orders={orders} sectionWrapper={sectionWrapper} />
                        <PaymentHistory payments={payments} sectionWrapper={sectionWrapper} />
                    </div>
                </>
            )}
        </>

    );
}
