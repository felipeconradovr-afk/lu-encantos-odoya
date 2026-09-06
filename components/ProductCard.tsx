'use client';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { money, isSafeImage, type Product } from '@/lib/catalog';
export function ProductImage({
  product,
  index = 0,
  className = '',
}: {
  product: Product;
  index?: number;
  className?: string;
}) {
  const src = product.images[index];
  return src && isSafeImage(src) ? (
    <img
      className={className}
      src={src}
      alt={`${product.name}${index ? ' — detalhe' : ''}`}
      width="700"
      height="840"
      loading="lazy"
    />
  ) : (
    <div
      className={`product-placeholder tone-${product.order % 4} ${className}`}
      aria-label={`Foto de ${product.name} ainda não fornecida`}
    >
      <span className="placeholder-overline">ENCANTOS ODOYÁ</span>
      <span className="placeholder-number">{product.code.slice(-3)}</span>
      <span className="placeholder-caption">
        {product.colors}
        <small>Foto da peça em breve</small>
      </span>
    </div>
  );
}
export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link
        href={`/produtos/${product.slug}`}
        className="product-image-link"
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <ProductImage product={product} />
        <span
          className={`status status-${product.status === 'Esgotado' ? 'sold' : 'normal'}`}
        >
          {product.status}
        </span>
        <span className="product-arrow" aria-hidden="true">
          <ArrowUpRight size={21} />
        </span>
      </Link>
      <div className="product-meta">
        <span>{product.category}</span>
        <span>{product.code}</span>
      </div>
      <h3>
        <Link href={`/produtos/${product.slug}`}>{product.name}</Link>
      </h3>
      <div className="product-bottom">
        <span>{money(product.price)}</span>
        <Link href={`/produtos/${product.slug}`}>Ver detalhes ↗</Link>
      </div>
    </article>
  );
}
