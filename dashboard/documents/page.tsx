"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, FileText } from "lucide-react";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchDocs = async () => {
    const res = await fetch("/api/documents");
    const data = await res.json();
    setDocuments(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, content, tags: [] }),
    });
    setTitle(""); setDescription(""); setContent("");
    setShowForm(false); setCreating(false);
    fetchDocs();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    fetchDocs();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Your uploaded documents with AI descriptions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold flex items-center gap-2 hover:opacity-90 glow">
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" required />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Document content..."
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none min-h-[120px] resize-none" required />
          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50">
              {creating ? "Creating..." : "Create Document"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-border hover:bg-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-card animate-pulse" />)}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No documents yet</h2>
          <p className="text-muted-foreground">Add your first document to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc._id} className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <button onClick={() => handleDelete(doc._id)} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold text-lg mb-1 truncate">{doc.title}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2">{doc.description || doc.content?.substring(0, 100)}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {doc.tags?.map((tag: string) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{tag}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">{new Date(doc.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
