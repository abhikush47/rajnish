'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MapPin, Tag } from 'lucide-react';

const campaigns = [
  {
    id: 1,
    titleNe: 'निःशुल्क शिक्षा अभियान',
    titleEn: 'Free Education Campaign',
    descNe: 'कालिकामाईका विद्यार्थीहरूलाई निःशुल्क शिक्षा सामग्री वितरण',
    descEn: 'Distributing free educational materials to students of Kalikamai',
    categoryNe: 'शिक्षा', categoryEn: 'Education',
    locationNe: 'वडा न. १-५', locationEn: 'Ward No. 1-5',
    dateNe: 'माघ २०८०', dateEn: 'Jan 2024',
    color: '#ff3333',
  },
  {
    id: 2,
    titleNe: 'स्वास्थ्य शिविर',
    titleEn: 'Health Camp',
    descNe: 'ग्रामीण क्षेत्रमा निःशुल्क स्वास्थ्य जाँच र औषधि वितरण',
    descEn: 'Free health checkup and medicine distribution in rural areas',
    categoryNe: 'स्वास्थ्य', categoryEn: 'Health',
    locationNe: 'बिन्दबासिनी', locationEn: 'Bindabasini',
    dateNe: 'फाल्गुन २०८०', dateEn: 'Mar 2024',
    color: '#fbbf24',
  },
  {
    id: 3,
    titleNe: 'युवा सशक्तिकरण',
    titleEn: 'Youth Empowerment',
    descNe: 'युवाहरूलाई सीप विकास तालिम र रोजगारी अवसर',
    descEn: 'Skill development training and employment opportunities for youth',
    categoryNe: 'रोजगार', categoryEn: 'Employment',
    locationNe: 'कालिकामाई', locationEn: 'Kalikamai',
    dateNe: 'चैत्र २०८०', dateEn: 'Apr 2024',
    color: '#60a5fa',
  },
];

export default function CampaignHighlights({ locale }) {
  const t = useTranslations('campaigns');
  const isNepali = locale === 'ne';
  const base = `/${locale}`;

  return (
    <section className="py-24 bg-dark-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_80%,rgba(200,13,13,0.05),transparent)]" />

      <div className="container-custom relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <div className="text-primary-500 text-xs font-bold uppercase tracking-[0.3em] mb-3">
              {isNepali ? 'हाम्रो काम' : 'OUR WORK'}
            </div>
            <h2 className={`text-white ${isNepali ? 'font-nepali text-4xl font-black' : 'font-display text-6xl uppercase tracking-wider'}`}>
              {t('title')}
            </h2>
            <div className="w-12 h-0.5 bg-primary-700 mt-4" />
          </div>
          <Link
            href={`${base}/campaigns`}
            className="flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm font-semibold uppercase tracking-widest transition-colors group"
          >
            <span className={isNepali ? 'font-nepali' : ''}>{t('viewAll')}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Campaign cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {campaigns.map((c, i) => (
            <motion.article
              key={c.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -4 }}
              className="group card-dark overflow-hidden hover:border-primary-700/40 transition-all duration-300 hover:shadow-card-hover"
            >
              {/* Top color bar */}
              <div
                className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, ${c.color}80, ${c.color})` }}
              />

              <div className="p-6">
                {/* Category */}
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={11} style={{ color: c.color }} />
                  <span
                    className={`text-xs font-bold uppercase tracking-widest ${isNepali ? 'font-nepali' : ''}`}
                    style={{ color: c.color }}
                  >
                    {isNepali ? c.categoryNe : c.categoryEn}
                  </span>
                </div>

                <h3 className={`text-white font-bold text-lg mb-3 group-hover:text-primary-200 transition-colors ${isNepali ? 'font-nepali' : ''}`}>
                  {isNepali ? c.titleNe : c.titleEn}
                </h3>

                <p className={`text-dark-400 text-sm leading-relaxed mb-5 ${isNepali ? 'font-nepali' : ''}`}>
                  {isNepali ? c.descNe : c.descEn}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap gap-3 text-xs text-dark-500 border-t border-primary-900/20 pt-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={10} className="text-primary-700" />
                    <span className={isNepali ? 'font-nepali' : ''}>
                      {isNepali ? c.locationNe : c.locationEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={10} className="text-primary-700" />
                    <span className={isNepali ? 'font-nepali' : ''}>
                      {isNepali ? c.dateNe : c.dateEn}
                    </span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
