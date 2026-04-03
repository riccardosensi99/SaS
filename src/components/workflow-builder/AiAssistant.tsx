"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface AiAssistantProps {
  onWorkflowGenerated: (workflow: {
    name: string;
    description: string;
    nodes: unknown[];
    edges: unknown[];
  }) => void;
  currentNodes?: unknown[];
  currentEdges?: unknown[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AiAssistant({ onWorkflowGenerated, currentNodes, currentEdges }: AiAssistantProps) {
  const t = useTranslations("ai");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", prompt: userMsg }),
      });
      const data = await res.json();

      if (data.workflow) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: t("generated", { name: data.workflow.name, steps: data.workflow.nodes.length }) },
        ]);
        onWorkflowGenerated(data.workflow);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error || t("error") }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t("error") }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    if (!currentNodes?.length) return;
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: t("analyzeRequest") }]);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze", nodes: currentNodes, edges: currentEdges }),
      });
      const data = await res.json();

      if (data.analysis) {
        const { score, summary, suggestions } = data.analysis;
        const text = [`**${t("score")}: ${score}/100** — ${summary}`]
          .concat(suggestions.map((s: { type: string; message: string }) =>
            `${s.type === "warning" ? "⚠" : s.type === "improvement" ? "💡" : "ℹ"} ${s.message}`
          ))
          .join("\n\n");
        setMessages((prev) => [...prev, { role: "assistant", content: text }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t("error") }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-xl z-50"
        title={t("title")}
      >
        AI
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div>
          <h3 className="font-semibold text-gray-900">{t("title")}</h3>
          <p className="text-xs text-gray-400">{t("subtitle")}</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-8">
            <p className="mb-2">{t("placeholder")}</p>
            <p className="text-xs italic">{t("example")}</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm rounded-xl px-3 py-2 max-w-[85%] whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-primary-600 text-white ml-auto"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="bg-gray-100 text-gray-500 text-sm rounded-xl px-3 py-2 max-w-[85%] animate-pulse">
            {t("thinking")}
          </div>
        )}
      </div>

      {/* Actions */}
      {currentNodes && currentNodes.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
          >
            {t("analyze")}
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder={t("inputPlaceholder")}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {t("send")}
          </button>
        </div>
      </div>
    </div>
  );
}
