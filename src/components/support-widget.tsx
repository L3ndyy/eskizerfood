'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  body: string;
  isFromAdmin: boolean;
  createdAt: string;
};

export function SupportWidget() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch('/api/support', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.conversation?.messages ?? []);
  }, []);

  useEffect(() => {
    if (open && session?.user) {
      setLoading(true);
      fetchMessages().finally(() => setLoading(false));
    }
  }, [open, session?.user, fetchMessages]);

  useEffect(() => {
    if (!open || !session?.user) return;
    const t = setInterval(fetchMessages, 5000);
    return () => clearInterval(t);
  }, [open, session?.user, fetchMessages]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.message) {
        setInput('');
        setMessages((prev) => [...prev, data.message]);
      } else {
        setError(data?.error ?? 'Не удалось отправить. Попробуйте ещё раз.');
      }
    } catch {
      setError('Ошибка сети. Попробуйте ещё раз.');
    } finally {
      setSending(false);
    }
  };

  const isLoggedIn = status === 'authenticated' && session?.user;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <div
          className={cn(
            'flex flex-col w-[min(100vw-2rem,380px)] rounded-2xl border border-border bg-card shadow-lg overflow-hidden',
            'opacity-100 translate-y-0 transition-all duration-200'
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50">
            <span className="font-semibold text-sm">Поддержка</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {!isLoggedIn ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <p className="mb-3">Войдите, чтобы написать в поддержку</p>
              <Button asChild size="sm">
                <Link href="/auth/signin">Войти</Link>
              </Button>
            </div>
          ) : (
            <>
              <div
                ref={listRef}
                className="flex flex-col gap-2 p-4 min-h-[200px] max-h-[280px] overflow-y-auto"
              >
                {loading ? (
                  <p className="text-sm text-muted-foreground">Загрузка...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Напишите сообщение — мы ответим в ближайшее время.
                  </p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        'rounded-xl px-3 py-2 text-sm max-w-[85%]',
                        m.isFromAdmin
                          ? 'bg-primary/10 text-primary-foreground ml-0 mr-auto'
                          : 'bg-muted ml-auto mr-0'
                      )}
                    >
                      {m.isFromAdmin && (
                        <span className="text-xs font-medium text-primary block mb-0.5">
                          Поддержка
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
                  ))
                )}
              </div>
              {error && (
                <p className="px-3 py-2 text-sm text-destructive bg-destructive/10 mx-3 rounded-lg">
                  {error}
                </p>
              )}
              <form
                className="flex gap-2 p-3 border-t border-border"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setError(null);
                  }}
                  placeholder="Сообщение..."
                  className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  maxLength={2000}
                  disabled={sending}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-xl shrink-0"
                  disabled={!input.trim() || sending}
                  aria-label="Отправить"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      )}

      <Button
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        onClick={() => setOpen((o) => !o)}
        aria-label="Поддержка"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}
