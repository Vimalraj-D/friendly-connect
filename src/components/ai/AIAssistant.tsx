import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Mic, MicOff, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Find outfits for my 7-year-old",
  "Show premium chef uniforms",
  "Best kitchen towels under budget",
  "What's trending right now?",
];

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "✨ Hi, I'm **GIGI** — your AI stylist & kitchen guide. Ask me anything about kids wear, chef uniforms, or kitchen essentials." },
  ]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: Msg = { role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    // Strip the seeded greeting (index 0) before sending to API
    const apiMessages = history.slice(1);

    let assistantStarted = false;
    let acc = "";
    const upsert = (chunk: string) => {
      acc += chunk;
      setMessages((prev) => {
        if (!assistantStarted) {
          assistantStarted = true;
          return [...prev, { role: "assistant", content: acc }];
        }
        return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: acc } : m));
      });
    };

    try {
      const resp = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });
      if (resp.status === 429) { toast.error("AI is busy, try again in a moment."); setLoading(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted."); setLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      toast.error("AI assistant unavailable.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { toast.error("Voice input not supported in this browser."); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = false;
    rec.onresult = (e: any) => { setInput(e.results[0][0].transcript); setListening(false); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI assistant"
        className="fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full glass-button animate-pulse-glow flex items-center justify-center"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[420px] h-[600px] max-h-[80vh] glass-card holo-border rounded-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-glass-border flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10">
              <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground glow-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-holo text-sm font-bold text-holo">GIGI</div>
                <div className="text-[11px] text-muted-foreground">AI Shopping Assistant · online</div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-br-sm"
                      : "bg-secondary/70 backdrop-blur-sm text-foreground rounded-bl-sm border border-glass-border"
                  }`}>
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-a:text-accent">
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) =>
                            href?.startsWith("/") ? (
                              <Link to={href} onClick={() => setOpen(false)} className="font-semibold underline decoration-accent/40 hover:decoration-accent">
                                {children}
                              </Link>
                            ) : (
                              <a href={href} target="_blank" rel="noreferrer">{children}</a>
                            ),
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-secondary/70 px-4 py-2.5 rounded-2xl rounded-bl-sm border border-glass-border">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="p-3 border-t border-glass-border flex items-center gap-2 bg-background/40 backdrop-blur-sm"
            >
              <button
                type="button"
                onClick={toggleVoice}
                className={`h-10 w-10 rounded-full flex items-center justify-center border transition-colors ${
                  listening ? "bg-accent text-accent-foreground border-accent animate-pulse" : "border-border hover:bg-secondary"
                }`}
                aria-label="Voice input"
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask GIGI anything…"
                className="flex-1 h-10 px-4 rounded-full bg-background/80 border border-border focus:border-accent focus:outline-none text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-10 w-10 rounded-full glass-button flex items-center justify-center disabled:opacity-50"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}