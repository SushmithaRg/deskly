import React, { useState } from 'react';
import { DeskAIMessage, TaskItem, UserProfile } from '../types';
import { Bot, Send, X, Sparkles, ChevronRight, MessageSquare } from 'lucide-react';

interface Props {
  userRole: string;
  tasks: TaskItem[];
  profiles: UserProfile[];
}

export const DeskAIWidget: React.FC<Props> = ({ userRole, tasks, profiles }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<DeskAIMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello! I am **Deskly AI**, your context-aware assistant. Ask me anything about pending sprint tasks, team skills directory, leave balances, or project health.`,
      timestamp: 'Just now'
    }
  ]);

  const handleSend = () => {
    if (!query.trim()) return;

    const userMsg: DeskAIMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    const userQ = query.toLowerCase();
    setQuery('');

    // Process context-aware natural language matching
    setTimeout(() => {
      let responseText = '';

      if (userQ.includes('task') || userQ.includes('pending') || userQ.includes('sprint')) {
        const pending = tasks.filter(t => t.status !== 'COMPLETED');
        const list = pending.map(t => `• **${t.title}** (${t.priority} Priority, ${t.progress}% done)`).join('\n');
        responseText = `Here are your current active tasks:\n\n${list}\n\n*Would you like me to shift stage on any task?*`;
      } else if (userQ.includes('who knows') || userQ.includes('python') || userQ.includes('react') || userQ.includes('skill')) {
        const matchingProfiles = profiles.filter(p => p.skills.some(s => s.toLowerCase().includes('python') || s.toLowerCase().includes('react')));
        const list = matchingProfiles.map(p => `• **${p.fullName}** (${p.jobTitle}) — Skills: ${p.skills.join(', ')}`).join('\n');
        responseText = `I found these team members with relevant skill tags:\n\n${list}`;
      } else if (userQ.includes('leave') || userQ.includes('holiday') || userQ.includes('casual')) {
        responseText = `You currently have **14 Days Earned Leave**, **8 Days Casual Leave**, and **6 Days Sick Leave** available. You also have 1 request pending approval.`;
      } else if (userQ.includes('manager') || userQ.includes('workload') || userQ.includes('capacity')) {
        responseText = `The **Engineering Team** is currently at **84% workload capacity** across 3 active projects. 10 out of 12 team members are present today.`;
      } else {
        responseText = `I processed your request: "${userMsg.text}".\n\nDeskly AI scanned company state: You have 2 high-priority deliverables assigned today and 1 team Town Hall at 4:00 PM.`;
      }

      const aiMsg: DeskAIMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        timestamp: 'Just now'
      };

      setMessages(prev => [...prev, aiMsg]);
    }, 400);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-2xl transition-all font-bold flex items-center space-x-2 border-2 border-indigo-400/40 group hover:scale-105"
        >
          <Bot className="w-6 h-6 animate-pulse text-indigo-200" />
          <span className="text-xs pr-1 font-semibold">Deskly AI</span>
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[480px] overflow-hidden glass-card">
          {/* Header */}
          <div className="p-3.5 bg-slate-800/90 border-b border-slate-700/80 flex justify-between items-center text-xs font-bold">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span className="text-white">🤖 Deskly AI Workspace Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
            {messages.map(m => (
              <div
                key={m.id}
                className={`p-3 rounded-xl max-w-[85%] whitespace-pre-line leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white ml-auto rounded-br-none shadow'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 mr-auto rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Quick Preset Prompt Chips */}
          <div className="p-2 bg-slate-950/60 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => {
                setQuery('What are my pending tasks?');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded whitespace-nowrap border border-slate-700"
            >
              📋 My Tasks
            </button>
            <button
              onClick={() => {
                setQuery('Who knows React and Python?');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded whitespace-nowrap border border-slate-700"
            >
              🔍 Skills Search
            </button>
            <button
              onClick={() => {
                setQuery('Summarize team workload');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded whitespace-nowrap border border-slate-700"
            >
              📊 Workload
            </button>
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
            <input
              type="text"
              placeholder="Ask Deskly AI..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSend}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition-all flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
