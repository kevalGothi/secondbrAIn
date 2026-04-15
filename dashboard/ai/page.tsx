"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Loader2, Mic, MicOff, Brain } from "lucide-react";

export default function AIPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, chatId }),
      });
      const data = await res.json();
      setChatId(data.chatId);
      setMessages(prev => [...prev, { role: "ai", content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, something went wrong. Try again." }]);
    }
    setLoading(false);
  };

  const startVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice not supported. Try Chrome.");
      return;
    }
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      setIsListening(false);
      handleSend(text);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const suggestions = [
    "Craft a message to remind Manoj about the money he owes me",
    "How much have I spent this month?",
    "Who owes me money? Any overdue?",
    "What job links have I saved? Any frontend roles?",
    "Recommend me a movie like the ones I liked",
    "What should I cook tonight based on my saved recipes?",
    "Show me all my saved Instagram links",
    "Write a polite follow-up message for getting my money back",
    "Summarize all my notes and links",
    "What are the top skills needed in my saved job links?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow">
            <Brain className="w-6 h-6 text-white" />
          </div>
          Second Brain AI
        </h1>
        <p className="text-muted-foreground mt-1">Your all-in-one assistant — finances, messages, recommendations, reminders & more</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-card border border-border mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6 glow">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">I know everything about you</h2>
            <p className="text-muted-foreground max-w-lg mb-8">
              Your movies, restaurants, recipes, finances, notes, reminders — I have it all. 
              Ask me anything or tell me to do something. I can even craft messages for you!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl w-full">
              {suggestions.map((s) => (
                <button key={s} onClick={() => { setInput(s); handleSend(s); }}
                  className="px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-left hover:bg-primary/10 hover:border-primary/30 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[75%] p-4 rounded-2xl whitespace-pre-wrap text-sm leading-relaxed ${
              msg.role === "user"
                ? "gradient-primary text-white rounded-br-md"
                : "bg-secondary rounded-bl-md"
            }`}>
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="p-4 rounded-2xl bg-secondary rounded-bl-md flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything... 'Craft message to Manoj', 'How much do I owe?', 'Recommend dinner'"
          className="flex-1 px-5 py-3.5 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
        <button type="button" onClick={startVoice}
          className={`px-4 rounded-xl border transition-all ${isListening ? "bg-red-500 text-white border-red-500 animate-pulse" : "border-border hover:bg-secondary"}`}>
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button type="submit" disabled={loading || !input.trim()}
          className="px-5 rounded-xl gradient-primary text-white hover:opacity-90 glow disabled:opacity-50 transition-all">
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
