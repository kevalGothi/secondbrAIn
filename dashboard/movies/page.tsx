"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Film, ThumbsUp, ThumbsDown, Star } from "lucide-react";

export default function MoviesPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchMovies = async () => {
    const res = await fetch("/api/movies");
    const data = await res.json();
    setMovies(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchMovies(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, fetchInfo: true }),
    });
    setTitle(""); setShowForm(false); setCreating(false);
    fetchMovies();
  };

  const handleToggleLike = async (id: string, liked: boolean) => {
    await fetch("/api/movies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, liked: !liked, disliked: false }),
    });
    fetchMovies();
  };

  const handleToggleDislike = async (id: string, disliked: boolean) => {
    await fetch("/api/movies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, disliked: !disliked, liked: false }),
    });
    fetchMovies();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/movies?id=${id}`, { method: "DELETE" });
    fetchMovies();
  };

  const filtered = filter === "all" ? movies : 
    filter === "liked" ? movies.filter(m => m.liked) :
    filter === "watchlist" ? movies.filter(m => m.status === "watchlist") :
    movies.filter(m => m.status === "watched");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Movies & Shows</h1>
          <p className="text-muted-foreground">Track, rate, and get AI recommendations</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold flex items-center gap-2 hover:opacity-90 glow">
          <Plus className="w-4 h-4" /> Add Movie
        </button>
      </div>

      <div className="flex gap-2">
        {["all", "watchlist", "watched", "liked"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? "gradient-primary text-white" : "bg-card border border-border hover:bg-secondary"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <p className="text-sm text-muted-foreground">Enter a movie name and AI will fetch all details automatically!</p>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Movie name (e.g., YJHD, Inception, Avengers)"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" required />
          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50">
              {creating ? "🤖 AI is fetching details..." : "Add Movie"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-border hover:bg-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-64 rounded-2xl bg-card animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No movies yet</h2>
          <p className="text-muted-foreground">Add movies or use voice: "I liked YJHD"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((movie) => (
            <div key={movie._id} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Film className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  {movie.rating > 0 && (
                    <span className="flex items-center gap-1 text-amber-400 text-sm font-medium">
                      <Star className="w-4 h-4 fill-current" /> {movie.rating}
                    </span>
                  )}
                  <button onClick={() => handleDelete(movie._id)} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">{movie.title}</h3>
              <p className="text-sm text-muted-foreground mb-1">{movie.year} • {movie.director}</p>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{movie.overview}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {movie.genre?.map((g: string) => (
                  <span key={g} className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 text-xs">{g}</span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${movie.status === "watched" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                  {movie.status}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => handleToggleLike(movie._id, movie.liked)}
                    className={`p-2 rounded-lg transition-all ${movie.liked ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-emerald-500/10 text-muted-foreground"}`}>
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggleDislike(movie._id, movie.disliked)}
                    className={`p-2 rounded-lg transition-all ${movie.disliked ? "bg-red-500/20 text-red-400" : "hover:bg-red-500/10 text-muted-foreground"}`}>
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
