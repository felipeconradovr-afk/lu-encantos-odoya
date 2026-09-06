import { HomeSections } from '@/components/HomeSections';
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Pequenos detalhes. Grandes significados.</p>
          <h1>
            Há um encanto
            <br />
            em ser <em>você.</em>
          </h1>
          <p>
            Miçangas, cristais e um jeito muito seu de ver o mundo. Peças feitas
            à mão, para acompanhar suas histórias.
          </p>
          <div className="actions">
            <a className="button" href="/produtos">
              Explorar as peças ↗
            </a>
            <a className="text-link" href="/encomendas">
              Criar minha encomenda ↗
            </a>
          </div>
          <span className="hero-footnote">
            LU BY ENCANTOS ODOYÁ · FEITO À MÃO
          </span>
        </div>
        <div className="hero-art">
          <img
            src="/images/atelier.webp"
            alt="Composição artística de conchas peroladas, cristais e miçangas lilás"
            width="1086"
            height="1448"
          />
          <span className="art-label">um universo de possibilidades</span>
          <span className="orbit" aria-hidden="true" />
        </div>
      </section>
      <div className="ribbon">
        Feito à mão <span>✧</span> Feito com significado <span>✧</span> Feito
        para você <span>✧</span> Lu by Encantos Odoyá
      </div>
      <HomeSections />
    </>
  );
}