'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { CheckCircle2, Users, Loader2, AlertCircle } from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase init (safe: only initializes once)
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db  = getFirestore(app);

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
      await addDoc(collection(db, 'volunteers'), {
        name:      data.name,
        phone:     data.phone,
        email:     data.email     || null,
        village:   data.village,
        interests: data.interests || [],
        locale,                          // which language they used
        createdAt: serverTimestamp(),    // server-side timestamp
        status:    'pending',            // for admin dashboard filtering
      });
      setSubmitted(true);
      reset();
    } catch (err) {
      console.error('Firestore error:', err);
      setError(isNepali
        ? 'डेटा सेभ गर्न समस्या भयो। पुनः प्रयास गर्नुहोस्।'
        : 'Failed to save. Please try again.');
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
              <button
                onClick={() => setSubmitted(false)}
                className="btn-outline mt-6 text-sm uppercase tracking-widest"
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2 ${isNepali ? 'font-nepali' : ''}`}>
                    {t('name')} *
                  </label>
                  <input
                    {...register('name', { required: true })}
                    className={`w-full bg-dark-900 border ${errors.name ? 'border-red-500' : 'border-primary-900/40'} rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors ${isNepali ? 'font-nepali' : ''}`}
                    placeholder={isNepali ? 'आफ्नो पूरा नाम लेख्नुहोस्' : 'Enter your full name'}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2 ${isNepali ? 'font-nepali' : ''}`}>
                    {t('phone')} *
                  </label>
                  <input
                    {...register('phone', { required: true, pattern: /^[0-9+\-\s]+$/ })}
                    className={`w-full bg-dark-900 border ${errors.phone ? 'border-red-500' : 'border-primary-900/40'} rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors`}
                    placeholder="+977 98XXXXXXXX"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2">
                    {t('email')}
                  </label>
                  <input
                    {...register('email', { pattern: /^\S+@\S+$/i })}
                    type="email"
                    className="w-full bg-dark-900 border border-primary-900/40 rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors"
                    placeholder="name@example.com"
                  />
                </div>

                {/* Village */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2 ${isNepali ? 'font-nepali' : ''}`}>
                    {t('village')} *
                  </label>
                  <input
                    {...register('village', { required: true })}
                    className={`w-full bg-dark-900 border ${errors.village ? 'border-red-500' : 'border-primary-900/40'} rounded-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors ${isNepali ? 'font-nepali' : ''}`}
                    placeholder={isNepali ? 'गाउँ/टोलको नाम' : 'Your village/ward name'}
                  />
                </div>

                {/* Interest */}
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
                          className="w-3 h-3 accent-red-600"
                        />
                        <span className={`text-sm text-dark-300 group-hover:text-white transition-colors ${isNepali ? 'font-nepali' : ''}`}>
                          {interest}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-950/40 border border-red-800/50 rounded-sm text-red-400 text-sm">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span className={isNepali ? 'font-nepali' : ''}>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary justify-center py-4 text-sm uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> {isNepali ? 'पेश हुँदैछ...' : 'Submitting...'}</>
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