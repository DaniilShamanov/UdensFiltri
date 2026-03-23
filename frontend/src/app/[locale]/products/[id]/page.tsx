import { notFound } from 'next/navigation';
import { getProduct, productImageUrl, getAllProductIds } from '@/lib/catalog';
import { locales } from '@/i18n/routing';
import ProductDetailPage from '@/components/pages/ProductDetailPage';

export const dynamic = 'force-dynamic';

interface PageParams {
  params: Promise<{ id: string; locale: string }>;
}

// Pre‑render all product pages at build time
/*export async function generateStaticParams() {
  const productIds = await getAllProductIds();
  return productIds.map((id) => ({ id: id.toString() }));
}*/

// Optional: Revalidate pages every hour (if using ISR)
export const revalidate = 3600;

export async function generateMetadata({ params }: PageParams) {
  const { id, locale } = await params;
  const productId = Number(id);

  if (isNaN(productId)) return notFound();

  try {
    const product = await getProduct(productId);
    const title = product.name;
    const description = product.description || `Buy ${product.name} at WaterFilters.lv – high‑quality water filtration system.`;
    const imageUrl = product.image ? productImageUrl(product.image, 800) : null;

    // Product structured data (JSON‑LD)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: imageUrl,
      brand: { '@type': 'Brand', name: product.brand },
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'EUR',
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    };

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
        type: 'product',
        locale,
        siteName: 'WaterFilters.lv',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
      alternates: {
        languages: Object.fromEntries(locales.map((loc) => [loc, `/${loc}/products/${id}`])),
      },
      canonical: `/${locale}/products/${id}`,
      other: {
        'application/ld+json': JSON.stringify(structuredData),
      },
    };
  } catch (error) {
    return {
      title: 'Product not found',
      description: 'The requested product could not be found.',
    };
  }
}

export default async function Page({ params }: PageParams) {
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId)) notFound();

  return <ProductDetailPage productId={productId} />;
}