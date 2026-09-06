// Tipos espelhando supabase/schema.sql. Gerado à mão para não exigir
// acesso ao projeto remoto durante o build local.
export type ProductStatus =
  | 'Disponível'
  | 'Sob encomenda'
  | 'Peça única'
  | 'Esgotado';

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryInsert = Omit<CategoryRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProductRow = {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string;
  price: number | null;
  category_id: string | null;
  materials: string;
  size: string;
  colors: string;
  status: ProductStatus;
  production_time: string;
  featured: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductInsert = Omit<ProductRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  storage_path: string;
  position: number;
  is_primary: boolean;
  created_at: string;
};

export type ProductImageInsert = Omit<ProductImageRow, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type SiteSettingRow = {
  key: string;
  value: string;
  updated_at: string;
};

export type CategoryWithCount = CategoryRow & {
  products?: { count: number }[];
};

export type ProductWithRelations = ProductRow & {
  category: Pick<CategoryRow, 'id' | 'name' | 'slug'> | null;
  images: Pick<ProductImageRow, 'id' | 'storage_path' | 'position' | 'is_primary'>[];
};

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: CategoryInsert;
        Update: Partial<CategoryInsert>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: Partial<ProductInsert>;
        Relationships: [];
      };
      product_images: {
        Row: ProductImageRow;
        Insert: ProductImageInsert;
        Update: Partial<ProductImageInsert>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettingRow;
        Insert: SiteSettingRow;
        Update: Partial<SiteSettingRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
