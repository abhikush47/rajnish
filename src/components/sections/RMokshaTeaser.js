'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Target, Globe2 } from 'lucide-react';

export default function RMokshaTeaser({ locale }) {
  const t = useTranslations('rmoksha');
  const isNepali = locale === 'ne';
  const base = `/${locale}`;

  const pillars = [
    { icon: Users, label: isNepali ? 'समुदाय' : 'Community' },
    { icon: Target, label: isNepali ? 'लक्ष्य' : 'Purpose' },
    { icon: Globe2, label: isNepali ? 'प्रभाव' : 'Impact' },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-[#0d0000]">
      {/* Big background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span className="font-display text-[20rem] text-primary-950/20 select-none tracking-tight">R</span>
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-primary-500 text-xs font-bold uppercase tracking-[0.3em] mb-4">
              {isNepali ? 'संस्था' : 'THE NGO'}
            </div>

            <h2 className={`mb-2 ${isNepali ? 'font-nepali text-5xl font-black text-white' : 'font-display text-7xl md:text-8xl text-white uppercase tracking-tight'}`}>
              {t('title')}
            </h2>
            <h3 className={`text-primary-400 mb-6 ${isNepali ? 'font-nepali text-2xl font-bold' : 'font-display text-3xl uppercase tracking-wider'}`}>
              {t('subtitle')}
            </h3>

            <div className="w-16 h-0.5 bg-primary-700 mb-6" />

            <p className={`text-dark-300 text-base leading-relaxed mb-8 max-w-lg ${isNepali ? 'font-nepali' : ''}`}>
              {t('description')}
            </p>

            {/* Pillars */}
            <div className="flex gap-4 mb-8">
              {pillars.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2 border border-primary-900/40 rounded-sm">
                  <Icon size={13} className="text-primary-500" />
                  <span className={`text-xs font-semibold text-dark-300 ${isNepali ? 'font-nepali' : 'uppercase tracking-widest'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href={`${base}/rmoksha`} className="btn-primary">
                <span className={isNepali ? 'font-nepali' : 'uppercase tracking-widest text-sm'}>{t('learnMore')}</span>
                <ArrowRight size={15} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: visual card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-sm mx-auto">
              {/* Rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-dashed border-primary-800/30"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4 rounded-full border border-dashed border-primary-700/20"
              />

              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-10 card-dark rounded-full w-64 h-64 flex flex-col items-center justify-center shadow-inner-red">
                  <div className="font-display text-7xl text-primary-600 mb-1">आर</div>
                  <div className={`text-white font-bold text-lg ${isNepali ? 'font-nepali' : 'font-display tracking-wider'}`}>
                    RMoksha
                  </div>
                  <div className={`text-dark-500 text-xs mt-1 ${isNepali ? 'font-nepali' : 'tracking-widest uppercase'}`}>
                    {isNepali ? 'एनजीओ' : 'NGO · Since 2078'}
                  </div>
                </div>
              </div>

              {/* Orbiting dots */}
              {[0, 120, 240].map((deg) => (
                <motion.div
                  key={deg}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear', delay: deg / 360 * 8 }}
                  style={{ transformOrigin: 'center center' }}
                  className="absolute inset-0"
                >
                  <div
                    className="absolute w-2.5 h-2.5 bg-primary-600 rounded-full shadow-red-glow"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${deg}deg) translateX(120px) translateY(-50%)`,
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
