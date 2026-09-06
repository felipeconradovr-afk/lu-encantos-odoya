'use client';
import { useCatalog } from '@/components/CatalogProvider';
import { ProductCard, ProductImage } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';
export function HomeSections() {
  const { products } = useCatalog();
  const featured = products
    .filter((p) => p.active && p.featured)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);
  return (
    <>
      <section className="section">
        <Reveal>
          <div className="section-heading">
            <div>
              <p className="eyebrow">O encontro começa aqui</p>
              <h2>
                Qual encanto
                <br />
                combina com <em>você?</em>
              </h2>
            </div>
            <a className="text-link" href="/produtos">
              Ver todo o catálogo ↗
            </a>
          </div>
          <p className="demo-note">
            Catálogo demonstrativo. Modelos e valores ilustrativos; confirme os
            detalhes com a Lu. As fotos reais serão adicionadas.
          </p>
          <div className="product-grid featured-grid">
            {featured.map((p) => (
              <ProductCard key={p.code} product={p} />
            ))}
          </div>
        </Reveal>
      </section>
      <section className="category-section">
        <div>
          <p className="eyebrow">Um jeito de se expressar</p>
          <h2>
            Em cada detalhe,
            <br />
            uma <em>possibilidade.</em>
          </h2>
        </div>
        <div className="category-links">
          {[
            ['Colares', '01'],
            ['Pulseiras', '02'],
            ['Guias', '03'],
            ['Adereços', '04'],
            ['Acessórios', '05'],
          ].map(([name, num]) => (
            <a
              key={name}
              href={`/produtos?categoria=${encodeURIComponent(name)}`}
            >
              <span>{num}</span>
              <h3>{name}</h3>
              <span>↗</span>
            </a>
          ))}
        </div>
      </section>
      <section className="story-section">
        <Reveal className="story-image">
          <img
            src="/images/atelier.webp"
            alt="Inspiração de materiais: cristais, conchas e contas sobre tecido rosa"
            width="1086"
            height="1448"
            loading="lazy"
          />
          <span>O começo de cada encanto.</span>
        </Reveal>
        <Reveal className="story-copy">
          <p className="eyebrow">A beleza de fazer com as mãos</p>
          <h2>
            Tempo, cuidado.
            <br />E um pouco
            <br />
            de <em>alma.</em>
          </h2>
          <p>
            Escolher as cores. Combinar os materiais. Encontrar o detalhe que
            deixa uma peça com a sua cara. É desse encontro que nascem as
            criações da Lu.
          </p>
          <a className="text-link" href="/sobre">
            Conheça nosso universo ↗
          </a>
        </Reveal>
      </section>
      <section className="custom-banner">
        <p className="eyebrow">Uma ideia sua. Um encanto novo.</p>
        <h2>
          Não precisa existir.
          <br />A gente pode <em>criar.</em>
        </h2>
        <p>
          Uma cor que você ama, um presente especial, um detalhe só seu. Conte
          sua ideia e vamos conversar sobre as possibilidades.
        </p>
        <a className="button" href="/encomendas">
          Quero uma peça personalizada ↗
        </a>
        <span className="banner-word" aria-hidden="true">
          feito para você
        </span>
      </section>
      <section className="section">
        <Reveal>
          <div className="section-heading">
            <div>
              <p className="eyebrow">Detalhes que nos inspiram</p>
              <h2>
                Nosso pequeno <em>universo.</em>
              </h2>
            </div>
            <span className="small-copy">
              Cores, texturas e possibilidades.
            </span>
          </div>
          <div className="editorial-gallery">
            <figure>
              <img
                src="/images/atelier.webp"
                width="1086"
                height="1448"
                loading="lazy"
                alt="Estudo de materiais perolados para inspiração artesanal"
              />
              <figcaption>Texturas que encantam · imagem conceitual</figcaption>
            </figure>
            {products
              .filter((p) => p.active)
              .slice(3, 5)
              .map((p) => (
                <a key={p.code} href={`/produtos/${p.slug}`}>
                  <ProductImage product={p} />
                  <span>{p.name} ↗</span>
                </a>
              ))}
          </div>
        </Reveal>
      </section>
      <section className="how-section">
        <p className="eyebrow">Do primeiro olhar até você</p>
        <h2>
          Simples como uma <em>boa conversa.</em>
        </h2>
        <div className="steps">
          {[
            [
              '01',
              'Encontre seu encanto',
              'Explore as peças ou conte sua ideia para uma encomenda.',
            ],
            [
              '02',
              'Converse com a Lu',
              'Combine cores, medidas, valor, prazo e envio pelo WhatsApp.',
            ],
            [
              '03',
              'Acompanhe a criação',
              'Com tudo combinado, sua peça ganha forma com cuidado.',
            ],
          ].map(([num, title, description]) => (
            <div key={num}>
              <span>{num}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
        <a className="text-link" href="/contato">
          Ficou com alguma dúvida? Fale com a Lu ↗
        </a>
      </section>
    </>
  );
}
