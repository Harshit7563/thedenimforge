import { API_BASE, networkError } from './apiBase';
import { compressImages } from './compressImage';

function adminToken() {
  return localStorage.getItem('admin_token');
}

function clearAdminSession() {
  localStorage.removeItem('admin_token');
}

async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = adminToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/admin${path}`, { ...options, headers });
  } catch (err) {
    throw networkError(err);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    if (res.status === 401) {
      clearAdminSession();
      throw new Error('Session expired — please login again at /admin/login');
    }
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const adminApi = {
  login: (email: string, password: string) =>
    adminRequest<{ token: string; user: { id: string; email: string; first_name: string } }>('/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
  getStats: () => adminRequest<{ products: number; orders: number; inquiries: number; users: number; revenue: string }>('/stats'),
  getProducts: (categoryId?: string | number) => {
    const q = categoryId ? `?category_id=${categoryId}` : '';
    return adminRequest<Record<string, unknown>[]>(`/products${q}`);
  },
  createProduct: (data: Record<string, unknown>) =>
    adminRequest('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    adminRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => adminRequest(`/products/${id}`, { method: 'DELETE' }),
  uploadImages: async (files: File[]) => {
    const compressed = await compressImages(files);
    const form = new FormData();
    compressed.forEach((f) => form.append('images', f));
    const token = adminToken();
    let res: Response;
    try {
      res = await fetch(`${API_BASE}/admin/upload/products`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
    } catch (err) {
      throw networkError(err);
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      if (res.status === 401) {
        clearAdminSession();
        throw new Error('Session expired — please login again at /admin/login');
      }
      if (res.status === 413) {
        throw new Error('Photos bahut badi hain. Chhoti images (8 MB se kam) upload karo.');
      }
      throw new Error(err.error || 'Upload failed');
    }
    return res.json() as Promise<{ urls: string[] }>;
  },
  getOrders: () => adminRequest<Record<string, unknown>[]>('/orders'),
  getOrderPaymentStatus: (id: string) =>
    adminRequest<Record<string, unknown>>(`/orders/${id}/payment-status`),
  updateOrderStatus: (id: string, status: string) =>
    adminRequest(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getInquiries: () => adminRequest<Record<string, unknown>[]>('/inquiries'),
  getNewsletter: () => adminRequest<Record<string, unknown>[]>('/newsletter'),
};
