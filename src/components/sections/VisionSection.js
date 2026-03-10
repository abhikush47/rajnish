'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { BookOpen, Heart, Briefcase, Building2, Sprout } from 'lucide-react';

const visionItems = [
  { icon: BookOpen, color: '#ff3333', bgColor: 'rgba(200,13,13,0.1)', key: 'education' },
  { icon: Heart, color: '#ff6b6b', bgColor: 'rgba(255,107,107,0.1)', key: 'health' },
  { icon: Briefcase, color: '#fbbf24', bgColor: 'rgba(251,191,36,0.1)', key: 'employment' },
  { icon: Building2, color: '#60a5fa', bgColor: 'rgba(96,165,250,0.1)', key: 'infrastructure' },
  { icon: Sprout, color: '#34d399', bgColor: 'rgba(52,211,153,0.1)', key: 'agriculture' }
];

export default function VisionSection({ locale }) {
  const t = useTranslations('vision');
  const isNepali = locale === 'ne';

  return (
    <section className="py-24 bg-dark-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_50%,rgba(200,13,13,0.06),transparent)]" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-900/30 border border-primary-800/30 rounded-full text-primary-500 text-xs uppercase tracking-widest mb-4">
            <span className={isNepali ? 'font-nepali' : ''}>{t('title')}</span>
          </div>
          <h2 className={`text-4xl md:text-6xl font-display text-white uppercase tracking-wider ${isNepali ? 'font-nepali font-black text-4xl md:text-5xl' : ''}`}>
            {isNepali ? t('title') : 'OUR VISION'}
          </h2>
          <p className={`text-dark-400 mt-4 text-base max-w-xl mx-auto ${isNepali ? 'font-nepali' : ''}`}>
            {t('subtitle')}
          </p>
          <div className="w-16 h-0.5 bg-primary-700 mx-auto mt-6" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visionItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative card-dark p-8 hover:border-primary-700/50 transition-all duration-300 hover:shadow-card-hover cursor-default"
              >
                {/* Corner accent */}
                <div className="absolute top-0 left-0 w-8 h-0.5 bg-primary-700 group-hover:w-full transition-all duration-500" />
                <div className="absolute top-0 left-0 w-0.5 h-8 bg-primary-700 group-hover:h-full transition-all duration-500" />

                <div
                  className="w-12 h-12 rounded-sm flex items-center justify-center mb-5"
                  style={{ backgroundColor: item.bgColor }}
                >
                  <Icon size={22} style={{ color: item.color }} />
                </div>

                <h3 className={`text-white font-bold text-lg mb-2 ${isNepali ? 'font-nepali' : 'uppercase tracking-wide'}`}>
                  {t(item.key)}
                </h3>
                <p className={`text-dark-400 text-sm leading-relaxed ${isNepali ? 'font-nepali' : ''}`}>
                  {t(`${item.key}Desc`)}
                </p>

                {/* Index number */}
                <div className="absolute bottom-4 right-5 text-4xl font-display text-primary-900/30 group-hover:text-primary-800/40 transition-colors">
                  {String(i + 1).padStart(2, '0')}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
