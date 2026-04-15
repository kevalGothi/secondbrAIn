"use client";

import { useState } from "react";
import { Search, Mic, FileText, StickyNote, Film, UtensilsCrossed, ChefHat, Loader2 } from "lucide-react";

const typeIcons: any = { document: FileText, note: StickyNote, movie: Film, restaurant: UtensilsCrossed, recipe: ChefHat };
const typeColors: any = { document: "from-blue-500 to-indigo-500", note: "from-violet-500 to-purple-500", movie: "from-pink-500 to-rose-500", restaurant: "from-orange-500 to-red-500", recipe: "from-emerald-500 to-teal-500" };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [filter, setFilter] = useState("all");
  const [isListening, setIsListening] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, type: filter }),
    });
    const data = await res.json();
    setResults(Array.isArray(data) ? data : []);
    setSearching(false);
  };

  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice search not supported in this browser");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setQuery(text);
      setIsListening(false);
      setTimeout(() => handleSearch(), 100);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search Your Brain</h1>
        <p className="text-muted-foreground">Full-text + AI vector search across everything</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by meaning... (e.g., 'spicy italian food', 'sad romantic movies')"
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-lg" />
        </div>
        <button type="button" onClick={startVoiceSearch}
          className={`px-4 rounded-xl border transition-all ${isListening ? "bg-red-500 text-white border-red-500 animate-pulse" : "border-border hover:bg-secondary"}`}>
          <Mic className="w-5 h-5" />
        </button>
        <button type="submit" disabled={searching}
          className="px-6 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 glow disabled:opacity-50">
          {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
        </button>
      </form>

      <div className="flex gap-2">
        {["all", "documents", "notes", "movies", "restaurants", "recipes"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? "gradient-primary text-white" : "bg-card border border-border hover:bg-secondary"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{results.length} results found</p>
          {results.map((r, i) => {
            const Icon = typeIcons[r.type] || FileText;
            const color = typeColors[r.type] || "from-gray-500 to-slate-500";
            return (
              <div key={i} className="p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{r.type}</span>
                      <span className="text-xs text-muted-foreground">Score: {(r.score * 100).toFixed(0)}%</span>
                    </div>
                    <h3 className="font-semibold">{r.item.title || r.item.name || "Untitled"}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {r.item.description || r.item.text || r.item.overview || ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!searching && results.length === 0 && query && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No results found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}
