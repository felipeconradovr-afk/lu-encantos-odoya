'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useCatalog } from '@/components/CatalogProvider';
import { ProductImage, ProductCard } from '@/components/ProductCard';
import { money, productMessage, whatsappUrl } from '@/lib/catalog';
export function ProductDetail({ slug }: { slug: string }) {
  const { products, settings, fromDatabase, catalogError } = useCatalog();
  const [image, setImage] = useState(0);
  const [prevSlug, setPrevSlug] = useState(slug);
  if (prevSlug !== slug) {
    setPrevSlug(slug);
    setImage(0);
  }
  const product = products.find((p) => p.slug === slug && p.active);
  if (!fromDatabase) return <section className="section empty-state"><h1>Detalhes da peça</h1><output>{catalogError || "Carregando a peça…"}</output><a className="text-link" href="/produtos">Voltar ao catálogo</a></section>;
  if (!product)
    return (
      <section className="section empty-state">
        <h1>Peça não encontrada.</h1>
        <a className="button" href="/produtos">
          Voltar ao catálogo
        </a>
      </section>
    );
  return (
    <section className="section detail-page">
      <a href="/produtos" className="back-link">
        <ArrowLeft size={16} /> Voltar ao catálogo
      </a>
      <div className="product-detail">
        <div className="detail-gallery">
          <ProductImage product={product} index={image} />
          {product.images.length > 1 && (
            <div className="thumbnails">
              {product.images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-pressed={image === i}
                  onClick={() => setImage(i)}
                >
                  <ProductImage product={product} index={i} />
                </button>
              ))}
            </div>
          )}
          <p className="small-copy">
            {product.images.length
              ? 'Cada detalhe faz parte da peça.'
              : 'Foto real desta peça ainda não fornecida.'}
          </p>
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            {product.category} · {product.code}
          </p>
          <span className="inline-status">{product.status}</span>
          <h1>{product.name}</h1>
          <p className="detail-price">{money(product.price)}</p>
          <p>{product.description}</p>
          <dl className="specs">
            {[
              ['Materiais', product.materials],
              ['Tamanho', product.size],
              ['Cores', product.colors],
              ['Prazo', product.leadTime],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <a
            className="button order-button"
            target="_blank"
            rel="noopener noreferrer"
            href={whatsappUrl(productMessage(product), settings.whatsapp)}
          >
            {product.status === 'Esgotado'
              ? 'Quero uma peça semelhante'
              : 'Pedir pelo WhatsApp'}
            <ArrowUpRight size={18} />
          </a>
          <p className="small-copy">
            Você conversa diretamente com a Lu. Nenhum pagamento é feito por
            aqui.
          </p>
          <details>
            <summary>Cuidados e informações adicionais</summary>
            <p>{product.additional}</p>
            <p>
              Evite contato prolongado com água, perfumes e produtos de limpeza.
              Guarde a peça seca, separada de outros acessórios.
            </p>
          </details>
        </div>
      </div>
      <div className="related">
        <p className="eyebrow">Outros encontros possíveis</p>
        <h2>
          Talvez você também <em>ame.</em>
        </h2>
        <div className="product-grid">
          {products
            .filter((p) => p.active && p.code !== product.code)
            .slice(0, 3)
            .map((p) => (
              <ProductCard key={p.code} product={p} />
            ))}
        </div>
      </div>
    </section>
  );
}
