"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Star,
  LayoutGrid,
  Mail,
  Settings,
  CreditCard,
  Menu,
  LogOut,
} from "lucide-react";
import { signOutAction } from "@/app/actions";

const navItems = [
  { href: "/dashboard/testimonials", label: "Testimonials", icon: Star },
  { href: "/dashboard/widgets", label: "Widgets", icon: LayoutGrid },
  { href: "/dashboard/collect", label: "Collect", icon: Mail },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

interface DashboardShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
}

export default function DashboardShell({ children, userEmail }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
        <Star className="w-5 h-5 text-teal-400" fill="#2dd4bf" />
        <span className="font-bold text-lg" style={{ color: "#0d9488" }}>
          TestimonialKit
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => mobile && setMobileOpen(false)}
              className="flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={
                active
                  ? {
                      background: "rgba(13,148,136,0.18)",
                      color: "#0d9488",
                      borderLeft: "3px solid #0d9488",
                      paddingLeft: "calc(0.75rem - 3px)",
                      paddingRight: "0.75rem",
                    }
                  : {
                      color: "#94a3b8",
                      borderLeft: "3px solid transparent",
                      paddingLeft: "calc(0.75rem - 3px)",
                      paddingRight: "0.75rem",
                    }
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom user + sign out */}
      <div className="px-4 py-4 border-t border-white/10">
        {userEmail && (
          <p className="text-xs text-slate-400 truncate mb-3">{userEmail}</p>
        )}
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#1e293b" }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 flex-shrink-0"
        style={{ background: "#0f172a" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="absolute left-0 top-0 bottom-0 w-64 flex flex-col"
            style={{ background: "#0f172a" }}
          >
            <SidebarContent mobile />
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header
          className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/10 flex-shrink-0"
          style={{ background: "#0f172a" }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-teal-400" fill="#2dd4bf" />
            <span className="font-bold text-sm" style={{ color: "#0d9488" }}>
              TestimonialKit
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
