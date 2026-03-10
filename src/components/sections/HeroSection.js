'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ChevronRight, Star, Zap } from 'lucide-react';

// Floating particle
const Particle = ({ style }) => (
  <motion.div
    className="absolute rounded-full bg-primary-600/20 pointer-events-none"
    animate={{
      y: [0, -30, 0],
      opacity: [0.2, 0.6, 0.2],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: Math.random() * 4 + 3,
      repeat: Infinity,
      delay: Math.random() * 3,
      ease: 'easeInOut',
    }}
    style={style}
  />
);

// Animated counter
function Counter({ end, suffix = '', duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function HeroSection({ locale }) {
  const t = useTranslations('hero');
  const tStats = useTranslations('stats');
  const base = `/${locale}`;
  const isNepali = locale === 'ne';
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    width: Math.random() * 6 + 2,
    height: Math.random() * 6 + 2,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
  }));

  const stats = [
    { value: 500, suffix: '+', label: tStats('volunteers') },
    { value: 25, suffix: '+', label: tStats('villages') },
    { value: 12, suffix: '', label: tStats('programs') },
    { value: 2000, suffix: '+', label: tStats('youth') },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-950"
    >
      {/* Background layers */}
      <motion.div style={{ y }} className="absolute inset-0 pointer-events-none">
        {/* Deep red radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(200,13,13,0.15),transparent)]" />
        {/* Secondary glow */}
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary-800/10 rounded-full blur-3xl" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(200,13,13,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(200,13,13,1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </motion.div>

      {/* Floating particles */}
      {particles.map((p, i) => (
        <Particle key={i} style={p} />
      ))}

      {/* Nepal flag-inspired diagonal element */}
      <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none overflow-hidden opacity-5">
        <div className="absolute top-0 right-0 w-full h-full bg-primary-700 [clip-path:polygon(30%_0%,100%_0%,100%_100%,60%_100%)]" />
      </div>

      <motion.div
        style={{ opacity }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container-custom relative z-10 pt-24 pb-16"
      >
        <div className="max-w-5xl mx-auto text-center">

          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-900/40 border border-primary-700/50 rounded-full text-primary-300 text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              <span className={isNepali ? 'font-nepali' : ''}>{t('badge')}</span>
            </div>
          </motion.div>

          {/* Mayor badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary-700/20 border border-primary-600/40 rounded-sm"
            >
              <Star size={13} className="text-gold-400 fill-gold-400" />
              <span className={`text-sm font-bold text-primary-300 tracking-wider ${isNepali ? 'font-nepali' : 'uppercase'}`}>
                {t('mayor2084')}
              </span>
              <Star size={13} className="text-gold-400 fill-gold-400" />
            </motion.div>
          </motion.div>

          {/* Prefix text */}
          <motion.p
            variants={itemVariants}
            className={`text-dark-400 text-lg mb-2 tracking-widest ${isNepali ? 'font-nepali' : 'font-body'}`}
          >
            {t('namePrefix')}
          </motion.p>

          {/* Name — big display */}
          <motion.div variants={itemVariants} className="mb-4">
            {isNepali ? (
              <h1 className="font-nepali text-6xl sm:text-8xl md:text-9xl font-black text-white leading-none tracking-tight">
                <span className="text-gradient">{t('name')}</span>
              </h1>
            ) : (
              <h1
                className="font-display text-7xl sm:text-9xl md:text-[11rem] text-white leading-none tracking-tight glitch"
                data-text="RAJNISH"
              >
                <span className="text-gradient">RAJNISH</span>
              </h1>
            )}
            {!isNepali && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="font-display text-4xl sm:text-6xl md:text-7xl text-dark-400 tracking-widest origin-left"
              >
                KUSHWAHA
              </motion.div>
            )}
          </motion.div>

          {/* Tagline */}
          <motion.div variants={itemVariants} className="mb-4">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary-600" />
              <p className={`text-primary-300 font-semibold tracking-widest text-sm sm:text-base ${isNepali ? 'font-nepali' : 'uppercase'}`}>
                {t('tagline')}
              </p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary-600" />
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className={`text-dark-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10 ${isNepali ? 'font-nepali' : ''}`}
          >
            {t('description')}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={`${base}/campaigns`}
                className="btn-primary text-sm uppercase tracking-widest px-8 py-3.5 shadow-red-glow"
              >
                <Zap size={15} />
                <span className={isNepali ? 'font-nepali' : ''}>{t('cta1')}</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={`${base}/volunteer`}
                className="btn-outline text-sm uppercase tracking-widest px-8 py-3.5"
              >
                <ChevronRight size={15} />
                <span className={isNepali ? 'font-nepali' : ''}>{t('cta2')}</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-primary-900/20 border border-primary-900/30 rounded-sm overflow-hidden"
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-dark-950/80 backdrop-blur-sm px-6 py-6 text-center hover:bg-primary-900/10 transition-colors duration-300"
              >
                <div className="text-3xl sm:text-4xl font-display text-white mb-1 animate-glow">
                  <Counter end={stat.value} suffix={stat.suffix} duration={2.5} />
                </div>
                <div className={`text-xs text-primary-500 font-semibold uppercase tracking-widest ${isNepali ? 'font-nepali' : ''}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-500"
      >
        <span className={`text-xs tracking-widest uppercase ${isNepali ? 'font-nepali' : ''}`}>{t('scroll')}</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={16} className="text-primary-600" />
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-950 to-transparent pointer-events-none" />
    </section>
  );
}
