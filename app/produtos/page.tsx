import { Suspense } from 'react';
import { Catalog } from '@/components/Catalog';
export const metadata = { title: 'Catálogo de peças' };
export default function ProductsPage() {
  return (
    <section className="section catalog-page">
      <div className="page-intro">
        <p className="eyebrow">Fé, cuidado e identidade</p>
        <h1>
          Escolha seu <em>encanto.</em>
        </h1>
        <p>
          Peças artesanais para acompanhar a sua fé e a sua história. Explore o catálogo e converse com a Lu sobre a sua escolha.
        </p>
      </div>
      <Suspense fallback={<p>Preparando o catálogo…</p>}>
        <Catalog />
      </Suspense>
    </section>
  );
}
