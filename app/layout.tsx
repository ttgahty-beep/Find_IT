import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/lib/authContext';

export const metadata: Metadata = {
  title: 'FindIt Campus — Foundation University Islamabad & Rawalpindi',
  description: 'Smart Lost & Found Management System for Foundation University (FUI) students, faculty, and proctorial staff.',
  openGraph: {
    title: 'FindIt Campus — Foundation University Islamabad & Rawalpindi',
    description: 'Smart Lost & Found Management System for Foundation University (FUI) students, faculty, and proctorial staff.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FindIt Campus — Foundation University Islamabad & Rawalpindi',
    description: 'Smart Lost & Found Management System for Foundation University (FUI) students, faculty, and proctorial staff.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
