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
} from "lucide-react";

export type NavChild = {
  key: string;
  href?: string;
  label: string;
  icon?: ElementType;
  isGroup?: boolean;
  children?: NavChild[];
};

export type NavItem = {
  key: string;
  href?: string;
  label: string;
  icon: ElementType;
  children?: NavChild[];
  /** Opens a custom sub-sidebar (instead of a plain link / child list). "aiChat" = New chat + chat history. */
  panel?: "aiChat";

};

export const adminNavigation: NavItem[] = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: Home },
  // { key: "chat", href: "/chat", label: "AI Chat", icon: Bot },
  { key: "chat", href: "/chat", label: "AI Chat", icon: Bot, panel: "aiChat" },
  {
    key: "shop",
    label: "Shop",
    icon: ShoppingBag,
    children: [
      {
        key: "catalog",
        label: "Catalog",
        isGroup: true,
        children: [
          { key: "products", href: "/products", label: "Products", icon: Box },
          { key: "category", href: "/category", label: "Categories", icon: Tag },
          { key: "flavors", href: "/flavors", label: "Flavors", icon: Pipette },
          { key: "cities", href: "/cities", label: "Cities", icon: MapPin },
          { key: "offers", href: "/coupons", label: "Offers", icon: Gift },
        ],
      },
      {
        key: "order-mgmt",
        label: "Order",
        isGroup: true,
        children: [
          { key: "orders", href: "/orders", label: "Orders", icon: ShoppingCart },
          { key: "reviews", href: "/reviews", label: "Reviews", icon: Star },
          { key: "testimonials", href: "/testimonials", label: "Testimonials", icon: MessageSquareQuote },
        ],
      },
      {
        key: "inventory-mgmt",
        label: "Inventory",
        isGroup: true,
        children: [
          { key: "inventory", href: "/inventory", label: "Inventory", icon: Boxes },
          { key: "payments", href: "/payments", label: "Payments", icon: CreditCard },
        ],
      },
      {
        key: "settings",
        label: "Settings",
        isGroup: true,
        children: [
          { key: "heroSlides", href: "/hero-slides", label: "Hero Slides", icon: SlidersHorizontal },
          { key: "occasions", href: "/occasions", label: "Occasions", icon: PartyPopper },
          { key: "deliveryHours", href: "/delivery-hours", label: "Operating Hours", icon: Clock },
        ],
      },
    ],
  },
  { key: "users", href: "/users", label: "Users", icon: Users },
  {
    key: "insight",
    label: "Insight",
    icon: Lightbulb,
    children: [
      { key: "leads", href: "/leads", label: "Leads", icon: UserPlus },
      { key: "crm", href: "/crm", label: "CRM Contacts", icon: Users },
    ],
  },
  {
    key: "websitecontact",
    label: "Website Contact",
    icon: Phone,
    children: [
      { key: "websiteContacts", href: "/websitecontact", label: "Website Contacts", icon: Mail },
      { key: "customerSupport", href: "/support", label: "Customer Support", icon: LifeBuoy },
    ],
  },
  {
    key: "seo",
    label: "SEO Suite",
    icon: Globe,
    children: [
      { key: "seo-global", href: "/seo/global", label: "Global & Schema", icon: Settings },
      { key: "seo-pages", href: "/seo/pages", label: "Page-by-Page SEO", icon: FileText },
      { key: "seo-redirects", href: "/seo/redirects", label: "URL Redirects", icon: ArrowRightLeft },
      { key: "seo-robots", href: "/seo/robots-sitemap", label: "Robots & Sitemap", icon: Bot },
      { key: "seo-audit", href: "/seo/audit", label: "SEO Health Audit", icon: Activity },
    ],
  },
  {
    key: "admin",
    label: "Admin",
    icon: Settings,
    children: [
      { key: "adminProfile", href: "/admins", label: "Admin Profile", icon: Users },
      { key: "developer", href: "/developer", label: "Developer", icon: Users },
      { key: "termsPolicy", href: "/terms", label: "Terms & Policy", icon: FileText },
    ],
  },
];
