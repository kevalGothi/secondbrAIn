"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Brain, Sparkles, Mic, Search, Film, UtensilsCrossed, BookOpen, Bell, ArrowRight, Zap, Globe, Shield } from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Second Brain</span>
          </Link>
          <div className="flex gap-4 items-center">
            {session ? (
              <Link href="/dashboard" className="px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all glow">
                Dashboard <ArrowRight className="inline w-4 h-4 ml-1" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
                  Sign In
                </Link>
                <Link href="/register" className="px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all glow">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "3s" }} />
        </div>

        <div className="relative container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Personal Knowledge Hub
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Your <span className="gradient-text">Second Brain</span>
            <br />Remembers Everything
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Capture movies, restaurants, recipes, notes & more. Search by meaning with AI vector search. 
            Just speak — your brain understands.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register" className="group px-8 py-4 rounded-2xl gradient-primary text-white font-bold text-lg hover:opacity-90 transition-all glow flex items-center gap-2">
              Start Building Your Brain
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="px-8 py-4 rounded-2xl border border-white/20 font-semibold hover:bg-white/5 transition-all">
              I Have an Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything Your Brain Can Do
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            Not just another note app. A complete life organizer powered by AI.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Film, title: "Movies & Shows", desc: "Track what you watch, rate, get AI recommendations based on your taste.", color: "from-violet-500 to-purple-600" },
              { icon: UtensilsCrossed, title: "Restaurants", desc: "Save favorite places, cuisines, and get personalized dining suggestions.", color: "from-orange-500 to-pink-500" },
              { icon: BookOpen, title: "Recipes", desc: "AI generates full recipes with ingredients, steps, and nutrition info.", color: "from-emerald-500 to-teal-500" },
              { icon: Mic, title: "Voice Input", desc: '"I liked YJHD" — AI understands, adds the movie, and finds similar ones.', color: "from-cyan-500 to-blue-500" },
              { icon: Search, title: "Vector Search", desc: "Search by meaning, not keywords. Find that spicy recipe from last month.", color: "from-amber-500 to-orange-500" },
              { icon: Bell, title: "Smart Reminders", desc: '"Remind me to watch Inception" — adds with genre + 5 recommendations.', color: "from-pink-500 to-rose-500" },
              { icon: Sparkles, title: "AI Assistant", desc: "Knows your preferences. Ask anything, get personalized answers.", color: "from-indigo-500 to-violet-500" },
              { icon: Globe, title: "MongoDB Atlas", desc: "Enterprise-grade database with vector search for semantic retrieval.", color: "from-green-500 to-emerald-500" },
              { icon: Shield, title: "Secure Auth", desc: "Custom authentication with encrypted passwords. Your data stays yours.", color: "from-slate-500 to-zinc-600" },
            ].map((feature, i) => (
              <div key={i} className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-6 border-t border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-12">Built With Modern Tech</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {["Next.js 14", "MongoDB Atlas", "Vector Search", "Gemini AI", "NextAuth.js", "TypeScript", "Tailwind CSS", "Framer Motion"].map((tech) => (
              <span key={tech} className="px-5 py-2.5 rounded-xl bg-card border border-border text-sm font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border text-center text-muted-foreground text-sm">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-4 h-4" />
          Second Brain — Built with 🧠 for smarter living
        </div>
      </footer>
    </div>
  );
}
