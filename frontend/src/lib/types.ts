export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  wholesalePrice?: number;
  category?: string;
  subCategory?: string;
  image?: string;
  inStock: boolean;
  brand: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  notes?: string;
}

export interface CheckoutOrderPayload {
  email: string;
  phone: string;
  customer_name: string;
  customer_address: string;
  delivery_option_id: number;
  items: Array<{
    product_id: string | null;
    title: string;
    quantity: number;
    unit_price: number;
  }>;
}

export interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  status: string;
  total_price: number;
  items: OrderItem[];
  customer_address: string;
  created_at: string;
  email: string;
  customer_name: string;
  delivery_option: {
    id: number;
    name: string;
    price_cents: number;
  };
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface User {
  id: string | number;
  phone?: string | null;
  email: string;
  first_name: string;
  last_name: string;
  address: Address;
  is_company: boolean;
  is_superuser?: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
}
