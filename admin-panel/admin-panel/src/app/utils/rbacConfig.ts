export interface RoleDefinition {
  id: string;
  name: string;
  department: string;
  badgeColor: string;
  avatarColor: string;
  description: string;
}

export const ROLES_CONFIG: Record<string, RoleDefinition> = {
  super_admin: {
    id: "super_admin",
    name: "Super Admin",
    department: "Executive Management",
    badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/25",
    avatarColor: "bg-pink-500 text-white",
    description: "Full root control across all modules, theme studio, billing & security.",
  },
  admin: {
    id: "admin",
    name: "Super Admin",
    department: "Executive Management",
    badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/25",
    avatarColor: "bg-pink-500 text-white",
    description: "Full root control across all modules, theme studio, billing & security.",
  },
  kitchen_manager: {
    id: "kitchen_manager",
    name: "Kitchen Manager",
    department: "Bakery & Production",
    badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/25",
    avatarColor: "bg-orange-500 text-white",
    description: "Responsible for cake baking queue, inscriptions, flavors, and dispatch.",
  },
  delivery_coordinator: {
    id: "delivery_coordinator",
    name: "Fleet Coordinator",
    department: "Logistics & Delivery",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/25",
    avatarColor: "bg-blue-500 text-white",
    description: "Assigns delivery riders, tracks midnight routes, and coordinates drop-offs.",
  },
  support_agent: {
    id: "support_agent",
    name: "Support Agent",
    department: "Customer Experience & CRM",
    badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/25",
    avatarColor: "bg-cyan-500 text-white",
    description: "Handles customer inquiries, leads, and sends 15% WhatsApp cart recovery coupons.",
  },
  seo_specialist: {
    id: "seo_specialist",
    name: "SEO Specialist",
    department: "Growth & Marketing",
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/25",
    avatarColor: "bg-purple-500 text-white",
    description: "Manages metadata, Google schemas, promotional coupons, and branding theme.",
  },
};

export interface PageRoleInfo {
  assignedTo: string;
  department: string;
  allowedRoles: string[];
  badgeColor: string;
  description: string;
}

export interface ScreenOption {
  route: string;
  label: string;
  department: string;
  category: "Workspace" | "Catalog" | "Sales & Fleet" | "Growth & CRM" | "Storefront & System";
  defaultRoles: string[];
}

export const AVAILABLE_SCREENS: ScreenOption[] = [
  // Workspace
  { route: "/dashboard", label: "Dashboard Telemetry", department: "Store Operations", category: "Workspace", defaultRoles: ["super_admin", "admin", "kitchen_manager", "delivery_coordinator", "support_agent", "seo_specialist"] },
  { route: "/chat", label: "AI Assistant Studio", department: "Executive Operations", category: "Workspace", defaultRoles: ["super_admin", "admin"] },

  // Catalog
  { route: "/products", label: "Cake Products Catalog", department: "Bakery & Catalog", category: "Catalog", defaultRoles: ["super_admin", "admin", "kitchen_manager"] },
  { route: "/category", label: "Categories Taxonomy", department: "Catalog Management", category: "Catalog", defaultRoles: ["super_admin", "admin", "kitchen_manager"] },
  { route: "/flavors", label: "Flavors & Sponge Variants", department: "Bakery Production", category: "Catalog", defaultRoles: ["super_admin", "admin", "kitchen_manager"] },
  { route: "/addons", label: "Gifting Add-ons & Candles", department: "Bakery & Catalog", category: "Catalog", defaultRoles: ["super_admin", "admin", "kitchen_manager"] },
  { route: "/cities", label: "Delivery Cities & Pin-codes", department: "Logistics Fleet", category: "Catalog", defaultRoles: ["super_admin", "admin", "delivery_coordinator"] },
  { route: "/stores", label: "Partner Stores (Tie-ups)", department: "Catalog & Partners", category: "Catalog", defaultRoles: ["super_admin", "admin", "kitchen_manager", "delivery_coordinator"] },
  { route: "/coupons", label: "Offers & Coupons", department: "Growth & Marketing", category: "Catalog", defaultRoles: ["super_admin", "admin", "seo_specialist"] },
  { route: "/gallery", label: "Media Gallery & Assets", department: "Brand Assets", category: "Catalog", defaultRoles: ["super_admin", "admin", "seo_specialist"] },

  // Sales & Fleet
  { route: "/orders", label: "Orders Pipeline & Invoices", department: "Sales Operations", category: "Sales & Fleet", defaultRoles: ["super_admin", "admin", "kitchen_manager", "delivery_coordinator", "support_agent"] },
  { route: "/orders/board", label: "Kitchen Live Dispatch Board", department: "Bakery & Kitchen", category: "Sales & Fleet", defaultRoles: ["super_admin", "admin", "kitchen_manager"] },
  { route: "/abandoned-carts", label: "Abandoned Cart Recovery", department: "Customer Retention", category: "Sales & Fleet", defaultRoles: ["super_admin", "admin", "support_agent"] },
  { route: "/delivery-fleet", label: "Delivery Fleet & Rider Dispatch", department: "Logistics Fleet", category: "Sales & Fleet", defaultRoles: ["super_admin", "admin", "delivery_coordinator"] },
  { route: "/delivery-slots", label: "Delivery Time Slots", department: "Logistics Fleet", category: "Sales & Fleet", defaultRoles: ["super_admin", "admin", "delivery_coordinator"] },
  { route: "/delivery-hours", label: "Operating & Cutoff Hours", department: "Logistics Fleet", category: "Sales & Fleet", defaultRoles: ["super_admin", "admin", "delivery_coordinator"] },
  { route: "/reviews", label: "Customer Reviews & Ratings", department: "Customer Experience", category: "Sales & Fleet", defaultRoles: ["super_admin", "admin", "support_agent"] },
  { route: "/testimonials", label: "Store Testimonials", department: "Growth & Marketing", category: "Sales & Fleet", defaultRoles: ["super_admin", "admin", "seo_specialist"] },
  { route: "/inventory", label: "Stock Inventory Tracking", department: "Warehouse & Baking", category: "Sales & Fleet", defaultRoles: ["super_admin", "admin", "kitchen_manager"] },
  { route: "/payments", label: "Gateway Settlements & Txns", department: "Executive Finance", category: "Sales & Fleet", defaultRoles: ["super_admin", "admin"] },

  // Growth & CRM
  { route: "/users", label: "Customer Directory", department: "CRM & Customers", category: "Growth & CRM", defaultRoles: ["super_admin", "admin"] },
  { route: "/leads", label: "Leads Funnel", department: "Customer Care", category: "Growth & CRM", defaultRoles: ["super_admin", "admin", "support_agent"] },
  { route: "/crm", label: "CRM Directory & VIPs", department: "Customer Retention", category: "Growth & CRM", defaultRoles: ["super_admin", "admin", "support_agent"] },
  { route: "/websitecontact", label: "Website Contact Inquiries", department: "Customer Care", category: "Growth & CRM", defaultRoles: ["super_admin", "admin", "support_agent"] },
  { route: "/support", label: "Support Tickets & Helpdesk", department: "Customer Experience", category: "Growth & CRM", defaultRoles: ["super_admin", "admin", "support_agent"] },
  { route: "/seo", label: "SEO Global Suite", department: "Growth & Marketing", category: "Growth & CRM", defaultRoles: ["super_admin", "admin", "seo_specialist"] },

  // Storefront & System
  { route: "/theme-customizer", label: "Theme & Branding Studio", department: "Storefront Branding", category: "Storefront & System", defaultRoles: ["super_admin", "admin", "seo_specialist"] },
  { route: "/stories", label: "Story Highlights & Reels", department: "Growth & Marketing", category: "Storefront & System", defaultRoles: ["super_admin", "admin", "seo_specialist"] },
  { route: "/hero-slides", label: "Hero Promotional Slides", department: "Growth & Marketing", category: "Storefront & System", defaultRoles: ["super_admin", "admin", "seo_specialist"] },
  { route: "/occasions", label: "Occasions & Events Tags", department: "Catalog & Marketing", category: "Storefront & System", defaultRoles: ["super_admin", "admin", "seo_specialist", "kitchen_manager"] },
  { route: "/admins", label: "Staff Profiles & RBAC", department: "Executive Security", category: "Storefront & System", defaultRoles: ["super_admin", "admin"] },
  { route: "/audit-logs", label: "Security & Activity Logs", department: "System Audit & Operations", category: "Storefront & System", defaultRoles: ["super_admin", "admin"] },
  { route: "/developer", label: "Developer API & Logs", department: "Engineering", category: "Storefront & System", defaultRoles: ["super_admin", "admin"] },
  { route: "/terms", label: "Terms & Legal Policies", department: "Legal Compliance", category: "Storefront & System", defaultRoles: ["super_admin", "admin"] },
  { route: "/footer", label: "Footer Management Overview", department: "Storefront & SEO", category: "Storefront & System", defaultRoles: ["super_admin", "admin", "seo_specialist"] },
  { route: "/footer/brand", label: "Footer Brand & Contact", department: "Storefront & SEO", category: "Storefront & System", defaultRoles: ["super_admin", "admin", "seo_specialist"] },
  { route: "/footer/badges", label: "Footer Trust Badges", department: "Storefront & SEO", category: "Storefront & System", defaultRoles: ["super_admin", "admin", "seo_specialist"] },
  { route: "/footer/links", label: "Footer Navigation Columns & Links", department: "Storefront & SEO", category: "Storefront & System", defaultRoles: ["super_admin", "admin", "seo_specialist"] },
  { route: "/footer/newsletter", label: "Footer Club & Newsletter", department: "Storefront & SEO", category: "Storefront & System", defaultRoles: ["super_admin", "admin", "seo_specialist"] },
  { route: "/footer/bottom", label: "Footer Bottom Strip & Legal", department: "Storefront & SEO", category: "Storefront & System", defaultRoles: ["super_admin", "admin", "seo_specialist"] },
  { route: "/footer/seo", label: "Footer SEO & Schema", department: "Storefront & SEO", category: "Storefront & System", defaultRoles: ["super_admin", "admin", "seo_specialist"] },
];

export const PAGE_ASSIGNMENT_MAP: Record<string, PageRoleInfo> = {
  "/dashboard": {
    assignedTo: "All Departments (Overview)",
    department: "Store Operations",
    allowedRoles: ["super_admin", "admin", "kitchen_manager", "delivery_coordinator", "support_agent", "seo_specialist"],
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    description: "Real-time sales telemetry, hourly order flow, and revenue trends.",
  },
  "/chat": {
    assignedTo: "👑 Super Admin",
    department: "Executive Operations",
    allowedRoles: ["super_admin", "admin"],
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    description: "Antigravity AI Assistant & Store Copilot.",
  },
  "/orders/board": {
    assignedTo: "👨‍🍳 Kitchen Team (Chefs & Bakers)",
    department: "Bakery & Kitchen",
    allowedRoles: ["super_admin", "admin", "kitchen_manager"],
    badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    description: "Live baking queues, cake weight, flavor, and custom message inscriptions.",
  },
  "/orders": {
    assignedTo: "📦 Sales & Dispatch Team",
    department: "Sales Operations",
    allowedRoles: ["super_admin", "admin", "kitchen_manager", "delivery_coordinator", "support_agent"],
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Incoming live orders pipeline, tax invoice generation, and packing slips.",
  },
  "/delivery-fleet": {
    assignedTo: "🛵 Fleet & Logistics Coordinator",
    department: "Logistics Fleet",
    allowedRoles: ["super_admin", "admin", "delivery_coordinator"],
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    description: "Assign riders, track dispatch in transit, and send Google Maps location pins.",
  },
  "/delivery-slots": {
    assignedTo: "🛵 Fleet & Logistics Coordinator",
    department: "Logistics Fleet",
    allowedRoles: ["super_admin", "admin", "delivery_coordinator"],
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    description: "Configure midnight and standard express delivery slot timing rules.",
  },
  "/delivery-hours": {
    assignedTo: "🛵 Fleet & Logistics Coordinator",
    department: "Logistics Fleet",
    allowedRoles: ["super_admin", "admin", "delivery_coordinator"],
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    description: "Operating cutoff schedules and dispatch window hours.",
  },
  "/cities": {
    assignedTo: "🛵 Fleet & Logistics Coordinator",
    department: "Logistics Fleet",
    allowedRoles: ["super_admin", "admin", "delivery_coordinator"],
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    description: "Delivery coverage regions, pincode mapping, and hub cities.",
  },
  "/abandoned-carts": {
    assignedTo: "🎧 Customer Care & Recovery Team",
    department: "Customer Retention",
    allowedRoles: ["super_admin", "admin", "support_agent"],
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    description: "Recover dropped checkouts with automated 15% discount WhatsApp coupons.",
  },
  "/theme-customizer": {
    assignedTo: "👑 Super Admin & Brand Strategist",
    department: "Storefront Branding",
    allowedRoles: ["super_admin", "admin", "seo_specialist"],
    badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    description: "Control storefront colors, festival presets, and announcement banners live.",
  },
  "/products": {
    assignedTo: "🎂 Kitchen & Catalog Manager",
    department: "Catalog & Production",
    allowedRoles: ["super_admin", "admin", "kitchen_manager"],
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    description: "Manage cake flavors, weights, eggless options, pricing, and gifting addons.",
  },
  "/category": {
    assignedTo: "🎂 Kitchen & Catalog Manager",
    department: "Catalog & Production",
    allowedRoles: ["super_admin", "admin", "kitchen_manager"],
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    description: "Store product taxonomy, cake types, and collection groups.",
  },
  "/flavors": {
    assignedTo: "🎂 Kitchen & Catalog Manager",
    department: "Bakery & Production",
    allowedRoles: ["super_admin", "admin", "kitchen_manager"],
    badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    description: "Baking sponge flavors, cream types, and delicacy options.",
  },
  "/addons": {
    assignedTo: "🎂 Kitchen & Catalog Manager",
    department: "Catalog & Upsells",
    allowedRoles: ["super_admin", "admin", "kitchen_manager"],
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    description: "Celebration accessories, sparkle candles, party toppers, and cards.",
  },
  "/inventory": {
    assignedTo: "📦 Warehouse & Inventory Team",
    department: "Inventory Stock",
    allowedRoles: ["super_admin", "admin", "kitchen_manager"],
    badgeColor: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    description: "Track raw baking ingredients, cake boxes, ribbons, and stock counts.",
  },
  "/stores": {
    assignedTo: "🤝 Partner & Store Manager",
    department: "Partner Tie-ups",
    allowedRoles: ["super_admin", "admin", "kitchen_manager", "delivery_coordinator"],
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Manage local bakeries, florists and gift partner tie-ups, WhatsApp dispatches and store profiles.",
  },
  "/payments": {
    assignedTo: "👑 Super Admin (Financial Settlements)",
    department: "Executive Finance",
    allowedRoles: ["super_admin", "admin"],
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Payment gateway settlements, Razorpay/Cashfree transactions, and revenue audits.",
  },
  "/users": {
    assignedTo: "👑 Super Admin Only",
    department: "Customer Management",
    allowedRoles: ["super_admin", "admin"],
    badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    description: "Registered shoppers, order history, and account records.",
  },
  "/admins": {
    assignedTo: "🛡️ Super Admin Only (Security & RBAC)",
    department: "Executive Security",
    allowedRoles: ["super_admin", "admin"],
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    description: "Create staff accounts, configure role permissions, and access controls.",
  },
  "/audit-logs": {
    assignedTo: "🛡️ Super Admin & System Audit",
    department: "System Audit & Operations",
    allowedRoles: ["super_admin", "admin"],
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Immutable activity trail, telemetry stream, security audit, and instant API file exports (CSV, PDF, JSON).",
  },
  "/activity": {
    assignedTo: "🛡️ Super Admin & System Audit",
    department: "System Audit & Operations",
    allowedRoles: ["super_admin", "admin"],
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Legacy activity alias (redirects to Security & Activity Logs).",
  },
  "/seo": {
    assignedTo: "📈 SEO Growth Specialist",
    department: "Search Optimization",
    allowedRoles: ["super_admin", "admin", "seo_specialist"],
    badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    description: "Manage metadata, Google JSON-LD schema, sitemaps, and robots.txt.",
  },
  "/support": {
    assignedTo: "🎧 Customer Support Specialist",
    department: "Customer Service",
    allowedRoles: ["super_admin", "admin", "support_agent"],
    badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    description: "Respond to customer inquiries, tickets, and contact form messages.",
  },
  "/websitecontact": {
    assignedTo: "🎧 Customer Support Specialist",
    department: "Customer Service",
    allowedRoles: ["super_admin", "admin", "support_agent"],
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Direct contact inquiries and custom celebration requests.",
  },
  "/leads": {
    assignedTo: "🎧 Customer Care & Leads",
    department: "Customer Service",
    allowedRoles: ["super_admin", "admin", "support_agent"],
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Prospective customer leads and phone inquiries.",
  },
  "/crm": {
    assignedTo: "👥 CRM & Customer Relationships",
    department: "Sales & Retention",
    allowedRoles: ["super_admin", "admin", "support_agent"],
    badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    description: "Customer directory, repeat cake buyers, and VIP celebration tracking.",
  },
  "/reviews": {
    assignedTo: "🎧 Customer Support Specialist",
    department: "Customer Service",
    allowedRoles: ["super_admin", "admin", "support_agent"],
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Shopper reviews moderation, photo uploads, and ratings verification.",
  },
  "/testimonials": {
    assignedTo: "📈 SEO & Growth Specialist",
    department: "Growth Team",
    allowedRoles: ["super_admin", "admin", "seo_specialist"],
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    description: "Curated store testimonials and client trust highlights.",
  },
  "/stories": {
    assignedTo: "📈 SEO & Growth Specialist",
    department: "Growth Team",
    allowedRoles: ["super_admin", "admin", "seo_specialist"],
    badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    description: "Instagram-style reels and celebration stories for the storefront.",
  },
  "/hero-slides": {
    assignedTo: "📈 SEO & Growth Specialist",
    department: "Growth Team",
    allowedRoles: ["super_admin", "admin", "seo_specialist"],
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    description: "Promotional banner carousel and festive offers on homepage.",
  },
  "/occasions": {
    assignedTo: "🎂 Kitchen & Marketing",
    department: "Catalog & Events",
    allowedRoles: ["super_admin", "admin", "seo_specialist", "kitchen_manager"],
    badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    description: "Celebration tags (Birthday, Anniversary, Valentine, Midnight Surprise).",
  },
  "/coupons": {
    assignedTo: "🏷️ Marketing & Promotions",
    department: "Growth Team",
    allowedRoles: ["super_admin", "admin", "seo_specialist"],
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Create festive promo codes, midnight delivery discounts, and seasonal offers.",
  },
  "/gallery": {
    assignedTo: "📈 Marketing & Design",
    department: "Brand Assets",
    allowedRoles: ["super_admin", "admin", "seo_specialist"],
    badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    description: "Centralized media repository for cakes, decorations, and banners.",
  },
  "/developer": {
    assignedTo: "🛡️ Super Admin (Developer Console)",
    department: "Engineering",
    allowedRoles: ["super_admin", "admin"],
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    description: "Webhooks, API keys, and server telemetry.",
  },
  "/terms": {
    assignedTo: "🛡️ Super Admin (Legal)",
    department: "Legal Compliance",
    allowedRoles: ["super_admin", "admin"],
    badgeColor: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    description: "Privacy policy, refund policy, and customer terms of service.",
  },
  "/footer": {
    assignedTo: "🌐 Storefront & SEO Specialist",
    department: "Storefront & Branding",
    allowedRoles: ["super_admin", "admin", "seo_specialist"],
    badgeColor: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    description: "Manage storefront footer brand details, trust badges, navigation columns, and SEO schemas.",
  },
};

export function getPageRoleInfo(pathname: string): PageRoleInfo {
  if (!pathname) return PAGE_ASSIGNMENT_MAP["/dashboard"];

  // Exact match
  if (PAGE_ASSIGNMENT_MAP[pathname]) {
    return PAGE_ASSIGNMENT_MAP[pathname];
  }

  // Prefix match (longest prefix first)
  const sortedRoutes = Object.keys(PAGE_ASSIGNMENT_MAP).sort((a, b) => b.length - a.length);
  for (const route of sortedRoutes) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return PAGE_ASSIGNMENT_MAP[route];
    }
  }

  return {
    assignedTo: "Super Admin",
    department: "Executive Security",
    allowedRoles: ["super_admin", "admin"],
    badgeColor: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    description: "Restricted administrative workstation module.",
  };
}

export function getDefaultPermissionsForRole(role: string = ""): string[] {
  const norm = role.toLowerCase().trim();
  if (norm === "super_admin" || norm === "admin") {
    return ["*"];
  }

  return AVAILABLE_SCREENS
    .filter((screen) => screen.defaultRoles.some((r) => r.toLowerCase() === norm))
    .map((screen) => screen.route);
}

export function canAccessPage(
  userRole: string | undefined | null,
  pathname: string,
  userPermissions?: string[] | null
): boolean {
  if (!userRole) return false;
  const normalizedRole = userRole.toLowerCase().trim();

  // Super admin has full unrestricted root access to everything
  if (normalizedRole === "super_admin" || normalizedRole === "admin") {
    return true;
  }

  // If user has wildcard permissions
  if (Array.isArray(userPermissions) && userPermissions.includes("*")) {
    return true;
  }

  const cleanPath = (pathname || "").toLowerCase().trim();

  // If user has explicit assigned screen permissions array:
  // This is the strict single source of truth!
  // ONLY explicitly granted screens can be accessed or visible.
  if (Array.isArray(userPermissions)) {
    return userPermissions.some((p) => {
      if (!p) return false;
      const cleanP = p.toLowerCase().trim();
      return cleanPath === cleanP || cleanPath.startsWith(cleanP + "/");
    });
  }

  // Fallback to role-based access table ONLY for legacy accounts with no permissions array defined at all
  const info = getPageRoleInfo(cleanPath);
  return info.allowedRoles.map((r) => r.toLowerCase()).includes(normalizedRole);
}
