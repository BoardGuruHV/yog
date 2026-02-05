'use client';

/**
 * Login Hero Component
 * Animated carousel showcasing value propositions for Yog app
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { valuePropositions } from '@/lib/login/value-propositions';

const SLIDE_DURATION = 10000; // 10 seconds per slide
const PAUSE_DURATION = 15000; // 15 seconds pause after interaction

export function LoginHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentProp = valuePropositions[currentSlide];

  // Navigate to next slide
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % valuePropositions.length);
  }, []);

  // Navigate to previous slide
  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === 0 ? valuePropositions.length - 1 : prev - 1
    );
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(nextSlide, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'BUTTON' ||
        activeElement?.tagName === 'TEXTAREA';

      if (isInputFocused) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          setIsPaused(true);
          setTimeout(() => setIsPaused(false), PAUSE_DURATION);
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSlide();
          setIsPaused(true);
          setTimeout(() => setIsPaused(false), PAUSE_DURATION);
          break;
        case 'Home':
          e.preventDefault();
          setCurrentSlide(0);
          setIsPaused(true);
          setTimeout(() => setIsPaused(false), PAUSE_DURATION);
          break;
        case 'End':
          e.preventDefault();
          setCurrentSlide(valuePropositions.length - 1);
          setIsPaused(true);
          setTimeout(() => setIsPaused(false), PAUSE_DURATION);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const handleIndicatorClick = (index: number) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), PAUSE_DURATION);
  };

  return (
    <div
      className="relative hidden lg:flex flex-col justify-center p-12 xl:p-16 overflow-hidden bg-linear-to-br from-emerald-900 via-green-800 to-teal-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-black/20 to-black/40 z-1" />

      {/* Decorative circles */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

      {/* Lotus pattern overlay */}
      <div className="absolute inset-0 opacity-5 bg-repeat" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 5 C20 15 10 20 10 30 C10 40 20 50 30 55 C40 50 50 40 50 30 C50 20 40 15 30 5' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 max-w-xl"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center">
            <span className="text-2xl">&#129504;</span> {/* Lotus emoji or yoga pose */}
          </div>
          <span className="text-xl font-bold text-white">
            Yog - Yoga Asana Platform
          </span>
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            {/* Headline */}
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              {currentProp.headline}{' '}
              <span className={currentProp.accentColor}>
                {currentProp.headlineEmphasis}
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-white/90 mb-10">
              {currentProp.subheadline}
            </p>

            {/* Features list */}
            <ul className="space-y-4 mb-12">
              {currentProp.features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="flex items-center gap-3 text-white/90"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                      className="shrink-0 h-10 w-10 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center"
                    >
                      <Icon className="h-5 w-5 text-green-300" />
                    </motion.div>
                    <span className="text-base">{feature.text}</span>
                  </motion.li>
                );
              })}
            </ul>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-5">
              <p className="text-sm text-white/90 italic mb-3">
                &ldquo;{currentProp.testimonial.text}&rdquo;
              </p>
              <p className="text-xs text-white/70">
                &mdash; {currentProp.testimonial.author}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress indicators */}
        <div
          className="flex gap-3 justify-center mt-8"
          role="tablist"
          aria-label="Carousel navigation"
        >
          {valuePropositions.map((prop, i) => (
            <button
              key={prop.id}
              onClick={() => handleIndicatorClick(i)}
              className="group relative focus:outline-hidden focus:ring-2 focus:ring-white/50 rounded-sm"
              aria-label={`View ${prop.theme} slide (${i + 1} of ${valuePropositions.length})`}
              aria-selected={i === currentSlide}
              role="tab"
            >
              <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: i === currentSlide ? '100%' : '0%',
                  }}
                  transition={{
                    duration: i === currentSlide && !isPaused ? SLIDE_DURATION / 1000 : 0.3,
                    ease: 'linear',
                  }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Navigation hint */}
        <p className="text-xs text-white/40 text-center mt-3">
          Press &#8592; &#8594; to navigate
        </p>
      </motion.div>
    </div>
  );
}

/**
 * Mobile Hero - Compact version for small screens
 */
export function MobileHero() {
  return (
    <div className="lg:hidden relative bg-linear-to-br from-emerald-800 via-green-700 to-teal-800 p-6 pb-10">
      {/* Logo and brand */}
      <div className="flex items-center gap-2 text-white mb-4">
        <div className="h-9 w-9 rounded-lg bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center">
          <span className="text-lg">&#129504;</span>
        </div>
        <span className="text-lg font-bold">Yog - Yoga Asana Platform</span>
      </div>

      {/* Headline */}
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
        Your Yoga Journey,{' '}
        <span className="text-green-300">Personalized</span>
      </h1>

      {/* Tagline */}
      <p className="text-white/80 text-sm sm:text-base">
        AI-powered yoga programs with expert guidance
      </p>
    </div>
  );
}
