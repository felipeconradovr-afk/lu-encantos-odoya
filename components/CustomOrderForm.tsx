'use client';
import { useState } from 'react';
import { SelectField } from '@/components/SelectField';
import { useCatalog } from '@/components/CatalogProvider';
import { customMessage, whatsappUrl, type CustomOrder } from '@/lib/catalog';
export function CustomOrderForm() {
  const { settings } = useCatalog();
  const [order, setOrder] = useState<CustomOrder>({
    type: 'Colar',
    colors: '',
    materials: '',
    size: '',
    purpose: '',
    notes: '',
  });
  const [ready, setReady] = useState(false);
  const update = (key: keyof CustomOrder, value: string) => {
    setReady(false);
    setOrder({ ...order, [key]: value });
  };
  return (
    <form
      className="custom-form"
      onSubmit={(e) => {
        e.preventDefault();
        setReady(true);
        window.open(
          whatsappUrl(customMessage(order), settings.whatsapp),
          '_blank',
          'noopener,noreferrer',
        );
      }}
    >
      <div className="form-heading">
        <span>01 — O começo da sua peça</span>
        <h2>
          Conte sua <em>ideia.</em>
        </h2>
      </div>
      <div className="form-grid">
        <SelectField
          id="tipo-peca"
          label="Que tipo de peça você imagina?"
          options={[
            'Colar',
            'Pulseira',
            'Guia',
            'Adereço para cabelo',
            'Adorno para roupa ou chapéu',
            'Acessório para carro',
            'Outra peça',
          ]}
          value={order.type}
          onChange={(v) => update('type', v)}
        />
        <div className="field">
          <label htmlFor="cores">Quais cores você ama?</label>
          <input
            id="cores"
            placeholder="Ex.: azul-claro e branco"
            value={order.colors}
            onChange={(e) => update('colors', e.target.value)}
            maxLength={200}
          />
        </div>
        <div className="field">
          <label htmlFor="materiais">Materiais que tem em mente</label>
          <input
            id="materiais"
            placeholder="Miçangas, cristais, muranos…"
            value={order.materials}
            onChange={(e) => update('materials', e.target.value)}
            maxLength={200}
          />
        </div>
        <div className="field">
          <label htmlFor="medida">Tamanho ou medida</label>
          <input
            id="medida"
            placeholder="Pode deixar para combinar"
            value={order.size}
            onChange={(e) => update('size', e.target.value)}
            maxLength={100}
          />
        </div>
        <div className="field full-width">
          <label htmlFor="finalidade">
            É para você, para presentear ou para uma ocasião?
          </label>
          <input
            id="finalidade"
            value={order.purpose}
            onChange={(e) => update('purpose', e.target.value)}
            placeholder="Conte um pouquinho"
            maxLength={200}
          />
        </div>
        <div className="field full-width">
          <label htmlFor="observacoes">Tem algum detalhe especial?</label>
          <textarea
            id="observacoes"
            rows={4}
            placeholder="Estilo, referências, ocasião…"
            value={order.notes}
            onChange={(e) => update('notes', e.target.value)}
            maxLength={1200}
          />
        </div>
      </div>
      <p className="small-copy">
        Não precisa ter tudo decidido. A Lu ajuda você a escolher. Fotos de
        referência podem ser enviadas na conversa.
      </p>
      <button className="button" type="submit">
        Conversar sobre minha encomenda ↗
      </button>
      {ready && (
        <output className="form-feedback">
          Sua mensagem está pronta.{' '}
          <a
            className="text-link"
            href={whatsappUrl(customMessage(order), settings.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir no WhatsApp ↗
          </a>
          <p>
            O pedido só é confirmado depois de combinar os detalhes com a Lu.
          </p>
        </output>
      )}
    </form>
  );
}
