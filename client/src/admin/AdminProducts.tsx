import { useEffect, useState } from 'react';
import { adminApi } from '../lib/adminApi';
import { Trash2, Plus } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminApi.getProducts().then(setProducts).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await adminApi.deleteProduct(id);
    load();
  };

  const addProduct = async () => {
    const name = prompt('Product name:');
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await adminApi.createProduct({
      name, slug,
      description: `Wholesale ${name}`,
      short_description: name,
      retail_price: 1999, wholesale_price: 650,
      category_id: 1, brand_id: 1,
      fabric: '98% Cotton, 2% Elastane', fit: 'Regular', wash: 'Blue',
      images: ['/images/products/jeans-mens-blue-1.jpg'],
    });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Products ({products.length})</h1>
        <button onClick={addProduct} className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> Add
        </button>
      </div>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="bg-white rounded-xl border border-[#e8e8e8] overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-[#faf9f7]">
              <tr>
                <th className="text-left p-3 font-semibold">Name</th>
                <th className="text-left p-3 font-semibold">SKU</th>
                <th className="text-left p-3 font-semibold">Wholesale</th>
                <th className="text-left p-3 font-semibold">MOQ</th>
                <th className="text-left p-3 font-semibold">Stock</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id as string} className="border-t border-[#f0f0f0]">
                  <td className="p-3 font-medium">{p.name as string}</td>
                  <td className="p-3 text-gray-500">{p.sku as string}</td>
                  <td className="p-3">₹{p.wholesale_price as string}</td>
                  <td className="p-3">{p.moq as number}</td>
                  <td className="p-3">{p.stock as number}</td>
                  <td className="p-3">
                    <button onClick={() => remove(p.id as string)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
