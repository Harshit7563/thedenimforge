const API = import.meta.env.VITE_API_URL || '/api';

function adminToken() {
  return localStorage.getItem('admin_token');
}

async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = adminToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}/admin${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
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
  getProducts: () => adminRequest<Record<string, unknown>[]>('/products'),
  createProduct: (data: Record<string, unknown>) =>
    adminRequest('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    adminRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => adminRequest(`/products/${id}`, { method: 'DELETE' }),
  getOrders: () => adminRequest<Record<string, unknown>[]>('/orders'),
  updateOrderStatus: (id: string, status: string) =>
    adminRequest(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getInquiries: () => adminRequest<Record<string, unknown>[]>('/inquiries'),
  getNewsletter: () => adminRequest<Record<string, unknown>[]>('/newsletter'),
};
