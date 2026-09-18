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
} from "lucide-react";

export type NavChild = {
  key: string;
  href: string;
  label: string;
  icon: ElementType;
};

export type NavItem = {
  key: string;
  href?: string;
  label: string;
  icon: ElementType;
  children?: NavChild[];
};

export const adminNavigation: NavItem[] = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: Home },
  { key: "chat", href: "/chat", label: "AI Chat", icon: Bot },
  {
    key: "shop",
    label: "Shop",
    icon: ShoppingBag,
    children: [
      { key: "products", href: "/products", label: "Products", icon: Box },
      { key: "inventory", href: "/inventory", label: "Inventory", icon: Boxes },
      { key: "deliveryHours", href: "/delivery-hours", label: "Operating Hours", icon: Clock },
      { key: "cities", href: "/cities", label: "Cities", icon: MapPin },
      { key: "orders", href: "/orders", label: "Orders", icon: ShoppingCart },
      { key: "payments", href: "/payments", label: "Payments", icon: CreditCard },
      { key: "reviews", href: "/reviews", label: "Reviews", icon: Star },
      { key: "flavors", href: "/flavors", label: "Flavors", icon: Pipette },
      { key: "occasions", href: "/occasions", label: "Occasions", icon: PartyPopper },
    ],
  },
  { key: "category", href: "/category", label: "Categories", icon: Tag },
  {
    key: "offers",
    label: "Offers",
    icon: Gift,
    children: [{ key: "coupons", href: "/coupons", label: "Coupons", icon: Ticket }],
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
