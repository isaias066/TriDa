import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Tag,
  PiggyBank,
  Target,
  Sparkles,
  BarChart3,
  ShieldAlert,
  MapPin,
  Settings,
  Laptop,
} from "lucide-react";
import React from "react";

export interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badgeKey?: "pendingAlerts";
  roles?: ("USER" | "ADMIN")[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    path: "/dashboard",
    label: "Resumen",
    icon: LayoutDashboard,
  },
  {
    path: "/accounts",
    label: "Mis Cuentas",
    icon: Wallet,
  },
  {
    path: "/transactions",
    label: "Movimientos",
    icon: ArrowLeftRight,
  },
  {
    path: "/categories",
    label: "Categorías",
    icon: Tag,
  },
  {
    path: "/budgets",
    label: "Presupuestos",
    icon: PiggyBank,
  },
  {
    path: "/savings",
    label: "Ahorro",
    icon: Target,
  },
  {
    path: "/insights",
    label: "Asesor IA",
    icon: Sparkles,
  },
  {
    path: "/reports",
    label: "Reportes",
    icon: BarChart3,
  },
  {
    path: "/security",
    label: "Seguridad",
    icon: ShieldAlert,
    badgeKey: "pendingAlerts",
  },
  {
    path: "/devices",
    label: "Dispositivos",
    icon: Laptop,
  },
  {
    path: "/map",
    label: "Mapa de gastos",
    icon: MapPin,
  },
  {
    path: "/settings",
    label: "Configuración",
    icon: Settings,
  },
];
