'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { CheckCircle2, Users, Loader2, AlertCircle } from 'lucide-react';
import { saveDoc } from '@/lib/firestore';

export default function VolunteerPage({ params: { locale } }) {
  const t = useTranslations('volunteer');
  const isNepali = locale === 'ne';
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await saveDoc('volunteers', {
        name:      data.name,
        phone:     data.phone,
        email:     data.email    || '',
        village:   data.village,
        interests: Array.isArray(data.interests)
                     ? data.interests.join(', ')
                     : (data.interests || ''),
        locale,
      });
      setSubmitted(true);
      reset();
    } catch (err) {
      console.error('Submit error:', err.message);
      const isMissingEnv = err.message?.includes('MISSING_ENV');
      setError(isNepali
        ? 'डेटा सेभ गर्न समस्या भयो। पुनः प्रयास गर्नुहोस्।'
        : isMissingEnv
          ? 'Firebase not configured. Add your .env.local keys and restart the server.'
          : 'Failed to save. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const interests = isNepali
    ? ['शिक्षा', 'स्वास्थ्य', 'रोजगार', 'पूर्वाधार', 'महिला अधिकार', 'युवा नेतृत्व']
    : ['Education', 'Health', 'Employment', 'Infrastructure', "Women's Rights", 'Youth Leadership'];

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-16">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-900/30 border border-primary-700/50 rounded-sm mb-6">
              <Users size={28} className="text-primary-500" />
            </div>
            <h1 className={`text-white mb-3 ${isNepali ? 'font-nepali text-4xl font-black' : 'font-display text-6xl uppercase tracking-tight'}`}>
              {t('title')}
            </h1>
            <p className={`text-dark-400 ${isNepali ? 'font-nepali' : ''}`}>{t('subtitle')}</p>
            <div className="w-12 h-0.5 bg-primary-700 mx-auto mt-6" />
          </motion.div>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-dark p-12 text-center"
            >
              <CheckCircle2 size={56} className="text-primary-500 mx-auto mb-6" />
              <h2 className={`text-white text-2xl font-bold mb-3 ${isNepali ? 'font-nepali' : ''}`}>
                {t('success')}
              </h2>
              <p className={`text-dark-400 text-sm mb-6 ${isNepali ? 'font-nepali' : ''}`}>
                {isNepali
                  ? 'तपाईंको दर्ता सफलतापूर्वक सेभ भयो। हामी चाँडै सम्पर्क गर्नेछौं।'
                  : 'Your registration has been saved. We will contact you soon.'}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="btn-outline text-sm uppercase tracking-widest"
              >
                {isNepali ? 'फेरि दर्ता गर्नुहोस्' : 'Register Another'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="card-dark p-8"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2 ${isNepali ? 'font-nepali' : ''}`}>
                    {t('name')} *
                  </label>
                  <input
                    {...register('name', { required: true })}
                    className={`w-full bg-dark-900 border rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors placeholder:text-dark-600 ${errors.name ? 'border-red-700' : 'border-primary-900/40'} ${isNepali ? 'font-nepali' : ''}`}
                    placeholder={isNepali ? 'आफ्नो पूरा नाम लेख्नुहोस्' : 'Enter your full name'}
                  />
                  {errors.name && (
                    <p className={`text-red-500 text-xs mt-1 ${isNepali ? 'font-nepali' : ''}`}>
                      {isNepali ? 'नाम अनिवार्य छ' : 'Name is required'}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2 ${isNepali ? 'font-nepali' : ''}`}>
                    {t('phone')} *
                  </label>
                  <input
                    {...register('phone', { required: true, pattern: /^[0-9+\-\s]{7,15}$/ })}
                    type="tel"
                    className={`w-full bg-dark-900 border rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors placeholder:text-dark-600 ${errors.phone ? 'border-red-700' : 'border-primary-900/40'}`}
                    placeholder="+977 98XXXXXXXX"
                  />
                  {errors.phone && (
                    <p className={`text-red-500 text-xs mt-1 ${isNepali ? 'font-nepali' : ''}`}>
                      {isNepali ? 'सही फोन नम्बर लेख्नुहोस्' : 'Enter a valid phone number'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2">
                    {t('email')} <span className="text-dark-600 normal-case tracking-normal font-normal">(optional)</span>
                  </label>
                  <input
                    {...register('email', { pattern: /^\S+@\S+\.\S+$/ })}
                    type="email"
                    className={`w-full bg-dark-900 border rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors placeholder:text-dark-600 ${errors.email ? 'border-red-700' : 'border-primary-900/40'}`}
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2 ${isNepali ? 'font-nepali' : ''}`}>
                    {t('village')} *
                  </label>
                  <input
                    {...register('village', { required: true })}
                    className={`w-full bg-dark-900 border rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors placeholder:text-dark-600 ${errors.village ? 'border-red-700' : 'border-primary-900/40'} ${isNepali ? 'font-nepali' : ''}`}
                    placeholder={isNepali ? 'गाउँ/टोलको नाम' : 'Your village/ward name'}
                  />
                  {errors.village && (
                    <p className={`text-red-500 text-xs mt-1 ${isNepali ? 'font-nepali' : ''}`}>
                      {isNepali ? 'गाउँ/टोल अनिवार्य छ' : 'Village is required'}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest text-dark-300 mb-3 ${isNepali ? 'font-nepali' : ''}`}>
                    {t('interest')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {interests.map((interest) => (
                      <label key={interest} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          value={interest}
                          {...register('interests')}
                          className="w-3.5 h-3.5 accent-red-600 cursor-pointer"
                        />
                        <span className={`text-sm text-dark-300 group-hover:text-white transition-colors ${isNepali ? 'font-nepali' : ''}`}>
                          {interest}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 bg-red-950/40 border border-red-800/50 rounded-sm"
                  >
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <span className={`text-red-400 text-sm ${isNepali ? 'font-nepali' : ''}`}>{error}</span>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className="w-full btn-primary justify-center py-4 text-sm uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span className={isNepali ? 'font-nepali' : ''}>
                        {isNepali ? 'सेभ हुँदैछ...' : 'Saving...'}
                      </span>
                    </>
                  ) : (
                    <span className={isNepali ? 'font-nepali' : ''}>{t('submit')}</span>
                  )}
                </motion.button>

              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}