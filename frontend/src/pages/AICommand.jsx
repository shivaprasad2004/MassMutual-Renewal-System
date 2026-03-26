import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiCpuChip, HiPaperAirplane, HiCommandLine, HiSparkles,
  HiArrowPath, HiClock, HiLightBulb
} from 'react-icons/hi2';
import api from '../services/api';

const AICommand = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const suggestedQueries = [
    'Show me high-risk policies',
    'What policies are expiring this month?',
    'Summarize portfolio health',
    'Which customers have lapsed policies?',
    'Show renewal predictions for next 30 days',
    'List anomalies in the portfolio',
  ];

  const sendMessage = async (text) => {
    const query = text || input.trim();
    if (!query) return;

    const userMsg = { role: 'user', content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: query });
      const data = res.data;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || data.message || JSON.stringify(data, null, 2),
        data: data.data || null,
        type: data.type || 'text',
        timestamp: new Date()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error processing request. Please try again.',
        type: 'error',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[calc(100vh-10rem)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
            <HiCpuChip className="w-8 h-8 text-blue-400" /> AI COMMAND
          </h1>
          <p className="text-slate-400 font-mono text-xs mt-1 uppercase tracking-widest">
            Natural Language Query Interface • AI-Powered Analytics
          </p>
        </div>
        <button onClick={clearChat} className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded border border-white/10 font-mono text-xs uppercase tracking-wider transition-all">
          <HiArrowPath className="w-4 h-4" /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20">
              <HiSparkles className="w-12 h-12 text-blue-400" />
            </div>
            <div className="text-center">
              <h3 className="text-white font-bold text-lg font-mono">Ask me anything about your portfolio</h3>
              <p className="text-slate-500 text-sm font-mono mt-2">I can analyze risks, predict renewals, and provide insights</p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-2xl">
              {suggestedQueries.map((q, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => sendMessage(q)}
                  className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 text-left transition-all group"
                >
                  <HiLightBulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs text-slate-400 group-hover:text-white font-mono transition-colors">{q}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                <div className={`flex items-center gap-2 mb-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && <HiCpuChip className="w-4 h-4 text-blue-400" />}
                  <span className="text-[10px] text-slate-500 font-mono uppercase">
                    {msg.role === 'user' ? 'You' : 'AI Engine'}
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className={`rounded-xl p-4 font-mono text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600/20 border border-blue-500/30 text-white'
                    : msg.type === 'error'
                    ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                    : 'bg-white/5 border border-white/10 text-slate-300'
                }`}>
                  <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed">{msg.content}</pre>
                  {msg.data && Array.isArray(msg.data) && msg.data.length > 0 && (
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Related Data ({msg.data.length} items)</p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {msg.data.slice(0, 10).map((item, j) => (
                          <div key={j} className="text-[11px] text-slate-400 bg-black/20 rounded p-2">
                            {typeof item === 'string' ? item : JSON.stringify(item)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
            <HiCpuChip className="w-4 h-4 text-blue-400" />
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-mono ml-2">Processing query...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <HiCommandLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your query..."
              className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-4 py-3.5 rounded-xl font-mono text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder-slate-600 transition-all"
              disabled={loading}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="p-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-all active:scale-95 border border-blue-400/20"
          >
            <HiPaperAirplane className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AICommand;
