"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, UtensilsCrossed, ThumbsUp, ThumbsDown, Star, MapPin } from "lucide-react";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchRestaurants = async () => {
    const res = await fetch("/api/restaurants");
    const data = await res.json();
    setRestaurants(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchRestaurants(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location, fetchInfo: true }),
    });
    setName(""); setLocation(""); setShowForm(false); setCreating(false);
    fetchRestaurants();
  };

  const handleToggleLike = async (id: string, liked: boolean) => {
    await fetch("/api/restaurants", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, liked: !liked, disliked: false }),
    });
    fetchRestaurants();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/restaurants?id=${id}`, { method: "DELETE" });
    fetchRestaurants();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Restaurants</h1>
          <p className="text-muted-foreground">Your favorite dining spots with AI-powered details</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold flex items-center gap-2 hover:opacity-90 glow">
          <Plus className="w-4 h-4" /> Add Restaurant
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <p className="text-sm text-muted-foreground">Enter a restaurant name and AI fills in cuisine, specialties & more!</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Restaurant name"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" required />
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (optional)"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" />
          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50">
              {creating ? "🤖 AI is fetching details..." : "Add Restaurant"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-border hover:bg-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-56 rounded-2xl bg-card animate-pulse" />)}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20">
          <UtensilsCrossed className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No restaurants yet</h2>
          <p className="text-muted-foreground">Save your favorite dining spots</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((r) => (
            <div key={r._id} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-white" />
                </div>
                <button onClick={() => handleDelete(r._id)} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-lg mb-1">{r.name}</h3>
              {r.location && <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1"><MapPin className="w-3 h-3" />{r.location}</p>}
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{r.overview}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {r.cuisine?.map((c: string) => (
                  <span key={c} className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-xs">{c}</span>
                ))}
              </div>
              {r.specialties?.length > 0 && (
                <p className="text-xs text-muted-foreground mb-3">🍽️ {r.specialties.slice(0, 3).join(", ")}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{r.priceRange} • {r.ambiance}</span>
                <button onClick={() => handleToggleLike(r._id, r.liked)}
                  className={`p-2 rounded-lg transition-all ${r.liked ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-emerald-500/10 text-muted-foreground"}`}>
                  <ThumbsUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
