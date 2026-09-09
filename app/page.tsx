import { HomeSections } from '@/components/HomeSections';
export default function Home() {
  return <>
    <section className="hero faith-hero">
      <div className="hero-copy">
        <p className="eyebrow">Feito à mão · Umbanda e ancestralidade</p>
        <h1 aria-label="Fé, axé e identidade em cada detalhe.">
          <span className="title-line" aria-hidden="true"><span><span className="hero-word">Fé,</span> <span className="hero-word">axé</span></span></span>
          <span className="title-line" aria-hidden="true"><span>e <em>identidade.</em></span></span>
          <span className="hero-title-end" aria-hidden="true">Em cada detalhe.</span>
        </h1>
        <p>Peças feitas à mão para acompanhar a sua fé, a sua ancestralidade e a sua conexão com o sagrado.</p>
        <div className="actions"><a className="button" href="/produtos">Conhecer as peças ↗</a><a className="text-link" href="/encomendas">Fazer uma encomenda ↗</a></div>
        <span className="hero-footnote">LU ENCANTOS ODOYÁ · CUIDADO EM CADA CRIAÇÃO</span>
      </div>
      <div className="hero-art">
        <div className="hero-image-mask"><img src="/images/mare-institucional.webp" alt="Água sobre areia clara, concha e contas peroladas junto ao tecido e à linha de trabalho artesanal" width="1086" height="1448" fetchPriority="high" /></div>
        <span className="art-label">Da delicadeza, nasce o detalhe.</span>
        <span className="image-index">01 / MATÉRIA & MEMÓRIA</span>
      </div>
    </section>
    <div className="ribbon"><span>Fé</span><span>Feito à mão</span><span>Ancestralidade</span><span>Axé</span></div>
    <HomeSections />
  </>;
}
