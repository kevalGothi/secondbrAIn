"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Film, UtensilsCrossed, ChefHat, StickyNote, FileText, ThumbsUp, ThumbsDown } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({ movies: 0, restaurants: 0, recipes: 0, notes: 0, documents: 0, likedMovies: 0, likedRestaurants: 0, likedRecipes: 0 });
  const [likedMovies, setLikedMovies] = useState<any[]>([]);
  const [likedRestaurants, setLikedRestaurants] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [moviesRes, restaurantsRes, recipesRes, notesRes, docsRes] = await Promise.all([
        fetch("/api/movies"), fetch("/api/restaurants"), fetch("/api/recipes"), fetch("/api/notes"), fetch("/api/documents"),
      ]);
      const [movies, restaurants, recipes, notes, docs] = await Promise.all([
        moviesRes.json(), restaurantsRes.json(), recipesRes.json(), notesRes.json(), docsRes.json(),
      ]);
      const m = Array.isArray(movies) ? movies : [];
      const r = Array.isArray(restaurants) ? restaurants : [];
      const rc = Array.isArray(recipes) ? recipes : [];
      setStats({
        movies: m.length, restaurants: r.length, recipes: rc.length,
        notes: (Array.isArray(notes) ? notes : []).length,
        documents: (Array.isArray(docs) ? docs : []).length,
        likedMovies: m.filter((x: any) => x.liked).length,
        likedRestaurants: r.filter((x: any) => x.liked).length,
        likedRecipes: rc.filter((x: any) => x.liked).length,
      });
      setLikedMovies(m.filter((x: any) => x.liked));
      setLikedRestaurants(r.filter((x: any) => x.liked));
    };
    fetchAll();
  }, []);

  const statCards = [
    { icon: Film, label: "Movies", count: stats.movies, liked: stats.likedMovies, color: "from-pink-500 to-rose-500" },
    { icon: UtensilsCrossed, label: "Restaurants", count: stats.restaurants, liked: stats.likedRestaurants, color: "from-orange-500 to-red-500" },
    { icon: ChefHat, label: "Recipes", count: stats.recipes, liked: stats.likedRecipes, color: "from-emerald-500 to-teal-500" },
    { icon: StickyNote, label: "Notes", count: stats.notes, liked: 0, color: "from-violet-500 to-purple-500" },
    { icon: FileText, label: "Documents", count: stats.documents, liked: 0, color: "from-blue-500 to-indigo-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-bold glow">
          {session?.user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{session?.user?.name}</h1>
          <p className="text-muted-foreground">{session?.user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-card border border-border text-center">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-3`}>
              <s.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold">{s.count}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            {s.liked > 0 && (
              <p className="text-xs text-emerald-400 mt-1 flex items-center justify-center gap-1">
                <ThumbsUp className="w-3 h-3" /> {s.liked} liked
              </p>
            )}
          </div>
        ))}
      </div>

      {likedMovies.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-emerald-400" /> Liked Movies
          </h2>
          <div className="flex flex-wrap gap-2">
            {likedMovies.map((m) => (
              <span key={m._id} className="px-4 py-2 rounded-xl bg-pink-500/10 border border-pink-500/20 text-sm">
                {m.title} {m.year ? `(${m.year})` : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {likedRestaurants.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-emerald-400" /> Liked Restaurants
          </h2>
          <div className="flex flex-wrap gap-2">
            {likedRestaurants.map((r) => (
              <span key={r._id} className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-sm">
                {r.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
        <h3 className="font-semibold mb-2">🧠 Brain Stats</h3>
        <p className="text-muted-foreground text-sm">
          Your Second Brain has <strong className="text-foreground">{stats.movies + stats.restaurants + stats.recipes + stats.notes + stats.documents}</strong> total items stored. 
          All searchable by meaning using AI vector embeddings.
        </p>
      </div>
    </div>
  );
}
