import { useEffect, useState } from 'react';
import { adminApi } from '../lib/adminApi';
import { Package, ShoppingCart, MessageSquare, Users, IndianRupee } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, inquiries: 0, users: 0, revenue: '0' });

  useEffect(() => {
    adminApi.getStats().then(setStats).catch(() => {});
  }, []);

  const cards = [
    { label: 'Products', value: stats.products, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-green-50 text-green-600' },
    { label: 'Inquiries', value: stats.inquiries, icon: MessageSquare, color: 'bg-orange-50 text-orange-600' },
    { label: 'Users', value: stats.users, icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: 'Revenue', value: `₹${Number(stats.revenue).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-[#e8e8e8] p-4 sm:p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 bg-white rounded-xl border border-[#e8e8e8] p-5">
        <h2 className="font-semibold mb-2">Live Site</h2>
        <p className="text-sm text-gray-600">Website: <a href="https://thedenimforge.com" className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">thedenimforge.com</a></p>
        <p className="text-sm text-gray-600 mt-1">Company: CODEQUIP WEBTECH PRIVATE LIMITED</p>
        <p className="text-sm text-gray-600 mt-1">Support: codequipwebtech@gmail.com · 8424939262</p>
      </div>
    </div>
  );
}
