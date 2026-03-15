'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';

const NavLink = ({ href, children, onClick, className = '' }) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        relative group text-sm font-semibold uppercase tracking-widest transition-colors duration-200
        ${isActive ? 'text-primary-400' : 'text-dark-200 hover:text-white'}
        ${className}
      `}
    >
      {children}
      <span
        className={`
          absolute -bottom-1 left-0 h-0.5 bg-primary-600 transition-all duration-300
          ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
        `}
      />
    </Link>
  );
};

export default function Navbar({ locale }) {
  const t = useTranslations('nav');
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreRef = useRef(null);

  const isNepali = locale === 'ne';

  const toggleLocale = () => {
    const newLocale = locale === 'ne' ? 'en' : 'ne';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const base = `/${locale}`;

  const primaryLinks = [
    { href: base, label: t('home') },
    { href: `${base}/about`, label: t('about') },
    { href: `${base}/social-work`, label: t('socialWork') },
    { href: `${base}/campaigns`, label: t('campaigns') },
    { href: `${base}/mayor-2084`, label: t('mayor2084') },
  ];

  const moreLinks = [
    { href: `${base}/rmoksha`, label: t('rmoksha') },
    { href: `${base}/manifesto`, label: t('manifesto') },
    { href: `${base}/gallery`, label: t('gallery') },
    { href: `${base}/news`, label: t('news') },
    { href: `${base}/volunteer`, label: t('volunteer') },
    { href: `${base}/youth-ideas`, label: t('youthIdeas') },
    { href: `${base}/contact`, label: t('contact') },
  ];

  const allLinks = [...primaryLinks, ...moreLinks];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-500
          ${scrolled
            ? 'bg-dark-950/95 backdrop-blur-md border-b border-primary-900/40 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-transparent'
          }
        `}
      >
        {/* Top accent bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-primary-950 via-primary-600 to-primary-950" />

        <nav className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* Logo */}
            <Link href={base} className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative">
                <div className="w-9 h-9 bg-primary-700 rounded-sm flex items-center justify-center group-hover:bg-primary-600 transition-colors duration-200 shadow-red-glow">
                  <span className="text-white font-display text-xl tracking-tight">R</span>
                </div>
                <div className="absolute -inset-0.5 bg-primary-600/30 rounded-sm blur-sm group-hover:blur-md transition-all duration-300" />
              </div>
              <div className="hidden sm:block">
                <div
                  className={`font-display text-lg tracking-wider text-white leading-none ${isNepali ? 'font-nepali text-base' : ''}`}
                >
                  {isNepali ? 'रजनीश कुशवाहा' : 'RAJNISH KUSHWAHA'}
                </div>
                <div className="text-[10px] text-primary-400 tracking-[0.2em] uppercase font-body">
                  {isNepali ? 'कालिकामाई गाउँपालिका' : 'KALIKAMAI GAUPALIKA'}
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              {primaryLinks.map((link) => (
                <NavLink key={link.href} href={link.href}>
                  <span className={isNepali ? 'font-nepali text-xs' : ''}>{link.label}</span>
                </NavLink>
              ))}

              {/* More dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="flex items-center gap-1 text-sm font-semibold uppercase tracking-widest text-dark-200 hover:text-white transition-colors duration-200"
                >
                  <span className={isNepali ? 'font-nepali text-xs' : ''}>
                    {isNepali ? 'अझ' : 'MORE'}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${showMoreMenu ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {showMoreMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-dark-950 border border-primary-900/40 rounded-sm shadow-card overflow-hidden"
                    >
                      {moreLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setShowMoreMenu(false)}
                          className="block px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-dark-200 hover:text-white hover:bg-primary-900/30 transition-all duration-150"
                        >
                          <span className={isNepali ? 'font-nepali' : ''}>{link.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {/* Language toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleLocale}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-primary-800/60 hover:border-primary-600 rounded-sm text-xs font-bold tracking-wider text-primary-400 hover:text-primary-300 hover:bg-primary-900/20 transition-all duration-200"
              >
                <Globe size={12} />
                <span>{t('toggleLang')}</span>
              </motion.button>

              {/* CTA */}
              <Link
                href={`${base}/volunteer`}
                className="hidden sm:inline-flex items-center px-4 py-2 bg-primary-700 hover:bg-primary-600 text-white text-xs font-bold uppercase tracking-widest rounded-sm transition-all duration-200 hover:shadow-red-glow"
              >
                <span className={isNepali ? 'font-nepali' : ''}>{t('volunteer')}</span>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden flex items-center justify-center w-9 h-9 border border-primary-800/60 rounded-sm text-white hover:bg-primary-900/20 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X size={18} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu size={18} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-dark-950 border-l border-primary-900/40 z-50 lg:hidden overflow-y-auto"
            >
              {/* Mobile header */}
              <div className="flex items-center justify-between p-4 border-b border-primary-900/30">
                <span className="text-primary-400 text-xs font-bold tracking-widest uppercase">
                  {isNepali ? 'मेनु' : 'MENU'}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-dark-300 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile links */}
              <div className="p-4 space-y-1">
                {allLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-sm hover:bg-primary-900/20 group transition-all duration-150"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-700 group-hover:bg-primary-500 transition-colors" />
                      <span className={`text-sm font-semibold uppercase tracking-wider text-dark-200 group-hover:text-white transition-colors ${isNepali ? 'font-nepali' : ''}`}>
                        {link.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile lang toggle */}
              <div className="p-4 mt-4 border-t border-primary-900/30">
                <button
                  onClick={() => { toggleLocale(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-primary-700/50 rounded-sm text-primary-400 hover:bg-primary-900/20 transition-all duration-200"
                >
                  <Globe size={14} />
                  <span className="text-sm font-bold tracking-widest">
                    {t('toggleLang')}
                  </span>
                </button>
              </div>

              {/* Social links */}
              <div className="p-4 flex gap-3">
                {['facebook', 'instagram', 'twitter', 'whatsapp'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-8 h-8 flex items-center justify-center border border-primary-900/50 rounded-sm text-dark-400 hover:text-white hover:border-primary-600 transition-all duration-200 text-xs font-bold uppercase"
                  >
                    {social[0].toUpperCase()}
                  </a>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
