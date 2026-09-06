import { Suspense } from 'react';
import { Catalog } from '@/components/Catalog';
export const metadata = { title: 'Catálogo de peças' };
export default function ProductsPage() {
  return (
    <section className="section catalog-page">
      <div className="page-intro">
        <p className="eyebrow">Peças com personalidade</p>
        <h1>
          Escolha seu <em>encanto.</em>
        </h1>
        <p>
          Um detalhe para o dia a dia. Um presente com intenção. Uma peça para
          chamar de sua.
        </p>
      </div>
      <p className="demo-note">
        Catálogo demonstrativo: modelos e preços ilustrativos. Fotos reais
        pendentes. Confirme as informações com a Lu.
      </p>
      <Suspense fallback={<p>Preparando o catálogo…</p>}>
        <Catalog />
      </Suspense>
    </section>
  );
}
