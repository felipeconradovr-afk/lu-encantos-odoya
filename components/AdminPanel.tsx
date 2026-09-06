'use client';
import { useMemo, useState, type SyntheticEvent } from 'react';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  LogOut,
  Copy,
  Search,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useCatalog } from '@/components/CatalogProvider';
import { SelectField } from '@/components/SelectField';
import { ProductImage } from '@/components/ProductCard';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminPasswordForm } from '@/components/AdminPasswordForm';
import { statuses, slugify, money, type Product, type Settings } from '@/lib/catalog';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { signOutAdmin, useAdminSession } from '@/lib/auth/session';
import {
  deleteProduct,
  duplicateProduct,
  fetchAdminCatalog,
  removeProductImage,
  reorderProducts,
  saveProduct,
  setPrimaryImage,
  setProductActive,
  uploadProductImages,
  validateProductInput,
  type AdminCategory,
  type ProductInput,
} from '@/lib/admin/products';
import {
  createCategory,
  deleteCategory,
  renameCategory,
  reorderCategories,
  setCategoryActive,
} from '@/lib/admin/categories';
import { fetchSiteSettings, saveSiteSettings } from '@/lib/admin/settings';

type EditingProduct = Product & { dbId?: string; categoryId: string | null };

const blankProduct = (
  code: string,
  category: string,
  categoryId: string | null,
  order: number,
): EditingProduct => ({
  dbId: undefined,
  code,
  slug: '',
  name: '',
  category,
  categoryId,
  price: null,
  description: '',
  materials: '',
  size: 'A combinar',
  colors: '',
  status: 'Sob encomenda',
  leadTime: 'Prazo a combinar',
  images: [],
  featured: false,
  active: true,
  order,
  additional: 'Peça artesanal. Confirme os detalhes com a Lu.',
});

const ADMIN_USER = 'luencantosodoya';

export function AdminPanel() {
  const { reloadCatalog } = useCatalog();
  const { user, loading: sessionLoading, error: sessionError, refresh } = useAdminSession();
  const [products, setProducts] = useState<(Product & { dbId: string })[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [settings, setSettings] = useState<Settings>({
    whatsapp: '5548991893262',
    instagram: '',
    headline: 'Há um encanto em ser você.',
    about: '',
  });
  const [boot, setBoot] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [bootError, setBootError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [editing, setEditing] = useState<EditingProduct | null>(null);
  const [originalCode, setOriginalCode] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [categoryDraft, setCategoryDraft] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [loggedOut, setLoggedOut] = useState(false);

  const configured = isSupabaseConfigured();
  const loggedIn = Boolean(user) && !loggedOut;

  async function loadAll() {
    setBoot('loading');
    setBootError('');
    try {
      const { products: rows, categories: cats } = await fetchAdminCatalog();
      setProducts(rows);
      setCategories(cats);
      const map = await fetchSiteSettings();
      setSettings((prev) => ({
        ...prev,
        whatsapp: map.get('whatsapp') || prev.whatsapp,
        instagram: map.get('instagram') || '',
        about: map.get('about') || prev.about,
      }));
      setBoot('ready');
    } catch (e) {
      setBoot('error');
      setBootError(e instanceof Error ? e.message : 'Não foi possível carregar o painel.');
    }
  }

  const [bootTrigger, setBootTrigger] = useState({ loggedIn: false, configured });
  if (bootTrigger.loggedIn !== loggedIn || bootTrigger.configured !== configured) {
    setBootTrigger({ loggedIn, configured });
    if (loggedIn && configured && boot === 'idle') {
      void loadAll();
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...products]
      .sort((a, b) => a.order - b.order)
      .filter(
        (p) =>
          (statusFilter === 'Todos' || p.status === statusFilter) &&
          (!q ||
            `${p.name} ${p.code} ${p.materials} ${p.colors}`.toLowerCase().includes(q)),
      );
  }, [products, query, statusFilter]);

  const counts = useMemo(() => {
    const by = (s: Product['status']) => products.filter((p) => p.status === s).length;
    return {
      total: products.length,
      disponiveis: by('Disponível'),
      encomenda: by('Sob encomenda'),
      esgotados: by('Esgotado'),
      unicas: by('Peça única'),
      destaques: products.filter((p) => p.featured).length,
    };
  }, [products]);

  function openEditor(p: (Product & { dbId?: string }) | null) {
    const next =
      Math.max(0, ...products.map((x) => Number(x.code.replace('LU-', '')) || 0)) + 1;
    setOriginalCode(p?.code ?? null);
    if (p) {
      const cat = categories.find((c) => c.name === p.category);
      setEditing({ ...p, images: [...p.images], categoryId: cat?.id ?? null });
    } else {
      const first = categories[0];
      setEditing(
        blankProduct(
          `LU-${String(next).padStart(3, '0')}`,
          first?.name || 'Colares',
          first?.id ?? null,
          Math.max(0, ...products.map((x) => x.order)) + 1,
        ),
      );
    }
    setError('');
    setNotice('');
    setTab('produtos');
  }

  async function handleSave(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing || saving) return;
    const input: ProductInput = {
      code: editing.code.trim().toUpperCase(),
      name: editing.name.trim(),
      slug: slugify(editing.slug || editing.name),
      description: editing.description,
      price: editing.price,
      categoryId: editing.categoryId,
      materials: editing.materials,
      size: editing.size,
      colors: editing.colors,
      status: editing.status,
      productionTime: editing.leadTime,
      featured: editing.featured,
      active: editing.active,
      sortOrder: editing.order,
    };
    const valid = validateProductInput(input);
    if ('error' in valid && valid.error) {
      setError(valid.error as string);
      return;
    }
    if ('code' in valid && valid.code) input.code = valid.code as string;
    if ('slug' in valid && valid.slug) input.slug = valid.slug as string;
    if (
      products.some(
        (x) =>
          x.code !== originalCode && (x.code === input.code || x.slug === input.slug),
      )
    ) {
      setError('Já existe uma peça com esse código ou endereço.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveProduct(input, editing.dbId);
      setEditing(null);
      setNotice(
        editing.dbId ? 'Produto atualizado e publicado.' : 'Produto criado e publicado.',
      );
      await loadAll();
      await reloadCatalog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || !editing?.dbId) {
      setError('Salve a peça antes de enviar fotos.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const urls = await uploadProductImages(editing.dbId, Array.from(files));
      setEditing({ ...editing, images: [...editing.images, ...urls] });
      setNotice('Upload concluído.');
      await reloadCatalog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar imagem.');
    } finally {
      setUploading(false);
    }
  }

  async function refreshAfterMutation(message: string) {
    setNotice(message);
    await loadAll();
    await reloadCatalog();
  }

  if (sessionLoading) {
    return (
      <section className="section admin-login">
        <p className="eyebrow">Área da Lu</p>
        <h1>
          Um cantinho
          <br />
          para seus <em>encantos.</em>
        </h1>
        <div className="login-box">
          <h2>Preparando…</h2>
          <p>Verificando sua sessão com segurança.</p>
        </div>
      </section>
    );
  }

  if (!configured) {
    return (
      <section className="section admin-login">
        <p className="eyebrow">Área da Lu</p>
        <h1>
          Falta conectar
          <br />
          o <em>banco.</em>
        </h1>
        <div className="login-box">
          <h2>Supabase não configurado</h2>
          <p>
            Defina <code>NEXT_PUBLIC_SUPABASE_URL</code> e{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no{' '}
            <code>.env.local</code> e rode <code>supabase/schema.sql</code> +{' '}
            <code>supabase/seed.sql</code> no projeto. Nenhum dado foi alterado.
          </p>
          {sessionError && <p role="alert" className="form-error">{sessionError}</p>}
        </div>
      </section>
    );
  }

  if (!loggedIn) {
    return (
      <AdminLogin
        onLoggedIn={() => {
          setLoggedOut(false);
          setBoot('idle');
          void refresh();
        }}
      />
    );
  }

  if (boot === 'loading' || boot === 'idle') {
    return (
      <section className="section admin-login">
        <p className="eyebrow">Área da Lu</p>
        <h1>
          Seu <em>ateliê.</em>
        </h1>
        <div className="login-box">
          <h2>Carregando produtos…</h2>
          <p>Buscando tudo direto do banco, com carinho.</p>
        </div>
      </section>
    );
  }

  if (boot === 'error') {
    return (
      <section className="section admin-login">
        <p className="eyebrow">Área da Lu</p>
        <h1>
          Algo não
          <br />
          carregou <em>ainda.</em>
        </h1>
        <div className="login-box">
          <h2>Tentar de novo</h2>
          <p role="alert">{bootError}</p>
          <button className="button" onClick={() => void loadAll()}>
            Recarregar painel ↻
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="section admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Área da Lu</p>
          <h1>
            Seu <em>ateliê.</em>
          </h1>
        </div>
        <div className="actions">
          <a className="text-link" href="/produtos">
            Ver catálogo ↗
          </a>
          <button
            className="icon-button"
            onClick={() => {
              setLoggedOut(true);
              void signOutAdmin().then(() =>
                fetch('/api/admin/logout', { method: 'POST' }).catch(() => {}),
              );
            }}
            aria-label="Sair do painel"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
      <p className="demo-note">
        Painel real · tudo que você salvar aqui aparece no site. Conectada como{' '}
        {user?.email?.split('@')[0] || ADMIN_USER}.
      </p>
      {notice && <output className="form-feedback">{notice}</output>}
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(String(v));
          setNotice('');
        }}
      >
        <TabsList className="admin-tabs">
          {[
            ['dashboard', 'Visão geral'],
            ['produtos', 'Produtos'],
            ['categorias', 'Categorias'],
            ['conteudo', 'Conteúdo'],
            ['config', 'Configurações'],
          ].map(([value, label]) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="dashboard">
          <div className="admin-stats">
            {[
              ['Peças no catálogo', String(counts.total)],
              ['Disponíveis', String(counts.disponiveis)],
              ['Sob encomenda', String(counts.encomenda)],
              ['Peças únicas', String(counts.unicas)],
              ['Esgotados', String(counts.esgotados)],
              ['Em destaque', String(counts.destaques)],
            ].map(([label, value]) => (
              <div key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="admin-welcome">
            <h2>
              Seu catálogo,
              <br />
              do seu <em>jeito.</em>
            </h2>
            <p>
              Adicione uma peça, organize a vitrine e cuide do site direto do
              celular.
            </p>
            <button className="button" onClick={() => openEditor(null)}>
              <Plus size={18} />
              Adicionar uma peça
            </button>
          </div>
        </TabsContent>
        <TabsContent value="produtos">
          {editing ? (
            <form className="product-editor" onSubmit={handleSave}>
              <div className="section-heading">
                <h2>{originalCode ? 'Editar peça' : 'Uma nova peça'}</h2>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => setEditing(null)}
                >
                  Voltar à lista
                </button>
              </div>
              <div className="form-grid">
                {(
                  [
                    ['name', 'Nome da peça'],
                    ['code', 'Código'],
                    ['slug', 'Endereço da peça (slug)'],
                    ['materials', 'Materiais'],
                    ['size', 'Tamanho'],
                    ['colors', 'Cores'],
                    ['leadTime', 'Prazo de produção'],
                  ] as const
                ).map(([key, label]) => (
                  <div className="field" key={key}>
                    <label htmlFor={`edit-${key}`}>{label}</label>
                    <input
                      id={`edit-${key}`}
                      required={key === 'name' || key === 'code'}
                      maxLength={200}
                      value={editing[key]}
                      onChange={(e) =>
                        setEditing({ ...editing, [key]: e.target.value })
                      }
                    />
                  </div>
                ))}
                <div className="field">
                  <label htmlFor="edit-category">Categoria</label>
                  <select
                    id="edit-category"
                    className="select-control"
                    value={editing.categoryId || ''}
                    onChange={(e) => {
                      const cat = categories.find((c) => c.id === e.target.value);
                      setEditing({
                        ...editing,
                        categoryId: cat?.id ?? null,
                        category: cat?.name || '',
                      });
                    }}
                  >
                    <option value="">Sem categoria</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <SelectField
                  id="edit-status"
                  label="Disponibilidade"
                  value={editing.status}
                  options={statuses}
                  onChange={(status) =>
                    setEditing({ ...editing, status: status as Product['status'] })
                  }
                />
                <div className="field">
                  <label htmlFor="edit-price">Preço (R$) · vazio = sob consulta</label>
                  <input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editing.price ?? ''}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        price: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="edit-order">Ordem na vitrine</label>
                  <input
                    id="edit-order"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={editing.order}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        order: Math.max(1, Number(e.target.value)),
                      })
                    }
                  />
                </div>
                {(
                  [
                    ['description', 'Descrição'],
                  ] as const
                ).map(([key, label]) => (
                  <div className="field full-width" key={key}>
                    <label htmlFor={`edit-${key}`}>{label}</label>
                    <textarea
                      id={`edit-${key}`}
                      rows={3}
                      maxLength={2000}
                      value={editing[key]}
                      onChange={(e) =>
                        setEditing({ ...editing, [key]: e.target.value })
                      }
                    />
                  </div>
                ))}
                <div className="switch-field">
                  <label htmlFor="edit-active">Peça ativa</label>
                  <Switch
                    id="edit-active"
                    checked={editing.active}
                    onCheckedChange={(active) => setEditing({ ...editing, active })}
                  />
                </div>
                <div className="switch-field">
                  <label htmlFor="edit-featured">Destaque na Home</label>
                  <Switch
                    id="edit-featured"
                    checked={editing.featured}
                    onCheckedChange={(featured) =>
                      setEditing({ ...editing, featured })
                    }
                  />
                </div>
                <div className="field full-width">
                  <label htmlFor="edit-images">
                    Fotos da peça · até 6 fotos, 3 MB cada
                  </label>
                  {!editing.dbId && (
                    <p className="small-copy">
                      Salve a peça primeiro; depois volte aqui para enviar as fotos.
                    </p>
                  )}
                  <input
                    id="edit-images"
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    disabled={!editing.dbId || uploading}
                    onChange={(e) => void handleUpload(e.target.files)}
                  />
                  {uploading && <p className="small-copy">Enviando imagem…</p>}
                  <div className="upload-previews">
                    {editing.images.map((src, i) => (
                      <div key={`${src}-${i}`}>
                        <img
                          src={src}
                          width="120"
                          height="140"
                          alt={`Foto ${i + 1} da peça`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!editing.dbId) return;
                            setBusyId(src);
                            removeProductImage(editing.dbId, src)
                              .then(() => {
                                setEditing({
                                  ...editing,
                                  images: editing.images.filter((_, n) => n !== i),
                                });
                                setNotice('Foto removida.');
                                void reloadCatalog();
                              })
                              .catch((err: Error) => setError(err.message))
                              .finally(() => setBusyId(''));
                          }}
                        >
                          Remover foto {i + 1}
                        </button>
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!editing.dbId) return;
                              setPrimaryImage(editing.dbId, src)
                                .then(() => {
                                  const next = [...editing.images];
                                  const [picked] = next.splice(i, 1);
                                  next.unshift(picked);
                                  setEditing({ ...editing, images: next });
                                  setNotice('Imagem principal atualizada.');
                                  void reloadCatalog();
                                })
                                .catch((err: Error) => setError(err.message));
                            }}
                          >
                            {busyId === src ? 'Aguarde…' : 'Tornar principal'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <button className="button" type="submit" disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar e publicar'}
              </button>
            </form>
          ) : (
            <>
              <div className="list-heading">
                <h2>Suas peças</h2>
                <button className="button" onClick={() => openEditor(null)}>
                  <Plus size={17} />
                  Nova peça
                </button>
              </div>
              <div className="catalog-controls">
                <div className="search-field">
                  <label htmlFor="admin-busca">Buscar peça</label>
                  <div>
                    <Search size={19} />
                    <input
                      id="admin-busca"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Nome, código, cor ou material"
                      maxLength={200}
                    />
                  </div>
                </div>
                <SelectField
                  id="admin-status"
                  label="Disponibilidade"
                  value={statusFilter}
                  options={['Todos', ...statuses]}
                  onChange={setStatusFilter}
                />
              </div>
              <div className="admin-products">
                {filtered.map((p, i) => (
                  <article className="admin-product" key={p.dbId}>
                    <ProductImage product={p} />
                    <div className="admin-product-info">
                      <span className="small-copy">
                        {p.code} · {p.category || 'Sem categoria'}
                      </span>
                      <h3>{p.name}</h3>
                      <span>
                        {money(p.price)} · {p.status}
                        {p.featured ? ' · destaque' : ''}
                        {!p.active ? ' · pausada' : ''}
                      </span>
                    </div>
                    <div className="admin-product-actions">
                      <Switch
                        aria-label={`Ativar ${p.name}`}
                        checked={p.active}
                        onCheckedChange={(active) => {
                          setBusyId(p.dbId);
                          setProductActive(p.dbId, active)
                            .then(() => refreshAfterMutation(
                              active ? 'Produto ativado no site.' : 'Produto pausado no site.',
                            ))
                            .catch((err: Error) => setError(err.message))
                            .finally(() => setBusyId(''));
                        }}
                      />
                      <button
                        className="icon-button"
                        disabled={i === 0}
                        aria-label={`Mover ${p.code} para cima`}
                        onClick={() => {
                          const ids = [...products]
                            .sort((a, b) => a.order - b.order)
                            .map((x) => x.dbId);
                          const pos = ids.indexOf(p.dbId);
                          if (pos <= 0) return;
                          [ids[pos - 1], ids[pos]] = [ids[pos], ids[pos - 1]];
                          reorderProducts(ids)
                            .then(() => refreshAfterMutation('Ordem atualizada.'))
                            .catch((err: Error) => setError(err.message));
                        }}
                      >
                        <ArrowUp size={17} />
                      </button>
                      <button
                        className="icon-button"
                        disabled={i === products.length - 1}
                        aria-label={`Mover ${p.code} para baixo`}
                        onClick={() => {
                          const ids = [...products]
                            .sort((a, b) => a.order - b.order)
                            .map((x) => x.dbId);
                          const pos = ids.indexOf(p.dbId);
                          if (pos < 0 || pos >= ids.length - 1) return;
                          [ids[pos], ids[pos + 1]] = [ids[pos + 1], ids[pos]];
                          reorderProducts(ids)
                            .then(() => refreshAfterMutation('Ordem atualizada.'))
                            .catch((err: Error) => setError(err.message));
                        }}
                      >
                        <ArrowDown size={17} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Editar ${p.code}`}
                        onClick={() => openEditor(p)}
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Duplicar ${p.code}`}
                        onClick={() => {
                          setBusyId(p.dbId);
                          duplicateProduct(p.dbId)
                            .then((copy) => {
                              setNotice(`Cópia ${copy.code} criada como rascunho pausado.`);
                              return loadAll().then(() => reloadCatalog());
                            })
                            .catch((err: Error) => setError(err.message))
                            .finally(() => setBusyId(''));
                        }}
                      >
                        <Copy size={17} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Excluir ${p.code}`}
                        onClick={() => setDeleting(p.dbId)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {busyId ? <p className="small-copy">Atualizando…</p> : null}
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
            </>
          )}
        </TabsContent>
        <TabsContent value="categorias">
          <div className="admin-narrow">
            <h2>
              Cada peça no
              <br />
              seu <em>lugar.</em>
            </h2>
            <form
              className="category-form"
              onSubmit={(e) => {
                e.preventDefault();
                createCategory(categoryDraft)
                  .then(() => {
                    setCategoryDraft('');
                    return refreshAfterMutation('Categoria criada.');
                  })
                  .catch((err: Error) => setError(err.message));
              }}
            >
              <label htmlFor="nova-categoria">Nova categoria</label>
              <div>
                <input
                  id="nova-categoria"
                  required
                  maxLength={60}
                  value={categoryDraft}
                  onChange={(e) => setCategoryDraft(e.target.value)}
                  placeholder="Ex.: Flores para cabelo"
                />
                <button className="button" type="submit">
                  Adicionar
                </button>
              </div>
            </form>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            {[...categories]
              .sort((a, b) => a.position - b.position)
              .map((c, i) => (
                <div className="category-admin-row" key={c.id}>
                  {renamingId === c.id ? (
                    <form
                      className="category-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        renameCategory(c.id, renameDraft)
                          .then(() => {
                            setRenamingId(null);
                            return refreshAfterMutation('Categoria renomeada.');
                          })
                          .catch((err: Error) => setError(err.message));
                      }}
                    >
                      <input
                        aria-label={`Novo nome para ${c.name}`}
                        value={renameDraft}
                        maxLength={60}
                        onChange={(e) => setRenameDraft(e.target.value)}
                      />
                      <button className="button" type="submit">
                        Salvar
                      </button>
                    </form>
                  ) : (
                    <>
                      <span>{c.name}</span>
                      <span>{c.count} peças</span>
                      <Switch
                        aria-label={`Ativar categoria ${c.name}`}
                        checked={c.active}
                        onCheckedChange={(active) =>
                          setCategoryActive(c.id, active)
                            .then(() => refreshAfterMutation('Categoria atualizada.'))
                            .catch((err: Error) => setError(err.message))
                        }
                      />
                      <button
                        className="icon-button"
                        disabled={i === 0}
                        aria-label={`Mover categoria ${c.name} para cima`}
                        onClick={() => {
                          const ids = [...categories]
                            .sort((a, b) => a.position - b.position)
                            .map((x) => x.id);
                          const pos = ids.indexOf(c.id);
                          if (pos <= 0) return;
                          [ids[pos - 1], ids[pos]] = [ids[pos], ids[pos - 1]];
                          reorderCategories(ids)
                            .then(() => refreshAfterMutation('Ordem atualizada.'))
                            .catch((err: Error) => setError(err.message));
                        }}
                      >
                        <ArrowUp size={17} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Renomear categoria ${c.name}`}
                        onClick={() => {
                          setRenamingId(c.id);
                          setRenameDraft(c.name);
                        }}
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Remover categoria ${c.name}`}
                        disabled={c.count > 0}
                        onClick={() =>
                          deleteCategory(c.id)
                            .then(() => refreshAfterMutation('Categoria removida.'))
                            .catch((err: Error) => setError(err.message))
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            <p className="small-copy">
              Para remover uma categoria em uso, primeiro mova suas peças para
              outra.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="conteudo">
          <form
            className="admin-narrow"
            onSubmit={(e) => {
              e.preventDefault();
              saveSiteSettings({
                whatsapp: settings.whatsapp,
                instagram: settings.instagram,
                about: settings.about,
              })
                .then(() => refreshAfterMutation('Texto atualizado no site.'))
                .catch((err: Error) => setError(err.message));
            }}
          >
            <h2>
              As palavras
              <br />
              da sua <em>marca.</em>
            </h2>
            <div className="field">
              <label htmlFor="sobre-marca">Texto da página Sobre</label>
              <textarea
                id="sobre-marca"
                required
                rows={9}
                maxLength={3000}
                value={settings.about}
                onChange={(e) => setSettings({ ...settings, about: e.target.value })}
              />
            </div>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button className="button" type="submit">
              Salvar texto
            </button>
          </form>
        </TabsContent>
        <TabsContent value="config">
          <form
            className="admin-narrow"
            onSubmit={(e) => {
              e.preventDefault();
              saveSiteSettings({
                whatsapp: settings.whatsapp,
                instagram: settings.instagram,
                about: settings.about,
              })
                .then((number) => {
                  setSettings({ ...settings, whatsapp: number });
                  return refreshAfterMutation('Contatos atualizados no site.');
                })
                .catch((err: Error) => setError(err.message));
            }}
          >
            <h2>
              Vamos manter
              <br />o <em>contato.</em>
            </h2>
            <div className="field">
              <label htmlFor="config-whatsapp">WhatsApp com país e DDD</label>
              <input
                id="config-whatsapp"
                required
                inputMode="tel"
                maxLength={20}
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="config-instagram">Instagram oficial (opcional)</label>
              <input
                id="config-instagram"
                type="url"
                placeholder="https://www.instagram.com/perfil/"
                value={settings.instagram}
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
              />
            </div>
            <p className="small-copy">
              O link social só aparece quando o perfil oficial for informado.
            </p>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button className="button" type="submit">
              Salvar contatos
            </button>
          </form>
          <AdminPasswordForm username={ADMIN_USER} />
        </TabsContent>
      </Tabs>
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogTitle>Excluir esta peça do site?</AlertDialogTitle>
          <AlertDialogDescription>
            A peça sai do catálogo e as fotos são removidas. Essa ação não pode
            ser desfeita.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const id = deleting;
                setDeleting(null);
                if (!id) return;
                deleteProduct(id)
                  .then(() => refreshAfterMutation('Peça excluída do site.'))
                  .catch((err: Error) => setError(err.message));
              }}
            >
              Excluir peça
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
