import { useEffect, useState } from 'react';
import { adminApi } from '../lib/adminApi';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    adminApi.getInquiries().then(setInquiries).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Wholesale Inquiries ({inquiries.length})</h1>
      <div className="space-y-3">
        {inquiries.map((q) => (
          <div key={q.id as string} className="bg-white rounded-xl border border-[#e8e8e8] p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 mb-2">
              <p className="font-semibold">{q.name as string}</p>
              <p className="text-xs text-gray-400">{new Date(q.created_at as string).toLocaleString('en-IN')}</p>
            </div>
            <p className="text-sm text-gray-600">{q.email as string} · {q.phone as string}</p>
            {q.company_name ? <p className="text-sm text-gray-500">{String(q.company_name)}</p> : null}
            {q.product_interest ? <p className="text-sm mt-1"><span className="font-medium">Interest:</span> {String(q.product_interest)}</p> : null}
            {q.quantity ? <p className="text-sm"><span className="font-medium">Qty:</span> {String(q.quantity)} pcs</p> : null}
            {q.message ? <p className="text-sm text-gray-500 mt-2">{String(q.message)}</p> : null}
          </div>
        ))}
        {!inquiries.length && <p className="text-gray-400 text-center py-10">No inquiries yet</p>}
      </div>
    </div>
  );
}
