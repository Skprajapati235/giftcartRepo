"use client";

import { useEffect, useMemo, useState } from "react";
import { getOrderPayments } from "../services/adminService";
import ProtectedRoute from "../components/ProtectedRoute";
import Pagination from "../components/Pagination";

interface Payment {
    _id: string;
    user: { name: string; email: string };
    totalAmount: number;
    razorpayPaymentId: string;
    createdAt: string;
    paymentStatus: string;
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

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

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filteredPayments = useMemo(
        () => payments.filter((payment) =>
            payment.razorpayPaymentId?.toLowerCase().includes(normalizedSearch) ||
            payment.user?.name?.toLowerCase().includes(normalizedSearch) ||
            payment._id.toLowerCase().includes(normalizedSearch)
        ),
        [normalizedSearch, payments]
    );

    const totalPages = Math.max(1, Math.ceil(filteredPayments.length / 10));
    const pagePayments = filteredPayments.slice((currentPage - 1) * 10, currentPage * 10);

    return (
        <ProtectedRoute>
            <main className="flex-1 p-10">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Payments</p>
                    </div>
                </div>

                <section className="rounded-3xl bg-white p-8 shadow-sm">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Payment history</h2>
                            <p className="mt-1 text-sm text-slate-600">Track successful transactions and payment IDs.</p>
                        </div>
                        <input
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search by Payment ID or Customer"
                            className="w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                        />
                    </div>

                    {loading ? (
                        <div className="py-20 text-center text-slate-500">Loading payments...</div>
                    ) : pagePayments.length === 0 ? (
                        <div className="rounded-3xl bg-slate-50 p-10 text-center text-slate-600">No successful payments found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-max text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500">
                                        <th className="px-3 py-3">Payment ID</th>
                                        <th className="px-3 py-3">Customer</th>
                                        <th className="px-3 py-3">Amount</th>
                                        <th className="px-3 py-3">Date</th>
                                        <th className="px-3 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pagePayments.map((payment) => (
                                        <tr key={payment._id} className="border-b border-slate-100">
                                            <td className="px-3 py-4 font-mono text-xs text-slate-900">{payment.razorpayPaymentId}</td>
                                            <td className="px-3 py-4 text-slate-600">
                                                <p className="font-semibold">{payment.user?.name}</p>
                                                <p className="text-xs text-slate-400">{payment.user?.email}</p>
                                            </td>
                                            <td className="px-3 py-4 font-bold text-green-600">₹{payment.totalAmount.toFixed(2)}</td>
                                            <td className="px-3 py-4 text-slate-600">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                            <td className="px-3 py-4">
                                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                                    Captured
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </section>
            </main>
        </ProtectedRoute>
    );
}
