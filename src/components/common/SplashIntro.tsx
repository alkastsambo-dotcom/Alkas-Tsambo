import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND_LOGO_URL } from '../../assets/brand';
import {
  ArrowRight,
  Building2,
  FileText,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';

interface SplashIntroProps {
  isVisible: boolean;
  platformName?: string;
  onFinish: () => void;
}

const FEATURE_PILLS = [
  { icon: <Building2 className="w-3.5 h-3.5" />, label: 'Maisons, Hôtels & Boutiques' },
  { icon: <FileText className="w-3.5 h-3.5" />, label: 'PDF Chambres Auto' },
  { icon: <Wallet className="w-3.5 h-3.5" />, label: 'Mobile Money & Cash' },
  { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Audit Informatique' },
];

export const SplashIntro: React.FC<SplashIntroProps> = ({
  isVisible,
  platformName = 'LocatifPro',
  onFinish,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }

    const start = performance.now();
    const duration = 2600;
    let rafId = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (elapsed < duration) {
        rafId = requestAnimationFrame(tick);
      } else {
        setTimeout(() => onFinish(), 180);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-5 overflow-hidden bg-[#07111A] text-white select-none"
        >
          {/* Ambient Animated Background Orbs matching Logo Petrol-Teal & Amber-Gold */}
          <motion.div
            animate={{
              x: [0, 32, -18, 0],
              y: [0, -24, 18, 0],
              scale: [1, 1.12, 0.96, 1],
            }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#1B5E6F]/40 blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{
              x: [0, -34, 20, 0],
              y: [0, 26, -16, 0],
              scale: [1, 1.15, 0.94, 1],
            }}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-28 -right-24 w-96 h-96 rounded-full bg-[#D99E44]/25 blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.16, 0.28, 0.16] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(29,78,216,0.22),transparent_60%)] pointer-events-none"
          />

          {/* Subtle Architectural Grid Overlay */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '42px 42px',
            }}
          />

          {/* Center Hero Content */}
          <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-6">
            {/* Orbital Aura + Uploaded Logo Card */}
            <motion.div
              initial={{ scale: 0.72, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
              className="relative flex items-center justify-center"
            >
              {/* Expanding Pulse Ring */}
              <span className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-[36px] border border-[#D99E44]/40 animate-pulse-ring pointer-events-none" />

              {/* Rotating Conic Halo */}
              <div className="relative p-[3px] rounded-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
                <div
                  className="absolute inset-0 rounded-[30px] animate-spin-slow opacity-90"
                  style={{
                    background:
                      'conic-gradient(from 0deg, #1B5E6F, #D99E44, #3B82F6, #14B8A6, #D99E44, #1B5E6F)',
                  }}
                />
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-[28px] overflow-hidden bg-[#F5F1EB] shimmer-sheen"
                >
                  <img
                    src={BRAND_LOGO_URL}
                    alt={`${platformName} - Identité Officielle`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Brand Wordmark & Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="space-y-1.5"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] font-semibold text-[#F6C878]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Plateforme SaaS Immobilière Nouvelle Génération</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {platformName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                Gestion locative & hôtelière intelligente : fiches PDF chambres, paiements multi-canaux, profils autonomes & audit informatique.
              </p>
            </motion.div>

            {/* Staggered Feature Chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-2"
            >
              {FEATURE_PILLS.map((pill, idx) => (
                <motion.div
                  key={pill.label}
                  initial={{ opacity: 0, y: 10, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.45 + idx * 0.08, duration: 0.32 }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] bg-white/8 border border-white/12 backdrop-blur-sm text-[11px] font-medium text-slate-200"
                >
                  <span className="text-[#F6C878]">{pill.icon}</span>
                  <span>{pill.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Progress Bar & Skip Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.35 }}
              className="w-full max-w-xs space-y-3 pt-1"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono tabular-nums">
                  <span>Initialisation sécurisée...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#14B8A6] via-[#3B82F6] to-[#D99E44] transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={onFinish}
                className="w-full min-h-[44px] px-4 rounded-[12px] bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <span>Accéder à {platformName}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
