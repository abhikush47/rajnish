'use client';

import { useTranslations } from 'next-intl';

const items = {
  ne: ['शिक्षा', 'स्वास्थ्य', 'रोजगार', 'समृद्धि', 'परिवर्तन', 'युवा', 'आरमोक्ष', 'कालिकामाई', 'मेयर २०८४', 'विकास'],
  en: ['EDUCATION', 'HEALTH', 'EMPLOYMENT', 'PROSPERITY', 'CHANGE', 'YOUTH', 'RMOKSHA', 'KALIKAMAI', 'MAYOR 2084', 'DEVELOPMENT'],
};

export default function MarqueeTicker({ locale }) {
  const isNepali = locale === 'ne';
  const list = [...items[isNepali ? 'ne' : 'en'], ...items[isNepali ? 'ne' : 'en']];

  return (
    <div className="relative overflow-hidden border-y border-primary-900/30 bg-primary-900/10 py-3">
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {list.map((item, i) => (
          <span key={i} className={`flex items-center gap-4 text-sm font-bold text-primary-500 ${isNepali ? 'font-nepali' : 'uppercase tracking-widest'}`}>
            {item}
            <span className="text-primary-800">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
