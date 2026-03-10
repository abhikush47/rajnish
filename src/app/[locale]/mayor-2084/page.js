'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Vote, Target, CheckCircle2, ArrowRight, Star } from 'lucide-react';

const pillars = [
  {
    n: '01',
    ne: { title: 'शिक्षा सुधार', desc: 'प्रत्येक बालबालिकाले गुणस्तरीय शिक्षा पाउने वातावरण निर्माण गर्ने।' },
    en: { title: 'Education Reform', desc: 'Creating an environment where every child receives quality education.' },
    color: '#ff3333',
  },
  {
    n: '02',
    ne: { title: 'स्वास्थ्य पहुँच', desc: 'निःशुल्क आधारभूत स्वास्थ्य सेवा सुनिश्चित गर्ने।' },
    en: { title: 'Healthcare Access', desc: 'Ensuring free basic healthcare services for all residents.' },
    color: '#fbbf24',
  },
  {
    n: '03',
    ne: { title: 'रोजगार सिर्जना', desc: 'युवाहरूका लागि स्थानीय रोजगारीका अवसर विस्तार गर्ने।' },
    en: { title: 'Job Creation', desc: 'Expanding local employment opportunities for youth.' },
    color: '#60a5fa',
  },
  {
    n: '04',
    ne: { title: 'पूर्वाधार विकास', desc: 'सडक, बिजुली र खानेपानी सुविधा सम्पूर्ण वडामा पुर्‍याउने।' },
    en: { title: 'Infrastructure Dev', desc: 'Bringing roads, electricity and water to every ward.' },
    color: '#34d399',
  },
  {
    n: '05',
    ne: { title: 'महिला सशक्तिकरण', desc: 'महिलाहरूको आर्थिक र सामाजिक सशक्तिकरणका कार्यक्रम सञ्चालन।' },
    en: { title: "Women's Empowerment", desc: 'Running economic and social empowerment programs for women.' },
    color: '#f472b6',
  },
  {
    n: '06',
    ne: { title: 'डिजिटल नेपाल', desc: 'इन्टरनेट र डिजिटल साक्षरता सबै घरमा पुर्‍याउने।' },
    en: { title: 'Digital Nepal', desc: 'Bringing internet and digital literacy to every household.' },
    color: '#a78bfa',
  },
];

export default function Mayor2084Page({ params: { locale } }) {
  const t = useTranslations('mayor');
  const isNepali = locale === 'ne';
  const base = `/${locale}`;

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-16 overflow-hidden">
      {/* Hero */}
      <div className="relative py-20 bg-[#080000] overflow-hidden mb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(200,13,13,0.1),transparent)]" />
        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <motion.div
              animate={{ boxShadow: ['0 0 20px rgba(200,13,13,0.3)', '0 0 60px rgba(200,13,13,0.7)', '0 0 20px rgba(200,13,13,0.3)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="inline-flex items-center gap-3 px-8 py-4 border border-primary-600/60 bg-primary-900/20 mb-8"
            >
              <Star size={16} className="text-gold-400 fill-gold-400" />
              <span className={`text-primary-300 font-bold text-xl tracking-widest ${isNepali ? 'font-nepali' : 'uppercase'}`}>
                {t('title')}
              </span>
              <Star size={16} className="text-gold-400 fill-gold-400" />
            </motion.div>

            <h1 className={`text-white mb-4 ${isNepali ? 'font-nepali text-5xl md:text-6xl font-black' : 'font-display text-7xl md:text-9xl uppercase tracking-tight'}`}>
              <span className="text-gradient">{isNepali ? 'कालिकामाई' : 'KALIKAMAI'}</span>
            </h1>
            <h2 className={`text-dark-300 mb-6 ${isNepali ? 'font-nepali text-2xl font-bold' : 'font-display text-4xl uppercase tracking-widest'}`}>
              {isNepali ? 'गाउँपालिकाको समृद्धिका लागि' : 'GAUPALIKA'}
            </h2>
            <p className={`text-dark-400 max-w-2xl mx-auto text-base ${isNepali ? 'font-nepali' : ''}`}>
              {t('subtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Six pillars */}
      <div className="container-custom mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className={`text-white mb-3 ${isNepali ? 'font-nepali text-4xl font-black' : 'font-display text-5xl uppercase tracking-wider'}`}>
            {isNepali ? 'विकासका ६ स्तम्भ' : '6 PILLARS OF DEVELOPMENT'}
          </h2>
          <div className="w-12 h-0.5 bg-primary-700 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((p, i) => {
            const content = isNepali ? p.ne : p.en;
            return (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="card-dark p-7 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <span className="font-display text-5xl leading-none" style={{ color: `${p.color}30` }}>
                    {p.n}
                  </span>
                  <div>
                    <h3 className={`text-white font-bold text-lg mb-2 ${isNepali ? 'font-nepali' : ''}`}
                      style={{ color: p.color }}>
                      {content.title}
                    </h3>
                    <p className={`text-dark-400 text-sm leading-relaxed ${isNepali ? 'font-nepali' : ''}`}>
                      {content.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="container-custom text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block"
        >
          <Link href={`${base}/volunteer`} className="btn-primary text-sm uppercase tracking-widest px-10 py-4 shadow-red-heavy">
            <Vote size={16} />
            <span className={isNepali ? 'font-nepali' : ''}>{t('voteFor')}</span>
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
