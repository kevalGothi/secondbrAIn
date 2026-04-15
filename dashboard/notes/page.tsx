"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, StickyNote } from "lucide-react";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchNotes = async () => {
    const res = await fetch("/api/notes");
    const data = await res.json();
    setNotes(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text }),
    });
    setTitle(""); setText("");
    setShowForm(false); setCreating(false);
    fetchNotes();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    fetchNotes();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground">Quick thoughts and ideas with AI embeddings</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold flex items-center gap-2 hover:opacity-90 glow">
          <Plus className="w-4 h-4" /> Add Note
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title (optional)"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" />
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your note..."
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none min-h-[150px] resize-none" required />
          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50">
              {creating ? "Saving..." : "Save Note"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-border hover:bg-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-card animate-pulse" />)}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-20">
          <StickyNote className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No notes yet</h2>
          <p className="text-muted-foreground">Start capturing your thoughts</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div key={note._id} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <StickyNote className="w-5 h-5 text-white" />
                </div>
                <button onClick={() => handleDelete(note._id)} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold mb-1">{note.title || "Untitled"}</h3>
              <p className="text-muted-foreground text-sm line-clamp-3">{note.text}</p>
              <p className="text-xs text-muted-foreground mt-3">{new Date(note.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
