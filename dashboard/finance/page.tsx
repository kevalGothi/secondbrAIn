"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Wallet, ArrowUpRight, ArrowDownLeft, Clock, Check, IndianRupee, TrendingUp, TrendingDown, HandCoins } from "lucide-react";
import GroupsTab from "./GroupsTab";

type FinanceRecord = {
  _id: string;
  type: string;
  amount: number;
  person: string;
  description: string;
  category: string;
  dueDate?: string;
  isSettled: boolean;
  createdAt: string;
};

const typeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  sent: { label: "Sent", icon: ArrowUpRight, color: "text-red-400", bg: "bg-red-500/10" },
  received: { label: "Received", icon: ArrowDownLeft, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  lent: { label: "Lent (will get back)", icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
  borrowed: { label: "Borrowed (need to return)", icon: TrendingDown, color: "text-orange-400", bg: "bg-orange-500/10" },
  expense: { label: "Expense", icon: Wallet, color: "text-red-400", bg: "bg-red-500/10" },
  income: { label: "Income", icon: IndianRupee, color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

export default function FinancePage() {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    type: "sent", amount: "", person: "", description: "", category: "general", dueDate: "",
  });

  const [activeTab, setActiveTab] = useState<"personal" | "groups">("personal");

  const fetchRecords = async () => {
    const res = await fetch("/api/finance");
    const data = await res.json();
    setRecords(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    setForm({ type: "sent", amount: "", person: "", description: "", category: "general", dueDate: "" });
    setShowForm(false);
    setCreating(false);
    fetchRecords();
  };

  const handleSettle = async (id: string) => {
    await fetch("/api/finance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isSettled: true }),
    });
    fetchRecords();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/finance?id=${id}`, { method: "DELETE" });
    fetchRecords();
  };

  const filtered = filter === "all" ? records :
    filter === "pending" ? records.filter(r => !r.isSettled && (r.type === "lent" || r.type === "borrowed")) :
    records.filter(r => r.type === filter);

  const totalLent = records.filter(r => r.type === "lent" && !r.isSettled).reduce((s, r) => s + r.amount, 0);
  const totalBorrowed = records.filter(r => r.type === "borrowed" && !r.isSettled).reduce((s, r) => s + r.amount, 0);
  const totalSpent = records.filter(r => r.type === "sent" || r.type === "expense").reduce((s, r) => s + r.amount, 0);
  const totalReceived = records.filter(r => r.type === "received" || r.type === "income").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold">Finance Tracker</h1>
          <p className="text-muted-foreground">Track money sent, received, lent & borrowed</p>
        </div>
        {activeTab === "personal" && (
          <button onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold flex items-center gap-2 hover:opacity-90 glow">
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        )}
      </div>

      <div className="flex border-b border-border/50 mb-6">
        <button
          onClick={() => setActiveTab("personal")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === "personal"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Personal Expenses
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === "groups"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Group Sharing
        </button>
      </div>

      {activeTab === "personal" ? (
        <>
          {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-red-400 flex items-center gap-1"><IndianRupee className="w-5 h-5" />{totalSpent.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Received</p>
          <p className="text-2xl font-bold text-emerald-400 flex items-center gap-1"><IndianRupee className="w-5 h-5" />{totalReceived.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">People Owe You</p>
          <p className="text-2xl font-bold text-amber-400 flex items-center gap-1"><IndianRupee className="w-5 h-5" />{totalLent.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border">
          <p className="text-sm text-muted-foreground mb-1">You Owe</p>
          <p className="text-2xl font-bold text-orange-400 flex items-center gap-1"><IndianRupee className="w-5 h-5" />{totalBorrowed.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "sent", "received", "lent", "borrowed", "expense", "income"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? "gradient-primary text-white" : "bg-card border border-border hover:bg-secondary"}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(typeConfig).map(([key, val]) => (
              <button key={key} type="button" onClick={() => setForm({ ...form, type: key })}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1 ${form.type === key ? "gradient-primary text-white" : "bg-secondary border border-border"}`}>
                <val.icon className="w-4 h-4" /> {val.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount (₹)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Person</label>
              <input value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="Manoj, Rahul, etc." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" placeholder="What was it for?" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none">
                <option value="general">General</option>
                <option value="food">Food</option>
                <option value="transport">Transport</option>
                <option value="shopping">Shopping</option>
                <option value="bills">Bills</option>
                <option value="entertainment">Entertainment</option>
                <option value="education">Education</option>
                <option value="rent">Rent</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date (for lent/borrowed)</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="px-6 py-2.5 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50">
              {creating ? "Adding..." : "Add Transaction"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-xl border border-border hover:bg-secondary">Cancel</button>
          </div>
        </form>
      )}

      {/* Records */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-card animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Wallet className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No transactions yet</h2>
          <p className="text-muted-foreground">Start tracking your money or say "500 rs sent to Manoj"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => {
            const config = typeConfig[record.type] || typeConfig.sent;
            const Icon = config.icon;
            const isOverdue = record.dueDate && !record.isSettled && new Date(record.dueDate) < new Date();
            return (
              <div key={record._id} className={`p-5 rounded-2xl bg-card border transition-all group ${isOverdue ? "border-red-500/30" : "border-border hover:border-primary/30"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg flex items-center gap-0.5">{config.color.includes("red") || config.color.includes("orange") ? "-" : "+"}<IndianRupee className="w-4 h-4" />{record.amount.toLocaleString()}</span>
                        {record.person && <span className="text-muted-foreground">→ {record.person}</span>}
                        {record.isSettled && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs">Settled</span>}
                        {isOverdue && <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs animate-pulse">Overdue!</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{record.description || config.label}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{new Date(record.createdAt).toLocaleDateString()}</span>
                        {record.dueDate && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />Due: {new Date(record.dueDate).toLocaleDateString()}</span>}
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">{record.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!record.isSettled && (record.type === "lent" || record.type === "borrowed") && (
                      <button onClick={() => handleSettle(record._id)} className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-all" title="Mark as settled">
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(record._id)} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      ) : (
        <GroupsTab />
      )}
    </div>
  );
}
