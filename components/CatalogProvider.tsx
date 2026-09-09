'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {


  initialSettings,
  type Product,
  type Settings,
} from '@/lib/catalog';
import { fetchCatalogSnapshot } from '@/lib/catalog/queries';
import { isSupabaseConfigured } from '@/lib/supabase/env';
type Catalog = {
  products: Product[];
  categories: string[];
  settings: Settings;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  fromDatabase: boolean;
  catalogError: string;
  reloadCatalog: () => Promise<void>;
};
const Context = createContext<Catalog | null>(null);

// Produtos reais são carregados exclusivamente do Supabase.
// O estado inicial vazio impede a exibição de registros demonstrativos.
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [settings, setSettings] = useState(initialSettings);
  const [fromDatabase, setFromDatabase] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  async function reloadCatalog() {
    if (!isSupabaseConfigured()) return;
    try {
      const snapshot = await fetchCatalogSnapshot();
      if (snapshot.fromDatabase) {
        setProducts(snapshot.products);
        setCategories(snapshot.categories);
        setSettings(snapshot.settings);
        setFromDatabase(true);
        setCatalogError('');
      }
    } catch {
      setCatalogError(
        'Não foi possível atualizar o catálogo. Tente recarregar a página em instantes.',
      );
    }
  }
  useEffect(() => {
    // Sinaliza hidratação concluída (usado pelos testes e2e; invisível).
    document.documentElement.dataset.hydrated = 'true';
    if (!isSupabaseConfigured()) return;
    void fetchCatalogSnapshot()
      .then((snapshot) => {
        if (snapshot.fromDatabase) {
          setProducts(snapshot.products);
          setCategories(snapshot.categories);
          setSettings(snapshot.settings);
          setFromDatabase(true);
          setCatalogError('');
        }
      })
      .catch(() => {
        setCatalogError(
          'Não foi possível atualizar o catálogo. Tente recarregar a página em instantes.',
        );
      });
  }, []);
  return (
    <Context.Provider
      value={{
        products,
        categories,
        settings,
        setProducts,
        setCategories,
        setSettings,
        fromDatabase,
        catalogError,
        reloadCatalog,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useCatalog() {
  const context = useContext(Context);
  if (!context) throw new Error('Catálogo indisponível.');
  return context;
}
