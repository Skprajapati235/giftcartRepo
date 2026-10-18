import type { ElementType } from "react";
import {
  Home,
  ShoppingBag,
  Box,
  ShoppingCart,
  Tag,
  Users,
  Settings,
  CreditCard,
  MapPin,
  Star,
  Gift,
  Ticket,
  Pipette,
  PartyPopper,
  FileText,
  Phone,
  Bot,
  Boxes,
  Clock,
  LifeBuoy,
  Mail,
  Lightbulb,
  UserPlus,
  SlidersHorizontal,
  Globe,
  ArrowRightLeft,
  Activity,
  MessageSquareQuote,
  Images,
  ChefHat,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export type NavChild = {
  key: string;
  href?: string;
  label: string;
  description?: string;
  icon?: ElementType;
  isGroup?: boolean;
  children?: NavChild[];
};

export type NavItem = {
  key: string;
  href?: string;
  label: string;
  railLabel?: string;
  icon: ElementType;
  children?: NavChild[];
  /** Opens a custom sub-sidebar (instead of a plain link / child list). "aiChat" = New chat + chat history. */
  panel?: "aiChat";
};

export const adminNavigation: NavItem[] = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: Home },
  { key: "chat", href: "/chat", label: "AI Assistant", icon: Bot, panel: "aiChat" },
  {
    key: "shop",
    label: "Products",
    icon: ShoppingBag,
    children: [
      {
        key: "catalog",
        label: "Products",
        isGroup: true,
        children: [
          { key: "products", href: "/products", label: "All Products", icon: Box },
          { key: "category", href: "/category", label: "Categories", icon: Tag },
          { key: "flavors", href: "/flavors", label: "Flavors", icon: Pipette },
          { key: "cities", href: "/cities", label: "Cities", icon: MapPin },
          { key: "offers", href: "/coupons", label: "Coupons", icon: Gift },
          { key: "addons", href: "/addons", label: "Add-ons", icon: Gift },
          { key: "gallery", href: "/gallery", label: "Gallery", icon: Images },
        ],
      },
      {
        key: "order-mgmt",
        label: "Orders",
        isGroup: true,
        children: [
          { key: "orders", href: "/orders", label: "All Orders", icon: ShoppingCart },
          { key: "kitchenBoard", href: "/orders/board", label: "Kitchen Board", icon: ChefHat },
          { key: "reviews", href: "/reviews", label: "Reviews", icon: Star },
          { key: "testimonials", href: "/testimonials", label: "Testimonials", icon: MessageSquareQuote },
        ],
      },
      {
        key: "inventory-mgmt",
        label: "Inventory",
        isGroup: true,
        children: [
          { key: "inventory", href: "/inventory", label: "Stock", icon: Boxes },
          { key: "payments", href: "/payments", label: "Payments", icon: CreditCard },
        ],
      },
      {
        key: "settings",
        label: "Settings",
        isGroup: true,
        children: [
          { key: "deliverySlots", href: "/delivery-slots", label: "Delivery Slots", icon: Clock },
          { key: "stories", href: "/stories", label: "Stories", icon: Sparkles },
          { key: "heroSlides", href: "/hero-slides", label: "Banners", icon: SlidersHorizontal },
          { key: "occasions", href: "/occasions", label: "Occasions", icon: PartyPopper },
          { key: "deliveryHours", href: "/delivery-hours", label: "Shop Timings", icon: Clock },
        ],
      },
    ],
  },
  { key: "users", href: "/users", label: "Customers", icon: Users },
  {
    key: "insight",
    label: "Leads & CRM",
    railLabel: "Leads",
    icon: Lightbulb,
    children: [
      { key: "leads", href: "/leads", label: "Leads", description: "Customer inquiries", icon: UserPlus },
      { key: "crm", href: "/crm", label: "Contacts", description: "Saved customer phonebook", icon: Users },
    ],
  },
  {
    key: "websitecontact",
    label: "Support",
    railLabel: "Support",
    icon: Phone,
    children: [
      { key: "websiteContacts", href: "/websitecontact", label: "Messages", description: "Website contact inquiries", icon: Mail },
      { key: "customerSupport", href: "/support", label: "Support Tickets", description: "Complaints & help tickets", icon: LifeBuoy },
    ],
  },
  {
    key: "seo",
    label: "Google SEO",
    railLabel: "SEO",
    icon: Globe,
    children: [
      { key: "seo-global", href: "/seo/global", label: "Search Settings", description: "Website title & Google tags", icon: Settings },
      { key: "seo-pages", href: "/seo/pages", label: "Page Titles", description: "Google titles per page", icon: FileText },
      { key: "seo-redirects", href: "/seo/redirects", label: "Redirects", description: "Old links to new links", icon: ArrowRightLeft },
      { key: "seo-robots", href: "/seo/robots-sitemap", label: "Sitemap", description: "Google search index", icon: Bot },
      { key: "seo-audit", href: "/seo/audit", label: "Health Check", description: "Speed check & error detector", icon: Activity },
    ],
  },
  {
    key: "admin",
    label: "Admin & Staff",
    railLabel: "Staff",
    icon: Settings,
    children: [
      { key: "adminProfile", href: "/admins", label: "Staff Accounts", description: "Team accounts & roles", icon: Users },
      { key: "auditLogs", href: "/audit-logs", label: "Activity Logs", description: "Changes & logins record", icon: ShieldCheck },
      { key: "developer", href: "/developer", label: "Developer API", description: "API keys & technical logs", icon: Users },
      { key: "termsPolicy", href: "/terms", label: "Terms & Policy", description: "Terms, refund & privacy", icon: FileText },
    ],
  },
];
