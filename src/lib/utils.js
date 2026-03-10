import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes intelligently
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Get locale-aware text from bilingual object
 */
export function getText(obj, locale) {
  return locale === 'ne' ? obj.ne : obj.en;
}

/**
 * Format date for Nepal Sambat / BS calendar display
 */
export function formatBS(date) {
  // Simplified – in production use a full BS converter
  const months = [
    'बैशाख', 'जेष्ठ', 'आषाढ', 'श्रावण',
    'भाद्र', 'आश्विन', 'कार्तिक', 'मंसिर',
    'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
  ];
  return months[date.getMonth()] + ' ' + (date.getFullYear() + 57);
}

/**
 * Animate stagger children config
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};
