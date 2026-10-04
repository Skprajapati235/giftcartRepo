"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getAllOrders, getOrderPayments } from "../../services/adminService";
import { getInventorySummary, InventorySummary } from "../../services/inventoryService";
import { getAllLeads } from "../../services/leadService";
import { getDeliveryHours, DeliveryHoursStatus } from "../../services/deliveryHoursService";
import { getSupportTickets } from "../../services/supportService";
import { useAdmin } from "../../context/AdminContext";
import { useAuth } from "../../context/AuthContext";
import { DashboardSkeleton } from "../skeletonLoader/commonSkeleton";
import StatsGrid from "./statsGrid";
import RecentOrder from "./recentOrder";
import PaymentHistory from "./paymentHistory";
import DashboardCharts, { DashboardTab } from "./dashboardCharts";
import Link from "next/link";
import {
  Sparkles,
  RefreshCw,
  PlusCircle,
  ShoppingBag,
  Clock,
  AlertTriangle,
  LifeBuoy,
  TrendingUp,
  ArrowUpRight,
  ChefHat,
  LayoutGrid,
  PackageCheck,
  Target,
  CreditCard,
  Flame,
  Package,
  Moon,
  CheckCircle2,
  Search,
  X,
  Zap,
} from "lucide-react";

export interface Order {
  _id: string;
  user: { name: string; email: string; phone?: string };
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  isPaymentAbandoned?: boolean;
  paymentCancelReason?: string;
  kitchenStatus?: string;
  deliverySlot?: {
    slotName?: string;
    slotType?: string;
    timeRange?: string;
    extraCharge?: number;
    deliveryDate?: string;
  };
  messageOnCake?: string;
  cardMessage?: string;
  recipientName?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    pinCode: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    messageOnCake?: string;
    flavor?: string;
    deliveryTime?: string;
    expectedDeliveryDate?: string;
  }>;
  createdAt: string;
}

export interface Payment {
  _id: string;
  razorpayPaymentId: string;
  totalAmount: number;
  createdAt: string;
}

export interface LeadItem {
  _id?: string;
  source?: string;
  status?: string;
  name?: string;
  phone?: string;
}

export interface SupportTicketItem {
  _id?: string;
  status?: string;
  subject?: string;
  priority?: string;
}

export default function DashboardView() {
  const { totalProducts, totalUsers, refreshAll } = useAdmin();
  const { token, authenticated, user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [leadsCount, setLeadsCount] = useState<number>(0);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [pendingTicketsCount, setPendingTicketsCount] = useState<number>(0);
  const [supportData, setSupportData] = useState<{
    tickets: SupportTicketItem[];
    counts?: {
      total: number;
      pending: number;
      in_progress: number;
      resolved: number;
      closed?: number;
    };
  } | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryHoursStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchData = useCallback(async () => {
    if (!authenticated || !token) return;
    try {
      const [ordRes, payRes, invRes, leadRes, delivRes, supportRes] = await Promise.allSettled([
        getAllOrders({ limit: 50 }),
        getOrderPayments(),
        getInventorySummary().catch(() => null),
        getAllLeads({ limit: 100 }).catch(() => ({ total: 0, leads: [] })),
        getDeliveryHours().catch(() => null),
        getSupportTickets({ limit: 50 }).catch(() => null),
      ]);

      if (ordRes.status === "fulfilled" && ordRes.value) {
        const ordersArray = ordRes.value.data || ordRes.value;
        setOrders(Array.isArray(ordersArray) ? ordersArray : []);
        setTotalOrders(ordRes.value.total || (Array.isArray(ordRes.value) ? ordRes.value.length : 0));
      }

      if (payRes.status === "fulfilled" && Array.isArray(payRes.value)) {
        setPayments(payRes.value);
      }

      if (invRes.status === "fulfilled" && invRes.value) {
        setInventorySummary(invRes.value);
      }

      if (leadRes.status === "fulfilled" && leadRes.value) {
        setLeadsCount(leadRes.value.total || 0);
        const leadsArr = leadRes.value.leads || leadRes.value.data || [];
        setLeads(Array.isArray(leadsArr) ? leadsArr : []);
      }

      if (delivRes.status === "fulfilled" && delivRes.value) {
        setDeliveryStatus(delivRes.value);
      }

      if (supportRes.status === "fulfilled" && supportRes.value) {
        const val = supportRes.value;
        const tickets = Array.isArray(val.data) ? val.data : [];
        const counts = val.counts || {
          total: val.total || tickets.length,
          pending: tickets.filter((t: SupportTicketItem) => t.status === "pending").length,
          in_progress: tickets.filter((t: SupportTicketItem) => t.status === "in_progress").length,
          resolved: tickets.filter((t: SupportTicketItem) => t.status === "resolved").length,
        };
        setSupportData({ tickets, counts });
        setPendingTicketsCount(counts.pending ?? 0);
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authenticated, token]);

  useEffect(() => {
    if (authenticated && token) {
      fetchData();
    }
  }, [authenticated, token, fetchData]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      fetchData(),
      refreshAll().catch(() => { }),
    ]);
    setRefreshing(false);
  };

  const totalRevenue = payments.reduce((acc, curr) => acc + curr.totalAmount, 0);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const isRestrictedActive = deliveryStatus?.isRestricted;
  const isNightClosed = deliveryStatus?.isCurrentlyRestricted;

  const incompleteOrdersCount = orders.filter((order: Order) => {
    if (order.paymentMethod === 'COD') return false;
    if (order.paymentStatus === 'Success') return false;
    if (order.isPaymentAbandoned) return true;
    if (order.paymentStatus === 'Incomplete' || order.paymentStatus === 'Cancelled') return true;
    if (order.paymentStatus === 'Pending' && order.createdAt) {
      const diffMins = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);
      if (diffMins > 15) return true;
    }
    return false;
  }).length;

  // Kitchen live preparation active count
  const kitchenInPrepCount = orders.filter((o: Order) => {
    const st = (o.kitchenStatus || o.status || "Pending").trim();
    return ["Received", "Pending", "In Kitchen", "Preparing", "Processing"].includes(st);
  }).length;

  // Midnight delivery slots count
  const midnightOrdersCount = orders.filter((o: Order) => {
    const slotType = (o.deliverySlot?.slotType || "").toLowerCase();
    const slotName = (o.deliverySlot?.slotName || "").toLowerCase();
    const timeRange = (o.deliverySlot?.timeRange || "").toLowerCase();
    const itemSlot = (o.items?.[0]?.deliveryTime || "").toLowerCase();
    return (
      slotType.includes("midnight") ||
      slotName.includes("midnight") ||
      timeRange.includes("11:00 pm") ||
      timeRange.includes("12:00 am") ||
      itemSlot.includes("midnight")
    );
  }).length;

  // Custom cake messages count
  const cakeMessagesCount = orders.filter((o: Order) => {
    return Boolean(
      (o.messageOnCake && o.messageOnCake.trim()) ||
      o.items?.some((it) => it.messageOnCake && it.messageOnCake.trim())
    );
  }).length;

  // Average Order Value
  const aov = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // CRM lead conversion rate
  const convertedLeadsCount = leads.filter((l) => (l.status || "").toUpperCase() === "CONVERTED").length;
  const leadConversionRate = leads.length > 0 ? Math.round((convertedLeadsCount / leads.length) * 100) : 0;

  // Support ticket resolution rate
  const resolvedTicketsCount = supportData?.counts?.resolved ?? supportData?.tickets?.filter((t) => t.status === "resolved").length ?? 0;
  const totalTickets = supportData?.counts?.total ?? supportData?.tickets?.length ?? 0;
  const supportResolutionRate = totalTickets > 0 ? Math.round((resolvedTicketsCount / totalTickets) * 100) : 0;

  interface PlatformPillar {
    id: string;
    tab: DashboardTab;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    tagBadge: string;
    badgeStyle: string;
    cardBorder: string;
    cardBg: string;
    iconBg: string;
    iconColor: string;
    titleColor: string;
    accentColor: string;
    description: string;
    dataPoints: string[];
    liveMetrics: Array<{ label: string; value: string | number; alert?: boolean }>;
    primaryLink: { label: string; href: string };
    secondaryLinks: Array<{ label: string; href: string }>;
    tags: string[];
  }

  const platformPillars: PlatformPillar[] = [
    {
      id: "kitchen",
      tab: "kitchen",
      title: "1. Bakery Kitchen & Dispatch (KDS)",
      subtitle: "Live Baking, Inscriptions & Express Fulfillment",
      icon: ChefHat,
      tagBadge: "#KitchenKDS",
      badgeStyle: "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30",
      cardBorder: "border-teal-500/30 hover:border-teal-500/60",
      cardBg: "bg-teal-500/5 hover:bg-teal-500/10",
      iconBg: "bg-teal-500/15",
      iconColor: "text-teal-700 dark:text-teal-300",
      titleColor: "text-teal-900 dark:text-teal-300",
      accentColor: "text-teal-700 dark:text-teal-400",
      description: "Real-time bakery pipeline from oven to dispatch. Tracks active prep stages, urgent midnight delivery slots, and custom inscriptions on cakes.",
      dataPoints: [
        "Live pipeline: Received → In Kitchen → Baked → Packed → Dispatched",
        "Midnight delivery slot countdown & priority express handling",
        "Personalized inscriptions on cakes & message cards",
        "Chef urgency queue for upcoming slot deadlines",
      ],
      liveMetrics: [
        { label: "Active in Prep", value: `${kitchenInPrepCount} Orders`, alert: kitchenInPrepCount > 0 },
        { label: "Midnight Slots", value: `${midnightOrdersCount} Orders` },
        { label: "Cake Messages", value: `${cakeMessagesCount} Custom` },
      ],
      primaryLink: { label: "Open Kitchen Board", href: "/orders/board" },
      secondaryLinks: [
        { label: "Order List", href: "/orders" },
        { label: "Delivery Slots", href: "/delivery-slots" },
      ],
      tags: ["kitchen", "kds", "orders", "prep", "baking", "cake", "midnight", "#KitchenKDS"],
    },
    {
      id: "sales",
      tab: "sales",
      title: "2. Sales, Finance & Gateway Settlements",
      subtitle: "GMV, Razorpay Digital & COD Ledger",
      icon: CreditCard,
      tagBadge: "#SalesRevenue",
      badgeStyle: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
      cardBorder: "border-emerald-500/30 hover:border-emerald-500/60",
      cardBg: "bg-emerald-500/5 hover:bg-emerald-500/10",
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-700 dark:text-emerald-300",
      titleColor: "text-emerald-900 dark:text-emerald-300",
      accentColor: "text-emerald-700 dark:text-emerald-400",
      description: "Financial performance center tracking gross sales, payment method splits (Online vs Cash on Delivery), basket size, and abandoned checkouts.",
      dataPoints: [
        "Gross Merchandise Value (GMV) & net settled transactions",
        "Razorpay online gateway (UPI/Cards/Netbanking) vs COD ratio",
        "Average Order Value (AOV) and upsell cart performance",
        "Unpaid dropout tracking (checkout dropouts needing retargeting)",
      ],
      liveMetrics: [
        { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}` },
        { label: "Avg Order Value", value: `₹${aov}` },
        { label: "Unpaid Abandoned", value: `${incompleteOrdersCount} Carts`, alert: incompleteOrdersCount > 0 },
      ],
      primaryLink: { label: "View Sales & Orders", href: "/orders" },
      secondaryLinks: [
        { label: "Addon Up-sells", href: "/addons" },
        { label: "Payment Logs", href: "/orders" },
      ],
      tags: ["sales", "revenue", "finance", "razorpay", "cod", "payment", "aov", "abandoned", "#SalesRevenue"],
    },
    {
      id: "inventory",
      tab: "inventory",
      title: "3. Catalog, Warehouse & Physical Inventory",
      subtitle: "Stock Health, Valuation & Depletion Alerts",
      icon: PackageCheck,
      tagBadge: "#WarehouseStock",
      badgeStyle: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30",
      cardBorder: "border-blue-500/30 hover:border-blue-500/60",
      cardBg: "bg-blue-500/5 hover:bg-blue-500/10",
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-700 dark:text-blue-300",
      titleColor: "text-blue-900 dark:text-blue-300",
      accentColor: "text-blue-700 dark:text-blue-400",
      description: "Physical unit counts, selling valuation across warehouse shelves, automated low-stock depletion warnings, and product catalog categorization.",
      dataPoints: [
        "Product catalog SKUs with pricing and variant specifications",
        "Total physical units currently stored in warehouse bins",
        "Total inventory asset selling valuation at current MRP",
        "Automated low-stock threshold triggers (<10 units remaining)",
      ],
      liveMetrics: [
        { label: "Active SKUs", value: `${totalProducts} Products` },
        { label: "Warehouse Stock", value: `${inventorySummary?.totalStock || 0} Units` },
        { label: "Low Stock Alert", value: `${inventorySummary?.lowStockCount || 0} SKUs`, alert: (inventorySummary?.lowStockCount || 0) > 0 },
      ],
      primaryLink: { label: "Manage Inventory", href: "/inventory" },
      secondaryLinks: [
        { label: "All Products", href: "/products" },
        { label: "Categories", href: "/categories" },
      ],
      tags: ["inventory", "warehouse", "stock", "catalog", "products", "sku", "valuation", "low stock", "#WarehouseStock"],
    },
    {
      id: "logistics",
      tab: "kitchen",
      title: "4. Logistics, Slots & Delivery Hours",
      subtitle: "Fulfillment Windows & Night Curfew Controls",
      icon: Clock,
      tagBadge: "#DeliveryCurfew",
      badgeStyle: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
      cardBorder: "border-amber-500/30 hover:border-amber-500/60",
      cardBg: "bg-amber-500/5 hover:bg-amber-500/10",
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-700 dark:text-amber-300",
      titleColor: "text-amber-900 dark:text-amber-300",
      accentColor: "text-amber-700 dark:text-amber-400",
      description: "Governs store operating hours, automated night curfew cutoff schedules, time-slot express pricing, and pincode serviceable radius.",
      dataPoints: [
        "Time slot configurations (Midnight 11 PM-12 AM, Fixed, Standard)",
        "Night curfew automation (automatic store checkout pause & resume)",
        "Active operating window status and next opening countdown",
        "Slot capacity management to prevent kitchen over-commitments",
      ],
      liveMetrics: [
        { label: "Curfew Status", value: isRestrictedActive ? "Restricted" : "24/7 Open", alert: Boolean(isNightClosed) },
        { label: "Operating Window", value: isRestrictedActive ? `${deliveryStatus?.dailyStart || "23:00"} - ${deliveryStatus?.dailyEnd || "07:00"}` : "24/7 Active" },
        { label: "Midnight Slots", value: `${midnightOrdersCount} Booked` },
      ],
      primaryLink: { label: "Configure Hours", href: "/delivery-hours" },
      secondaryLinks: [
        { label: "Delivery Slots", href: "/delivery-slots" },
        { label: "Dispatch Board", href: "/orders/board" },
      ],
      tags: ["delivery", "logistics", "curfew", "slots", "midnight", "hours", "night", "#DeliveryCurfew"],
    },
    {
      id: "crm",
      tab: "crm",
      title: "5. Omnichannel CRM & Marketing Pipeline",
      subtitle: "Inbound Social Leads & Conversion Stages",
      icon: Target,
      tagBadge: "#CRMLeads",
      badgeStyle: "bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30",
      cardBorder: "border-purple-500/30 hover:border-purple-500/60",
      cardBg: "bg-purple-500/5 hover:bg-purple-500/10",
      iconBg: "bg-purple-500/15",
      iconColor: "text-purple-700 dark:text-purple-300",
      titleColor: "text-purple-900 dark:text-purple-300",
      accentColor: "text-purple-700 dark:text-purple-400",
      description: "Omnichannel customer inquiry hub aggregating leads from WhatsApp, Instagram DMs, Facebook, and Web into an actionable conversion funnel.",
      dataPoints: [
        "Social lead capture across Instagram, WhatsApp, and Web forms",
        "Pipeline stages: New Inquiry → Contacted → Qualified → Converted",
        "Sales team follow-up attribution and customer conversion timeline",
        "Lead-to-paid conversion rate metrics and source ROI tracking",
      ],
      liveMetrics: [
        { label: "Total Leads", value: `${leadsCount} Inquiries` },
        { label: "Converted Deals", value: `${convertedLeadsCount} Closed` },
        { label: "Funnel Win Rate", value: `${leadConversionRate}% Win` },
      ],
      primaryLink: { label: "Open CRM Leads", href: "/leads" },
      secondaryLinks: [
        { label: "Story Campaigns", href: "/stories" },
        { label: "Customer List", href: "/users" },
      ],
      tags: ["crm", "leads", "marketing", "whatsapp", "instagram", "conversion", "funnel", "#CRMLeads"],
    },
    {
      id: "support",
      tab: "crm",
      title: "6. Customer Care, Helpdesk & Buyer Base",
      subtitle: "Ticket SLA, Urgency & Verified Users",
      icon: LifeBuoy,
      tagBadge: "#SupportDesk",
      badgeStyle: "bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30",
      cardBorder: "border-sky-500/30 hover:border-sky-500/60",
      cardBg: "bg-sky-500/5 hover:bg-sky-500/10",
      iconBg: "bg-sky-500/15",
      iconColor: "text-sky-700 dark:text-sky-300",
      titleColor: "text-sky-900 dark:text-sky-300",
      accentColor: "text-sky-700 dark:text-sky-400",
      description: "Customer service helpdesk managing queries, feedback, delivery complaints, along with the directory of registered customer accounts.",
      dataPoints: [
        "Live support ticket queue with priority levels & status tracking",
        "Ticket resolution speed and customer satisfaction metrics",
        "Verified customer profiles with phone numbers and delivery history",
        "Repeat customer retention and order frequency insights",
      ],
      liveMetrics: [
        { label: "Registered Buyers", value: `${totalUsers} Users` },
        { label: "Open Tickets", value: `${pendingTicketsCount} Pending`, alert: pendingTicketsCount > 0 },
        { label: "Resolution Rate", value: `${supportResolutionRate}% Resolved` },
      ],
      primaryLink: { label: "Helpdesk Tickets", href: "/support" },
      secondaryLinks: [
        { label: "User Profiles", href: "/users" },
        { label: "Support Queue", href: "/support" },
      ],
      tags: ["support", "helpdesk", "tickets", "users", "customers", "queries", "care", "#SupportDesk"],
    },
  ];

  const handleDashboardTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    setSelectedTag("all");
  };

  const quickTags = [
    { label: "All Data Pillars (6)", value: "all" },
    { label: "#KitchenKDS", value: "#KitchenKDS" },
    { label: "#SalesRevenue", value: "#SalesRevenue" },
    { label: "#WarehouseStock", value: "#WarehouseStock" },
    { label: "#DeliveryCurfew", value: "#DeliveryCurfew" },
    { label: "#CRMLeads", value: "#CRMLeads" },
    { label: "#SupportDesk", value: "#SupportDesk" },
  ];

  const filteredPillars = platformPillars.filter((pillar) => {
    if (activeTab !== "all" && pillar.tab !== activeTab) return false;
    if (selectedTag !== "all") {
      const matchTag = pillar.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
      if (!matchTag) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const inTitle = pillar.title.toLowerCase().includes(q);
    const inSubtitle = pillar.subtitle.toLowerCase().includes(q);
    const inDesc = pillar.description.toLowerCase().includes(q);
    const inPoints = pillar.dataPoints.some((dp) => dp.toLowerCase().includes(q));
    const inTags = pillar.tags.some((t) => t.toLowerCase().includes(q));
    const inMetrics = pillar.liveMetrics.some((m) => m.label.toLowerCase().includes(q) || String(m.value).toLowerCase().includes(q));
    return inTitle || inSubtitle || inDesc || inPoints || inTags || inMetrics;
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* 1. Header Banner: Greeting + Live Store Status + Quick Actions */}
      <div className="relative overflow-hidden rounded-2xl border border-border-theme bg-card p-4 sm:p-5 shadow-sm">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-16 h-48 w-48 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
                <Sparkles className="h-3 w-3" />
                <span>Admin Command Center</span>
              </span>

              {incompleteOrdersCount > 0 && (
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
                  title="View customers who backed out without completing payment"
                >
                  <AlertTriangle className="h-3 w-3 text-rose-500" />
                  <span>{incompleteOrdersCount} User Backed Out (Unpaid)</span>
                </Link>
              )}

              {/* Delivery Operating Pill */}
              <Link
                href="/delivery-hours"
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition-colors ${!isRestrictedActive
                    ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-border-theme"
                    : isNightClosed
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                  }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${!isRestrictedActive
                      ? "bg-slate-400"
                      : isNightClosed
                        ? "bg-rose-500 animate-pulse"
                        : "bg-emerald-500 animate-pulse"
                    }`}
                />
                <span>
                  {!isRestrictedActive
                    ? "24/7 Delivery Open"
                    : isNightClosed
                      ? "🌙 Night Pause Active"
                      : "🟢 Deliveries Open"}
                </span>
              </Link>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              {getGreeting()}, {user?.name ? user.name.split(" ")[0] : "Admin"} 👋
            </h1>

            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              Real-time snapshot of your e-commerce gift store, orders, revenue, and fulfillment.
            </p>
          </div>

          {/* Action Buttons: Quick Navigation + Refresh */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              title="Refresh Dashboard"
              className="flex items-center gap-1.5 rounded-xl border border-border-theme bg-background px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/products"
              className="flex items-center gap-1.5 rounded-xl bg-primary text-white px-3 py-2 text-xs font-bold shadow-xs hover:opacity-95 transition-all cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>New Product</span>
            </Link>

            <Link
              href="/orders"
              className="flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-2 text-xs font-bold transition-all cursor-pointer"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>View Orders</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Operational Priority Action Stream (Live Backlog & Immediate Actions) */}
      {(incompleteOrdersCount > 0 || kitchenInPrepCount > 0 || (inventorySummary?.lowStockCount || 0) > 0 || pendingTicketsCount > 0 || midnightOrdersCount > 0) ? (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-3 sm:p-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Flame className="h-3 w-3" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  ⚡ Operational Priority Stream: Action Required Now
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  Real-time pending fulfillment, payment dropouts, and stock warnings requiring admin decisions
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full self-start sm:self-auto">
              Live Priority Queue
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {incompleteOrdersCount > 0 && (
              <Link
                href="/orders"
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                <AlertTriangle className="h-3 w-3" />
                <span>{incompleteOrdersCount} Unpaid Abandoned Checkouts</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}

            {kitchenInPrepCount > 0 && (
              <Link
                href="/orders/board"
                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:bg-teal-500/20 transition-all cursor-pointer"
              >
                <ChefHat className="h-3 w-3" />
                <span>{kitchenInPrepCount} Orders in Kitchen Preparation</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}

            {(inventorySummary?.lowStockCount || 0) > 0 && (
              <Link
                href="/inventory"
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                <Package className="h-3 w-3" />
                <span>{inventorySummary?.lowStockCount} SKUs Low on Stock</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}

            {pendingTicketsCount > 0 && (
              <Link
                href="/support"
                className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-700 dark:text-sky-400 hover:bg-sky-500/20 transition-all cursor-pointer"
              >
                <LifeBuoy className="h-3 w-3" />
                <span>{pendingTicketsCount} Customer Queries Need Reply</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}

            {midnightOrdersCount > 0 && (
              <Link
                href="/orders/board"
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-bold text-purple-700 dark:text-purple-400 hover:bg-purple-500/20 transition-all cursor-pointer"
              >
                <Moon className="h-3 w-3" />
                <span>{midnightOrdersCount} Midnight Orders Tonight</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              All Operational Queues Clear: Orders, kitchen prep, and customer tickets running smoothly.
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full">
            100% Operational
          </span>
        </div>
      )}

      {/* 3. Primary KPI Cards Grid */}
      <StatsGrid
        totalRevenue={totalRevenue}
        ordersCount={totalOrders}
        productsCount={totalProducts}
        usersCount={totalUsers}
        lowStockCount={inventorySummary?.lowStockCount || 0}
        leadsCount={leadsCount}
      />

      {/* 3. Operational Highlights Strip (Low Stock Alert, Support Tickets, Inventory Valuation) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Inventory Stock Health */}
        <Link
          href="/inventory"
          className="group relative overflow-hidden rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Inventory Valuation
            </span>
            <div className="rounded-lg p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
            ₹{(inventorySummary?.totalValueSelling || 0).toLocaleString("en-IN")}
          </div>
          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center justify-between">
            <span>{inventorySummary?.totalStock || 0} units stored</span>
            <span className="text-primary font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Manage <ArrowUpRight className="h-3 w-3" />
            </span>
          </p>
        </Link>

        {/* Customer Support Queue */}
        <Link
          href="/support"
          className="group relative overflow-hidden rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Support Inquiries
            </span>
            <div className="rounded-lg p-1.5 bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <LifeBuoy className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
            {pendingTicketsCount} Pending
          </div>
          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center justify-between">
            <span>Customer tickets in queue</span>
            <span className="text-sky-600 dark:text-sky-400 font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Review <ArrowUpRight className="h-3 w-3" />
            </span>
          </p>
        </Link>

        {/* Store Night Delivery Hours */}
        <Link
          href="/delivery-hours"
          className="group relative overflow-hidden rounded-2xl border border-border-theme bg-card p-3.5 sm:p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Operating Window
            </span>
            <div className="rounded-lg p-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
            {isRestrictedActive
              ? `${deliveryStatus?.dailyStart || "23:00"} - ${deliveryStatus?.dailyEnd || "07:00"}`
              : "24/7 Always Open"}
          </div>
          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium flex items-center justify-between">
            <span>
              {isRestrictedActive ? "Night window active" : "No cutoff active"}
            </span>
            <span className="text-purple-600 dark:text-purple-400 font-bold inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Configure <ArrowUpRight className="h-3 w-3" />
            </span>
          </p>
        </Link>
      </div>

      {/* 4. Interactive Dashboard Section Navigator & Blueprint Hub */}
      <div className="space-y-3">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 p-2 rounded-2xl border border-border-theme bg-card shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => handleDashboardTabChange("all")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === "all"
                  ? "bg-primary text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>All Sections</span>
            </button>

            <button
              type="button"
              onClick={() => handleDashboardTabChange("kitchen")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === "kitchen"
                  ? "bg-teal-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-teal-500/10 hover:text-teal-600"
                }`}
            >
              <ChefHat className="h-3.5 w-3.5" />
              <span>Kitchen & Delivery</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${activeTab === "kitchen" ? "bg-white/20 text-white" : "bg-teal-500/15 text-teal-700 dark:text-teal-300"
                }`}>
                {kitchenInPrepCount} active
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDashboardTabChange("sales")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === "sales"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600"
                }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Sales & Revenue</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${activeTab === "sales" ? "bg-white/20 text-white" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                }`}>
                ₹{totalRevenue > 999 ? `${Math.round(totalRevenue / 1000)}k` : totalRevenue}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDashboardTabChange("inventory")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === "inventory"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-blue-500/10 hover:text-blue-600"
                }`}
            >
              <PackageCheck className="h-3.5 w-3.5" />
              <span>Warehouse & Stock</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${activeTab === "inventory" ? "bg-white/20 text-white" : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                }`}>
                {inventorySummary?.totalStock || 0} units
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDashboardTabChange("crm")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === "crm"
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-purple-500/10 hover:text-purple-600"
                }`}
            >
              <Target className="h-3.5 w-3.5" />
              <span>CRM & Support</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${activeTab === "crm" ? "bg-white/20 text-white" : "bg-purple-500/15 text-purple-700 dark:text-purple-300"
                }`}>
                {leadsCount} leads
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium px-1">
            <span>Filter mode:</span>
            <span className="font-bold text-slate-900 dark:text-white capitalize">
              {activeTab === "all" ? "Viewing All 4 Hubs" : `${activeTab} Hub Only`}
            </span>
          </div>
        </div>


      </div>

      {/* 5. Interactive Order Volume & Fulfillment Charts */}
      <DashboardCharts
        orders={orders}
        payments={payments}
        leads={leads}
        inventorySummary={inventorySummary}
        supportData={supportData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 6. Recent Activity: Orders & Payments Tables */}
      {(activeTab === "all" || activeTab === "kitchen" || activeTab === "sales") && (
        <div className="grid gap-4 lg:grid-cols-2">
          <RecentOrder orders={orders} />
          <PaymentHistory payments={payments} />
        </div>
      )}
    </div>
  );
}
