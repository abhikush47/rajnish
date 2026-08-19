'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Youtube, MessageCircle, MapPin, Phone, Mail, Heart } from 'lucide-react';

export default function Footer({ locale }) {
  const t = useTranslations();
  const base = `/${locale}`;
  const isNepali = locale === 'ne';
  const year = new Date().getFullYear();

  const links = {
    [isNepali ? 'मुख्य' : 'Main']: [
      { href: base, label: t('nav.home') },
      { href: `${base}/about`, label: t('nav.about') },
      { href: `${base}/rmoksha`, label: t('nav.rmoksha') },
      { href: `${base}/campaigns`, label: t('nav.campaigns') },
    ],
    [isNepali ? 'राजनीति' : 'Politics']: [
      { href: `${base}/manifesto`, label: t('nav.manifesto') },
      { href: `${base}/mayor-2084`, label: t('nav.mayor2084') },
      { href: `${base}/youth-ideas`, label: t('nav.youthIdeas') },
      { href: `${base}/volunteer`, label: t('nav.volunteer') },
    ],
    [isNepali ? 'मिडिया' : 'Media']: [
      { href: `${base}/gallery`, label: t('nav.gallery') },
      { href: `${base}/news`, label: t('nav.news') },
      { href: `${base}/contact`, label: t('nav.contact') },
    ],
  };

  const socials = [
    { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61580541899428', label: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/rajnish_moksha/', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: MessageCircle, href: 'https://wa.me/9779851359115', label: 'WhatsApp' },
  ];

  return (
    <footer className="relative bg-dark-950 border-t border-primary-900/30 overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary-600 to-transparent" />
      </div>

      <div className="container-custom py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href={base} className="inline-flex items-center gap-3 group mb-6">
              <div className="w-10 h-10 bg-primary-700 rounded-sm flex items-center justify-center">
                <span className="text-white font-display text-2xl">R</span>
              </div>
              <div>
                <div className={`font-display text-xl text-white tracking-wider ${isNepali ? 'font-nepali text-lg' : ''}`}>
                  {isNepali ? 'रजनीश कुशवाहा' : 'RAJNISH KUSHWAHA'}
                </div>
                <div className="text-xs text-primary-500 tracking-widest uppercase">
                  {isNepali ? 'कालिकामाई गाउँपालिका' : 'KALIKAMAI GAUPALIKA'}
                </div>
              </div>
            </Link>

            <p className={`text-dark-400 text-sm leading-relaxed mb-6 max-w-xs ${isNepali ? 'font-nepali' : ''}`}>
              {isNepali
                ? 'युवा शक्तिले नेपाललाई अगाडि लैजान्छ। आरमोक्ष एनजीओ र परिवर्तनको सपनासहित।'
                : 'Youth power drives Nepal forward. With RMoksha NGO and a dream for change.'}
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center border border-primary-900/50 rounded-sm text-dark-400 hover:text-white hover:bg-primary-800 hover:border-primary-700 transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h4 className={`text-white text-xs font-bold uppercase tracking-widest mb-4 ${isNepali ? 'font-nepali' : ''}`}>
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`text-dark-400 hover:text-primary-400 text-sm transition-colors duration-150 ${isNepali ? 'font-nepali' : ''}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div className="mt-12 pt-8 border-t border-primary-900/20 flex flex-wrap gap-6 text-sm text-dark-500">
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-primary-700" />
            <span className={isNepali ? 'font-nepali' : ''}>{t('contact.address')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={13} className="text-primary-700" />
            <span>+977 985-1359115</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={13} className="text-primary-700" />
            <span>kushwaharajnish2019@gmail.com</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-primary-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={`text-dark-600 text-xs ${isNepali ? 'font-nepali' : ''}`}>
            © {year} {isNepali ? 'रजनीश कुशवाहा। सर्वाधिकार सुरक्षित।' : 'Rajnish Kushwaha. All Rights Reserved.'}{' '}
            •{' '}
            <Link href={`${base}/admin`} className="hover:text-primary-400 transition-colors">
              {isNepali ? 'प्रशासक लगइन' : 'Admin Login'}
            </Link>
          </p>
          <p className="text-dark-600 text-xs flex items-center gap-1.5">
            <span className={isNepali ? 'font-nepali' : ''}>{t('footer.madeWith')}</span>
            <Heart size={10} className="text-primary-600 fill-primary-600" />
          </p>
        </div>
      </div>

      {/* Bottom red accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-primary-950 via-primary-700 to-primary-950" />
    </footer>
  );
}
