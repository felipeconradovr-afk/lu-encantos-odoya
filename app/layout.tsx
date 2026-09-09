import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome';
import './globals.css';
import { SiteMotion } from '@/components/SiteMotion';
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
    default: 'Lu by Encantos Odoyá | Fé, axé e identidade',
    template: '%s | Lu by Encantos Odoyá',
  },
  description:
    'Peças artesanais ligadas à Umbanda e ao Candomblé. Fé, ancestralidade e cuidado em cada detalhe. Conheça o catálogo e faça sua encomenda.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Lu by Encantos Odoyá',
    description: 'Fé, axé e identidade para acompanhar suas histórias.',
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
          <SiteMotion />
          <main id="conteudo">{children}</main>
          <SiteFooter />
        </CatalogProvider>
      </body>
    </html>
  );
}
