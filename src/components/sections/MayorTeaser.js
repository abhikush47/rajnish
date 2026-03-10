'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Vote, ArrowRight, CheckCircle2 } from 'lucide-react';

const promises = {
  ne: [
    'गुणस्तरीय सडक र पूर्वाधार',
    'निःशुल्क स्वास्थ्य सेवा',
    'युवा रोजगार केन्द्र',
    'डिजिटल साक्षरता',
    'महिला सशक्तिकरण',
    'किसान सहायता कार्यक्रम',
  ],
  en: [
    'Quality roads & infrastructure',
    'Free healthcare services',
    'Youth employment centers',
    'Digital literacy programs',
    'Women empowerment',
    'Farmer support programs',
  ],
};

export default function MayorTeaser({ locale }) {
  const t = useTranslations('mayor');
  const isNepali = locale === 'ne';
  const base = `/${locale}`;
  const list = isNepali ? promises.ne : promises.en;

  return (
    <section className="py-24 relative overflow-hidden bg-[#080000]">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(200,13,13,0.08),transparent)]" />
        {/* Diagonal stripes */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #c80d0d 0, #c80d0d 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            {/* Election badge */}
            <motion.div
              animate={{ boxShadow: ['0 0 20px rgba(200,13,13,0.3)', '0 0 50px rgba(200,13,13,0.6)', '0 0 20px rgba(200,13,13,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-primary-800/20 border border-primary-700/50 rounded-sm mb-8"
            >
              <Vote size={18} className="text-primary-400" />
              <span className={`text-primary-300 font-bold text-lg tracking-widest ${isNepali ? 'font-nepali' : 'uppercase'}`}>
                {t('title')}
              </span>
              <Vote size={18} className="text-primary-400" />
            </motion.div>

            <h2 className={`text-white mb-4 ${isNepali ? 'font-nepali text-4xl md:text-5xl font-black' : 'font-display text-5xl md:text-7xl uppercase tracking-tight'}`}>
              {isNepali ? 'कालिकामाईको' : 'FOR'}{' '}
              <span className="text-gradient">{isNepali ? 'समृद्धि' : 'KALIKAMAI'}</span>
            </h2>
            <p className={`text-dark-400 max-w-xl mx-auto ${isNepali ? 'font-nepali' : ''}`}>
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Promises grid */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10"
          >
            {list.map((promise, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-4 border border-primary-900/30 rounded-sm bg-primary-900/5 hover:bg-primary-900/10 transition-colors"
              >
                <CheckCircle2 size={15} className="text-primary-500 flex-shrink-0" />
                <span className={`text-dark-200 text-sm font-medium ${isNepali ? 'font-nepali' : ''}`}>
                  {promise}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href={`${base}/mayor-2084`} className="btn-primary inline-flex text-sm uppercase tracking-widest px-10 py-4 shadow-red-heavy">
              <span className={isNepali ? 'font-nepali' : ''}>{t('voteFor')}</span>
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
