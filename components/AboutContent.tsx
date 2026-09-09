'use client';
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
          a sua <em>identidade.</em>
        </h1>
      </div>
      <div className="story-section">
        <div className="story-image institutional-image">
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
            Fé e ancestralidade.
            <br />
            <em>Cuidado em cada detalhe.</em>
          </h2>
          <p>{settings.about}</p>
          <p>
            A Umbanda está no centro da identidade da Lu Encantos Odoyá, ao lado do respeito ao Candomblé e às tradições de matriz africana. Peças feitas à mão para acompanhar a sua espiritualidade e a sua conexão com o sagrado.
          </p>
          <a className="button" href="/encomendas">
            Vamos imaginar sua peça? ↗
          </a>
        </div>
      </div>
    </section>
  );
}