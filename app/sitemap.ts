import{initialProducts}from'@/lib/catalog';
// Set only after choosing the final public origin. No invented canonical URLs.
export const revalidate = 3600;
export default function sitemap(){const origin=process.env.NEXT_PUBLIC_SITE_URL;if(!origin||!origin.startsWith('https://'))return [];return ['','/produtos','/encomendas','/sobre','/contato',...initialProducts.map(p=>`/produtos/${p.slug}`)].map(path=>({url:new URL(path,origin).href}));}
