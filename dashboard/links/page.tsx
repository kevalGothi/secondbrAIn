"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Link2, ExternalLink, Star, StarOff, Briefcase, Eye, EyeOff, Copy, CheckCheck } from "lucide-react";

type LinkRecord = {
  _id: string;
  url: string;
  title: string;
  description: string;
  platform: string;
  category: string;
  tags: string[];
  aiSummary: string;
  jobInfo?: {
    role: string;
    company: string;
    location: string;
    type: string;
    skills: string[];
  };
  userNote: string;
  isRead: boolean;
  isFavorite: boolean;
  createdAt: string;
};

const platformConfig: Record<string, { emoji: string; color: string; bg: string }> = {
  instagram: { emoji: "📸", color: "text-pink-400", bg: "from-pink-500 to-purple-500" },
  twitter: { emoji: "𝕏", color: "text-sky-400", bg: "from-sky-500 to-blue-500" },
  linkedin: { emoji: "💼", color: "text-blue-400", bg: "from-blue-600 to-blue-700" },
  youtube: { emoji: "▶️", color: "text-red-400", bg: "from-red-500 to-red-600" },
  github: { emoji: "🐙", color: "text-gray-300", bg: "from-gray-600 to-gray-700" },
  reddit: { emoji: "🤖", color: "text-orange-400", bg: "from-orange-500 to-red-500" },
  medium: { emoji: "✍️", color: "text-green-400", bg: "from-green-600 to-emerald-600" },
  website: { emoji: "🌐", color: "text-violet-400", bg: "from-violet-500 to-purple-500" },
  other: { emoji: "🔗", color: "text-gray-400", bg: "from-gray-500 to-zinc-500" },
};

const categoryConfig: Record<string, { label: string; color: string }> = {
  job: { label: "💼 Job", color: "bg-blue-500/10 text-blue-400" },
  learning: { label: "📚 Learning", color: "bg-emerald-500/10 text-emerald-400" },
  entertainment: { label: "🎬 Entertainment", color: "bg-pink-500/10 text-pink-400" },
  news: { label: "📰 News", color: "bg-amber-500/10 text-amber-400" },
  shopping: { label: "🛒 Shopping", color: "bg-orange-500/10 text-orange-400" },
  social: { label: "👥 Social", color: "bg-violet-500/10 text-violet-400" },
  tool: { label: "🛠️ Tool", color: "bg-cyan-500/10 text-cyan-400" },
  reference: { label: "📖 Reference", color: "bg-indigo-500/10 text-indigo-400" },
  tutorial: { label: "🎓 Tutorial", color: "bg-teal-500/10 text-teal-400" },
  portfolio: { label: "🎨 Portfolio", color: "bg-rose-500/10 text-rose-400" },
  other: { label: "📌 Other", color: "bg-gray-500/10 text-gray-400" },
};

export default function LinksPage() {
  const [links, setLinks] = useState<LinkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [userNote, setUserNote] = useState("");

  const fetchLinks = async () => {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, userNote, context: userNote }),
    });
    setUrl("");
    setUserNote("");
    setShowForm(false);
    setCreating(false);
    fetchLinks();
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    await fetch("/api/links", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isFavorite: !current }),
    });
    fetchLinks();
  };

  const handleToggleRead = async (id: string, current: boolean) => {
    await fetch("/api/links", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead: !current }),
    });
    fetchLinks();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/links?id=${id}`, { method: "DELETE" });
    fetchLinks();
  };

  const copyUrl = (id: string, linkUrl: string) => {
    navigator.clipboard.writeText(linkUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filters
  let filtered = links;
  if (filter === "favorites") filtered = filtered.filter((l) => l.isFavorite);
  if (filter === "unread") filtered = filtered.filter((l) => !l.isRead);
  if (filter === "jobs") filtered = filtered.filter((l) => l.category === "job" || l.jobInfo?.role);
  if (filter !== "all" && filter !== "favorites" && filter !== "unread" && filter !== "jobs") {
    filtered = filtered.filter((l) => l.category === filter);
  }
  if (platformFilter !== "all") filtered = filtered.filter((l) => l.platform === platformFilter);

  const jobLinks = links.filter((l) => l.category === "job" || l.jobInfo?.role);
  const uniquePlatforms = [...new Set(links.map((l) => l.platform))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Saved Links</h1>
          <p className="text-muted-foreground">AI analyzes every link — jobs, tweets, posts, videos & more</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold flex items-center gap-2 hover:opacity-90 glow">
          <Plus className="w-4 h-4" /> Save Link
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border text-center">
          <p className="text-2xl font-bold">{links.length}</p>
          <p className="text-sm text-muted-foreground">Total Links</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border text-center">
          <p className="text-2xl font-bold text-amber-400">{links.filter((l) => l.isFavorite).length}</p>
          <p className="text-sm text-muted-foreground">Favorites</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border text-center">
          <p className="text-2xl font-bold text-blue-400">{jobLinks.length}</p>
          <p className="text-sm text-muted-foreground">Job Links</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border text-center">
          <p className="text-2xl font-bold text-emerald-400">{links.filter((l) => !l.isRead).length}</p>
          <p className="text-sm text-muted-foreground">Unread</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          {["all", "favorites", "unread", "jobs", "learning", "entertainment", "social", "tool"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? "gradient-primary text-white" : "bg-card border border-border hover:bg-secondary"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {uniquePlatforms.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground py-2">Platform:</span>
            <button onClick={() => setPlatformFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${platformFilter === "all" ? "bg-secondary" : "hover:bg-secondary/50"}`}>
              All
            </button>
            {uniquePlatforms.map((p) => (
              <button key={p} onClick={() => setPlatformFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${platformFilter === p ? "bg-secondary" : "hover:bg-secondary/50"}`}>
                {platformConfig[p]?.emoji || "🔗"} {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <p className="text-sm text-muted-foreground">
            Paste any link — AI will analyze it, detect the platform, categorize it, and if it&apos;s job-related, extract role details!
          </p>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste URL here (Instagram, Twitter, LinkedIn, YouTube, etc.)"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" required type="url" />
          <input value={userNote} onChange={(e) => setUserNote(e.target.value)}
            placeholder="What's this about? (optional) e.g., 'job search frontend dev', 'funny reel', 'tutorial react'"
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" />
          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50">
              {creating ? "🤖 AI is analyzing the link..." : "Save & Analyze"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-border hover:bg-secondary">Cancel</button>
          </div>
        </form>
      )}

      {/* Links List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-2xl bg-card animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Link2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No links saved yet</h2>
          <p className="text-muted-foreground">Save Instagram posts, tweets, job links, YouTube videos & more</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((link) => {
            const pConfig = platformConfig[link.platform] || platformConfig.other;
            const cConfig = categoryConfig[link.category] || categoryConfig.other;
            return (
              <div key={link._id} className={`p-5 rounded-2xl bg-card border transition-all group ${link.isRead ? "border-border opacity-75" : "border-border hover:border-primary/30"}`}>
                <div className="flex items-start gap-4">
                  {/* Platform badge */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pConfig.bg} flex items-center justify-center flex-shrink-0 text-xl`}>
                    {pConfig.emoji}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cConfig.color}`}>{cConfig.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${pConfig.color} bg-white/5`}>{link.platform}</span>
                      {link.isRead && <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400">Read</span>}
                    </div>

                    <h3 className="font-bold text-lg mb-1 truncate">{link.title || "Untitled Link"}</h3>

                    {link.aiSummary && (
                      <p className="text-sm text-muted-foreground mb-2">{link.aiSummary}</p>
                    )}

                    {/* Job Info */}
                    {link.jobInfo?.role && (
                      <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-2">
                        <p className="text-sm font-medium text-blue-400 flex items-center gap-1 mb-1">
                          <Briefcase className="w-3.5 h-3.5" /> {link.jobInfo.role}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {link.jobInfo.company && <span>🏢 {link.jobInfo.company}</span>}
                          {link.jobInfo.location && <span>📍 {link.jobInfo.location}</span>}
                          {link.jobInfo.type && <span>🏠 {link.jobInfo.type}</span>}
                        </div>
                        {link.jobInfo.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {link.jobInfo.skills.map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 text-xs">{skill}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {link.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {link.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">#{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* User note */}
                    {link.userNote && (
                      <p className="text-xs text-muted-foreground italic mb-2">📝 {link.userNote}</p>
                    )}

                    {/* URL preview */}
                    <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-all" title="Open link">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button onClick={() => copyUrl(link._id, link.url)}
                      className="p-2 rounded-lg hover:bg-secondary transition-all" title="Copy URL">
                      {copiedId === link._id ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    <button onClick={() => handleToggleFavorite(link._id, link.isFavorite)}
                      className={`p-2 rounded-lg transition-all ${link.isFavorite ? "text-amber-400" : "text-muted-foreground hover:text-amber-400"}`} title="Favorite">
                      {link.isFavorite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleToggleRead(link._id, link.isRead)}
                      className={`p-2 rounded-lg transition-all ${link.isRead ? "text-emerald-400" : "text-muted-foreground hover:text-emerald-400"}`} title="Mark read">
                      {link.isRead ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(link._id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
