'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import {
  Lightbulb, Send, CheckCircle2, Loader2,
  AlertCircle, Sparkles, Clock, BadgeCheck,
  Rocket, Eye, RefreshCw, X
} from 'lucide-react';

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

// ─── Idea Validation Function ────────────────────────────────────────────────
function validateIdea(value, isNepali = false) {
  const length = value.trim().length;

  if (length < 20) {
    return isNepali
      ? "कृपया आफ्नो विचार कम्तिमा २० अक्षरमा वर्णन गर्नुहोस्।"
      : "Please describe your idea in at least 20 characters.";
  }

  if (length > 500) {
    return isNepali
      ? "तपाईंको विचार ५०० अक्षरभन्दा बढी हुन सक्दैन।"
      : "Your idea cannot exceed 500 characters.";
  }

  return null;
}

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

// Animated counter with IntersectionObserver
function Counter({ end, suffix = '', duration = 1.8 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

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
  const [isLive, setIsLive]                 = useState(false);
  const [successSerialId, setSuccessSerialId] = useState('');
  const [statsData, setStatsData]           = useState({
    ideasSubmitted: 120,
    wardsCovered: 8,
    implemented: 3
  });

  // Track progress modal states & touched validation
  const [trackedIdea, setTrackedIdea] = useState(null);
  const [trackedTimeline, setTrackedTimeline] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [ideaTouched, setIdeaTouched] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const ideaText = watch('idea', '');
  const trimmedLength = ideaText.trim().length;

  const ideaRegister = register('idea', {
    required: isNepali ? 'विचार अनिवार्य छ' : 'Idea is required',
    validate: (value) => {
      const err = validateIdea(value || '', isNepali);
      return err ? err : true;
    }
  });

  const cats = isNepali ? categories.ne : categories.en;

  // ── Load recent ideas ──
  const loadIdeas = useCallback(async () => {
    setIdeasLoading(true);
    try {
      const res = await fetch('/api/youth-ideas');
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data && result.data.length > 0) {
          setIdeas(result.data);
          setIsLive(true);
        }
      }
    } catch {
      setIsLive(false);
    } finally {
      setIdeasLoading(false);
    }
  }, []);

  // ── Load stats ──
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/youth-ideas/stats');
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setStatsData({
            ideasSubmitted: result.data.ideasSubmitted,
            wardsCovered: result.data.wardsCovered,
            implemented: result.data.implemented
          });
        }
      }
    } catch (err) {
      console.warn('Failed to load stats:', err);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadIdeas();
    fetchStats();
  }, [loadIdeas, fetchStats]);

  // ── Poll every 30s for near-realtime updates ──
  useEffect(() => {
    const interval = setInterval(() => {
      loadIdeas();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadIdeas, fetchStats]);

  // ── Poll timeline updates every 30s while tracking modal is open ──
  useEffect(() => {
    if (!trackedIdea) {
      setTrackedTimeline([]);
      return;
    }
    
    const fetchTimeline = async () => {
      setTimelineLoading(true);
      try {
        const res = await fetch(`/api/youth-ideas/${trackedIdea.id}/progress`);
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            setTrackedTimeline(result.data);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch progress updates:', err);
      } finally {
        setTimelineLoading(false);
      }
    };

    fetchTimeline(); // initial fetch

    const interval = setInterval(fetchTimeline, 30000);
    return () => clearInterval(interval);
  }, [trackedIdea]);

  // ── Submit handler ──
  const onSubmit = async (data) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/youth-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: data.name,
          location: data.location,
          ward: data.ward || '',
          contact: data.phone,
          email: data.email || '',
          category: selectedCategory || 'other',
          language: locale
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessSerialId(result.serialId || 'YI-000000');
        setSubmitted(true);
        reset();
        setSelectedCategory('');
        setIdeaTouched(false);
        loadIdeas();
        fetchStats();
      } else {
        setError(result.error || (isNepali ? 'पेश गर्न असक्षम। कृपया पुन: प्रयास गर्नुहोस्।' : 'Unable to submit your idea. Please try again.'));
      }
    } catch (err) {
      setError(isNepali ? 'सञ्जाल जडान त्रुटि। कृपया पुन: प्रयास गर्नुहोस्।' : 'Network error. Please try again.');
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
                { n: statsData.ideasSubmitted, suffix: '+', labelNe: 'विचारहरू', labelEn: 'Ideas Submitted' },
                { n: statsData.wardsCovered,   suffix: '',  labelNe: 'वडाहरू',   labelEn: 'Wards Covered'   },
                { n: statsData.implemented,    suffix: '',  labelNe: 'लागू भएका', labelEn: 'Implemented'    },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-2xl text-primary-400">
                    <Counter end={s.n} suffix={s.suffix} duration={1.8} />
                  </div>
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
                  className="card-dark p-8 sm:p-12 text-center border border-primary-900/40 rounded-sm relative"
                >
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.4, delay: 0.1 }}>
                    <CheckCircle2 size={56} className="text-primary-500 mx-auto mb-5" />
                  </motion.div>
                  
                  <h2 className={`text-white text-xl sm:text-2xl font-bold uppercase tracking-wide mb-4 ${isNepali ? 'font-nepali' : 'font-display'}`}>
                    {isNepali ? '✓ विचार पेश भयो' : '✓ IDEA SUBMITTED'}
                  </h2>
                  
                  <p className={`text-dark-300 text-sm mb-6 max-w-sm mx-auto leading-relaxed ${isNepali ? 'font-nepali' : ''}`}>
                    {isNepali
                      ? 'तपाईंको विचार साझा गर्नुभएकोमा धन्यवाद। तपाईंको सुझाव प्राप्त भएको छ र हाम्रो टोलीद्वारा समीक्षा गरिनेछ।'
                      : 'Thank you for sharing your idea. Your suggestion has been received and will be reviewed by our team.'}
                  </p>

                  {/* ID Wrapper */}
                  <div className="bg-dark-900 border border-primary-950 p-4 rounded-sm max-w-xs mx-auto mb-8">
                    <span className="text-dark-500 text-xs block uppercase tracking-wider mb-1">
                      {isNepali ? 'विचार आइडी' : 'Idea ID'}
                    </span>
                    <strong className="text-primary-400 font-display text-lg tracking-widest block">
                      {successSerialId}
                    </strong>
                  </div>

                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-primary text-xs uppercase tracking-widest px-6 py-3 font-bold shadow-red-glow min-h-[44px]"
                  >
                    <Sparkles size={13} />
                    <span className={isNepali ? 'font-nepali' : ''}>
                      {isNepali ? 'अर्को विचार पेश गर्नुहोस्' : 'Submit Another'}
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
                        {...ideaRegister}
                        maxLength={500}
                        onChange={(e) => {
                          setIdeaTouched(true);
                          ideaRegister.onChange(e);
                        }}
                        onBlur={(e) => {
                          setIdeaTouched(true);
                          ideaRegister.onBlur(e);
                        }}
                        rows={5}
                        className={`w-full bg-dark-900 border rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors placeholder:text-dark-600 resize-none
                          ${(ideaTouched && trimmedLength > 0 && trimmedLength < 20) || (errors.idea && trimmedLength === 0) ? 'border-red-700' : 'border-primary-900/40'} ${isNepali ? 'font-nepali' : ''}`}
                        placeholder={isNepali
                          ? 'तपाईंको विचार विस्तारमा लेख्नुहोस्... (कम्तिमा २० अक्षर)'
                          : 'Describe your idea in detail... (minimum 20 characters)'}
                      />
                      <div className="flex justify-between items-start mt-2">
                        <div>
                          {ideaTouched ? (
                            <>
                              {trimmedLength === 0 && errors.idea && (
                                <p className={`text-red-500 text-xs ${isNepali ? 'font-nepali' : ''}`}>
                                  {errors.idea.message}
                                </p>
                              )}
                              {trimmedLength > 0 && trimmedLength < 20 && (
                                <p className="text-red-500 text-xs flex items-center gap-1 font-semibold">
                                  <span>⚠</span>
                                  <span>{isNepali ? 'कृपया आफ्नो विचार कम्तिमा २० अक्षरमा वर्णन गर्नुहोस्।' : 'Please describe your idea in at least 20 characters.'}</span>
                                </p>
                              )}
                              {trimmedLength >= 20 && trimmedLength <= 500 && (
                                <p className="text-green-500 text-xs flex items-center gap-1 font-semibold">
                                  <span>✓</span>
                                  <span>{isNepali ? 'विचार ठीक देखिन्छ' : 'Idea looks good'}</span>
                                </p>
                              )}
                            </>
                          ) : (
                            errors.idea && (
                              <p className={`text-red-500 text-xs ${isNepali ? 'font-nepali' : ''}`}>
                                {errors.idea.message}
                              </p>
                            )
                          )}
                        </div>
                        <span className={`text-xs font-mono font-bold ${
                          trimmedLength === 0 ? 'text-dark-600' :
                          (trimmedLength < 20 || (trimmedLength >= 480 && trimmedLength < 500)) ? 'text-yellow-500 animate-pulse' :
                          trimmedLength >= 500 ? 'text-red-500 font-black' :
                          'text-green-500'
                        }`}>
                          {trimmedLength}/500
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
                            {isNepali ? 'नाम अनिवार्य छ' : 'Name is required'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2 ${isNepali ? 'font-nepali' : ''}`}>
                          {isNepali ? 'ठाउँ' : 'Location'} *
                        </label>
                        <input
                          {...register('location', { required: true })}
                          className={`w-full bg-dark-900 border rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors placeholder:text-dark-600
                            ${errors.location ? 'border-red-700' : 'border-primary-900/40'} ${isNepali ? 'font-nepali' : ''}`}
                          placeholder={isNepali ? 'गाउँ/वडा' : 'Village/Ward'}
                        />
                        {errors.location && (
                          <p className={`text-red-500 text-xs mt-1 ${isNepali ? 'font-nepali' : ''}`}>
                            {isNepali ? 'ठाउँ अनिवार्य छ' : 'Location is required'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Phone required with validation */}
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2 ${isNepali ? 'font-nepali' : ''}`}>
                        {isNepali ? 'फोन नम्बर' : 'Contact Number'} *
                      </label>
                      <input
                        {...register('phone', {
                          required: true,
                          validate: (value) => {
                            if (!value) return false;
                            if (!/^[0-9+\-\s]{7,15}$/.test(value.trim())) return false;
                            const cleaned = value.replace(/[^0-9]/g, '');
                            if (/^(.)\1+$/.test(cleaned) || cleaned.length < 7 || cleaned === '1234567890') return false;
                            return true;
                          }
                        })}
                        type="tel"
                        className={`w-full bg-dark-900 border rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors placeholder:text-dark-600
                          ${errors.phone ? 'border-red-700' : 'border-primary-900/40'} ${isNepali ? 'font-nepali' : ''}`}
                        placeholder="+977 98XXXXXXXX"
                      />
                      {errors.phone && (
                        <p className={`text-red-500 text-xs mt-1 ${isNepali ? 'font-nepali' : ''}`}>
                          {errors.phone.type === 'required'
                            ? (isNepali ? 'फोन नम्बर अनिवार्य छ' : 'Contact number is required')
                            : (isNepali ? 'कृपया मान्य फोन नम्बर प्रविष्ट गर्नुहोस्' : 'Please enter a valid phone number')}
                        </p>
                      )}
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
                          {/* Status and Progress percent bar */}
                          <div className="mt-3.5 space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className={`px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                                idea.status === 'implemented' ? 'bg-green-950/40 text-green-400 border border-green-800/40' :
                                idea.status === 'approved' ? 'bg-primary-950/40 text-primary-400 border border-primary-800/40' :
                                idea.status === 'under_review' ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-800/40' :
                                idea.status === 'rejected' ? 'bg-red-950/40 text-red-400 border border-red-800/40' :
                                'bg-dark-950 text-dark-400 border border-dark-800'
                              }`}>
                                {idea.status === 'pending' ? (isNepali ? 'विचाराधीन' : 'PENDING') :
                                 idea.status === 'under_review' ? (isNepali ? 'समीक्षाधीन' : 'UNDER REVIEW') :
                                 idea.status === 'approved' ? (isNepali ? 'स्वीकृत' : 'APPROVED') :
                                 idea.status === 'implemented' ? (isNepali ? 'कार्यान्वित' : 'IMPLEMENTED') :
                                 idea.status === 'rejected' ? (isNepali ? 'अस्वीकृत' : 'REJECTED') :
                                 (idea.status || 'PENDING').toUpperCase()}
                              </span>
                              <span className="text-primary-400 font-mono">
                                {idea.progressPercent || 0}% {isNepali ? 'सम्पन्न' : 'COMPLETE'}
                              </span>
                            </div>

                            {/* Progress bar container */}
                            <div className="w-full bg-dark-900 border border-primary-950/40 h-2 rounded-full overflow-hidden relative">
                              <div
                                className="bg-primary-600 h-full rounded-full transition-all duration-500 shadow-red-glow"
                                style={{ width: `${idea.progressPercent || 0}%` }}
                              />
                            </div>

                            {/* Track Progress Action Button */}
                            <button
                              type="button"
                              onClick={() => setTrackedIdea(idea)}
                              className="w-full mt-2 border border-primary-900/50 hover:border-primary-600 bg-primary-950/10 hover:bg-primary-900/20 text-primary-400 hover:text-white rounded-sm py-2 text-[10px] uppercase font-bold tracking-widest transition-all duration-200 flex items-center justify-center gap-1.5 min-h-[44px]"
                            >
                              <Clock size={11} />
                              <span>{isNepali ? 'प्रगति ट्र्याक गर्नुहोस्' : 'Track Progress'}</span>
                            </button>
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
      {/* Track Progress Modal Dialog */}
      {trackedIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setTrackedIdea(null)} />
          
          <div className="relative w-[calc(100vw-24px)] sm:w-full sm:max-w-lg bg-dark-900 border border-primary-900/40 rounded-sm p-6 sm:p-8 shadow-2xl z-10 my-4 max-h-[calc(100dvh-24px)] overflow-y-auto font-sans">
            {/* Close button with 44px touch height */}
            <button
              onClick={() => setTrackedIdea(null)}
              className="absolute top-4 right-4 text-dark-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
              title={isNepali ? 'बन्द गर्नुहोस्' : 'Close'}
            >
              <X size={18} />
            </button>

            <h3 className="text-white text-lg font-bold font-display uppercase tracking-wider mb-2 pr-6">
              {isNepali ? 'विचारको प्रगति' : 'Idea Progress'}
            </h3>
            
            {/* Header info card */}
            <div className="bg-dark-950 border border-primary-900/10 p-4 rounded-sm space-y-2 mb-6">
              <p className="text-white text-sm font-semibold leading-relaxed">
                {trackedIdea.idea}
              </p>
              <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold text-dark-500 uppercase tracking-widest pt-2 border-t border-primary-900/5">
                <span className="text-primary-400">{trackedIdea.category}</span>
                <span>•</span>
                <span>{trackedIdea.location}{trackedIdea.ward ? ` - ${isNepali ? 'वडा' : 'Ward'} ${trackedIdea.ward}` : ''}</span>
              </div>
            </div>

            {/* Implementation progress bar */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-dark-400 uppercase tracking-wider">
                  {isNepali ? 'कार्यान्वयन प्रगति' : 'IMPLEMENTATION PROGRESS'}
                </span>
                <span className="text-primary-400 font-mono text-xs">
                  {trackedIdea.progressPercent || 0}%
                </span>
              </div>
              <div className="w-full bg-dark-950 border border-primary-950 h-3 rounded-full overflow-hidden relative">
                <div
                  className="bg-primary-600 h-full rounded-full transition-all duration-500 shadow-red-glow"
                  style={{ width: `${trackedIdea.progressPercent || 0}%` }}
                />
              </div>
            </div>

            {/* Timeline updates progress timeline log list */}
            <div className="space-y-4">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest border-b border-primary-900/10 pb-2">
                {isNepali ? 'प्रक्रिया इतिहास' : 'PROCESS HISTORY'}
              </h4>

              {timelineLoading && trackedTimeline.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-dark-500 gap-1.5 text-xs">
                  <Loader2 size={14} className="animate-spin" />
                  <span>{isNepali ? 'लोड हुँदैछ...' : 'Loading history updates...'}</span>
                </div>
              ) : trackedTimeline.length === 0 ? (
                <p className="text-dark-500 text-xs py-4 text-center">
                  {isNepali ? 'कुनै प्रगति इतिहास फेला परेन।' : 'No timeline progress logs yet.'}
                </p>
              ) : (
                <div className="relative pl-6 border-l border-primary-900/20 space-y-6 py-2 ml-2">
                  {trackedTimeline.map((item, idx) => {
                    const isLast = idx === trackedTimeline.length - 1;
                    const dateObj = new Date(item.createdAt);
                    const formattedDate = dateObj.toLocaleDateString(locale === 'ne' ? 'ne-NP' : 'en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });
                    
                    // Map status to readable label
                    const statusText =
                      item.status === 'pending' ? (isNepali ? 'विचाराधीन (Submitted)' : 'Submitted') :
                      item.status === 'under_review' ? (isNepali ? 'समीक्षाधीन (Under Review)' : 'Under Review') :
                      item.status === 'approved' ? (isNepali ? 'स्वीकृत (Approved)' : 'Approved') :
                      item.status === 'in_progress' ? (isNepali ? `कार्य प्रगतिमा (In Progress) — ${item.progressPercent}%` : `In Progress — ${item.progressPercent}%`) :
                      item.status === 'implemented' ? (isNepali ? 'कार्यान्वित (Implemented) — 100%' : 'Implemented — 100%') :
                      item.status === 'rejected' ? (isNepali ? 'अस्वीकृत (Rejected)' : 'Rejected') :
                      item.status;

                    return (
                      <div key={item.id} className="relative">
                        {/* Bullet point node */}
                        <span className={`absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 ${
                          isLast 
                            ? 'bg-primary-950 border-primary-500 text-primary-400 animate-pulse' 
                            : 'bg-dark-900 border-primary-900/60 text-dark-500'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isLast ? 'bg-primary-500' : 'bg-dark-600'}`} />
                        </span>

                        <div className="space-y-1">
                          <div className="flex justify-between items-baseline flex-wrap gap-x-2">
                            <span className={`text-xs font-bold uppercase tracking-wider ${isLast ? 'text-primary-400' : 'text-white'}`}>
                              {statusText}
                            </span>
                            <span className="text-[10px] text-dark-500 font-mono">
                              {formattedDate}
                            </span>
                          </div>
                          {item.message && (
                            <p className="text-dark-400 text-xs leading-relaxed">
                              {item.message}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Close action at bottom */}
            <div className="mt-6 pt-4 border-t border-primary-950/40 flex justify-end">
              <button
                type="button"
                onClick={() => setTrackedIdea(null)}
                className="px-5 py-2.5 border border-primary-800/60 hover:border-primary-600 rounded-sm text-xs font-bold uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-all duration-200 min-h-[44px]"
              >
                {isNepali ? 'बन्द गर्नुहोस्' : 'Close Details'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
