'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import {
  Lightbulb, Send, CheckCircle2, Loader2,
  AlertCircle, Sparkles, Clock, BadgeCheck,
  Rocket, Eye, RefreshCw,
} from 'lucide-react';
import { saveDoc, fetchDocs } from '@/lib/firestore';

// ─── Category definitions ────────────────────────────────────────────────────
const categories = {
  en: [
    { id: 'education',   label: 'Education',        emoji: '📚' },
    { id: 'health',      label: 'Health',            emoji: '🏥' },
    { id: 'roads',       label: 'Roads & Transport', emoji: '🛣️'  },
    { id: 'employment',  label: 'Employment',        emoji: '💼' },
    { id: 'environment', label: 'Environment',       emoji: '🌱' },
    { id: 'technology',  label: 'Technology',        emoji: '💻' },
    { id: 'women',       label: "Women's Rights",    emoji: '👩' },
    { id: 'agriculture', label: 'Agriculture',       emoji: '🌾' },
    { id: 'other',       label: 'Other',             emoji: '💡' },
  ],
  ne: [
    { id: 'education',   label: 'शिक्षा',            emoji: '📚' },
    { id: 'health',      label: 'स्वास्थ्य',          emoji: '🏥' },
    { id: 'roads',       label: 'सडक र यातायात',     emoji: '🛣️'  },
    { id: 'employment',  label: 'रोजगार',            emoji: '💼' },
    { id: 'environment', label: 'वातावरण',           emoji: '🌱' },
    { id: 'technology',  label: 'प्रविधि',            emoji: '💻' },
    { id: 'women',       label: 'महिला अधिकार',      emoji: '👩' },
    { id: 'agriculture', label: 'कृषि',               emoji: '🌾' },
    { id: 'other',       label: 'अन्य',               emoji: '💡' },
  ],
};

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    en: 'Pending',
    ne: 'विचाराधीन',
    icon: Clock,
    color: 'text-yellow-400',
    bg:    'bg-yellow-900/20',
    border:'border-yellow-800/40',
    dot:   'bg-yellow-400',
  },
  approved: {
    en: 'Approved',
    ne: 'स्वीकृत',
    icon: BadgeCheck,
    color: 'text-blue-400',
    bg:    'bg-blue-900/20',
    border:'border-blue-800/40',
    dot:   'bg-blue-400',
  },
  implemented: {
    en: 'Implemented',
    ne: 'कार्यान्वित',
    icon: Rocket,
    color: 'text-green-400',
    bg:    'bg-green-900/20',
    border:'border-green-800/40',
    dot:   'bg-green-400',
  },
  reviewed: {
    en: 'Under Review',
    ne: 'समीक्षाधीन',
    icon: Eye,
    color: 'text-purple-400',
    bg:    'bg-purple-900/20',
    border:'border-purple-800/40',
    dot:   'bg-purple-400',
  },
};

// ─── Status Badge component ───────────────────────────────────────────────────
function StatusBadge({ status, isNepali }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <Icon size={9} />
      {isNepali ? cfg.ne : cfg.en}
    </span>
  );
}

// ─── Time-ago helper ──────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d`;
  return `${Math.floor(d / 7)}w`;
}

// ─── Fallback static ideas (shown when Firebase not configured) ───────────────
const FALLBACK_IDEAS = [
 {
  id: 'f1',
  name: 'Rmoksha Youth Team',
  idea: 'Free milk distribution for devotees during Chhath festival to support pilgrims and promote community service.',
  category: 'community',
  location: 'Kalikamai',
  status: 'implemented',
  createdAt: new Date(Date.now() - 2 * 31536000000).toISOString(),
},
{
  id: 'f2',
  name: 'Rmoksha Volunteers',
  idea: 'Helping an elderly man in Kathmandu by arranging an artificial leg replacement and medical support.',
  category: 'health',
  location: 'Kathmandu',
  status: 'implemented',
  createdAt: new Date(Date.now() - 5 * 25920000000).toISOString(),
},
{
  id: 'f3',
  name: 'Youth Social Initiative',
  idea: 'Free clothes distribution drive for underprivileged families during winter season.',
  category: 'community',
  location: 'Ward 4',
  status: 'implemented',
  createdAt: new Date(Date.now() - 7 * 31536000000).toISOString(),
},
{
  id: 'f4',
  name: 'Rmoksha Youth Volunteers',
  idea: 'Community cleanliness campaign and waste collection drive in Kalikamai village areas.',
  category: 'environment',
  location: 'Ward 2',
  status: 'implemented',
  createdAt: new Date(Date.now() - 4 * 25920000000).toISOString(),
},
{
  id: 'f5',
  name: 'Local Youth Group',
  idea: 'Organizing a free health checkup camp for elderly citizens and farmers.',
  category: 'health',
  location: 'Kalikamai',
  status: 'implemented',
  createdAt: new Date(Date.now() - 6 * 5184000000).toISOString(),
}

];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function YouthIdeasPage({ params: { locale } }) {
  const t = useTranslations('youth');
  const isNepali = locale === 'ne';

  const [submitted, setSubmitted]           = useState(false);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [ideas, setIdeas]                   = useState(FALLBACK_IDEAS);
  const [ideasLoading, setIdeasLoading]     = useState(true);
  const [totalCount, setTotalCount]         = useState(120);
  const [isLive, setIsLive]                 = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const ideaText = watch('idea', '');
  const cats = isNepali ? categories.ne : categories.en;

  // ── Load recent ideas from Firestore ──
  const loadIdeas = useCallback(async () => {
    setIdeasLoading(true);
    try {
      const docs = await fetchDocs('youth_ideas', 8);
      if (docs.length > 0) {
        setIdeas(docs);
        setTotalCount(prev => Math.max(prev, docs.length));
        setIsLive(true);
      }
    } catch {
      // Firebase not configured yet — keep fallback data, no error shown
      setIsLive(false);
    } finally {
      setIdeasLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => { loadIdeas(); }, [loadIdeas]);

  // ── Poll every 30s for near-realtime updates ──
  useEffect(() => {
    const interval = setInterval(loadIdeas, 30000);
    return () => clearInterval(interval);
  }, [loadIdeas]);

  // ── Submit handler ──
  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const docId = await saveDoc('youth_ideas', {
        name:     data.name,
        phone:    data.phone    || '',
        idea:     data.idea,
        category: selectedCategory || 'other',
        location: data.location || '',
        locale,
      });

      // Optimistically prepend the new idea to the list
      const newIdea = {
        id:        docId || `local-${Date.now()}`,
        name:      data.name,
        idea:      data.idea,
        category:  selectedCategory || 'other',
        location:  data.location || '',
        status:    'pending',
        createdAt: new Date().toISOString(),
      };
      setIdeas(prev => [newIdea, ...prev.slice(0, 7)]);
      setTotalCount(prev => prev + 1);
      setIsLive(true);

      setSubmitted(true);
      reset();
      setSelectedCategory('');
    } catch (err) {
      const isMissingEnv = err.message?.includes('MISSING_ENV');
      setError(isNepali
        ? 'विचार पेश गर्न समस्या भयो। पुनः प्रयास गर्नुहोस्।'
        : isMissingEnv
          ? 'Firebase not configured. Add your .env.local keys and restart the server.'
          : 'Failed to submit. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-16 overflow-hidden">

      {/* ── Hero ── */}
      <div className="relative py-16 bg-[#050510] overflow-hidden mb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(100,100,255,0.05),transparent)]" />
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary-900/20 select-none pointer-events-none"
            style={{ left: `${10 + i * 16}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [0, -15, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
          >
            <Lightbulb size={24 + i * 8} />
          </motion.div>
        ))}

        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-primary-900/30 border border-primary-700/50 rounded-sm mb-6 mx-auto"
            >
              <Lightbulb size={28} className="text-primary-400" />
            </motion.div>

            <h1 className={`text-white mb-4 ${isNepali ? 'font-nepali text-5xl md:text-6xl font-black' : 'font-display text-7xl md:text-9xl uppercase tracking-tight'}`}>
              {isNepali
                ? <> युवा <span className="text-gradient">विचार</span> </>
                : <> YOUTH <span className="text-gradient">IDEAS</span> </>}
            </h1>
            <p className={`text-dark-400 max-w-lg mx-auto text-base ${isNepali ? 'font-nepali' : ''}`}>
              {t('subtitle')}
            </p>

            {/* Live stats */}
            <div className="flex justify-center gap-8 mt-8">
              {[
                { n: totalCount + '+', labelNe: 'विचारहरू', labelEn: 'Ideas Submitted' },
                { n: '8',              labelNe: 'वडाहरू',   labelEn: 'Wards Covered'   },
                { n: '3',              labelNe: 'लागू भएका', labelEn: 'Implemented'    },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-2xl text-primary-400">{s.n}</div>
                  <div className={`text-dark-500 text-xs uppercase tracking-widest ${isNepali ? 'font-nepali' : ''}`}>
                    {isNepali ? s.labelNe : s.labelEn}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container-custom">
        <div className="grid lg:grid-cols-5 gap-10">

          {/* ── LEFT: Form ── */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="card-dark p-12 text-center"
                >
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <CheckCircle2 size={60} className="text-primary-500 mx-auto mb-6" />
                  </motion.div>
                  <h2 className={`text-white text-2xl font-bold mb-3 ${isNepali ? 'font-nepali' : ''}`}>
                    {isNepali ? 'विचार पेश भयो!' : 'Idea Submitted!'}
                  </h2>
                  <p className={`text-dark-400 text-sm mb-3 max-w-sm mx-auto ${isNepali ? 'font-nepali' : ''}`}>
                    {isNepali
                      ? 'तपाईंको विचार "विचाराधीन" अवस्थामा छ। हाम्रो टोलीले समीक्षा गरेपछि अवस्था अपडेट हुनेछ।'
                      : 'Your idea is now "Pending" review. Status will update as our team reviews it.'}
                  </p>
                  {/* Status flow explanation */}
                  <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
                    {['pending','reviewed','approved','implemented'].map((s, i, arr) => (
                      <div key={s} className="flex items-center gap-2">
                        <StatusBadge status={s} isNepali={isNepali} />
                        {i < arr.length - 1 && <span className="text-dark-700 text-xs">→</span>}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setSubmitted(false)} className="btn-primary text-sm uppercase tracking-widest">
                    <Sparkles size={14} />
                    <span className={isNepali ? 'font-nepali' : ''}>
                      {isNepali ? 'अर्को विचार पेश गर्नुहोस्' : 'Submit Another Idea'}
                    </span>
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-dark p-8">
                  <h2 className={`text-white font-bold mb-6 ${isNepali ? 'font-nepali text-xl' : 'font-display text-2xl uppercase tracking-wide'}`}>
                    {isNepali ? 'आफ्नो विचार साझा गर्नुहोस्' : 'SHARE YOUR IDEA'}
                  </h2>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

                    {/* Category picker */}
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest text-dark-300 mb-3 ${isNepali ? 'font-nepali' : ''}`}>
                        {isNepali ? 'श्रेणी छान्नुहोस्' : 'Select Category'} *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {cats.map((cat) => (
                          <button
                            key={cat.id} type="button"
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-sm border text-xs font-semibold transition-all duration-150 text-left
                              ${selectedCategory === cat.id
                                ? 'border-primary-600 bg-primary-900/30 text-primary-300'
                                : 'border-primary-900/30 text-dark-400 hover:border-primary-800 hover:text-dark-200'}
                              ${isNepali ? 'font-nepali' : ''}`}
                          >
                            <span>{cat.emoji}</span><span>{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Idea textarea */}
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2 ${isNepali ? 'font-nepali' : ''}`}>
                        {t('idea')} *
                      </label>
                      <textarea
                        {...register('idea', { required: true, minLength: 20, maxLength: 500 })}
                        rows={5}
                        className={`w-full bg-dark-900 border rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors placeholder:text-dark-600 resize-none
                          ${errors.idea ? 'border-red-700' : 'border-primary-900/40'} ${isNepali ? 'font-nepali' : ''}`}
                        placeholder={isNepali
                          ? 'तपाईंको विचार विस्तारमा लेख्नुहोस्... (कम्तिमा २० अक्षर)'
                          : 'Describe your idea in detail... (minimum 20 characters)'}
                      />
                      <div className="flex justify-between mt-1">
                        {errors.idea
                          ? <p className={`text-red-500 text-xs ${isNepali ? 'font-nepali' : ''}`}>
                              {errors.idea.type === 'minLength'
                                ? (isNepali ? 'कम्तिमा २० अक्षर' : 'Min 20 characters')
                                : (isNepali ? 'विचार अनिवार्य छ' : 'Required')}
                            </p>
                          : <span />}
                        <span className={`text-xs ${ideaText.length > 450 ? 'text-yellow-500' : 'text-dark-600'}`}>
                          {ideaText.length}/500
                        </span>
                      </div>
                    </div>

                    {/* Name + Location */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2 ${isNepali ? 'font-nepali' : ''}`}>
                          {t('name')} *
                        </label>
                        <input
                          {...register('name', { required: true })}
                          className={`w-full bg-dark-900 border rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors placeholder:text-dark-600
                            ${errors.name ? 'border-red-700' : 'border-primary-900/40'} ${isNepali ? 'font-nepali' : ''}`}
                          placeholder={isNepali ? 'तपाईंको नाम' : 'Your name'}
                        />
                        {errors.name && (
                          <p className={`text-red-500 text-xs mt-1 ${isNepali ? 'font-nepali' : ''}`}>
                            {isNepali ? 'नाम अनिवार्य छ' : 'Required'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2 ${isNepali ? 'font-nepali' : ''}`}>
                          {isNepali ? 'ठाउँ' : 'Location'}
                        </label>
                        <input
                          {...register('location')}
                          className={`w-full bg-dark-900 border border-primary-900/40 rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors placeholder:text-dark-600 ${isNepali ? 'font-nepali' : ''}`}
                          placeholder={isNepali ? 'गाउँ/वडा' : 'Village/Ward'}
                        />
                      </div>
                    </div>

                    {/* Phone optional */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2">
                        {isNepali ? 'फोन नम्बर' : 'Phone'}{' '}
                        <span className="text-dark-600 normal-case tracking-normal font-normal">(optional)</span>
                      </label>
                      <input
                        {...register('phone', { pattern: /^[0-9+\-\s]{7,15}$/ })}
                        type="tel"
                        className="w-full bg-dark-900 border border-primary-900/40 rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors placeholder:text-dark-600"
                        placeholder="+977 98XXXXXXXX"
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-4 bg-red-950/40 border border-red-800/50 rounded-sm"
                      >
                        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <span className={`text-red-400 text-sm ${isNepali ? 'font-nepali' : ''}`}>{error}</span>
                      </motion.div>
                    )}

                    <motion.button
                      type="submit" disabled={loading}
                      whileHover={!loading ? { scale: 1.02 } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      className="w-full btn-primary justify-center py-4 text-sm uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? <><Loader2 size={16} className="animate-spin" /><span className={isNepali ? 'font-nepali' : ''}>{isNepali ? 'पेश हुँदैछ...' : 'Submitting...'}</span></>
                        : <><Send size={15} /><span className={isNepali ? 'font-nepali' : ''}>{t('submit')}</span></>}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT: How it works + Live recent ideas ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* How it works */}
            <div className="card-dark p-6">
              <h3 className={`text-white font-bold mb-5 ${isNepali ? 'font-nepali text-lg' : 'font-display text-xl uppercase tracking-wide'}`}>
                {isNepali ? 'कसरी काम गर्छ?' : 'HOW IT WORKS'}
              </h3>
              <div className="space-y-4">
                {[
                  { n:'01', ne:{t:'विचार पेश गर्नुहोस्',d:'आफ्नो विकास विचार यहाँ लेख्नुहोस्।'}, en:{t:'Submit',d:'Write your development idea here.'} },
                  { n:'02', ne:{t:'समीक्षाधीन',d:'हाम्रो टोलीले विचार समीक्षा गर्नेछ।'},     en:{t:'Review', d:'Our team reviews your submission.'} },
                  { n:'03', ne:{t:'स्वीकृत',d:'राम्रो विचार स्वीकृत गरिनेछ।'},               en:{t:'Approved',d:'Good ideas get approved.'} },
                  { n:'04', ne:{t:'कार्यान्वित',d:'उत्कृष्ट विचारहरू कार्यान्वयन गरिनेछ।'}, en:{t:'Implemented',d:'Best ideas get turned into action.'} },
                ].map((step) => (
                  <div key={step.n} className="flex gap-3 items-start">
                    <span className="font-display text-2xl text-primary-800 leading-none flex-shrink-0 w-7">{step.n}</span>
                    <div>
                      <div className={`text-white text-sm font-bold ${isNepali ? 'font-nepali' : ''}`}>
                        {isNepali ? step.ne.t : step.en.t}
                      </div>
                      <div className={`text-dark-500 text-xs mt-0.5 ${isNepali ? 'font-nepali' : ''}`}>
                        {isNepali ? step.ne.d : step.en.d}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status legend */}
              <div className="mt-5 pt-4 border-t border-primary-900/20">
                <p className="text-dark-600 text-[10px] uppercase tracking-widest mb-3">
                  {isNepali ? 'अवस्था संकेत' : 'STATUS KEY'}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.keys(STATUS_CONFIG).map(s => (
                    <StatusBadge key={s} status={s} isNepali={isNepali} />
                  ))}
                </div>
              </div>
            </div>

            {/* Live Recent Ideas */}
            <div className="card-dark p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-white font-bold ${isNepali ? 'font-nepali text-lg' : 'font-display text-xl uppercase tracking-wide'}`}>
                  {isNepali ? 'हालैका विचारहरू' : 'RECENT IDEAS'}
                </h3>
                <div className="flex items-center gap-2">
                  {isLive && (
                    <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      LIVE
                    </span>
                  )}
                  <button
                    onClick={loadIdeas}
                    disabled={ideasLoading}
                    className="text-dark-500 hover:text-primary-400 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw size={13} className={ideasLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {ideas.slice(0, 5).map((idea, i) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, x: 20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="pb-4 border-b border-primary-900/20 last:border-0 last:pb-0"
                    >
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Lightbulb size={12} className="text-primary-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          {/* Idea text — truncated */}
                          <p className={`text-dark-200 text-sm font-medium leading-snug line-clamp-2 ${isNepali ? 'font-nepali' : ''}`}>
                            {idea.idea}
                          </p>
                          {/* Meta row */}
                          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1.5">
                            {idea.category && (
                              <span className={`text-xs text-primary-600 capitalize ${isNepali ? 'font-nepali' : ''}`}>
                                {idea.category}
                              </span>
                            )}
                            {idea.location && (
                              <>
                                <span className="text-dark-700">·</span>
                                <span className={`text-xs text-dark-600 ${isNepali ? 'font-nepali' : ''}`}>
                                  {idea.location}
                                </span>
                              </>
                            )}
                            <span className="text-dark-700">·</span>
                            <span className="text-xs text-dark-700">{timeAgo(idea.createdAt)}</span>
                          </div>
                          {/* Status badge */}
                          <div className="mt-2">
                            <StatusBadge status={idea.status || 'pending'} isNepali={isNepali} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-4 pt-3 border-t border-primary-900/20 text-center">
                <p className={`text-dark-700 text-xs ${isNepali ? 'font-nepali' : ''}`}>
                  {isLive
                    ? (isNepali ? 'लाइभ डेटा · हरेक ३० सेकेन्डमा अपडेट' : 'Live data · Updates every 30s')
                    : (isNepali ? 'तपाईंको विचार अर्को परिवर्तन हुन सक्छ।' : 'Your idea could be the next change.')}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
