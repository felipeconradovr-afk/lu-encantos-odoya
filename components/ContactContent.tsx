'use client';
import Link from 'next/link';
import { useCatalog } from '@/components/CatalogProvider';
import { whatsappUrl } from '@/lib/catalog';
export function ContactContent() {
  const { settings } = useCatalog();
  return (
    <section className="section contact-page">
      <p className="eyebrow">Pode chegar</p>
      <h1>
        Uma boa conversa.
        <br />
        Um novo <em>encanto.</em>
      </h1>
      <p>
        Quer saber mais sobre uma peça, combinar uma encomenda ou tirar uma
        dúvida? Fale diretamente com a Lu.
      </p>
      <a
        className="button"
        target="_blank"
        rel="noopener noreferrer"
        href={whatsappUrl(
          'Olá! Vim pelo site da Lu by Encantos Odoyá e gostaria de conversar sobre uma peça.',
          settings.whatsapp,
        )}
      >
        Falar com a Lu pelo WhatsApp ↗
      </a>
      <div className="contact-details">
        <div>
          <span>WhatsApp</span>
          <p>
            {settings.whatsapp === '5548991893262'
              ? '(48) 99189-3262'
              : `+${settings.whatsapp}`}
          </p>
        </div>
        <div>
          <span>Peças personalizadas</span>
          <Link href="/encomendas">Conte sua ideia no formulário ↗</Link>
        </div>
        {settings.instagram && (
          <div>
            <span>Nosso Instagram</span>
            <a
              href={settings.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              Acompanhar as criações ↗
            </a>
          </div>
        )}
      </div>
      <p className="small-copy">
        Para encomendar, envie o código da peça ou uma referência. Valores,
        disponibilidade, prazo e envio são confirmados durante a conversa.
      </p>
    </section>
  );
}
