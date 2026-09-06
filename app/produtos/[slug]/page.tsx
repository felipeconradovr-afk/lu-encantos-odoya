import { ProductDetail } from '@/components/ProductDetail';
import { initialProducts } from '@/lib/catalog';
export const revalidate = 60;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = initialProducts.find((p) => p.slug === slug);
  return {
    title: product?.name || 'Detalhes da peça',
    description: product?.description,
  };
}
export async function generateStaticParams() {
  return initialProducts.map((p) => ({ slug: p.slug }));
}
export default async function DetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
