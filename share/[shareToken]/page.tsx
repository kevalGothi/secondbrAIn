"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronRight, Circle, Coins, Plus, Receipt, User, Users, Pencil, Trash2 } from "lucide-react";

export default function SharedGroupPage() {
  const { shareToken } = useParams() as { shareToken: string };
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [identity, setIdentity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState<string>("");
  const [splitAmong, setSplitAmong] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check localStorage for identity
    const saved = localStorage.getItem(`group-identity-${shareToken}`);
    if (saved) setIdentity(saved);
  }, [shareToken]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/groups/shared/${shareToken}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setGroup(data);
      } catch (e) {
        setGroup(false); 
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [shareToken]);

  useEffect(() => {
    if (identity && group) {
      fetchExpenses();
      setPaidBy(identity); // Default who paid
    }
  }, [identity, group]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`/api/groups/shared/${shareToken}/expenses`);
      const data = await res.json();
      setExpenses(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectIdentity = (member: string) => {
    localStorage.setItem(`group-identity-${shareToken}`, member);
    setIdentity(member);
    setPaidBy(member);
  };

  const logout = () => {
    localStorage.removeItem(`group-identity-${shareToken}`);
    setIdentity(null);
  };

  const submitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || parseFloat(amount) <= 0 || splitAmong.length === 0) return;
    setSubmitting(true);
    try {
      const url = editingExpenseId 
        ? `/api/groups/shared/${shareToken}/expenses/${editingExpenseId}`
        : `/api/groups/shared/${shareToken}/expenses`;
      const method = editingExpenseId ? "PUT" : "POST";
      
      const res = await fetch(url, {
         method,
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ description: desc, amount: parseFloat(amount), paidBy, splitAmong })
      });
      if (res.ok) {
         setIsModalOpen(false);
         setDesc("");
         setAmount("");
         setSplitAmong([]);
         setEditingExpenseId(null);
         fetchExpenses();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteExpense = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      const res = await fetch(`/api/groups/shared/${shareToken}/expenses/${expenseId}`, { method: "DELETE" });
      if (res.ok) fetchExpenses();
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (expense: any) => {
    setDesc(expense.description);
    setAmount(expense.amount.toString());
    setPaidBy(expense.paidBy);
    setSplitAmong(expense.splitAmong);
    setEditingExpenseId(expense._id);
    setIsModalOpen(true);
  };
  
  const openCreateModal = () => {
    setDesc("");
    setAmount("");
    setPaidBy(identity || "");
    setSplitAmong(group ? group.members : []);
    setEditingExpenseId(null);
    setIsModalOpen(true);
  };

  const toggleSplitMember = (member: string) => {
    if (splitAmong.includes(member)) {
      setSplitAmong(splitAmong.filter(m => m !== member));
    } else {
      setSplitAmong([...splitAmong, member]);
    }
  };

  const calculateBalances = () => {
    // Returns { [member]: balance } where positive means they are owed, negative means they owe
    const balances: Record<string, number> = {};
    if (group) group.members.forEach((m: string) => balances[m] = 0);
    
    expenses.forEach(exp => {
      // The person who paid gets the amount added to their balance
      if (balances[exp.paidBy] !== undefined) {
          balances[exp.paidBy] += exp.amount;
      } else {
          balances[exp.paidBy] = exp.amount;
      }
      
      const splitCost = exp.amount / exp.splitAmong.length;
      
      exp.splitAmong.forEach((m: string) => {
         if (balances[m] !== undefined) {
             balances[m] -= splitCost;
         } else {
             balances[m] = -splitCost;
         }
      });
    });
    
    return balances;
  };

  if (loading) return <div className="flex h-screen items-center justify-center animate-pulse"><Users className="w-10 h-10 text-primary opacity-50"/></div>;
  if (group === false) return <div className="flex h-screen flex-col items-center justify-center text-center p-6"><h1 className="text-2xl font-bold mb-2">Group Not Found</h1><p className="text-muted-foreground">This invite link is invalid or the group was deleted.</p></div>;

  // Identity Selection Screen
  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="text-muted-foreground mt-2">Select your name to join the group</p>
          </div>
          
          <div className="space-y-3">
            {group.members.map((member: string) => (
              <button
                key={member}
                onClick={() => handleSelectIdentity(member)}
                className="w-full flex items-center justify-between bg-card hover:bg-secondary/50 border border-border/50 p-4 rounded-2xl shadow-sm transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 flex items-center justify-center text-white font-bold to-purple-500 rounded-full shrink-0">
                    {member.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-lg font-medium">{member}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
            {group.members.length === 0 && (
              <p className="text-center text-muted-foreground italic text-sm">No members added to this group yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  const balances = calculateBalances();
  const myBalanceStr = balances[identity] ? balances[identity].toFixed(2) : "0.00";
  const myBalance = balances[identity] || 0;

  return (
    <div className="min-h-screen bg-background pb-24 font-sans text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-4 flex justify-between items-center shadow-sm">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold truncate pr-2" style={{ maxWidth: "200px" }}>{group.name}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Logged in as {identity}
          </p>
        </div>
        <button onClick={logout} className="text-sm font-medium text-red-400 hover:text-red-500 bg-red-400/10 px-3 py-1.5 rounded-full transition-colors">
          Logout
        </button>
      </header>

      <main className="p-4 space-y-6 max-w-md mx-auto">
        {/* Balance Card */}
        <div className={`p-6 rounded-3xl shadow-lg border relative overflow-hidden text-white ${myBalance >= 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400/30' : 'bg-gradient-to-br from-red-500 to-rose-600 border-red-400/30'}`}>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
            <Coins className="w-32 h-32" />
          </div>
          <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">Your Total Balance</p>
          <div className="text-4xl font-bold flex items-baseline gap-1">
            <span className="text-2xl opacity-80">₹</span>
            {Math.abs(myBalance).toFixed(2)}
          </div>
          <div className="mt-2 text-sm font-medium bg-black/20 self-start inline-block px-3 py-1 rounded-full backdrop-blur-sm">
            {myBalance > 0 ? "You are owed" : myBalance < 0 ? "You owe overall" : "You are settled up"}
          </div>
        </div>

        {/* Expenses List */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Recent Expenses
          </h2>
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-secondary/30 rounded-2xl border border-border/50">
                <Receipt className="w-8 h-8 opacity-50 mx-auto mb-2" />
                No expenses yet
              </div>
            ) : (
              expenses.map(exp => {
                const date = new Date(exp.date);
                const amIInvolved = exp.paidBy === identity || exp.splitAmong.includes(identity);
                const didIPay = exp.paidBy === identity;
                const costForMe = exp.splitAmong.includes(identity) ? (exp.amount / exp.splitAmong.length) : 0;
                
                return (
                  <div key={exp._id} className="bg-card border border-border/50 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-secondary rounded-xl flex flex-col items-center justify-center">
                          <span className="text-xs uppercase text-muted-foreground font-semibold">{date.toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-lg font-bold leading-none">{date.getDate()}</span>
                       </div>
                       <div>
                         <h3 className="font-semibold text-lg leading-tight">{exp.description}</h3>
                         <p className="text-sm text-muted-foreground">
                           <span className="font-medium text-foreground">{exp.paidBy}</span> paid ₹{exp.amount.toFixed(2)}
                         </p>
                       </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {amIInvolved && (
                          <div className="text-right">
                            {didIPay && costForMe < exp.amount ? (
                              <div className="text-emerald-500 font-semibold text-sm">
                                  <span className="block text-xs uppercase opacity-80">You lent</span>
                                  ₹{(exp.amount - costForMe).toFixed(2)}
                              </div>
                            ) : !didIPay && costForMe > 0 ? (
                              <div className="text-red-500 font-semibold text-sm">
                                  <span className="block text-xs uppercase opacity-80">You owe</span>
                                  ₹{costForMe.toFixed(2)}
                              </div>
                            ) : (
                              <div className="text-muted-foreground text-sm">Not involved</div>
                            )}
                          </div>
                      )}
                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-1">
                         <button onClick={() => openEditModal(exp)} className="p-1.5 bg-secondary hover:bg-primary/10 hover:text-primary rounded-lg transition-colors text-muted-foreground"><Pencil className="w-4 h-4" /></button>
                         <button onClick={() => deleteExpense(exp._id)} className="p-1.5 bg-secondary hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-muted-foreground"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>

      {/* Floating Add Action */}
      <div className="fixed bottom-6 w-full flex justify-center z-30 px-4 pointer-events-none">
        <button 
          onClick={openCreateModal}
          className="pointer-events-auto bg-primary text-primary-foreground flex items-center gap-2 px-6 py-4 rounded-full shadow-xl shadow-primary/30 font-bold active:scale-95 transition-transform">
          <Plus className="w-6 h-6" /> Add Expense
        </button>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-background w-full sm:w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up sm:animate-fade-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingExpenseId ? "Edit Expense" : "New Expense"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-secondary p-2 rounded-full"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            
            <form onSubmit={submitExpense} className="space-y-5 overflow-y-auto pr-2 pb-6">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-muted-foreground">Description</label>
                <input type="text" required value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Dinner, Cab ride" autoFocus
                  className="w-full bg-background border-b-2 border-border focus:border-primary px-0 py-3 text-xl focus:outline-none transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-muted-foreground">Total Amount (₹)</label>
                <input type="number" required min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                  className="w-full bg-background border-b-2 border-border focus:border-primary px-0 py-3 text-3xl font-bold focus:outline-none transition-colors" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-muted-foreground">Who paid?</label>
                <select value={paidBy} onChange={e => setPaidBy(e.target.value)}
                  className="w-full bg-background border-b-2 border-border focus:border-primary px-0 py-3 text-lg focus:outline-none transition-colors">
                  {group.members.map((m: string) => (
                    <option key={m} value={m}>{m} {m === identity ? "(You)" : ""}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground border-b border-border/50 pb-2 flex justify-between">
                  <span>Split equally among ({splitAmong.length < group.members.length ? `${splitAmong.length} selected` : 'All'})</span>
                  <button type="button" onClick={() => setSplitAmong(group.members)} className="text-primary text-xs">Select All</button>
                </label>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {group.members.map((m: string) => (
                    <button type="button" key={m} onClick={() => toggleSplitMember(m)}
                       className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                         splitAmong.includes(m) ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 hover:bg-secondary'
                       }`}
                    >
                      {splitAmong.includes(m) ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                      <span className="truncate">{m}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting || !desc || !amount || splitAmong.length === 0}
                className="w-full py-4 mt-4 bg-primary text-primary-foreground font-bold text-lg rounded-2xl shadow-lg disabled:opacity-50 transition-opacity"
              >
                {submitting ? "Saving..." : "Save Expense"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
