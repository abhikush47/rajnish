'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';

export default function ContactPage({ params: { locale } }) {

  const t = useTranslations('contact');
  const isNepali = locale === 'ne';

  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    setLoading(false);

    alert(isNepali ? 'सन्देश पठाइयो!' : 'Message Sent!');

    setForm({
      name: '',
      email: '',
      message: ''
    });
  };

  const socials = [
    { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61580541899428', color: '#1877f2' },
    { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/rajnish_moksha/', color: '#e4405f' },
    { icon: Youtube, label: 'YouTube', href: '#', color: '#ff0000' },
    { icon: MessageCircle, label: '@hamrorajnish', href: 'https://wa.me/9779851359115', color: '#25d366' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-16">
      <div className="container-custom">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >

          <div className="mb-12 text-center">
            <h1 className={`text-white mb-3 ${isNepali ? 'font-nepali text-4xl font-black' : 'font-display text-7xl uppercase tracking-tight'}`}>
              {t('title')}
            </h1>

            <p className={`text-dark-400 ${isNepali ? 'font-nepali' : ''}`}>
              {t('subtitle')}
            </p>

            <div className="w-12 h-0.5 bg-primary-700 mx-auto mt-6" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Contact info */}
            <div className="space-y-5">

              {[
                { icon: MapPin, label: t('address'), value: 'Kalikamai Gaupalika, Parsa, Nepal' },
                { icon: Phone, label: t('phone'), value: '+977 985-1359115' },
                { icon: Mail, label: t('email'), value: 'kushwaharajnish2019@gmail.com' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="card-dark p-5 flex items-center gap-4">

                  <div className="w-10 h-10 bg-primary-900/40 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-primary-500" />
                  </div>

                  <div>
                    <div className={`text-xs text-dark-500 uppercase tracking-widest mb-0.5 ${isNepali ? 'font-nepali' : ''}`}>
                      {label}
                    </div>

                    <div className="text-white text-sm font-medium">
                      {value}
                    </div>
                  </div>

                </div>
              ))}

              {/* Social media */}
              <div className="card-dark p-5">

                <div className={`text-xs text-dark-500 uppercase tracking-widest mb-4 ${isNepali ? 'font-nepali' : ''}`}>
                  {isNepali ? 'सामाजिक सञ्जाल' : 'Social Media'}
                </div>

                <div className="grid grid-cols-2 gap-3">

                  {socials.map(({ icon: Icon, label, href, color }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      className="flex items-center gap-3 p-3 border border-primary-900/30 rounded-sm hover:bg-primary-900/10 transition-colors"
                    >

                      <Icon size={16} style={{ color }} />

                      <span className="text-dark-300 text-sm hover:text-white transition-colors">
                        {label}
                      </span>

                    </a>
                  ))}

                </div>
              </div>
            </div>

            {/* Map + Message Form */}
            <div className="space-y-5">

              {/* Map */}
              <div className="card-dark overflow-hidden rounded-sm">

                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56840.89055669083!2d84.68441954417113!3d27.075770172704622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3994a77defec9b91%3A0x87684aefa076a3bc!2sKalikamai%2C%2044300%2C%20Nepal!5e0!3m2!1sen!2sin!4v1773150679694!5m2!1sen!2sin"
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />

              </div>

              {/* Message form */}
              <div className="card-dark p-6">

                <h3 className={`text-white font-bold mb-4 ${isNepali ? 'font-nepali' : 'uppercase tracking-wide text-sm'}`}>
                  {isNepali ? 'सन्देश पठाउनुहोस्' : 'SEND A MESSAGE'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-3">

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-dark-900 border border-primary-900/40 rounded-sm px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors"
                    placeholder={isNepali ? 'तपाईंको नाम' : 'Your name'}
                  />

                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-dark-900 border border-primary-900/40 rounded-sm px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors"
                    placeholder={isNepali ? 'तपाईंको इमेल' : 'Your email'}
                  />

                  <textarea
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="w-full bg-dark-900 border border-primary-900/40 rounded-sm px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors resize-none"
                    placeholder={isNepali ? 'तपाईंको सन्देश' : 'Your message'}
                  />

                  <button
                    type="submit"
                    className="w-full btn-primary justify-center text-sm uppercase tracking-widest"
                  >
                    {loading ? 'Sending...' : (isNepali ? 'पठाउनुहोस्' : 'SEND')}
                  </button>

                </form>

              </div>

            </div>

          </div>

        </motion.div>

      </div>
    </div>
  );
}