'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useCatalog } from '@/components/CatalogProvider';
import { ProductCard } from '@/components/ProductCard';
import { SelectField } from '@/components/SelectField';
import { filterProducts, statuses } from '@/lib/catalog';
type Registry = {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};
export function Catalog() {
  const { products, categories, fromDatabase, catalogError } = useCatalog();
  const params = useSearchParams();
  const [query, setQuery] = useState('');
  const categoriaParam = params.get('categoria') || 'Todas';
  const [category, setCategory] = useState(categoriaParam);
  const [status, setStatus] = useState('Todos');
  const [prevCategoriaParam, setPrevCategoriaParam] = useState(categoriaParam);
  if (prevCategoriaParam !== categoriaParam) {
    setPrevCategoriaParam(categoriaParam);
    setCategory(categoriaParam);
  }
  const filtered = filterProducts(products, query, category, status);
  useEffect(() => {
    const context = (document as Document & { modelContext?: Registry })
      .modelContext;
    if (!context) return;
    const lifecycle = new AbortController();
    const tool = {
      name: 'filter_catalog',
      description:
        'Filter the visible Lu catalog by search, category and availability. Does not place or send orders.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          category: { type: 'string', enum: ['Todas', ...categories] },
          status: { type: 'string', enum: ['Todos', ...statuses] },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true },
      execute: (input: unknown) => {
        if (!input || typeof input !== 'object')
          throw new Error('Filtros inválidos');
        const v = input as Record<string, unknown>;
        const q = v.query ?? '';
        const c = v.category ?? 'Todas';
        const s = v.status ?? 'Todos';
        if (
          typeof q !== 'string' ||
          q.length > 200 ||
          typeof c !== 'string' ||
          !['Todas', ...categories].includes(c) ||
          typeof s !== 'string' ||
          !['Todos', ...statuses].includes(s)
        )
          throw new Error('Filtros inválidos');
        setQuery(q);
        setCategory(c);
        setStatus(s);
        return {
          products: filterProducts(products, q, c, s).map((p) => ({
            code: p.code,
            name: p.name,
            slug: p.slug,
          })),
        };
      },
    };
    try {
      void Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {
      /* Optional browser feature. */
    }
    return () => lifecycle.abort();
  }, [products, categories]);
  return (
    <>
      {!fromDatabase && <output>{catalogError || "Carregando as peças…"}</output>}
      <div className="catalog-controls">
        <div className="search-field">
          <label htmlFor="busca">Encontre uma peça</label>
          <div>
            <Search size={19} />
            <input
              id="busca"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome, cor, material ou código"
              maxLength={200}
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Limpar busca">
                <X size={17} />
              </button>
            )}
          </div>
        </div>
        <SelectField
          id="categoria"
          label="Categoria"
          value={category}
          options={['Todas', ...categories]}
          onChange={setCategory}
        />
        <SelectField
          id="status"
          label="Disponibilidade"
          value={status}
          options={['Todos', ...statuses]}
          onChange={setStatus}
        />
      </div>
      <div className="results-bar">
        <p aria-live="polite">
          {filtered.length}{' '}
          {filtered.length === 1 ? 'peça encontrada' : 'peças encontradas'}
        </p>
        {(query || category !== 'Todas' || status !== 'Todos') && (
          <button
            className="text-link"
            onClick={() => {
              setQuery('');
              setCategory('Todas');
              setStatus('Todos');
            }}
          >
            Limpar filtros
          </button>
        )}
      </div>
      {!fromDatabase ? null : filtered.length ? (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard key={p.code} product={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>
            Ainda não encontramos
            <br />
            esse encanto.
          </h2>
          <p>
            Tente outra cor, categoria ou palavra. Você também pode encomendar
            uma peça personalizada.
          </p>
          <a href="/encomendas" className="button">
            Criar minha encomenda ↗
          </a>
        </div>
      )}
    </>
  );
}
