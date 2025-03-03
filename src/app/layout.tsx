import { Metadata } from 'next';
import Layout from '@/components/layout/Layout';
import { AuthProvider } from '@/lib/auth/AuthContext';
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
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  );
}