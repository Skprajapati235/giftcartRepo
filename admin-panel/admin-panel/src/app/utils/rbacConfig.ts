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

export const PAGE_ASSIGNMENT_MAP: Record<string, PageRoleInfo> = {
  "/dashboard": {
    assignedTo: "All Departments (Overview)",
    department: "Store Operations",
    allowedRoles: ["super_admin", "admin", "kitchen_manager", "delivery_coordinator", "support_agent", "seo_specialist"],
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    description: "Real-time sales telemetry, hourly order flow, and revenue trends.",
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
    description: "Assign riders, track dispatch in transit, and send Google Maps location pins via WhatsApp.",
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
    allowedRoles: ["super_admin", "admin", "kitchen_manager", "seo_specialist"],
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    description: "Manage cake flavors, weights, eggless options, pricing, and gifting addons.",
  },
  "/inventory": {
    assignedTo: "📦 Warehouse & Inventory Team",
    department: "Inventory Stock",
    allowedRoles: ["super_admin", "admin", "kitchen_manager"],
    badgeColor: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    description: "Track raw baking ingredients, cake boxes, ribbons, and stock counts.",
  },
  "/admins": {
    assignedTo: "🛡️ Super Admin Only (Security & RBAC)",
    department: "Executive Security",
    allowedRoles: ["super_admin", "admin"],
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    description: "Create staff accounts, configure role permissions, and access controls.",
  },
  "/audit-logs": {
    assignedTo: "🛡️ Super Admin Only (Audit & Compliance)",
    department: "System Audit",
    allowedRoles: ["super_admin", "admin"],
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    description: "Immutable activity trail tracking team actions, timestamps, and IP addresses.",
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
  "/crm": {
    assignedTo: "👥 CRM & Customer Relationships",
    department: "Sales & Retention",
    allowedRoles: ["super_admin", "admin", "support_agent"],
    badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    description: "Customer directory, repeat cake buyers, and VIP celebration tracking.",
  },
  "/coupons": {
    assignedTo: "🏷️ Marketing & Promotions",
    department: "Growth Team",
    allowedRoles: ["super_admin", "admin", "seo_specialist"],
    badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    description: "Create festive promo codes, midnight delivery discounts, and seasonal offers.",
  },
};

export function getPageRoleInfo(pathname: string): PageRoleInfo {
  if (!pathname) return PAGE_ASSIGNMENT_MAP["/dashboard"];

  // Exact match
  if (PAGE_ASSIGNMENT_MAP[pathname]) {
    return PAGE_ASSIGNMENT_MAP[pathname];
  }

  // Prefix match
  for (const [route, info] of Object.entries(PAGE_ASSIGNMENT_MAP)) {
    if (pathname.startsWith(route)) {
      return info;
    }
  }

  return {
    assignedTo: "Store Administration",
    department: "Operations",
    allowedRoles: ["super_admin", "admin"],
    badgeColor: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    description: "Administrative workspace module.",
  };
}

export function canAccessPage(userRole: string | undefined, pathname: string): boolean {
  const normalizedRole = (userRole || "super_admin").toLowerCase();
  if (normalizedRole === "super_admin" || normalizedRole === "admin") {
    return true; // Super admin has root access to everything
  }

  const info = getPageRoleInfo(pathname);
  return info.allowedRoles.includes(normalizedRole);
}
