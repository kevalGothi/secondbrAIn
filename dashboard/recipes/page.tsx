"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ChefHat, ThumbsUp, Clock, Users } from "lucide-react";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchRecipes = async () => {
    const res = await fetch("/api/recipes");
    const data = await res.json();
    setRecipes(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchRecipes(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, fetchInfo: true }),
    });
    setTitle(""); setShowForm(false); setCreating(false);
    fetchRecipes();
  };

  const handleToggleLike = async (id: string, liked: boolean) => {
    await fetch("/api/recipes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, liked: !liked }),
    });
    fetchRecipes();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/recipes?id=${id}`, { method: "DELETE" });
    fetchRecipes();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recipes</h1>
          <p className="text-muted-foreground">AI-generated recipes with ingredients & instructions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold flex items-center gap-2 hover:opacity-90 glow">
          <Plus className="w-4 h-4" /> Add Recipe
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <p className="text-sm text-muted-foreground">Just enter a dish name and AI generates the full recipe!</p>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Dish name (e.g., Butter Chicken, Pasta Carbonara)"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" required />
          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50">
              {creating ? "🤖 AI is generating recipe..." : "Generate Recipe"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-border hover:bg-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-64 rounded-2xl bg-card animate-pulse" />)}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20">
          <ChefHat className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No recipes yet</h2>
          <p className="text-muted-foreground">Ask AI to generate any recipe for you</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <div key={recipe._id} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleToggleLike(recipe._id, recipe.liked)}
                    className={`p-2 rounded-lg transition-all ${recipe.liked ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-emerald-500/10 text-muted-foreground"}`}>
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(recipe._id)} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">{recipe.title}</h3>
              <div className="flex gap-3 text-sm text-muted-foreground mb-3">
                {recipe.prepTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recipe.prepTime}</span>}
                {recipe.servings && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{recipe.servings} servings</span>}
                {recipe.difficulty && <span className={`px-2 py-0.5 rounded-full text-xs ${recipe.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" : recipe.difficulty === "Hard" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>{recipe.difficulty}</span>}
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {recipe.tags?.map((t: string) => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">{t}</span>
                ))}
              </div>
              <button onClick={() => setExpanded(expanded === recipe._id ? null : recipe._id)}
                className="text-primary text-sm font-medium hover:underline">
                {expanded === recipe._id ? "Hide details" : "Show recipe →"}
              </button>
              {expanded === recipe._id && (
                <div className="mt-4 space-y-4 border-t border-border pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">🧾 Ingredients</h4>
                    <ul className="space-y-1">
                      {recipe.ingredients?.map((ing: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">• {ing}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">👨‍🍳 Instructions</h4>
                    <ol className="space-y-2">
                      {recipe.instructions?.map((step: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">{i + 1}. {step}</li>
                      ))}
                    </ol>
                  </div>
                  {recipe.nutritionInfo && (
                    <p className="text-xs text-muted-foreground bg-secondary p-3 rounded-xl">📊 {recipe.nutritionInfo}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
