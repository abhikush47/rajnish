import { getTranslations } from 'next-intl/server';
import AboutClient from './AboutClient';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  return { title: `${t('about')} | Rajnish Kushwaha` };
}

export default function AboutPage({ params: { locale } }) {
  return <AboutClient locale={locale} />;
}
