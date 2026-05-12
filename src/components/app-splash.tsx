'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function AppSplash() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const minTime = 1400;
    const start = Date.now();
    const onDone = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minTime - elapsed);
      setTimeout(() => setVisible(false), remaining);
    };
    if (document.readyState === 'complete') {
      onDone();
    } else {
      window.addEventListener('load', onDone);
      return () => window.removeEventListener('load', onDone);
    }
  }, [mounted]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Мягкий фон: световые пятна без зерна */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-[20%] left-1/2 h-[55vh] w-[min(140vw,900px)] -translate-x-1/2 rounded-full bg-primary/[0.18] blur-[100px] dark:bg-primary/[0.22]"
              aria-hidden
              animate={{ opacity: [0.85, 1, 0.85], scale: [1, 1.03, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
              className="absolute bottom-[-10%] right-[-5%] h-[45vh] w-[min(80vw,520px)] rounded-full bg-primary/[0.08] blur-[90px] dark:bg-primary/[0.12]"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,transparent_40%,var(--background)_88%)]"
              aria-hidden
            />
          </div>

          <div className="relative flex flex-col items-center gap-8 px-6">
            <motion.p
              className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              FoodExpress
            </motion.p>
            <motion.div
              className="relative h-1 w-40 overflow-hidden rounded-full bg-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.35 }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-primary"
                animate={{ x: ['-100%', '280%'] }}
                transition={{ duration: 1.1, ease: 'easeInOut', repeat: Infinity }}
              />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-center text-base text-muted-foreground md:text-lg"
            >
              Мы готовим для вас
            </motion.p>
            <p className="text-sm text-muted-foreground/80">Загрузка меню…</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
