import { CustomOrderForm } from '@/components/CustomOrderForm';
export const metadata = { title: 'Encomendas personalizadas' };
export default function CustomPage() {
  return (
    <section className="section order-page">
      <div className="page-intro">
        <p className="eyebrow">Do seu jeito, desde o primeiro detalhe</p>
        <h1>
          Uma peça
          <br />
          para acompanhar <em>sua fé.</em>
        </h1>
        <p>
          Compartilhe as cores, medidas, materiais e referências que fazem sentido para você. Cada encomenda é conversada com a Lu, respeitando os detalhes que você fornecer.
        </p>
      </div>
      <div className="order-layout">
        <aside>
          <img
            src="/images/atelier.webp"
            alt="Conchas e miçangas, inspiração para uma criação personalizada"
            width="1086"
            height="1448"
            loading="lazy"
          />
          <h3>
            Cada escolha
            <br />
            conta uma história.
          </h3>
          <p>
            Materiais, medidas, valor, produção e entrega são combinados com a
            Lu antes de começar.
          </p>
        </aside>
        <CustomOrderForm />
      </div>
    </section>
  );
}
