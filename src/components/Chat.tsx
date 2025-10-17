"use client";

import { useEffect, useRef, useState } from 'react';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'sys-1',
    role: 'system',
    content: 'You are a helpful, concise assistant.'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })) })
      });

      if (!res.ok) {
        throw new Error('Request failed');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'assistant' && last.id.startsWith('asst-stream')) {
              return [...prev.slice(0, -1), { ...last, content: assistantText }];
            }
            return [...prev, { id: 'asst-stream-' + crypto.randomUUID(), role: 'assistant', content: assistantText }];
          });
        }
      } else {
        const text = await res.text();
        assistantText = text;
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: assistantText }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: '抱歉，出现了错误。'}]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-700 p-4 h-[60vh] overflow-y-auto">
        {messages.filter(m => m.role !== 'system').map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'text-blue-300 mb-3' : 'text-green-300 mb-3'}>
            <div className="text-xs opacity-70 mb-1">{m.role}</div>
            <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 rounded-md bg-gray-900 border border-gray-700 px-3 py-2 outline-none"
          placeholder="输入你的问题..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          className="rounded-md bg-indigo-600 hover:bg-indigo-500 px-4 py-2 disabled:opacity-50"
          disabled={loading}
        >发送</button>
      </form>
    </div>
  );
}
