'use client';
import { useCatalog } from '@/components/CatalogProvider';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';
export function HomeSections() {
  const { products, categories, catalogError, fromDatabase } = useCatalog();
  const featured = products.filter(p => p.active && p.featured).sort((a,b) => a.order-b.order).slice(0,3);
  return <>
    <section className="identity-section section">
      <Reveal><p className="eyebrow">Nossa essência</p><h2>O que você carrega<br />também conta <em>de onde vem.</em></h2></Reveal>
      <Reveal className="identity-copy"><p>A Lu Encantos Odoyá cria peças artesanais ligadas à Umbanda e ao Candomblé. Um trabalho de cuidado com os detalhes e respeito à fé, à ancestralidade e à identidade de quem as escolhe.</p><p>Para acompanhar a sua relação com o sagrado, com a tradição e com os Orixás — do seu jeito, na sua história.</p><a className="text-link" href="/sobre">Conheça a Lu Encantos Odoyá ↗</a></Reveal>
    </section>
    <section className="section featured-section">
      <Reveal><div className="section-heading"><div><p className="eyebrow">Peças do nosso catálogo</p><h2>Detalhes para<br /><em>acompanhar a sua fé.</em></h2></div><a className="text-link" href="/produtos">Ver todas as peças ↗</a></div></Reveal>
      {catalogError && <output>{catalogError}</output>}
      {!fromDatabase && !catalogError && <output>Carregando as peças…</output>}
      <div className="product-grid featured-grid">{featured.map(p => <ProductCard key={p.code} product={p} />)}</div>
    </section>
    <section className="category-section"><Reveal><p className="eyebrow">Escolhas com identidade</p><h2>Uma peça.<br /><em>O seu jeito de sentir.</em></h2></Reveal><div className="category-links">{categories.map((name,i) => <a key={name} href={'/produtos?categoria='+encodeURIComponent(name)}><span>{String(i+1).padStart(2,'0')}</span><h3>{name}</h3><span>↗</span></a>)}</div></section>
    <section className="story-section"><Reveal className="story-image institutional-image"><img src="/images/atelier.webp" alt="Conchas, cristais e contas: detalhes de inspiração artesanal" width="1086" height="1448" loading="lazy" /><span>Matéria, tempo e cuidado.</span></Reveal><Reveal className="story-copy"><p className="eyebrow">Entre as mãos e a memória</p><h2>Feito à mão.<br />Com cuidado.<br /><em>Com respeito.</em></h2><p>Na escolha dos materiais e no encontro de cada detalhe, o fazer artesanal ganha forma. São peças que acolhem a expressão da sua espiritualidade, sem perder a delicadeza do cotidiano.</p><a className="text-link" href="/sobre">Nossa essência ↗</a></Reveal></section>
    <section className="custom-banner"><Reveal><p className="eyebrow">Encomendas personalizadas</p><h2>Uma peça feita para<br /><em>acompanhar a sua fé.</em></h2><p className="banner-copy">Compartilhe as cores, as medidas, os materiais e as referências que fazem sentido para você. A Lu conversa sobre cada detalhe e sobre as possibilidades de criação.</p><a className="button" href="/encomendas">Fazer uma encomenda ↗</a></Reveal></section>
    <section className="how-section"><Reveal><p className="eyebrow">Da escolha ao encontro</p><h2>Tudo começa com <em>uma conversa.</em></h2></Reveal><div className="steps">{[['01','Escolha sua peça','Conheça o catálogo ou compartilhe sua ideia para uma encomenda.'],['02','Converse com a Lu','Combine materiais, medidas, valor, prazo e envio pelo WhatsApp.'],['03','Acompanhe os detalhes','Com tudo combinado, converse com a Lu sobre os próximos passos do seu pedido.']].map(([num,title,description])=><Reveal key={num}><span>{num}</span><h3>{title}</h3><p>{description}</p></Reveal>)}</div><a className="text-link" href="/contato">Fale com a Lu ↗</a></section>
  </>;
}
