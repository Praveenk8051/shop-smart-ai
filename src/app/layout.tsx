import { Metadata } from 'next';
import Layout from '@/components/layout/Layout';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI T-Shirt Designer',
  description: 'Design and purchase AI-generated t-shirts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}