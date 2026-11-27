import React, { useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, RotateCcw, Send, Sparkles } from "lucide-react";
import { insightsApi } from "@/api/Insights";
import { useAccount } from "@/hooks/useAccount";
import { cn } from "@/utils/cn";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const DEFAULT_QUICK_OPTIONS = [
  "📊 Informe de gastos",
  "🛡️ Revisar alertas",
  "💡 Consejos directos",
  "🤖 Ampliar info de TriDa",
  "💸 Top categorías",
];

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "¡Hola! Soy **TriDa IA**, tu asistente financiero y de protección pasiva.\n\nElige una de las opciones rápidas de abajo o escríbeme para pedir un **informe de gastos**, **revisar alertas**, **ampliar información** o recibir **consejos directos**.",
  timestamp: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
};

function renderFormattedText(text: string) {
  return text.split("\n").map((line, lineIdx) => {
    if (!line.trim()) {
      return <div key={lineIdx} className="h-2" />;
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={lineIdx} className="leading-relaxed">
        {parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={partIdx} className="font-semibold text-text-primary">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={partIdx}>{part}</span>;
        })}
      </p>
    );
  });
}

export const TriDaChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [quickOptions, setQuickOptions] = useState<string[]>(DEFAULT_QUICK_OPTIONS);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { selectedAccountId } = useAccount();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isSending]);

  async function handleSendMessage(rawText: string) {
    const trimmed = rawText.trim();
    if (!trimmed || isSending) return;

    const now = new Date().toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsSending(true);

    try {
      const response = await insightsApi.sendChatMessage({
        mensaje: trimmed,
        periodo_dias: 30,
        id_cuenta: selectedAccountId ?? undefined,
      });

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: response.respuesta,
        timestamp: new Date().toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMsg]);
      if (response.sugerencias_rapidas && response.sugerencias_rapidas.length > 0) {
        setQuickOptions(response.sugerencias_rapidas);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "No pude consultar tus datos en este momento. Verifica tu sesión o intenta de nuevo en unos segundos.",
          timestamp: new Date().toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleResetChat() {
    setMessages([
      {
        ...INITIAL_WELCOME_MESSAGE,
        id: `welcome-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setQuickOptions(DEFAULT_QUICK_OPTIONS);
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end lg:bottom-6 lg:right-6">
      {isOpen && (
        <section
          aria-label="Asistente IA de TriDa"
          className="mb-3 flex h-[530px] max-h-[78dvh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl sm:w-[400px]"
        >
          {/* Header del chatbot */}
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="flex items-center gap-1.5 text-sm font-bold">
                  Asistente TriDa IA
                  <Sparkles className="h-3.5 w-3.5" />
                </h2>
                <p className="text-[11px] text-white/80">
                  Reportes, alertas y consejos en tiempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reiniciar conversación"
                aria-label="Reiniciar conversación"
                className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimizar asistente"
                aria-label="Minimizar asistente"
                className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Historial de mensajes */}
          <div className="trida-chat-scroll flex-1 space-y-3 overflow-y-auto bg-background/60 p-3.5">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col",
                    isUser ? "items-end" : "items-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm",
                      isUser
                        ? "rounded-br-sm bg-primary text-white"
                        : "rounded-bl-sm border border-border bg-surface text-text-secondary",
                    )}
                  >
                    {isUser ? (
                      <p className="leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="space-y-1">{renderFormattedText(msg.content)}</div>
                    )}
                  </div>
                  <span className="mt-1 px-1 text-[10px] text-text-muted">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-start">
                <div className="rounded-2xl rounded-bl-sm border border-border bg-surface px-3.5 py-2.5 text-xs text-text-muted">
                  Consultando tus datos...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Opciones rápidas justo encima de la barra de escritura */}
          <div className="border-t border-border bg-surface px-3 pt-2.5 pb-1.5">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-text-muted">
              Opciones rápidas
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pb-1">
              {quickOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={isSending}
                  onClick={() => handleSendMessage(option)}
                  className="rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Barra de escritura */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex items-center gap-2 bg-surface p-3 pt-1.5"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu pregunta aquí..."
              disabled={isSending}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSending || !inputValue.trim()}
              aria-label="Enviar mensaje"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      {/* Burbuja flotante para abrir/cerrar */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Cerrar asistente IA" : "Abrir asistente IA"}
        className="group flex items-center gap-2.5 rounded-full bg-primary px-4 py-3 text-white shadow-xl transition-transform hover:scale-105 focus:outline-none"
      >
        <div className="relative flex h-6 w-6 items-center justify-center">
          <Bot className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-emerald-400" />
        </div>
        <span className="text-xs font-bold tracking-wide">
          {isOpen ? "Ocultar IA" : "Asistente IA"}
        </span>
      </button>
    </div>
  );
};
