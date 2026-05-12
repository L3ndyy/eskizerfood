'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  body: string;
  isFromAdmin: boolean;
  createdAt: string;
};

type ConversationSummary = {
  id: string;
  user: { id: string; name: string | null; email: string | null };
  lastMessage: { body: string; isFromAdmin: boolean; createdAt: string } | null;
  updatedAt: string;
};

type ConversationDetail = {
  id: string;
  user: { id: string; name: string | null; email: string | null };
  messages: Message[];
};

export default function AdminSupportPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selected, setSelected] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reply, setReply] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    const res = await fetch('/api/admin/support');
    if (!res.ok) return;
    const data = await res.json();
    setConversations(data.conversations);
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/support/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setSelected(data.conversation);
  }, []);

  useEffect(() => {
    loadConversations().finally(() => setLoading(false));
  }, [loadConversations]);

  useEffect(() => {
    if (selected?.id && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [selected?.id, selected?.messages]);

  const sendReply = async () => {
    if (!selected || !reply.trim() || sending) return;
    setSending(true);
    const text = reply.trim();
    setReply('');
    try {
      const res = await fetch(`/api/admin/support/${selected.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelected((prev) =>
          prev ? { ...prev, messages: [...prev.messages, data.message] } : null
        );
        loadConversations();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          В панель
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-7 w-7" />
          Поддержка
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-4 py-3 font-medium">
            Диалоги
          </div>
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">
              Загрузка...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              Пока нет обращений
            </div>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => loadConversation(c.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors',
                      selected?.id === c.id && 'bg-primary/10'
                    )}
                  >
                    <p className="font-medium truncate">
                      {c.user.name || c.user.email || 'Без имени'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.user.email}
                    </p>
                    {c.lastMessage && (
                      <p className="text-xs mt-1 truncate text-muted-foreground">
                        {c.lastMessage.body}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card flex flex-col overflow-hidden min-h-[400px]">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
              Выберите диалог
            </div>
          ) : (
            <>
              <div className="border-b border-border px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {selected.user.name || selected.user.email || 'Клиент'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selected.user.email}
                  </p>
                </div>
              </div>
              <div
                ref={listRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[240px] max-h-[50vh]"
              >
                {selected.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'rounded-xl px-3 py-2 text-sm max-w-[85%]',
                      m.isFromAdmin
                        ? 'bg-primary/10 ml-auto'
                        : 'bg-muted mr-auto'
                    )}
                  >
                    {m.isFromAdmin && (
                      <span className="text-xs font-medium text-primary block mb-0.5">
                        Вы
                      </span>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(m.createdAt).toLocaleString('ru', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
              <form
                className="flex gap-2 p-3 border-t border-border"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendReply();
                }}
              >
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Ответ клиенту..."
                  className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  maxLength={2000}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="shrink-0"
                  disabled={!reply.trim() || sending}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Отправить
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
