import { useEffect, useState } from 'react';
import { adminApi } from '../lib/adminApi';

const STATUSES = ['awaiting_payment', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    adminApi.getOrders().then(setOrders).catch(() => {});
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await adminApi.updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Orders ({orders.length})</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id as string} className="bg-white rounded-xl border border-[#e8e8e8] p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <p className="font-semibold">{o.order_number as string}</p>
                <p className="text-xs text-gray-500">{o.first_name as string} {o.last_name as string} · {o.email as string}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {(o.payment_method as string) === 'upi' ? 'UPI' : 'COD'}
                  {o.payment_status ? ` · ${String(o.payment_status)}` : ''}
                  {o.payment_gateway_status ? ` · GW: ${String(o.payment_gateway_status)}` : ''}
                </p>
              </div>
              <p className="text-lg font-bold">₹{Number(o.total_amount).toLocaleString('en-IN')}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <select
                value={o.status as string}
                onChange={(e) => updateStatus(o.id as string, e.target.value)}
                className="h-9 border border-[#e8e8e8] rounded-lg px-3 text-sm"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {(o.payment_method as string) === 'upi' && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const r = await adminApi.getOrderPaymentStatus(o.id as string);
                      const mapped = r.mapped as { gateway_status?: string; is_paid?: boolean } | undefined;
                      const hdfc = r.hdfc as { status?: string } | undefined;
                      alert(
                        `Order ${r.order_number}\nHDFC: ${hdfc?.status || mapped?.gateway_status}\nPaid: ${mapped?.is_paid ? 'YES' : 'NO'}`
                      );
                      adminApi.getOrders().then(setOrders).catch(() => {});
                    } catch (err) {
                      alert(err instanceof Error ? err.message : 'Status check failed');
                    }
                  }}
                  className="h-9 px-3 border border-[#004c8f] text-[#004c8f] rounded-lg text-xs font-semibold"
                >
                  Check HDFC status
                </button>
              )}
              <span className="text-xs text-gray-400">{new Date(o.created_at as string).toLocaleString('en-IN')}</span>
            </div>
          </div>
        ))}
        {!orders.length && <p className="text-gray-400 text-center py-10">No orders yet</p>}
      </div>
    </div>
  );
}
