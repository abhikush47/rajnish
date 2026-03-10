import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ne', 'en'],
  defaultLocale: 'ne',
  localePrefix: 'always',
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
