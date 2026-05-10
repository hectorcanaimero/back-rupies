"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  CreditCard,
  Coins,
  TrendingUp,
  Tag,
  Image,
  HelpCircle,
  Package,
  Bell,
  Bug,
  Gauge,
  BarChart3,
  Settings,
  BellRing,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Principal",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Usuários", href: "/usuarios", icon: Users },
      { label: "Serviços", href: "/servicos", icon: Briefcase },
      { label: "Leads", href: "/leads", icon: FileText },
      { label: "Chats", href: "/chats", icon: MessageSquare },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { label: "Assinaturas", href: "/assinaturas", icon: CreditCard },
      { label: "Créditos", href: "/creditos", icon: Coins },
      { label: "Revenue", href: "/revenue", icon: TrendingUp },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      { label: "Categorias", href: "/categorias", icon: Tag },
      { label: "Banners", href: "/banners", icon: Image },
      { label: "FAQs", href: "/faqs", icon: HelpCircle },
      { label: "Planos", href: "/planos", icon: Package },
    ],
  },
  {
    title: "Firebase",
    items: [
      { label: "Push", href: "/push", icon: Bell },
      { label: "Crashlytics", href: "/crashlytics", icon: Bug },
      { label: "Performance", href: "/performance", icon: Gauge },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Sistema",
    items: [
      { label: "Configurações", href: "/configuracoes", icon: Settings },
      { label: "Notificações", href: "/notificacoes", icon: BellRing },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        "relative hidden md:flex flex-col h-screen bg-secondary border-r border-border transition-all duration-200 overflow-hidden",
        isCollapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-14 border-b border-border shrink-0",
          isCollapsed ? "justify-center px-0" : "px-5"
        )}
      >
        {isCollapsed ? (
          <span className="text-primary font-bold text-lg">R</span>
        ) : (
          <span className="text-primary font-bold text-xl tracking-tight">
            Rupies
          </span>
        )}
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            {/* Section header */}
            {!isCollapsed && (
              <p className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {section.title}
              </p>
            )}
            {isCollapsed && (
              <div className="mx-auto mb-1 h-px w-8 bg-border" />
            )}

            {/* Items */}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 h-9 text-sm font-medium transition-colors",
                    isCollapsed ? "justify-center px-0" : "px-4",
                    isActive
                      ? "text-foreground bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {/* Active left border accent */}
                  {isActive && (
                    <span className="absolute left-0 top-0 h-full w-[3px] rounded-r-full bg-primary" />
                  )}
                  <Icon
                    className={cn(
                      "shrink-0 h-4 w-4",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="shrink-0 border-t border-border">
        <button
          onClick={toggle}
          className={cn(
            "flex items-center h-10 w-full text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors text-sm",
            isCollapsed ? "justify-center px-0" : "gap-2 px-4"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
