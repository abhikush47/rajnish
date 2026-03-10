import '@/styles/globals.css';

export const metadata = {
  title: 'Rajnish Kushwaha',
  description: 'Official website of Rajnish Kushwaha - Youth Leader, Social Worker, Founder of RMoksha NGO',
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
