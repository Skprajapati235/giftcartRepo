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
  {
    key: "shop",
    label: "Shop",
    icon: ShoppingBag,
    children: [
      { key: "products", href: "/products", label: "Products", icon: Box },
      { key: "cities", href: "/cities", label: "Cities", icon: MapPin },
      { key: "orders", href: "/orders", label: "Orders", icon: ShoppingCart },
      { key: "payments", href: "/payments", label: "Payments", icon: CreditCard },
      { key: "reviews", href: "/reviews", label: "Reviews", icon: Star },
      { key: "flavors", href: "/flavors", label: "Flavors", icon: Pipette },
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
    key: "admin",
    label: "Admin",
    icon: Settings,
    children: [
      { key: "adminProfile", href: "/admins", label: "Admin Profile", icon: Users },
      { key: "Developer", href: "/developer", label: "Developer", icon: Users },
    ],
  },
];
