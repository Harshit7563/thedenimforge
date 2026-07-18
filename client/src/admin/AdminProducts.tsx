import { useEffect, useState, type FormEvent, type ChangeEvent, type ReactNode } from 'react';
import { adminApi } from '../lib/adminApi';
import { api, type Category, type Brand } from '../lib/api';
import { Trash2, Plus, X, Upload, Pencil } from 'lucide-react';

const SIZE_OPTIONS = ['28', '30', '32', '34', '36', '38', '40', '4', '6', '8', '10', '12', '14'];
const FIT_OPTIONS = ['Slim', 'Regular', 'Straight', 'Bootcut', 'Tapered', 'Skinny', 'Relaxed', 'Wide Leg'];
const WASH_OPTIONS = ['Dark Indigo', 'Mid Blue', 'Light Wash', 'Black', 'Grey', 'Vintage', 'Raw', 'Stone Wash'];

type ProductRow = Record<string, unknown>;

const emptyForm = {
  name: '',
  short_description: '',
  description: '',
  category_id: '',
  brand_id: '',
  retail_price: '',
  wholesale_price: '',
  moq: '10',
  stock: '1000',
  sku: '',
  fabric: '98% Cotton, 2% Elastane',
  fit: 'Regular',
  wash: 'Mid Blue',
  sizes: ['28', '30', '32', '34', '36', '38', '40'] as string[],
  colors: 'Blue, Black',
  is_featured: false,
  is_new: false,
  is_bestseller: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = (categoryId?: string) => {
    setLoading(true);
    adminApi
      .getProducts(categoryId || undefined)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    api.getBrands().then(setBrands).catch(() => {});
    load();
  }, []);

  useEffect(() => {
    load(filterCategory);
  }, [filterCategory]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setError('');
    setShowForm(true);
  };

  const openEdit = (p: ProductRow) => {
    const sizes = Array.isArray(p.sizes) ? (p.sizes as string[]) : SIZE_OPTIONS.slice(0, 7);
    const colors = Array.isArray(p.colors) ? (p.colors as string[]).join(', ') : String(p.colors || 'Blue, Black');
    const images = Array.isArray(p.images) ? (p.images as string[]) : [];
    setEditingId(p.id as string);
    setForm({
      name: String(p.name || ''),
      short_description: String(p.short_description || ''),
      description: String(p.description || ''),
      category_id: String(p.category_id || ''),
      brand_id: String(p.brand_id || ''),
      retail_price: String(p.retail_price || ''),
      wholesale_price: String(p.wholesale_price || ''),
      moq: String(p.moq || 10),
      stock: String(p.stock || 1000),
      sku: String(p.sku || ''),
      fabric: String(p.fabric || ''),
      fit: String(p.fit || 'Regular'),
      wash: String(p.wash || 'Mid Blue'),
      sizes,
      colors,
      is_featured: Boolean(p.is_featured),
      is_new: Boolean(p.is_new),
      is_bestseller: Boolean(p.is_bestseller),
    });
    setExistingImages(images);
    setImageFiles([]);
    setImagePreviews([]);
    setError('');
    setShowForm(true);
  };

  const onPickImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 8);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const toggleSize = (size: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await adminApi.deleteProduct(id);
    load(filterCategory);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Product name required');
    if (!form.category_id) return setError('Category select karo');
    if (!form.wholesale_price) return setError('Wholesale price required');
    if (!editingId && imageFiles.length === 0 && existingImages.length === 0) {
      return setError('Kam se kam 1 product photo upload karo');
    }

    setSaving(true);
    try {
      let images = [...existingImages];
      if (imageFiles.length > 0) {
        const uploaded = await adminApi.uploadImages(imageFiles);
        images = editingId ? [...existingImages, ...uploaded.urls] : uploaded.urls;
      }
      if (!images.length) images = ['/images/products/jeans-mens-blue-1.jpg'];

      const payload = {
        name: form.name.trim(),
        short_description: form.short_description.trim() || form.name.trim(),
        description: form.description.trim(),
        category_id: Number(form.category_id),
        brand_id: form.brand_id ? Number(form.brand_id) : null,
        retail_price: Number(form.retail_price || form.wholesale_price),
        wholesale_price: Number(form.wholesale_price),
        moq: Number(form.moq) || 10,
        stock: Number(form.stock) || 1000,
        sku: form.sku.trim() || undefined,
        fabric: form.fabric,
        fit: form.fit,
        wash: form.wash,
        sizes: form.sizes,
        colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
        images,
        is_featured: form.is_featured,
        is_new: form.is_new,
        is_bestseller: form.is_bestseller,
      };

      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      setShowForm(false);
      load(filterCategory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, children: ReactNode) => (
    <label className="block text-sm">
      <span className="font-medium text-gray-700 mb-1.5 block">{label}</span>
      {children}
    </label>
  );

  const inputClass =
    'w-full border border-[#e8e8e8] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a1a1a] bg-white';

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Products ({products.length})</h1>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`${inputClass} sm:w-52`}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#333]"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl border border-[#e8e8e8] overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-[#faf9f7]">
              <tr>
                <th className="text-left p-3 font-semibold">Product</th>
                <th className="text-left p-3 font-semibold">Category</th>
                <th className="text-left p-3 font-semibold">SKU</th>
                <th className="text-left p-3 font-semibold">Wholesale</th>
                <th className="text-left p-3 font-semibold">MOQ</th>
                <th className="text-left p-3 font-semibold">Stock</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const imgs = Array.isArray(p.images) ? (p.images as string[]) : [];
                return (
                  <tr key={p.id as string} className="border-t border-[#f0f0f0]">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={imgs[0] || '/images/products/jeans-mens-blue-1.jpg'}
                          alt=""
                          className="w-12 h-14 object-cover rounded-md bg-gray-100"
                        />
                        <span className="font-medium">{p.name as string}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{(p.category_name as string) || '—'}</td>
                    <td className="p-3 text-gray-500">{p.sku as string}</td>
                    <td className="p-3">₹{p.wholesale_price as string}</td>
                    <td className="p-3">{p.moq as number}</td>
                    <td className="p-3">{p.stock as number}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(p)} className="text-gray-500 hover:text-[#1a1a1a] p-1" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => remove(p.id as string)} className="text-red-400 hover:text-red-600 p-1" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!products.length && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Is category mein koi product nahi. Add Product dabao.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-6 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e8e8]">
              <h2 className="text-lg font-bold">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="p-1 text-gray-500 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submit} className="p-5 space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {field(
                  'Category *',
                  <select
                    required
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
                {field(
                  'Brand',
                  <select
                    value={form.brand_id}
                    onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {field(
                'Product Name *',
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Slim Fit Stretch Jeans - Mid Blue"
                />
              )}

              {field(
                'Short Description',
                <input
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  className={inputClass}
                  placeholder="Slim fit | Mid Blue | MOQ 10 pcs"
                />
              )}

              {field(
                'Full Description',
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                  placeholder="Product details for buyers..."
                />
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {field(
                  'Wholesale ₹ *',
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.wholesale_price}
                    onChange={(e) => setForm({ ...form, wholesale_price: e.target.value })}
                    className={inputClass}
                  />
                )}
                {field(
                  'Retail ₹',
                  <input
                    type="number"
                    min="1"
                    value={form.retail_price}
                    onChange={(e) => setForm({ ...form, retail_price: e.target.value })}
                    className={inputClass}
                  />
                )}
                {field(
                  'MOQ',
                  <input
                    type="number"
                    min="1"
                    value={form.moq}
                    onChange={(e) => setForm({ ...form, moq: e.target.value })}
                    className={inputClass}
                  />
                )}
                {field(
                  'Stock',
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className={inputClass}
                  />
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {field(
                  'SKU',
                  <input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className={inputClass}
                    placeholder="Auto if empty"
                  />
                )}
                {field(
                  'Fabric',
                  <input
                    value={form.fabric}
                    onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                    className={inputClass}
                  />
                )}
                {field(
                  'Fit',
                  <select value={form.fit} onChange={(e) => setForm({ ...form, fit: e.target.value })} className={inputClass}>
                    {FIT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                )}
                {field(
                  'Wash / Color',
                  <select value={form.wash} onChange={(e) => setForm({ ...form, wash: e.target.value })} className={inputClass}>
                    {WASH_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                )}
              </div>

              {field(
                'Colors (comma separated)',
                <input
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  className={inputClass}
                />
              )}

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {SIZE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1.5 rounded-full text-xs border ${
                        form.sizes.includes(s)
                          ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                          : 'border-[#e8e8e8] text-gray-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Product Photos *</p>
                {(existingImages.length > 0 || imagePreviews.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {existingImages.map((src) => (
                      <div key={src} className="relative">
                        <img src={src} alt="" className="w-20 h-24 object-cover rounded-lg border border-[#e8e8e8]" />
                        <button
                          type="button"
                          onClick={() => setExistingImages((imgs) => imgs.filter((i) => i !== src))}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {imagePreviews.map((src) => (
                      <img key={src} src={src} alt="" className="w-20 h-24 object-cover rounded-lg border border-[#e8e8e8]" />
                    ))}
                  </div>
                )}
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#e8e8e8] rounded-xl p-6 cursor-pointer hover:border-[#1a1a1a] transition">
                  <Upload size={22} className="text-gray-400" />
                  <span className="text-sm text-gray-600">Photos upload karo (jpg/png, max 8)</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={onPickImages} />
                </label>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                  Featured (Top Shelf)
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} />
                  New Arrival
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_bestseller} onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })} />
                  Bestseller / Hot
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#f0f0f0]">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm rounded-lg border border-[#e8e8e8]">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-sm rounded-lg bg-[#1a1a1a] text-white font-medium disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
