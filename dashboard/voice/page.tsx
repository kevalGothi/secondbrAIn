"use client";

import { useState } from "react";
import { Mic, MicOff, Loader2, Film, UtensilsCrossed, ChefHat, StickyNote, Bell, Sparkles, Wallet, MessageSquare, Copy, CheckCheck, Link2 } from "lucide-react";

export default function VoicePage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input not supported. Try Chrome or Edge on mobile/desktop.");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => { setIsListening(true); setResult(null); };
    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };
    recognition.onend = () => {
      setIsListening(false);
      if (transcript) processVoice(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const processVoice = async (text: string) => {
    setProcessing(true);
    try {
      const res = await fetch("/api/voice/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data);
      setHistory(prev => [{ text, result: data, time: new Date() }, ...prev]);
    } catch {
      setResult({ message: "Failed to process. Try again." });
    }
    setProcessing(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim()) processVoice(transcript);
  };

  const typeIcons: any = { movie: Film, restaurant: UtensilsCrossed, recipe: ChefHat, note: StickyNote, reminder: Bell, finance: Wallet, message: MessageSquare, link: Link2 };
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Voice Input</h1>
        <p className="text-muted-foreground">Speak naturally — AI understands and organizes for you</p>
      </div>

      <div className="flex flex-col items-center py-12">
        <button onClick={startListening} disabled={isListening || processing}
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
            isListening
              ? "bg-red-500 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.5)]"
              : processing
              ? "gradient-primary opacity-50"
              : "gradient-primary hover:scale-105 glow"
          }`}>
          {processing ? (
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          ) : isListening ? (
            <MicOff className="w-12 h-12 text-white" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
        </button>
        <p className="mt-4 text-muted-foreground">
          {isListening ? "Listening... speak now" : processing ? "AI is processing..." : "Tap to speak"}
        </p>
      </div>

      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <input value={transcript} onChange={(e) => setTranscript(e.target.value)}
          placeholder="Try: '500 rs sent to Manoj', 'Craft message to Rahul about money', 'I liked YJHD movie'"
          className="flex-1 px-5 py-3.5 rounded-xl bg-card border border-border focus:border-primary outline-none" />
        <button type="submit" disabled={processing || !transcript.trim()}
          className="px-6 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50">
          Process
        </button>
      </form>

      {result && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center gap-3">
            {result.type && typeIcons[result.type] && (
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                result.type === "movie" ? "bg-gradient-to-br from-pink-500 to-rose-500" :
                result.type === "restaurant" ? "bg-gradient-to-br from-orange-500 to-red-500" :
                result.type === "recipe" ? "bg-gradient-to-br from-emerald-500 to-teal-500" :
                result.type === "reminder" ? "bg-gradient-to-br from-cyan-500 to-blue-500" :
                result.type === "finance" ? "bg-gradient-to-br from-amber-500 to-orange-500" :
                result.type === "message" ? "bg-gradient-to-br from-indigo-500 to-violet-500" :
                "bg-gradient-to-br from-violet-500 to-purple-500"
              }`}>{(() => { const Icon = typeIcons[result.type]; return <Icon className="w-5 h-5 text-white" />; })()}</div>
            )}
            <div>
              <p className="font-semibold text-lg">{result.message}</p>
              {result.parsed && (
                <p className="text-sm text-muted-foreground">Intent: {result.parsed.intent} • Sentiment: {result.parsed.sentiment}</p>
              )}
            </div>
          </div>
          {result.created && (
            <div className="p-4 rounded-xl bg-secondary space-y-2">
              <h4 className="font-medium">Created: {result.created.title || result.created.name}</h4>
              {result.created.genre && <p className="text-sm text-muted-foreground">Genre: {result.created.genre.join(", ")}</p>}
              {result.created.cuisine && <p className="text-sm text-muted-foreground">Cuisine: {Array.isArray(result.created.cuisine) ? result.created.cuisine.join(", ") : result.created.cuisine}</p>}
              {result.created.overview && <p className="text-sm text-muted-foreground">{result.created.overview}</p>}
            </div>
          )}
          {result.craftedMessage && (
            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-indigo-400 flex items-center gap-1"><MessageSquare className="w-4 h-4" /> Crafted Message</p>
                <button onClick={() => { navigator.clipboard.writeText(result.craftedMessage); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="p-1.5 rounded-lg hover:bg-indigo-500/10 transition-all">
                  {copied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
              <p className="text-sm whitespace-pre-wrap bg-background p-3 rounded-lg border border-border">{result.craftedMessage}</p>
            </div>
          )}
          {result.recommendations?.length > 0 && (
            <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
              <p className="text-sm font-medium text-violet-400 flex items-center gap-1 mb-2"><Sparkles className="w-4 h-4" /> You might also like</p>
              <div className="flex flex-wrap gap-2">
                {result.recommendations.map((r: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 text-sm">{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Voice Commands</h2>
          <div className="space-y-2">
            {history.slice(0, 10).map((h, i) => (
              <div key={i} className="p-3 rounded-xl bg-card/50 border border-border text-sm flex justify-between items-center">
                <span>"{h.text}"</span>
                <span className="text-muted-foreground text-xs">{h.result?.parsed?.intent || "processed"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
