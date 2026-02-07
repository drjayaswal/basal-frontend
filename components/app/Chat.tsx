"use client";

import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Send,
  FileText,
  PlayCircle,
  Plus,
  MessageSquare,
  UserCircle2,
  Brain,
  ArrowLeft,
  Check,
  Copy,
  LucideArrowsUpFromLine,
  ArrowUpFromLine,
} from "lucide-react";
import { UserData, Source, Message, Conversation } from "@/lib/interface";
import { useRouter } from "next/navigation";
import { cn, getBaseUrl } from "@/lib/utils";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AnimatedButton } from "../ui/animated-button";

export default function Chat({ user }: { user: UserData }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarLoading, setIsSidebarLoading] = useState(true);
  const [sources, setSources] = useState<Source[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [isFlying, setIsFlying] = useState(false);

  const onFlight = () => {
    setIsFlying(true);
    setTimeout(() => setIsFlying(false), 500);
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const NAV_HEIGHT = "64px";
  const [collapsedIds, setCollapsedIds] = useState<Record<number, boolean>>({});

  const toggleCollapse = (id: number) => {
    setCollapsedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const initChat = async () => {
      setIsSidebarLoading(true);
      const token = localStorage.getItem("token");
      try {
        const [srcRes, convRes] = await Promise.all([
          fetch(`${getBaseUrl()}/get-sources`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${getBaseUrl()}/conversations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const sourcesData = await srcRes.json();
        const convData = await convRes.json();
        setSources(sourcesData);
        setConversations(convData);
        if (sourcesData.length > 0) setSelectedSourceId(sourcesData[0].id);
      } catch (error) {
        toast.error("Failed to sync library.");
      } finally {
        setIsSidebarLoading(false);
      }
    };
    initChat();
  }, []);

  const loadConversation = async (id: string) => {
    setIsLoading(true);
    setActiveConversationId(id);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${getBaseUrl()}/conversations/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const history = await res.json();
      setMessages(history);
    } catch (error) {
      toast.error("Could not load history.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedSourceId) {
      return toast.info("No Available Source", {
        action: {
          label: "Upload",
          onClick: () => {
            const toastId = toast.loading("Redirecting...");
            setTimeout(() => {
              toast.dismiss(toastId);
              router.push("/biasbreakerai");
            }, 1500);
          },
        },
      });
    }
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${getBaseUrl()}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: userMsg,
          source_id: selectedSourceId,
          conversation_id: activeConversationId,
        }),
      });
      const data = await response.json();
      if (!activeConversationId && data.conversation_id) {
        setActiveConversationId(data.conversation_id);
        const convRes = await fetch(`${getBaseUrl()}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(await convRes.json());
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (error: any) {
      toast.error("Bridge Connection Failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex w-full text-slate-200 bg-black font-sans overflow-hidden"
      style={{
        height: `calc(100vh - ${NAV_HEIGHT})`,
        marginTop: NAV_HEIGHT,
      }}
    >
      <aside className="w-70 mb-12 hidden md:flex flex-col border-r border-white/15 bg-black">
        <div className="p-6">
          <span className="text-[10px] uppercase font-bold text-white/30 border-b border-white/20">
            Source(s) [
            {sources.length > 0
              ? sources.length.toString().padStart(2, "0")
              : "00"}
            ]
          </span>
          <div className="mt-4">
            {isSidebarLoading
              ? [1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-full bg-white/20 animate-pulse mb-px"
                  />
                ))
              : sources.length > 0 &&
                sources.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSourceId(s.id)}
                    className={`w-full cursor-pointer flex items-center gap-3 px-3 py-1.5 text-xs transition-all duration-200 ${
                      selectedSourceId === s.id
                        ? "text-white bg-rose-700"
                        : "text-white/40 hover:bg-white/10 hover:text-white/60"
                    }`}
                  >
                    {s.source_type === "video" ? (
                      <PlayCircle size={16} />
                    ) : (
                      <FileText size={16} />
                    )}
                    <span className="truncate font-medium">
                      {s.source_name}
                    </span>
                  </button>
                ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-white/30 border-b border-white/20">
            Conversation(s) [
            {conversations.length > 0
              ? conversations.length.toString().padStart(2, "0")
              : "00"}
            ]
          </span>
          <div className="mt-4">
            {isSidebarLoading
              ? [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-full bg-white/20 animate-pulse mb-px"
                  />
                ))
              : conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => loadConversation(c.id)}
                    className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 text-xs transition-all ${
                      activeConversationId === c.id
                        ? "text-white bg-rose-700"
                        : "text-white/40 hover:bg-white/10 hover:text-white/70"
                    }`}
                  >
                    <MessageSquare size={14} className="shrink-0" />
                    <span className="truncate text-left">
                      {c.title || "Untitled Chat"}
                    </span>
                  </button>
                ))}
          </div>
        </div>

        <div className="pt-2 pb-4 px-2 mt-auto border-t border-white/20">
          <button
            onClick={() => {
              setActiveConversationId(null);
              setMessages([]);
            }}
            className="w-full cursor-pointer py-3 text-[11px] bg-white uppercase tracking-widest text-black hover:text-white font-bold flex items-center justify-center gap-2 hover:bg-rose-700 hover:border-rose-600 transition-all duration-300"
          >
            <Plus size={14} /> New Conversation
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative">
        <div
          ref={scrollRef}
          className="flex-1 mb-30 overflow-y-auto p-6 md:p-12 space-y-8 no-scrollbar scroll-smooth"
        >
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-700">
              <div className="text-center max-w-sm flex flex-col items-center">
                <Image
                  className="mb-6 opacity-80 grayscale hover:grayscale-0 transition-all duration-500"
                  src="/logo.png"
                  alt="logo"
                  width={60}
                  height={60}
                />
                <h3 className="text-xl font-bold text-white tracking-[0.4em] uppercase">
                  BiasBreaker
                </h3>
                <div className="h-1 my-1 w-full bg-rose-600/50" />
                {sources.length > 0 ? (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 leading-relaxed">
                    Select a source to begin analysis...
                  </p>
                ) : (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 leading-relaxed">
                    Upload a source to begin analysis...
                  </p>
                )}
              </div>

              <div className="mt-6 w-full max-w-md border border-white/10">
                {sources.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                    {[
                      "Summarize document",
                      "Extract key insights",
                      "Find specific mentions",
                      "Analyze sentiment",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="group relative flex items-center justify-center border-b border-r border-white/10 bg-white/5 py-3 px-4 text-[11px] font-bold uppercase tracking-tighter text-white/50 transition-all hover:bg-rose-700 hover:text-white last:border-b-0 `sm:nth-[2n]:border-r-0 cursor-pointer active:bg-rose-800"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="relative h-10.5 w-full overflow-hidden border-b border-r border-black bg-white/20 animate-pulse last:border-b-0 `sm:nth-[2n]:border-r-0"
                      >
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/5 to-transparent" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {messages.map((msg, i) => {
            const isCollapsed = collapsedIds[i];

            return (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-3 duration-500`}
              >
                <div
                  className={`flex max-w-[90%] md:max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`relative group p-5 text-sm leading-relaxed transition-all duration-300 ${
                      msg.role === "user"
                        ? "text-white bg-rose-700"
                        : "text-white bg-indigo-700"
                    } ${isCollapsed ? "h-10 overflow-hidden opacity-80" : "h-auto"}`}
                  >
                    <button
                      onClick={() => toggleCollapse(i)}
                      title={isCollapsed ? "Expand" : "Collapse"}
                      className={`absolute top-0 z-20 bg-white w-4 h-4 cursor-pointer transition-colors flex items-center justify-center ${
                        msg.role === "user" ? "right-0" : "left-0"
                      }`}
                    >
                      <div
                        className={`w-2 h-0.5 bg-black transition-transform ${isCollapsed ? "rotate-90" : ""}`}
                      />
                      {isCollapsed && (
                        <div className="absolute w-2 h-0.5 bg-black" />
                      )}
                    </button>

                    <div className={isCollapsed ? "invisible" : "visible"}>
                      {msg.role === "assistant" && (
                        <CopyButton content={msg.content} />
                      )}

                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="mb-3 last:mb-0" {...props} />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    {isCollapsed && (
                      <span className="text-[14px] absolute left-6 text-white top-2 truncate max-w-[70%]">
                        message is collapsed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-center">
              <div className="flex max-w-[70%]">
                <div className="p-4">
                  <Loader2 className="animate-spin text-white" size={18} />
                </div>
              </div>
            </div>
          )}
        </div>

        {sources.length > 0 && (
          <div className="absolute bottom-5 bg-white/10 backdrop-blur-md border-t border-white/15 w-full mx-auto pt-1.25 px-2 pb-5 md:pb-10">
            <form
              onSubmit={handleSendMessage}
              className="group relative flex items-center bg-black focus-within:border-white/30 pl-6 py-0.5 pr-1.5 transition-all duration-300"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your source anything..."
                className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-white placeholder:text-white/70"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                onClick={onFlight}
                className={`p-2.5 cursor-pointer bg-transparent text-white transition-all duration-500 ease-in-out transform disabled:opacity-20
                ${isFlying ? "-translate-y-16 translate-x-16 opacity-0 scale-150" : "active:scale-95 hover:bg-rose-700"}
              `}
              >
                <Send size={18} className={isFlying ? "animate-pulse" : ""} />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

const CopyButton = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-0 right-0 cursor-pointer p-1.5 bg- shadow-none text-white hover:bg-white/20 rounded-bl-xl hover:text-white transition-all duration-200"
      title="Copy response"
    >
      {copied ? <Check size={14} className="text-white" /> : <Copy size={14} />}
    </button>
  );
};
