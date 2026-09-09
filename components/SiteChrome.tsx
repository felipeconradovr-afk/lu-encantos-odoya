'use client';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, ArrowUpRight } from 'lucide-react';
import {useCatalog} from '@/components/CatalogProvider';
import {whatsappUrl} from '@/lib/catalog';
const links = [
  ['/', 'Início'],
  ['/produtos', 'Produtos'],
  ['/encomendas', 'Encomendas'],
  ['/sobre', 'Sobre'],
  ['/contato', 'Contato'],
];
export function Brand() {
  return (
    <span className="brand">
      <span className="brand-lu">
        Lu<span aria-hidden="true">✧</span>
      </span>
      <span className="brand-name">BY ENCANTOS ODOYÁ</span>
    </span>
  );
}
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); toggleRef.current?.focus(); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="site-header">
      <a
        href="/"
        aria-label="Lu by Encantos Odoyá, início"
        onClick={() => setOpen(false)}
      >
        <Brand />
      </a>
      <nav
        className={open ? 'main-nav is-open' : 'main-nav'}
        aria-label="Navegação principal"
        id="menu-principal"
      >
        {links.map(([href, label]) => (
          <a
            key={href}
            href={href}
            aria-current={path === href ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            {label}
          </a>
        ))}
      </nav>
      <a className="header-cta" href="/encomendas">
        Feito para você <ArrowUpRight size={16} />
      </a>
      <button
        className="menu-toggle"
        ref={toggleRef}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="menu-principal"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
      >
        <span className="menu-lines" aria-hidden="true"><span /><span /></span>
      </button>
    </header>
  );
}
export function SiteFooter() {
  const {settings}=useCatalog();
  const contactUrl=whatsappUrl('Olá! Vim pelo site da Lu by Encantos Odoyá.',settings.whatsapp);
  return (
    <>
      <footer className="site-footer">
        <div>
          <a href="/">
            <Brand />
          </a>
          <p>
            Fé, axé e identidade.
            <br />
            Feito à mão, com respeito.
          </p>
        </div>
        <nav aria-label="Navegação do rodapé">
          {links.slice(1).map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="footer-contact">
          <span>Vamos criar algo seu?</span>
          <a
            href={contactUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {settings.whatsapp==='5548991893262'?'(48) 99189-3262':`+${settings.whatsapp}`} ↗
          </a>
          {settings.instagram&&<a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="footer-social">Instagram ↗</a>}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Lu by Encantos Odoyá</span>
          <span>Feito com cuidado por VOLT.SYS</span>
          <a href="/admin">Área da Lu</a>
        </div>
      </footer>
      <a
        className="whatsapp-float"
        href={contactUrl}
        aria-label="Conversar com a Lu pelo WhatsApp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle size={25} />
      </a>
    </>
  );
}