import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
});


export const metadata: Metadata = {
  title: 'PolyQuiz',
  description: 'A futuristic quiz game for Star Citizen fans.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${orbitron.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
