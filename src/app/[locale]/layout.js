import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const dynamic = "force-dynamic";
const locales = ['ne', 'en'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }) {
  const isNepali = locale === 'ne';
  return {
    title: isNepali
      ? 'रजनीश कुशवाहा | युवा नेता'
      : 'Rajnish Kushwaha | Youth Leader',
    description: isNepali
      ? 'कालिकामाई गाउँपालिकाका युवा नेता, सामाजिक कार्यकर्ता र आरमोक्ष एनजीओका संस्थापक'
      : 'Youth Leader, Social Worker and Founder of RMoksha NGO from Kalikamai Gaupalika, Parsa, Nepal',
    keywords: 'Rajnish Kushwaha, RMoksha, Kalikamai, Parsa, Nepal, Youth, NGO, Mayor 2084',
    openGraph: {
      title: isNepali ? 'रजनीश कुशवाहा' : 'Rajnish Kushwaha',
      locale: locale === 'ne' ? 'ne_NP' : 'en_US',
    },
  };
}

export default async function LocaleLayout({ children, params: { locale } }) {
  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-dark-950 text-white antialiased overflow-x-hidden">
        <NextIntlClientProvider messages={messages}>
          <div className="relative min-h-screen flex flex-col">
            <Navbar locale={locale} />
            <main className="flex-1">{children}</main>
            <Footer locale={locale} />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
