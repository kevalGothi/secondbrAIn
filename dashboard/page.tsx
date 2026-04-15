"use client";

import { useSession } from "next-auth/react";
import { FileText, StickyNote, Film, UtensilsCrossed, ChefHat, Bell, Sparkles, Search, Wallet, Link2, Mic, ArrowRight, Brain, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const quickActions = [
  { icon: Search, label: "Search Everything", desc: "Vector-powered semantic search", href: "/dashboard/search", color: "from-amber-500 to-orange-500" },
  { icon: FileText, label: "Documents", desc: "Upload & organize files", href: "/dashboard/documents", color: "from-blue-500 to-indigo-500" },
  { icon: StickyNote, label: "Notes", desc: "Quick thoughts & ideas", href: "/dashboard/notes", color: "from-violet-500 to-purple-500" },
  { icon: Link2, label: "Saved Links", desc: "AI-analyzed bookmarks", href: "/dashboard/links", color: "from-sky-500 to-blue-500" },
  { icon: Film, label: "Movies", desc: "Track & get AI recommendations", href: "/dashboard/movies", color: "from-pink-500 to-rose-500" },
  { icon: UtensilsCrossed, label: "Restaurants", desc: "Favorite dining spots", href: "/dashboard/restaurants", color: "from-orange-500 to-red-500" },
  { icon: ChefHat, label: "Recipes", desc: "AI-generated recipes", href: "/dashboard/recipes", color: "from-emerald-500 to-teal-500" },
  { icon: Wallet, label: "Finance", desc: "Track money & IOUs", href: "/dashboard/finance", color: "from-amber-500 to-yellow-500" },
  { icon: Bell, label: "Reminders", desc: "Smart reminders + recs", href: "/dashboard/reminders", color: "from-cyan-500 to-blue-500" },
  { icon: Sparkles, label: "AI Assistant", desc: "Knows everything about you", href: "/dashboard/ai", color: "from-indigo-500 to-violet-500" },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 mesh-gradient border border-primary/10">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-muted-foreground font-medium">Your Second Brain is active</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {greeting}, <span className="gradient-text">{session?.user?.name || "there"}</span> 👋
          </h1>
          <p className="text-muted-foreground text-lg">What would you like to remember today?</p>
        </div>
        {/* Decorative orbs */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* Voice CTA */}
      <Link href="/dashboard/voice"
        className="group flex items-center gap-4 p-5 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 hover:from-cyan-500/10 hover:to-blue-500/10 transition-all duration-300">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center glow-cyan flex-shrink-0 group-hover:scale-105 transition-transform">
          <Mic className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">Voice Command Center</h3>
          <p className="text-sm text-muted-foreground">
            Say <span className="text-cyan-400 font-medium">"500 rs sent to Manoj"</span> or <span className="text-cyan-400 font-medium">"I liked YJHD"</span> — AI handles the rest
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
      </Link>

      {/* Quick actions grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}
              className="group glass-card p-5 rounded-2xl flex flex-col gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{action.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="relative overflow-hidden p-8 rounded-2xl border border-violet-500/10">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">Pro Tips</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { emoji: "🎤", tip: 'Voice Input — say "I liked YJHD movie" and AI does the rest' },
              { emoji: "💰", tip: 'Say "500 rs sent to Manoj" — auto-tracks in Finance' },
              { emoji: "📝", tip: 'Say "Craft message to Rahul about money" — AI writes it!' },
              { emoji: "🔍", tip: "Search uses vector embeddings — search by meaning, not keywords" },
              { emoji: "🔗", tip: "Save any link — AI tells you if it's a job, tutorial, or reel" },
              { emoji: "🤖", tip: "AI Assistant knows your finances, movies, food — ask anything" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors">
                <span className="text-lg flex-shrink-0">{item.emoji}</span>
                <p className="text-sm text-muted-foreground">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
