import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatPrice } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: string;
  created_at: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const message = (location.state as { message?: string })?.message;

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetch('/api/orders', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {});
  }, [user, navigate]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-denim mb-8">My Orders</h1>
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6 text-sm">{message}</div>
      )}
      {orders.length === 0 ? (
        <p className="text-center text-gray-500 py-20">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-xl p-5 flex justify-between items-center">
              <div>
                <p className="font-semibold">{order.order_number}</p>
                <p className="text-sm text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-denim">{formatPrice(order.total_amount)}</p>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded capitalize">{order.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
