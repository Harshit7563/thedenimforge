const API = import.meta.env.VITE_API_URL || '/api';
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://thedenimforge.com';

function getToken() {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  retail_price: string;
  wholesale_price: string;
  moq: number;
  fabric: string;
  fit: string;
  wash: string;
  sizes: string[];
  colors: string[];
  images: string[];
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  rating: string;
  review_count: number;
  sku?: string;
  category_name: string;
  category_slug: string;
  stock?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string;
  is_wholesale: boolean;
}

/** Storefront listings — high enough to show full wholesale catalog */
export const PRODUCT_LIST_LIMIT = '500';

export const api = {
  getProducts: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Product[]>(`/products${q}`);
  },
  getProduct: (slug: string) => request<Product>(`/products/${slug}`),
  getCategories: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Category[]>(`/categories${q}`);
  },
  getBanners: () => request<Banner[]>('/banners'),
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: Record<string, unknown>) =>
    request<{ user: User; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<User>('/auth/me'),
  updateProfile: (data: Partial<User>) =>
    request<User>('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),
  getCart: () => request<CartItem[]>('/cart'),
  addToCart: (data: { product_id: string; quantity: number; size: string; color: string }) =>
    request('/cart', { method: 'POST', body: JSON.stringify(data) }),
  removeFromCart: (id: string) => request(`/cart/${id}`, { method: 'DELETE' }),
  getOrders: () => request<OrderSummary[]>('/orders'),
  getOrder: (id: string) => request<OrderDetail>(`/orders/${id}`),
  trackOrder: (orderNumber: string) => request<OrderDetail>(`/orders/track/${orderNumber}`),
  getAddresses: () => request<ShippingAddress[]>('/addresses'),
  createAddress: (data: Partial<ShippingAddress>) =>
    request<ShippingAddress>('/addresses', { method: 'POST', body: JSON.stringify(data) }),
  updateAddress: (id: string, data: Partial<ShippingAddress>) =>
    request<ShippingAddress>(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAddress: (id: string) => request(`/addresses/${id}`, { method: 'DELETE' }),
  placeOrder: (data: { shipping_address?: object; notes?: string }) =>
    request<{ order_number: string; id: string }>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  submitInquiry: (data: Record<string, unknown>) =>
    request('/inquiries', { method: 'POST', body: JSON.stringify(data) }),
  subscribeNewsletter: (email: string) =>
    request('/newsletter', { method: 'POST', body: JSON.stringify({ email }) }),
};

export interface ShippingAddress {
  id: string;
  name: string;
  phone: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

export interface OrderSummary {
  id: string;
  order_number: string;
  status: string;
  total_amount: string;
  created_at: string;
  shipping_address?: Record<string, string>;
}

export interface OrderDetail extends OrderSummary {
  notes?: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: string;
    size: string;
    color: string;
  }>;
}

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  quantity: number;
  size: string;
  color: string;
  wholesale_price: string;
  retail_price: string;
  images: string[];
  moq: number;
}

export function formatPrice(price: string | number) {
  return '₹' + Number(price).toLocaleString('en-IN');
}
