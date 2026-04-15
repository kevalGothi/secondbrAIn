"use client";

import { cn } from "@/lib/utils";
import { Brain, Search, FileText, StickyNote, Film, UtensilsCrossed, ChefHat, Bell, Sparkles, User, Mic, Wallet, Link2, X, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: Search, label: "Search", href: "/dashboard/search" },
  { icon: FileText, label: "Documents", href: "/dashboard/documents" },
  { icon: StickyNote, label: "Notes", href: "/dashboard/notes" },
  { icon: Link2, label: "Saved Links", href: "/dashboard/links" },
  { icon: Film, label: "Movies", href: "/dashboard/movies" },
  { icon: UtensilsCrossed, label: "Restaurants", href: "/dashboard/restaurants" },
  { icon: ChefHat, label: "Recipes", href: "/dashboard/recipes" },
  { icon: Wallet, label: "Finance", href: "/dashboard/finance" },
  { icon: Bell, label: "Reminders", href: "/dashboard/reminders" },
  { icon: Sparkles, label: "AI Assistant", href: "/dashboard/ai" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

export default function SideNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in" onClick={onClose} />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-full w-64 flex flex-col z-50 transition-transform duration-300 ease-out",
        "bg-card/95 backdrop-blur-2xl border-r border-border/50",
        "lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-5 flex justify-between items-center border-b border-border/30">
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold gradient-text block leading-tight">Second Brain</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">AI Knowledge Hub</span>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "gradient-primary text-white shadow-lg glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Voice button */}
        <div className="p-4 border-t border-border/30">
          <Link href="/dashboard/voice" onClick={onClose}
            className="group flex items-center justify-center gap-2.5 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold transition-all duration-300 glow-cyan hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02]">
            <Mic className="w-5 h-5 group-hover:animate-pulse" />
            Voice Input
          </Link>
        </div>
      </aside>
    </>
  );
}
