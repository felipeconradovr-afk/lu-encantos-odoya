export type ProductStatus =
  | 'Disponível'
  | 'Sob encomenda'
  | 'Peça única'
  | 'Esgotado';
export type Product = {
  code: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  materials: string;
  size: string;
  colors: string;
  price: number | null;
  status: ProductStatus;
  leadTime: string;
  images: string[];
  featured: boolean;
  active: boolean;
  order: number;
  additional: string;
};
export type Settings = {
  whatsapp: string;
  instagram: string;
  headline: string;
  about: string;
};
export const statuses: ProductStatus[] = [
  'Disponível',
  'Sob encomenda',
  'Peça única',
  'Esgotado',
];
export const initialCategories = [
  'Colares',
  'Pulseiras',
  'Guias',
  'Adereços',
  'Acessórios',
  'Peças personalizadas',
  'Novidades',
];
export const initialSettings: Settings = {
  whatsapp: '5548991893262',
  instagram: '',
  headline: 'Há um encanto em ser você.',
  about:
    'Cada peça começa com uma combinação: uma cor que chama, uma textura que encanta, um detalhe que faz sentido. Na Lu by Encantos Odoyá, miçangas, cristais e adornos ganham forma em criações artesanais. Você pode escolher uma proposta do catálogo ou contar sua ideia para criar algo personalizado.',
};
const seeds: [string, string, string, string, string, number | null, ProductStatus][] =
  [
    [
      'Colar Vermelho e Preto com Flor',
      'Colares',
      'Miçangas de vidro e detalhe floral',
      'Vermelho e preto',
      'Um encontro de cores intensas e um detalhe floral que faz a diferença. Uma proposta para quem gosta de acessórios com presença.',
      89,
      'Disponível',
    ],
    [
      'Pulseira Artesanal Preto e Vermelho',
      'Pulseiras',
      'Miçangas e fio elástico',
      'Preto e vermelho',
      'Uma combinação marcante para usar sozinha ou junto de outras pulseiras. O tamanho pode ser ajustado na encomenda.',
      35,
      'Disponível',
    ],
    [
      'Colar Imperial com Cristais',
      'Colares',
      'Cristais, contas de vidro e fecho metálico',
      'Lilás e translúcido',
      'Cristais em uma composição delicada, com pontos de luz entre as contas. Um toque especial para os seus dias.',
      129,
      'Peça única',
    ],
    [
      'Guia Colorida com Miçangas',
      'Guias',
      'Miçangas de vidro e fio resistente',
      'Multicolorido',
      'Cores e sequência de contas escolhidas com você. Conte à Lu suas referências e o significado que deseja dar à peça.',
      75,
      'Sob encomenda',
    ],
    [
      'Adorno Artesanal para Carro',
      'Acessórios',
      'Contas de vidro e cordão',
      'Rosa e perolado',
      'Um pequeno detalhe artesanal para acompanhar seus caminhos. Cores e comprimento podem ser combinados pelo WhatsApp.',
      49,
      'Sob encomenda',
    ],
    [
      'Colar Azul com Cristais',
      'Colares',
      'Cristais azuis e contas de vidro',
      'Azul e transparente',
      'Tons de azul e transparências em uma peça leve. Esta proposta pode inspirar uma nova combinação feita para você.',
      98,
      'Esgotado',
    ],
    [
      'Pulseira Personalizada',
      'Peças personalizadas',
      'Materiais definidos na encomenda',
      'À sua escolha',
      'Sua cor favorita, uma medida confortável, um detalhe especial. Uma pulseira que começa com a sua ideia.',
      null,
      'Sob encomenda',
    ],
    [
      'Peça Artesanal Branco e Preto',
      'Adereços',
      'Miçangas, contas e cordão',
      'Branco e preto',
      'Contrastes simples em uma composição artesanal. Converse com a Lu sobre como adaptar o adereço para seu uso.',
      59,
      'Peça única',
    ],
  ];
export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
export const initialProducts: Product[] = seeds.map(
  ([name, category, materials, colors, description, price, status], i) => ({
    code: `LU-${String(i + 1).padStart(3, '0')}`,
    slug: slugify(name),
    name,
    category,
    materials,
    colors,
    description,
    price,
    status,
    size:
      category === 'Pulseiras'
        ? 'Ajustável, confirmar medida'
        : category === 'Colares'
          ? 'Comprimento a combinar'
          : 'Medida a combinar',
    leadTime:
      status === 'Sob encomenda'
        ? 'Prazo combinado antes da produção'
        : 'Confirmar disponibilidade com a Lu',
    images: [],
    featured: [0, 2, 5].includes(i),
    active: true,
    order: i + 1,
    additional:
      'Peça artesanal: cores e acabamentos podem variar. Confirme medidas, materiais, valor e envio antes de fechar o pedido.',
  }),
);
export const money = (value: number | null) =>
  value === null
    ? 'Valor sob consulta'
    : new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
export function whatsappUrl(
  message: string,
  number = initialSettings.whatsapp,
) {
  const digits = number.replace(/\D/g, '');
  if (!/^\d{10,15}$/.test(digits))
    throw new Error('Número de WhatsApp inválido.');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
export function productMessage(product: Product) {
  return `Olá! Vim pelo site da Lu by Encantos Odoyá e gostaria de ${product.status === 'Esgotado' ? 'solicitar uma peça semelhante ao produto' : 'saber mais sobre o produto'} ${product.code} — ${product.name}. Poderia confirmar os detalhes, o valor e a disponibilidade?`;
}
export type CustomOrder = {
  type: string;
  colors: string;
  materials: string;
  size: string;
  purpose: string;
  notes: string;
};
export function customMessage(order: CustomOrder) {
  return `Olá! Vim pelo site da Lu by Encantos Odoyá e gostaria de solicitar uma encomenda personalizada.\n\nTipo de peça: ${order.type}\nCores: ${order.colors || 'A combinar'}\nMateriais: ${order.materials || 'Gostaria de sugestões'}\nTamanho: ${order.size || 'A combinar'}\nFinalidade: ${order.purpose || 'Não informada'}\nObservações: ${order.notes || 'Sem observações'}`;
}
export function filterProducts(
  products: Product[],
  query: string,
  category: string,
  status: string,
) {
  const search = slugify(query);
  return products
    .filter(
      (p) =>
        p.active &&
        (category === 'Todas' ||
          p.category === category ||
          (category === 'Novidades' && p.order > 5)) &&
        (status === 'Todos' || p.status === status) &&
        slugify(`${p.name} ${p.code} ${p.materials} ${p.colors}`).includes(
          search,
        ),
    )
    .sort((a, b) => a.order - b.order);
}
export function isSafeImage(url: string) {
  return (
    /^\/(?!\/)/.test(url) ||
    /^https:\/\//i.test(url) ||
    /^data:image\/(png|jpeg|webp);base64,/i.test(url)
  );
}
