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
  Check,
  Copy,
  CircleX,
} from "lucide-react";
import {
  UserData,
  Source,
  Message,
  Conversation as ConversationI,
} from "@/lib/interface";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "@/lib/utils";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Conversation({ user }: { user: UserData }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarLoading, setIsSidebarLoading] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [conversations, setConversations] = useState<ConversationI[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isFlying, setIsFlying] = useState(false);
  const hasInitialized = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [collapsedIds, setCollapsedIds] = useState<Record<number, boolean>>({});

  const NAV_HEIGHT = "64px";

  const onFlight = () => {
    setIsFlying(true);
    setTimeout(() => setIsFlying(false), 500);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleCollapse = (id: number) => {
    setCollapsedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initChat = async () => {
      setIsSidebarLoading(true);
      const token = localStorage.getItem("token");
      try {
        const [srcRes, convRes] = await Promise.all([
          fetch(`${getBaseUrl()}/get-sources`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${getBaseUrl()}/conversations`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const sourcesData = await srcRes.json();
        const convData = await convRes.json();

        setSources(sourcesData);
        setConversations(convData);

        if (sourcesData && sourcesData.length > 0) {
          setSelectedSourceId(sourcesData[0].id);
          toast.success(`${sourcesData.length} source(s) available`);
        } else {
          toast.info("No Source Available");
        }
      } catch (error) {
        toast.error("Failed to sync library.");
      } finally {
        setIsSidebarLoading(false);
      }
    };

    initChat();
  }, [router]);

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
    if (!input.trim() || !selectedSourceId) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${getBaseUrl()}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (error) {
      toast.error("Bridge Connection Failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex w-full text-slate-200 bg-black font-sans overflow-hidden"
      style={{ height: `calc(100vh - ${NAV_HEIGHT})`, marginTop: NAV_HEIGHT }}
    >
      <aside className="w-70 mb-12 hidden md:flex flex-col border-r border-white/15 bg-black">
        <div className="p-6 px-2">
          <span className="text-[10px] uppercase font-bold text-white/30 border-b border-white/20">
            Source(s) [{sources.length.toString().padStart(2, "0")}]
          </span>
          <div className="mt-4">
            {isSidebarLoading ? (
              [1, 2].map((i) => <div key={i} className="h-9 w-full bg-white/10 animate-pulse mb-px" />)
            ) : sources.length > 0 ? (
              sources.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSourceId(s.id)}
                  className={`w-full cursor-pointer flex items-center gap-3 pr-3 py-1.5 text-xs transition-all duration-200 ${
                    selectedSourceId === s.id ? "text-white bg-rose-700 border-l pl-3 border-white" : "text-white/40 pl-2 hover:bg-white/10"
                  }`}
                >
                  {s.source_type === "video" ? <PlayCircle className="scale-140" size={16} /> : <FileText size={16} />}
                  <span className="truncate font-medium">{s.source_name}</span>
                </button>
              ))
            ) : (
              <SourceEmptyState onIngest={() => router.push("/ingest")} />
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-2 no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-white/30 border-b border-white/20">
            Conversation(s) [{conversations.length.toString().padStart(2, "0")}]
          </span>
          <div className="mt-4">
            {conversations.length > 0 ? conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => loadConversation(c.id)}
                className={`w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 text-xs transition-all ${
                  activeConversationId === c.id ? "text-white bg-rose-700 border-l border-white" : "text-white/40 hover:bg-white/10"
                }`}
              >
                <MessageSquare size={14} className="shrink-0" />
                <span className="truncate text-left">{c.title || "Untitled Conversations"}</span>
              </button>
            )) : <ConversationsEmptyState/>}
          </div>
        </div>
        <div className={`pt-2 pb-4 px-2 mt-auto ${sources.length > 0 && "border-t border-white/20"}`}>
          {sources.length > 0 && (
            <button
              onClick={() => { setActiveConversationId(null); setMessages([]); }}
              className="w-full cursor-pointer py-3 text-[11px] text-white uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition-all duration-300"
            >
              <Plus size={14} /> New Conversation
            </button>
          )}
        </div>
      </aside>
      <main className="flex-1 flex flex-col relative">
        <div
          ref={scrollRef}
          className="flex-1 mb-30 overflow-y-auto p-6 md:p-10 space-y-8 no-scrollbar scroll-smooth"
        >
          {isSidebarLoading && messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-white/20" size={40} />
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-white/20">Synchronizing...</p>
            </div>
          ) : (
            <>
              {messages.length === 0 && !isLoading && (
                <MessageEmptyState
                  hasSources={sources.length > 0}
                  onSetInput={(val) => setInput(val)}
                />
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-3 duration-500`}
                >
                  <div className={`flex max-w-[90%] md:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <MessageItem
                      msg={msg}
                      index={i}
                      isCollapsed={collapsedIds[i]}
                      toggleCollapse={toggleCollapse}
                    />
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin text-white" size={18} />
                </div>
              )}
            </>
          )}
        </div>
        {sources.length > 0 && (
          <div className="absolute bottom-5 bg-white/10 backdrop-blur-md border-t border-white/15 w-full pt-1.25 px-2 pb-5 md:pb-10">
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
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

const MessageEmptyState = ({
  hasSources,
  onSetInput,
}: {
  hasSources: boolean;
  onSetInput: (val: string) => void;
}) => {
  if (!hasSources) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative group">
          <CircleX className="text-rose-600" size={40} />
        </div>

        <div className="mt-2 text-center max-w-xs">
          <h3 className="inline-flex items-center justify-center gap-2 text-xl font-bold text-white/40 uppercase">
            No Source Available
          </h3>
        </div>
      </div>
    );
  }

  return (
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
          Basal•AI
        </h3>
        <div className="h-1 my-1 w-full bg-rose-600/50" />
      </div>

      <div className="mt-6 w-full max-w-md border border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {[
            "Summarize document",
            "Extract key insights",
            "Find specific mentions",
            "Analyze sentiment",
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onSetInput(suggestion)}
              className="group relative flex items-center justify-center border-b border-r border-white/10 py-3 px-4 text-[11px] font-bold uppercase tracking-tighter text-white/50 transition-all hover:bg-rose-700 hover:text-white cursor-pointer active:bg-rose-800"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
const CopyButton = ({
  content,
  onCopy,
}: {
  content: string;
  onCopy: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    onCopy();
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-0 right-0 cursor-pointer p-1.5 bg-transparent text-white hover:bg-white/20 transition-all duration-200 z-30"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
};
const MessageItem = ({
  msg,
  index,
  isCollapsed,
  toggleCollapse,
}: {
  msg: any;
  index: number;
  isCollapsed: boolean;
  toggleCollapse: (id: number) => void;
}) => {
  const [isShining, setIsShining] = useState(false);

  const triggerShine = () => {
    setIsShining(true);
    setTimeout(() => setIsShining(false), 850);
  };

  return (
    <div
      className={`relative group text-sm leading-relaxed transition-all duration-300 overflow-hidden ${
        msg.role === "user"
          ? "text-white p-2 pl-3 pr-10 bg-rose-600 rounded-4xl rounded-tr-none"
          : "text-white bg-indigo-700 p-3 pl-5 pr-6.5 pt-4 rounded-4xl rounded-t-none"
      } ${isCollapsed ? "h-10 opacity-80 rounded-tr-4xl" : "h-auto"}`}
    >
      {isShining && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="absolute inset-y-0 w-1/2 bg-linear-to-r from-transparent via-white/60 to-transparent animate-shine" />
        </div>
      )}
      <button
        onClick={() => toggleCollapse(index)}
        className={`absolute top-0 z-20 bg-white w-4 h-4 cursor-pointer flex items-center justify-center ${
          msg.role === "user" ? "right-0" : "left-0"
        }`}
      >
        <div
          className={`w-2 h-0.5 bg-black transition-transform ${isCollapsed ? "rotate-90" : ""}`}
        />
      </button>

      <div className={isCollapsed ? "invisible" : "visible"}>
        {msg.role === "assistant" && (
          <CopyButton content={msg.content} onCopy={triggerShine} />
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
  );
};
const SourceEmptyState = ({ onIngest }: { onIngest: () => void }) => (
  <button
    onClick={onIngest}
    className="w-full cursor-pointer group relative flex items-center justify-center py-5 px-4 border-2 border-dashed border-white/10 hover:border-teal-700/50 hover:bg-teal-700/15 transition-all duration-300 gap-3"
  >
    <div className="p-2 bg-white/5 rounded-full group-hover:bg-teal-700/60 transition-colors">
      <Plus size={16} className="text-white/40 group-hover:text-white" />
    </div>
    <div className="text-center">
      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest group-hover:text-white/60">
        No Sources Found
      </p>
    </div>
  </button>
);
const ConversationsEmptyState = () => (
  <div className="w-full group relative flex flex-col items-center justify-center py-4 px-4 border-2 border-dashed border-white/10 gap-2">
    <div className="text-center">
      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
        Empty History
      </p>
    </div>
  </div>
);
