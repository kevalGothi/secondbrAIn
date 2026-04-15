"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Bell, Check, Sparkles } from "lucide-react";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("movie");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchReminders = async () => {
    const res = await fetch("/api/reminders");
    const data = await res.json();
    setReminders(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchReminders(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, type, description }),
    });
    setTitle(""); setDescription(""); setShowForm(false); setCreating(false);
    fetchReminders();
  };

  const handleComplete = async (id: string) => {
    await fetch("/api/reminders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isCompleted: true }),
    });
    fetchReminders();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/reminders?id=${id}`, { method: "DELETE" });
    fetchReminders();
  };

  const active = reminders.filter(r => !r.isCompleted);
  const completed = reminders.filter(r => r.isCompleted);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reminders</h1>
          <p className="text-muted-foreground">Smart reminders with AI recommendations</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold flex items-center gap-2 hover:opacity-90 glow">
          <Plus className="w-4 h-4" /> Add Reminder
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex gap-2">
            {["movie", "restaurant", "recipe", "custom"].map(t => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${type === t ? "gradient-primary text-white" : "bg-secondary border border-border"}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What to remember? (e.g., Watch Inception)"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" required />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Extra details (optional)"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" />
          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50">
              {creating ? "🤖 Getting recommendations..." : "Set Reminder"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-border hover:bg-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 rounded-2xl bg-card animate-pulse" />)}
        </div>
      ) : active.length === 0 && completed.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No reminders yet</h2>
          <p className="text-muted-foreground">Set a reminder and AI will suggest similar things to try</p>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Active ({active.length})</h2>
              <div className="space-y-3">
                {active.map((r) => (
                  <div key={r._id} className="p-5 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.type === "movie" ? "bg-pink-500/10 text-pink-400" :
                            r.type === "restaurant" ? "bg-orange-500/10 text-orange-400" :
                            r.type === "recipe" ? "bg-emerald-500/10 text-emerald-400" : "bg-violet-500/10 text-violet-400"
                          }`}>{r.type}</span>
                          <span className="text-xs text-muted-foreground">{new Date(r.dueDate).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-semibold text-lg">{r.title}</h3>
                        {r.description && <p className="text-sm text-muted-foreground mt-1">{r.description}</p>}
                        {r.recommendations?.length > 0 && (
                          <div className="mt-3 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                            <p className="text-xs font-medium text-violet-400 flex items-center gap-1 mb-2"><Sparkles className="w-3 h-3" /> AI Recommendations</p>
                            <div className="flex flex-wrap gap-1">
                              {r.recommendations.map((rec: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 text-xs">{rec}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 ml-4">
                        <button onClick={() => handleComplete(r._id)} className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-all">
                          <Check className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(r._id)} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Completed ({completed.length})</h2>
              <div className="space-y-2">
                {completed.map((r) => (
                  <div key={r._id} className="p-4 rounded-xl bg-card/50 border border-border opacity-60">
                    <div className="flex justify-between items-center">
                      <span className="line-through">{r.title}</span>
                      <button onClick={() => handleDelete(r._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
