"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/stores/sidebar-store";

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  usuarios: "Usuários",
  servicos: "Serviços",
  leads: "Leads",
  chats: "Chats",
  assinaturas: "Assinaturas",
  creditos: "Créditos",
  revenue: "Revenue",
  categorias: "Categorias",
  banners: "Banners",
  faqs: "FAQs",
  planos: "Planos",
  push: "Push",
  crashlytics: "Crashlytics",
  performance: "Performance",
  analytics: "Analytics",
  configuracoes: "Configurações",
  notificacoes: "Notificações",
};

function getBreadcrumbs(pathname: string): string[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return ["Dashboard"];
  return segments.map((seg) => routeLabels[seg] ?? seg);
}

export function Header() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const { setMobileOpen } = useSidebarStore();

  return (
    <>
      <MobileSidebar />
      <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Rupies</span>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="text-muted-foreground">/</span>
                <span
                  className={
                    i === breadcrumbs.length - 1
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold select-none">
            AD
          </div>
        </div>
      </header>
    </>
  );
}
