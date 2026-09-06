import Link from 'next/link';
export default function NotFound() {
  return (
    <section className="section empty-state">
      <p className="eyebrow">404</p>
      <h1>
        Esse caminho
        <br />
        ainda não <em>existe.</em>
      </h1>
      <p>Mas há muitos encantos esperando por você.</p>
      <Link className="button" href="/produtos">
        Conhecer o catálogo ↗
      </Link>
    </section>
  );
}
