'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Heart, Users, BookOpen, Stethoscope, Sprout, HandHeart, X, Play, ExternalLink } from 'lucide-react';

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
  const t = useTranslations('social_work');

  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Fetch videos
  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('/api/social-videos');
        if (res.ok) {
          const data = await res.json();
          setVideos(data);
        }
      } catch (error) {
        console.error('Failed to load social videos:', error);
      } finally {
        setVideosLoading(false);
      }
    }
    fetchVideos();
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedVideo]);

  // Handle ESC key close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedVideo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20 overflow-hidden">
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

      {/* Videos Section (Now first, directly below Hero) */}
      <div className="container-custom mb-24">
        <div className="text-center mb-12">
          <h2 className={`text-white text-3xl md:text-4xl font-bold uppercase tracking-wider mb-2 ${isNepali ? 'font-nepali' : 'font-display'}`}>
            {t('videosTitle')}
          </h2>
          <p className={`text-dark-400 max-w-lg mx-auto text-sm ${isNepali ? 'font-nepali' : ''}`}>
            {t('videosSubtitle')}
          </p>
        </div>

        {videosLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-dark-500 text-sm">
            {isNepali ? 'कुनै भिडियोहरू फेला परेनन्।' : 'No videos found.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => {
              const title = isNepali ? video.title_ne : video.title_en;
              const desc = isNepali ? video.description_ne : video.description_en;
              return (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedVideo(video)}
                  className="group cursor-pointer bg-dark-900 border border-primary-950 hover:border-primary-700/40 rounded-sm overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col"
                >
                  {/* Thumbnail Cover container */}
                  <div className="relative aspect-video w-full bg-dark-950 overflow-hidden flex items-center justify-center border-b border-primary-950">
                    {video.cover_image_url ? (
                      <img
                        src={video.cover_image_url}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-dark-500">
                        <Play size={28} className="text-primary-600/70" />
                        <span className="text-[10px] uppercase tracking-widest">{video.platform}</span>
                      </div>
                    )}
                    {/* Hover Overlay Play Icon */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 bg-primary-700 rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-red-glow">
                        <Play size={20} className="text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    {/* Platform Badge */}
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-dark-950/80 border border-primary-900/50 rounded-sm text-[9px] uppercase tracking-wider font-bold text-primary-400">
                      {video.platform}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className={`text-white font-bold text-base mb-2 group-hover:text-primary-400 transition-colors line-clamp-1 ${isNepali ? 'font-nepali' : ''}`}>
                        {title}
                      </h3>
                      <p className={`text-dark-400 text-xs line-clamp-2 leading-relaxed ${isNepali ? 'font-nepali' : ''}`}>
                        {desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Works grid (Now second, below Videos, with divider border) */}
      <div className="container-custom border-t border-primary-950/40 pt-16">
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

      {/* Video Modal Preview */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVideo(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-2xl bg-dark-900 border border-primary-900/40 rounded-sm overflow-hidden shadow-2xl z-10 flex flex-col"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-dark-950/80 border border-primary-900/40 flex items-center justify-center text-dark-300 hover:text-white hover:border-primary-600 transition-all duration-200"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>

              {/* Large Cover Image */}
              <div className="relative aspect-video w-full bg-dark-950 border-b border-primary-950 flex items-center justify-center">
                {selectedVideo.cover_image_url ? (
                  <img
                    src={selectedVideo.cover_image_url}
                    alt={isNepali ? selectedVideo.title_ne : selectedVideo.title_en}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-dark-500">
                    <Play size={40} className="text-primary-600/70" />
                    <span className="text-xs uppercase tracking-widest font-bold">{selectedVideo.platform}</span>
                  </div>
                )}
                {/* Play Button Overlay */}
                <a
                  href={selectedVideo.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/30 flex items-center justify-center group"
                >
                  <div className="w-16 h-16 bg-primary-700 hover:bg-primary-600 rounded-full flex items-center justify-center transition-all duration-200 shadow-red-glow cursor-pointer group-hover:scale-105">
                    <Play size={24} className="text-white fill-white ml-1" />
                  </div>
                </a>
              </div>

              {/* Content Description info */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-primary-950/60 border border-primary-800/40 rounded-sm text-[9px] uppercase tracking-wider font-bold text-primary-400">
                    {selectedVideo.platform}
                  </span>
                </div>

                <h3 className={`text-white font-bold text-xl mb-3 ${isNepali ? 'font-nepali' : ''}`}>
                  {isNepali ? selectedVideo.title_ne : selectedVideo.title_en}
                </h3>

                <p className={`text-dark-300 text-sm leading-relaxed mb-6 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar ${isNepali ? 'font-nepali' : ''}`}>
                  {isNepali ? selectedVideo.description_ne : selectedVideo.description_en}
                </p>

                <div className="flex justify-end gap-3 border-t border-primary-950/40 pt-4">
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="px-4 py-2 border border-primary-800/60 hover:border-primary-600 rounded-sm text-xs font-bold uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-all duration-200"
                  >
                    {t('close')}
                  </button>
                  <a
                    href={selectedVideo.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center gap-1.5 px-5 py-2.5 text-xs uppercase tracking-widest shadow-red-glow"
                  >
                    <span>{t('goToVideo')}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
