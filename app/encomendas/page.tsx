import { CustomOrderForm } from '@/components/CustomOrderForm';
export const metadata = { title: 'Encomendas personalizadas' };
export default function CustomPage() {
  return (
    <section className="section order-page">
      <div className="page-intro">
        <p className="eyebrow">Do seu jeito, desde o primeiro detalhe</p>
        <h1>
          Um encanto
          <br />
          que começa em <em>você.</em>
        </h1>
        <p>
          Escolha as cores, conte o que imaginou e deixe espaço para a criação.
          A sua próxima peça pode começar aqui.
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
