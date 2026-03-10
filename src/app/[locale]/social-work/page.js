'use client';

import { motion } from 'framer-motion';
import { Heart, Users, BookOpen, Stethoscope, Sprout, HandHeart } from 'lucide-react';

const works = [
  {
    icon: BookOpen,
    color: '#ff3333',
    ne: { title: 'शिक्षा अभियान', desc: 'ग्रामीण विद्यार्थीहरूलाई निःशुल्क शिक्षा सामग्री र ट्युसन सेवा।' },
    en: { title: 'Education Drive', desc: 'Free study materials and tutoring services for rural students.' },
  },
  {
    icon: Stethoscope,
    color: '#fbbf24',
    ne: { title: 'स्वास्थ्य शिविर', desc: 'निःशुल्क स्वास्थ्य जाँच र औषधि वितरण कार्यक्रम।' },
    en: { title: 'Health Camps', desc: 'Free medical checkups and medicine distribution programs.' },
  },
  {
    icon: Users,
    color: '#60a5fa',
    ne: { title: 'युवा सशक्तिकरण', desc: 'सीप विकास तालिम र रोजगारीका अवसरहरू।' },
    en: { title: 'Youth Empowerment', desc: 'Skill development training and employment opportunities.' },
  },
  {
    icon: Sprout,
    color: '#34d399',
    ne: { title: 'वातावरण संरक्षण', desc: 'वृक्षारोपण र सफाई अभियान।' },
    en: { title: 'Environmental Care', desc: 'Tree plantation and community cleanliness drives.' },
  },
  {
    icon: HandHeart,
    color: '#f472b6',
    ne: { title: 'महिला अधिकार', desc: 'महिला सशक्तिकरण र जागरण कार्यक्रमहरू।' },
    en: { title: "Women's Rights", desc: 'Women empowerment and awareness programs.' },
  },
  {
    icon: Heart,
    color: '#a78bfa',
    ne: { title: 'सामुदायिक सेवा', desc: 'बाढी, भूकम्प र विपद्मा राहत सहयोग।' },
    en: { title: 'Community Relief', desc: 'Disaster relief support during floods and earthquakes.' },
  },
];

export default function SocialWorkPage({ params: { locale } }) {
  const isNepali = locale === 'ne';

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-16 overflow-hidden">
      {/* Hero */}
      <div className="relative py-16 bg-[#080000] mb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(200,13,13,0.08),transparent)]" />
        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-900/40 border border-primary-700/40 rounded-full text-primary-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Heart size={11} className="fill-primary-500 text-primary-500" />
              <span className={isNepali ? 'font-nepali' : ''}>{isNepali ? 'समाज सेवा' : 'SOCIAL WORK'}</span>
            </div>
            <h1 className={`text-white mb-4 ${isNepali ? 'font-nepali text-5xl md:text-6xl font-black' : 'font-display text-7xl md:text-9xl uppercase tracking-tight'}`}>
              {isNepali ? (
                <>सामाजिक <span className="text-gradient">कार्य</span></>
              ) : (
                <>SOCIAL <span className="text-gradient">WORK</span></>
              )}
            </h1>
            <p className={`text-dark-400 max-w-xl mx-auto text-base ${isNepali ? 'font-nepali' : ''}`}>
              {isNepali
                ? 'समुदायको सेवामा समर्पित — शिक्षा, स्वास्थ्य र सामाजिक न्यायका लागि।'
                : 'Dedicated to serving the community — for education, health and social justice.'}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Works grid */}
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {works.map((w, i) => {
            const Icon = w.icon;
            const content = isNepali ? w.ne : w.en;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -5 }}
                className="group card-dark p-7 hover:shadow-card-hover hover:border-primary-700/40 transition-all duration-300 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 w-full h-0.5 opacity-60"
                  style={{ background: `linear-gradient(90deg, transparent, ${w.color}, transparent)` }}
                />
                <div
                  className="w-12 h-12 rounded-sm flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${w.color}15` }}
                >
                  <Icon size={22} style={{ color: w.color }} />
                </div>
                <h3 className={`text-white font-bold text-lg mb-2 ${isNepali ? 'font-nepali' : ''}`}>
                  {content.title}
                </h3>
                <p className={`text-dark-400 text-sm leading-relaxed ${isNepali ? 'font-nepali' : ''}`}>
                  {content.desc}
                </p>
                <div className="absolute bottom-4 right-5 font-display text-5xl text-primary-900/20 group-hover:text-primary-800/30 transition-colors">
                  {String(i + 1).padStart(2, '0')}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
