'use client';
import Link from 'next/link';
import { useCatalog } from '@/components/CatalogProvider';
export function AboutContent() {
  const { settings } = useCatalog();
  return (
    <section className="section about-page">
      <div className="page-intro">
        <p className="eyebrow">Lu by Encantos Odoyá</p>
        <h1>
          O feito à mão tem
          <br />
          outro <em>sentido.</em>
        </h1>
      </div>
      <div className="story-section">
        <div className="story-image">
          <img
            src="/images/atelier.webp"
            alt="Inspiração artesanal de cristais, conchas e miçangas"
            width="1086"
            height="1448"
          />
          <span>Cor. Textura. Intenção.</span>
        </div>
        <div className="story-copy">
          <h2>
            Pequenas peças.
            <br />
            <em>Muitas histórias.</em>
          </h2>
          <p>{settings.about}</p>
          <p>
            Colares, pulseiras, adornos e acessórios para diferentes momentos. O
            que conecta cada criação é o cuidado com os detalhes e a liberdade
            de escolher o que combina com você.
          </p>
          <Link className="button" href="/encomendas">
            Vamos imaginar sua peça? ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
