import { fetchJson } from '@/lib/api';
import { Category, Product, Service } from '@/lib/types';

type ApiList<T> = {
  count?: number;
  results?: T[];
};

type ApiProduct = {
  id: number;
  name: string;
  description?: string;
  price: number;
  wholesalePrice?: number;
  wholesale_price?: number;
  category?: string;
  subCategory?: string;
  sub_category?: string;
  image?: string;
  inStock?: boolean;
  in_stock?: boolean;
  brand: string;
};

type ApiCategory = {
  id: string;
  name: string;
  icon?: string;
  slug?: string;
  subCategories?: ApiCategory[];
  sub_categories?: ApiCategory[];
};

type ApiService = {
  id: string;
  name: string;
  description: string;
  price: number;
};

function mapCategory(category: ApiCategory): Category {
  const children = category.subCategories ?? category.sub_categories ?? [];
  return {
    id: String(category.id),
    name: category.name,
    icon: category.icon ?? 'droplet',
    subCategories: children.map((child) => ({
      id: String(child.id),
      name: child.name,
    })),
  };
}

export function mapProduct(product: ApiProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    wholesalePrice: product.wholesalePrice ?? product.wholesale_price,
    category: product.category,
    subCategory: product.subCategory ?? product.sub_category,
    image: product.image,
    inStock: product.inStock ?? product.in_stock ?? false,
    brand: product.brand,
  };
}

export function productImageUrl(image?: string, size: 800 | 200 = 800): string {
  if (!image) {
    return `https://via.placeholder.com/${size}`;
  }

  if (/^https?:\/\//.test(image)) {
    return image;
  }

  return `https://source.unsplash.com/${size}x${size}/?${encodeURIComponent(image)}`;
}

export async function getCategories(): Promise<Category[]> {
  const data = await fetchJson<ApiCategory[] | ApiList<ApiCategory>>('/api/catalog/categories/');
  const categories = Array.isArray(data) ? data : data.results ?? [];
  return categories.map(mapCategory);
}

export async function getBrands(): Promise<string[]> {
  const data = await fetchJson<string[] | ApiList<string>>('/api/catalog/brands/');
  const brands = Array.isArray(data) ? data : data.results ?? [];
  return [...brands].sort((a, b) => a.localeCompare(b));
}

export async function getProducts(params?: URLSearchParams): Promise<{ count: number; results: Product[] }> {
  const query = params?.toString();
  const path = query ? `/api/catalog/products/?${query}` : '/api/catalog/products/';

  const data = await fetchJson<ApiList<ApiProduct> | ApiProduct[]>(path);
  if (Array.isArray(data)) {
    return {
      count: data.length,
      results: data.map(mapProduct),
    };
  }

  return {
    count: data.count ?? 0,
    results: (data.results ?? []).map(mapProduct),
  };
}

export async function getProduct(productId: number): Promise<Product> {
  const data = await fetchJson<ApiProduct>(`/api/catalog/products/${productId}/`);
  return mapProduct(data);
}

export async function getAllProductIds(): Promise<number[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    console.warn('NEXT_PUBLIC_API_BASE_URL not set, skipping static generation of product pages');
    return [];
  }
  const url = `${baseUrl}/api/catalog/products/?fields=id&page_size=1000`;
  try {
    const data = await fetchJson<{ results: Array<{ id: number }> }>(url);
    return (data.results ?? []).map((p) => p.id);
  } catch (error) {
    console.warn('Failed to fetch product IDs for static generation:', error);
    return [];
  }
}

const SERVICE_ENDPOINTS = ['/api/catalog/services/', '/api/services/'] as const;

export async function getServices(): Promise<Service[]> {
  for (const endpoint of SERVICE_ENDPOINTS) {
    try {
      const data = await fetchJson<ApiService[] | ApiList<ApiService>>(endpoint);
      const services = Array.isArray(data) ? data : data.results ?? [];
      return services.map((service) => ({
        id: String(service.id),
        name: service.name,
        description: service.description,
        price: service.price,
      }));
    } catch {
      // try next endpoint
    }
  }

  return [];
}
