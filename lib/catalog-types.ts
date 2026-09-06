// Formato canônico do catálogo usado pelo site público e pelo admin.
// lib/catalog.ts continua exportando helpers (slugify, money, whatsappUrl,
// mensagens, filtros) e os dados de demonstração como fallback offline.
export type { ProductStatus, Product, Settings } from '@/lib/catalog';
export { statuses, slugify, money, whatsappUrl, productMessage } from '@/lib/catalog';
export type { CustomOrder } from '@/lib/catalog';
export { customMessage, filterProducts, isSafeImage } from '@/lib/catalog';
