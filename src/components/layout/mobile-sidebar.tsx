"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSidebarStore } from "@/stores/sidebar-store";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

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

export function MobileSidebar() {
  const { isMobileOpen, setMobileOpen } = useSidebarStore();
  const pathname = usePathname();

  return (
    <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-[220px] p-0">
        <SheetHeader className="h-14 flex items-center justify-start px-5 border-b border-border">
          <SheetTitle className="text-primary font-bold text-xl tracking-tight">
            Rupies
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto py-3">
          {navSections.map((section) => (
            <div key={section.title} className="mb-4">
              <p className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {section.title}
              </p>
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
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 h-9 px-4 text-sm font-medium transition-colors",
                      isActive
                        ? "text-foreground bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-0 h-full w-[3px] rounded-r-full bg-primary" />
                    )}
                    <Icon
                      className={cn(
                        "shrink-0 h-4 w-4",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
