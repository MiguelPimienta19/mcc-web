'use client';

import { useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your meeting agenda assistant. I can help you create structured meeting agendas, brainstorm topics, and organize your thoughts. What kind of meeting are you planning?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }

    setLoading(false);
  }

  // Render message with proper formatting (no visible markdown)
  const renderMessage = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('### ')) {
          return <h3 key={index} className="font-semibold text-base mt-3 mb-1">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="font-bold text-lg mt-3 mb-2">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="font-bold text-xl mt-3 mb-2">{line.replace('# ', '')}</h1>;
        }
        if (line.match(/^\d+\.\s/)) {
          return <div key={index} className="ml-3 mb-1">• {line.replace(/^\d+\.\s/, '')}</div>;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <div key={index} className="ml-3 mb-1">• {line.replace(/^[-*]\s/, '')}</div>;
        }
        if (line.trim() === '') {
          return <div key={index} className="h-2" />;
        }
        
        // Handle bold text and regular text
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <div key={index} className="mb-1">
            {parts.map((part, i) => 
              part.startsWith('**') && part.endsWith('**') ? 
                <strong key={i}>{part.slice(2, -2)}</strong> : 
                part
            )}
          </div>
        );
      });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">Meeting Agenda Assistant</h1>
          <p className="text-gray-600">Get help creating structured meeting agendas</p>
        </div>
        <a 
          href="/" 
          className="h-10 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 flex items-center text-gray-700"
        >
          ← Back
        </a>
      </div>

      {/* Messages - Full height with scroll */}
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl px-6 py-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-brand-700 text-white'
                    : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div>{renderMessage(message.content)}</div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 px-6 py-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse">Thinking...</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input - Fixed at bottom of screen */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-line shadow-lift p-4 z-10">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Describe your meeting or ask for agenda help..."
            className="flex-1 h-12 px-4 rounded-xl border border-line bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="h-12 px-6 rounded-xl bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-50 font-medium transition-colors"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}