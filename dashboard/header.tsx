"use client";

import { useSession, signOut } from "next-auth/react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LogOut, Menu } from "lucide-react";

export default function DashboardHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8">
      <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors">
        <Menu className="w-5 h-5" />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-2 md:gap-4">
        <ModeToggle />
        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-border">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <span className="text-sm font-medium hidden sm:inline">{session?.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: "/" })}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
