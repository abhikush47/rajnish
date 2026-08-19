'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ConnectModal({ isOpen, onClose }) {
  const t = useTranslations('connect');
  
  const [form, setForm] = useState({
    name: '',
    palika: '',
    ward: '',
    contact: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    // Clear error
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = t('requiredName');
    if (!form.palika.trim()) newErrors.palika = t('requiredPalika');
    if (!form.ward.trim()) newErrors.ward = t('requiredWard');
    if (!form.contact.trim()) {
      newErrors.contact = t('requiredContact');
    } else if (!/^[0-9+\-\s]{7,15}$/.test(form.contact.trim())) {
      newErrors.contact = t('invalidContact');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          palika: form.palika.trim(),
          ward: form.ward.trim(),
          contact: form.contact.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setForm({ name: '', palika: '', ward: '', contact: '' });
      } else {
        setSubmitError(data.error || t('error'));
      }
    } catch (err) {
      console.error(err);
      setSubmitError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-dark-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-[calc(100vw-24px)] sm:w-full sm:max-w-md bg-dark-900 border border-primary-900/40 rounded-sm shadow-2xl p-6 sm:p-8 z-10 max-h-[calc(100dvh-24px)] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-dark-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {success ? (
            <div className="text-center py-6">
              <CheckCircle2 size={56} className="text-primary-500 mx-auto mb-4" />
              <h3 className="text-white text-2xl font-bold mb-2 font-display uppercase tracking-wider">
                {t('title')}
              </h3>
              <p className="text-dark-300 text-sm mb-6">
                {t('success')}
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  onClose();
                }}
                className="btn-primary w-full justify-center py-3 text-sm uppercase tracking-widest"
              >
                Close
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-white text-2xl font-bold mb-1 font-display uppercase tracking-wide">
                {t('title')}
              </h3>
              <div className="w-12 h-0.5 bg-primary-700 mb-6" />

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2">
                    {t('fullName')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full bg-dark-950 border rounded-sm px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors ${
                      errors.name ? 'border-red-700' : 'border-primary-900/40'
                    }`}
                    placeholder={t('fullName')}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Palika & Ward */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2">
                      {t('palika')} *
                    </label>
                    <input
                      type="text"
                      name="palika"
                      value={form.palika}
                      onChange={handleChange}
                      className={`w-full bg-dark-950 border rounded-sm px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors ${
                        errors.palika ? 'border-red-700' : 'border-primary-900/40'
                      }`}
                      placeholder={t('palika')}
                    />
                    {errors.palika && <p className="text-red-500 text-xs mt-1">{errors.palika}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2">
                      {t('ward')} *
                    </label>
                    <input
                      type="text"
                      name="ward"
                      value={form.ward}
                      onChange={handleChange}
                      className={`w-full bg-dark-950 border rounded-sm px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors ${
                        errors.ward ? 'border-red-700' : 'border-primary-900/40'
                      }`}
                      placeholder={t('ward')}
                    />
                    {errors.ward && <p className="text-red-500 text-xs mt-1">{errors.ward}</p>}
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-dark-300 mb-2">
                    {t('contact')} *
                  </label>
                  <input
                    type="text"
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    className={`w-full bg-dark-950 border rounded-sm px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-600 transition-colors ${
                      errors.contact ? 'border-red-700' : 'border-primary-900/40'
                    }`}
                    placeholder="+977 98XXXXXXXX"
                  />
                  {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
                </div>

                {submitError && (
                  <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-800/50 rounded-sm">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-red-400 text-xs">{submitError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary justify-center py-3 text-sm uppercase tracking-widest disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{t('submitting')}</span>
                    </>
                  ) : (
                    <span>{t('submit')}</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
