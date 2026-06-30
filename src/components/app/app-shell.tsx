"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Download, MessageSquareText, Quote } from "lucide-react";
import type { PublicOrganization } from "@/types/domain";

type AppShellProps = {
  organization: PublicOrganization;
  isDemo: boolean;
  children: React.ReactNode;
};

export function AppShell({ organization, isDemo, children }: AppShellProps) {
  const pathname = usePathname();
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/testimonials", label: "Depoimentos", icon: Quote },
    { href: "/exports", label: "Exportação", icon: Download },
    { href: `/feedback/${organization.publicFeedbackSlug}`, label: "Página pública", icon: MessageSquareText }
  ];

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <aside className="sidebar" aria-label="Navegação principal">
        <div className="brand-lockup">
          <span className="brand-mark">RP</span>
          <div>
            <strong>ReviewPulse</strong>
            <span>{organization.name}</span>
          </div>
        </div>
        <nav className="main-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined}>
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {isDemo ? <p className="demo-note">Mockup de portfólio com dados locais em SQLite. Nenhuma credencial externa é necessária.</p> : null}
      </aside>
      <div className="app-content" id="main-content">
        {children}
      </div>
    </div>
  );
}
