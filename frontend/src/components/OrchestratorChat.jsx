import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Bot, User, X, MessageSquare } from 'lucide-react';
import { sendChatMessage } from '../services/api';

export default function OrchestratorChat({ isOpen, onClose, report }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I am your Store Orchestrator AI. I have analyzed your sales transactions, stock levels, and promotions. What would you like to ask about your shop's strategy this week?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(userText);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.answer },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Apologies, I encountered an issue querying the agent state. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="kirana-card rounded-2xl border border-panel-border w-full max-w-2xl h-[600px] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 border-b border-panel-border bg-panel-light/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber/20 border border-amber/40 flex items-center justify-center text-amber">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-headline font-bold text-[#f0f6f3]">
                Orchestrator Strategic Copilot
              </h3>
              <p className="text-[11px] text-sage">
                Instant answers grounded in stored multi-agent reasoning
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-panel hover:bg-panel-light text-sage hover:text-[#f0f6f3] border border-panel-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                  msg.role === 'user'
                    ? 'bg-amber text-[#12211c] font-bold'
                    : 'bg-panel-light border border-panel-border text-amber'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-amber text-[#12211c] font-medium rounded-tr-none'
                    : 'bg-[#152620] text-[#f0f6f3] border border-panel-border/80 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-sage bg-panel/50 p-3 rounded-xl w-fit">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber" />
              <span>Consulting multi-agent state...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries */}
        <div className="px-4 py-2 border-t border-panel-border/40 bg-[#12211c]/60 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-sage shrink-0">Try:</span>
          {[
            'Why should I reorder Basmati Rice now?',
            'How do I clear the Organic Paneer before expiry?',
            'What is our highest margin category?',
          ].map((q, idx) => (
            <button
              key={idx}
              onClick={() => setInput(q)}
              className="px-2.5 py-1 rounded-full bg-panel hover:bg-panel-light border border-panel-border text-sage hover:text-[#f0f6f3] shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-panel-border bg-panel-light/30 flex gap-2">
          <input
            type="text"
            placeholder="Ask anything about inventory, promotions, or sales patterns..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#12211c] border border-panel-border text-xs text-[#f0f6f3] placeholder-sage/60 focus:outline-none focus:border-amber transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-amber hover:bg-amber-light text-[#12211c] font-bold text-xs transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
