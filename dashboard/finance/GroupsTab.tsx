"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Link as LinkIcon, Trash2, UserPlus, Check, ArrowUpRight } from "lucide-react";

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [newMemberInputs, setNewMemberInputs] = useState<Record<string, string>>({});
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      if (Array.isArray(data)) setGroups(data);
    } catch (e) {
      console.error("Failed to fetch groups", e);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName, members: [] }),
      });
      if (res.ok) {
        setNewGroupName("");
        fetchGroups();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addMember = async (groupId: string, members: string[]) => {
    const newMember = newMemberInputs[groupId]?.trim();
    if (!newMember) return;
    
    // Check if member already exists (case-insensitive)
    if (members.map(m => m.toLowerCase()).includes(newMember.toLowerCase())) return;

    try {
      const updatedMembers = [...members, newMember];
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: updatedMembers }),
      });

      if (res.ok) {
        setNewMemberInputs({ ...newMemberInputs, [groupId]: "" });
        fetchGroups();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeMember = async (groupId: string, members: string[], memberToRemove: string) => {
    try {
      const updatedMembers = members.filter(m => m !== memberToRemove);
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members: updatedMembers }),
      });

      if (res.ok) {
        fetchGroups();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this group and all its expenses?")) return;
    
    try {
      const res = await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
      if (res.ok) {
        fetchGroups();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(token);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading groups...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Groups
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Create groups, add friends, and share expenses via a public link.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-4 md:p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
        <form onSubmit={createGroup} className="flex gap-3">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="e.g. Goa Trip, Apartment Groceries"
            className="flex-1 bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            required
          />
          <button
            type="submit"
            className="gradient-primary text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
            disabled={!newGroupName.trim()}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Create</span>
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div key={group._id} className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <a href={`/share/${group.shareToken}`} target="_blank" rel="noopener noreferrer" className="text-xl font-bold truncate pr-3 hover:text-primary transition-colors flex itens-center gap-2">
                {group.name} <ArrowUpRight className="w-4 h-4 inline" />
              </a>
              <button 
                onClick={() => deleteGroup(group._id)}
                className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                title="Delete Group"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Members ({group.members.length})</h4>
              {group.members.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-3">
                  {group.members.map((member: string, idx: number) => (
                    <span key={idx} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {member}
                      <button 
                         onClick={() => removeMember(group._id, group.members, member)}
                         className="text-muted-foreground hover:text-red-400"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-3 italic">No members yet.</p>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMemberInputs[group._id] || ""}
                  onChange={(e) => setNewMemberInputs({ ...newMemberInputs, [group._id]: e.target.value })}
                  placeholder="Add member name..."
                  className="flex-1 bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          e.preventDefault();
                          addMember(group._id, group.members);
                      }
                  }}
                />
                <button
                  onClick={() => addMember(group._id, group.members)}
                  className="bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary/20 transition-colors flex items-center justify-center"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-border/50">
              <button
                onClick={() => copyShareLink(group.shareToken)}
                className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {copiedLink === group.shareToken ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Copied Link!</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    Copy WhatsApp Share Link
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border/50 rounded-2xl">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">You haven't created any groups yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple Helper Icon
function XIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
