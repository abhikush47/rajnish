'use client';
import { motion } from 'framer-motion';

export default function RMokshaPage({ params: { locale } }) {
  const isNepali = locale === 'ne';
  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-16">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="text-primary-500 text-xs font-bold uppercase tracking-[0.3em] mb-3">
            {isNepali ? 'आरमोक्ष' : 'RMoksha NGO'}
          </div>
          <h1 className={`text-white mb-6 ${isNepali ? 'font-nepali text-4xl font-black' : 'font-display text-7xl uppercase tracking-tight'}`}>
            {isNepali ? 'आरमोक्ष' : 'RMoksha NGO'}
          </h1>
          <div className="w-16 h-0.5 bg-primary-700 mb-12" />
          <div className="card-dark p-12 text-center">
            <p className={`text-dark-400 text-lg ${isNepali ? 'font-nepali' : ''}`}>
              {isNepali ? 'सामग्री छिट्टै आउँदैछ...' : 'Content coming soon...'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
