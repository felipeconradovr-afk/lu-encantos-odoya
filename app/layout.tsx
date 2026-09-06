import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome';
import './globals.css';
import { CatalogProvider } from '@/components/CatalogProvider';
const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});
const sans = Manrope({ subsets: ['latin'], variable: '--font-body' });
export const metadata: Metadata = {
  icons:{icon:'/favicon.svg'},
  title: {
    default: 'Lu by Encantos Odoyá | Encantos feitos à mão',
    template: '%s | Lu by Encantos Odoyá',
  },
  description:
    'Colares, pulseiras e acessórios artesanais. Encontre uma peça com significado ou crie uma encomenda personalizada pelo WhatsApp.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Lu by Encantos Odoyá',
    description: 'Encantos feitos à mão para acompanhar suas histórias.',
    locale: 'pt_BR',
    type: 'website',
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${display.variable} ${sans.variable}`}>
        <CatalogProvider>
          <a className="skip" href="#conteudo">
            Pular para o conteúdo
          </a>
          <SiteHeader />
          <main id="conteudo">{children}</main>
          <SiteFooter />
        </CatalogProvider>
      </body>
    </html>
  );
}
