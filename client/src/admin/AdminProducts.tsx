import { useEffect, useState, type FormEvent, type ChangeEvent, type ReactNode } from 'react';
import { adminApi } from '../lib/adminApi';
import { api, type Category } from '../lib/api';
import { Trash2, Plus, X, Upload, Pencil } from 'lucide-react';

const MENS_SIZES = ['28', '30', '32', '34', '36', '38', '40', '42'];
const KIDS_SIZES = ['4', '6', '8', '10', '12', '14'];
const SIZE_OPTIONS = [...MENS_SIZES, ...KIDS_SIZES];
const FIT_OPTIONS = ['Slim', 'Regular', 'Straight', 'Bootcut', 'Tapered', 'Skinny', 'Relaxed', 'Wide Leg', 'Mom Fit', 'Boyfriend', 'Cargo'];
const WASH_OPTIONS = ['Dark Indigo', 'Mid Blue', 'Light Wash', 'Black', 'Grey', 'Vintage', 'Raw', 'Stone Wash', 'Acid Wash', 'Faded Blue', 'Charcoal', 'Olive'];
const MAX_PHOTOS = 4;

type ProductRow = Record<string, unknown>;
type PhotoSlot = { kind: 'existing'; url: string } | { kind: 'new'; file: File; preview: string } | null;
type SizeStock = Record<string, string>;

const emptyForm = {
  name: '',
  short_description: '',
  description: '',
  category_id: '',
  retail_price: '',
  wholesale_price: '',
  moq: '1',
  sku: '',
  fabric: '98% Cotton, 2% Elastane',
  fit: 'Regular',
  wash: 'Mid Blue',
  is_featured: false,
  is_new: false,
  is_bestseller: false,
};

function defaultSizeStock(): SizeStock {
  return Object.fromEntries(MENS_SIZES.map((s) => [s, '100']));
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [sizeStock, setSizeStock] = useState<SizeStock>(defaultSizeStock);
  const [customSize, setCustomSize] = useState('');
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>(Array(MAX_PHOTOS).fill(null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');

  const filledPhotos = photoSlots.filter(Boolean).length;
  const enabledSizes = Object.keys(sizeStock).filter((s) => Number(sizeStock[s]) >= 0 && sizeStock[s] !== '');
  const totalPieces = enabledSizes.reduce((sum, s) => sum + (Number(sizeStock[s]) || 0), 0);

  const inputClass = 'w-full h-11 border border-[#e8e8e8] rounded-lg px-3 text-sm focus:outline-none focus:border-[#1a1a1a] bg-white';

  const field = (label: string, child: ReactNode) => (
    <label className="block">
      <span className="text-sm font-medium text-gray-700 mb-1.5 block">{label}</span>
      {child}
    </label>
  );

  const resetPhotos = (urls: string[] = []) => {
    const slots: PhotoSlot[] = Array(MAX_PHOTOS).fill(null);
    urls.slice(0, MAX_PHOTOS).forEach((url, i) => {
      slots[i] = { kind: 'existing', url };
    });
    setPhotoSlots(slots);
  };

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
    load();
  }, []);

  useEffect(() => {
    load(filterCategory);
  }, [filterCategory]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSizeStock(defaultSizeStock());
    setCustomSize('');
    resetPhotos();
    setError('');
    setOkMsg('');
    setShowForm(true);
  };

  const openEdit = (p: ProductRow) => {
    const sizes = Array.isArray(p.sizes) ? (p.sizes as string[]) : MENS_SIZES;
    let stockMap: SizeStock = {};
    const raw = p.size_stock;
    if (raw && typeof raw === 'object' && !Array.isArray(raw) && Object.keys(raw as object).length) {
      stockMap = Object.fromEntries(
        Object.entries(raw as Record<string, number | string>).map(([k, v]) => [k, String(v)])
      );
    } else {
      const per = Math.max(1, Math.floor(Number(p.stock || 0) / Math.max(sizes.length, 1)));
      stockMap = Object.fromEntries(sizes.map((s) => [s, String(per)]));
    }

    setEditingId(p.id as string);
    setForm({
      name: String(p.name || ''),
      short_description: String(p.short_description || ''),
      description: String(p.description || ''),
      category_id: String(p.category_id || ''),
      retail_price: String(p.retail_price || ''),
      wholesale_price: String(p.wholesale_price || ''),
      moq: String(p.moq ?? 1),
      sku: String(p.sku || ''),
      fabric: String(p.fabric || ''),
      fit: String(p.fit || 'Regular'),
      wash: String(p.wash || 'Mid Blue'),
      is_featured: Boolean(p.is_featured),
      is_new: Boolean(p.is_new),
      is_bestseller: Boolean(p.is_bestseller),
    });
    setSizeStock(stockMap);
    setCustomSize('');
    const images = Array.isArray(p.images) ? (p.images as string[]) : [];
    resetPhotos(images);
    setError('');
    setOkMsg('');
    setShowForm(true);
  };

  const toggleSize = (size: string) => {
    setSizeStock((prev) => {
      if (size in prev) {
        const next = { ...prev };
        delete next[size];
        return next;
      }
      return { ...prev, [size]: '100' };
    });
  };

  const setPieces = (size: string, value: string) => {
    const clean = value.replace(/[^\d]/g, '');
    setSizeStock((prev) => ({ ...prev, [size]: clean }));
  };

  const addCustomSize = () => {
    const s = customSize.trim();
    if (!s) return;
    setSizeStock((prev) => ({ ...prev, [s]: prev[s] || '50' }));
    setCustomSize('');
  };

  const onPickSlot = (slotIndex: number, e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = '';

    setPhotoSlots((prev) => {
      const next = [...prev];
      if (files.length === 1) {
        const file = files[0];
        const old = next[slotIndex];
        if (old?.kind === 'new') URL.revokeObjectURL(old.preview);
        next[slotIndex] = { kind: 'new', file, preview: URL.createObjectURL(file) };
        return next;
      }
      let i = next.findIndex((s) => !s);
      if (i < 0) i = slotIndex;
      for (const file of files) {
        while (i < MAX_PHOTOS && next[i]) i += 1;
        if (i >= MAX_PHOTOS) break;
        next[i] = { kind: 'new', file, preview: URL.createObjectURL(file) };
        i += 1;
      }
      return next;
    });
  };

  const clearSlot = (slotIndex: number) => {
    setPhotoSlots((prev) => {
      const next = [...prev];
      const old = next[slotIndex];
      if (old?.kind === 'new') URL.revokeObjectURL(old.preview);
      next[slotIndex] = null;
      return next;
    });
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await adminApi.deleteProduct(id);
    load(filterCategory);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setOkMsg('');
    if (!form.name.trim()) return setError('Product name required');
    if (!form.category_id) return setError('Category select karo');
    if (!form.wholesale_price) return setError('Wholesale price required');
    if (!enabledSizes.length) return setError('Kam se kam 1 size select karo aur pieces bhara');
    if (filledPhotos < MAX_PHOTOS) {
      return setError(`4 photos upload karo (${filledPhotos}/4)`);
    }

    const size_stock: Record<string, number> = {};
    for (const s of enabledSizes) {
      size_stock[s] = Number(sizeStock[s]) || 0;
    }
    const stock = Object.values(size_stock).reduce((a, b) => a + b, 0);

    setSaving(true);
    try {
      const newFiles = photoSlots
        .filter((s): s is Extract<PhotoSlot, { kind: 'new' }> => s?.kind === 'new')
        .map((s) => s.file);

      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        const uploaded = await adminApi.uploadImages(newFiles);
        uploadedUrls = uploaded.urls;
      }

      let uploadIdx = 0;
      const images = photoSlots
        .filter(Boolean)
        .map((s) => {
          if (s!.kind === 'existing') return s!.url;
          return uploadedUrls[uploadIdx++] || '';
        })
        .filter(Boolean)
        .slice(0, MAX_PHOTOS);

      const payload = {
        name: form.name.trim(),
        short_description: form.short_description.trim() || `${form.fit} | ${form.wash} | MOQ ${form.moq}`,
        description: form.description.trim(),
        category_id: Number(form.category_id),
        brand_id: null,
        retail_price: Number(form.retail_price || form.wholesale_price),
        wholesale_price: Number(form.wholesale_price),
        moq: Number(form.moq) || 1,
        stock,
        size_stock,
        sizes: enabledSizes,
        colors: [form.wash],
        sku: form.sku.trim() || undefined,
        fabric: form.fabric,
        fit: form.fit,
        wash: form.wash,
        images,
        is_featured: form.is_featured,
        is_new: form.is_new,
        is_bestseller: form.is_bestseller,
      };

      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
        setOkMsg('Product updated');
      } else {
        await adminApi.createProduct(payload);
        setOkMsg('Product added');
      }
      setShowForm(false);
      load(filterCategory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const allSizeChoices = Array.from(new Set([...SIZE_OPTIONS, ...Object.keys(sizeStock)]));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} products · size + pieces manage karo</p>
        </div>
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
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#333]"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {okMsg && !showForm && (
        <div className="mb-4 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">{okMsg}</div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl border border-[#e8e8e8] overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-[#faf9f7]">
              <tr>
                <th className="text-left p-3 font-semibold">Product</th>
                <th className="text-left p-3 font-semibold">Category</th>
                <th className="text-left p-3 font-semibold">Sizes / Pieces</th>
                <th className="text-left p-3 font-semibold">Wholesale</th>
                <th className="text-left p-3 font-semibold">MOQ</th>
                <th className="text-left p-3 font-semibold">Stock</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const imgs = Array.isArray(p.images) ? (p.images as string[]) : [];
                const sizes = Array.isArray(p.sizes) ? (p.sizes as string[]) : [];
                const ss = (p.size_stock && typeof p.size_stock === 'object' && !Array.isArray(p.size_stock))
                  ? (p.size_stock as Record<string, number>)
                  : null;
                return (
                  <tr key={p.id as string} className="border-t border-[#f0f0f0]">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={imgs[0] || '/images/products/jeans-mens-blue-1.jpg'}
                          alt=""
                          className="w-12 h-14 object-cover rounded-md bg-gray-100"
                        />
                        <div>
                          <p className="font-medium">{p.name as string}</p>
                          <p className="text-xs text-gray-400">{p.sku as string}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{(p.category_name as string) || '—'}</td>
                    <td className="p-3 text-xs text-gray-600 max-w-[200px]">
                      {ss
                        ? Object.entries(ss).slice(0, 6).map(([s, n]) => `${s}:${n}`).join(' · ')
                        : sizes.join(', ')}
                      {ss && Object.keys(ss).length > 6 ? '…' : ''}
                    </td>
                    <td className="p-3">₹{p.wholesale_price as string}</td>
                    <td className="p-3">{p.moq as number}</td>
                    <td className="p-3 font-medium">{p.stock as number}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button type="button" onClick={() => openEdit(p)} className="text-gray-500 hover:text-[#1a1a1a] p-1" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button type="button" onClick={() => remove(p.id as string)} className="text-red-400 hover:text-red-600 p-1" title="Delete">
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
                    No products yet. Click Add Product.
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
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e8e8] sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-bold">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="p-1 text-gray-500 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submit} className="p-5 space-y-6">
              {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

              <section className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Basic info</h3>
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
                  />
                )}
                {field(
                  'Full Description',
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={inputClass}
                  />
                )}
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pricing & MOQ</h3>
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
                    'MOQ (min pieces)',
                    <input
                      type="number"
                      min="1"
                      value={form.moq}
                      onChange={(e) => setForm({ ...form, moq: e.target.value })}
                      className={inputClass}
                    />
                  )}
                  {field(
                    'SKU',
                    <input
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      className={inputClass}
                      placeholder="Auto if empty"
                    />
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Fit & wash</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {field(
                    'Fit',
                    <select value={form.fit} onChange={(e) => setForm({ ...form, fit: e.target.value })} className={inputClass}>
                      {FIT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  )}
                  {field(
                    'Wash',
                    <select value={form.wash} onChange={(e) => setForm({ ...form, wash: e.target.value })} className={inputClass}>
                      {WASH_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                  )}
                  {field(
                    'Fabric',
                    <input
                      value={form.fabric}
                      onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                      className={inputClass}
                    />
                  )}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Size & pieces *</h3>
                    <p className="text-xs text-gray-400 mt-1">Size select karo, har size ke pieces (stock) bhara</p>
                  </div>
                  <p className="text-sm font-semibold text-[#1a1a1a] shrink-0">
                    Total: {totalPieces} pcs
                  </p>
                </div>

                <div className="border border-[#e8e8e8] rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[1fr_120px_40px] gap-2 bg-[#faf9f7] px-3 py-2 text-xs font-semibold text-gray-500">
                    <span>Size</span>
                    <span>Pieces</span>
                    <span></span>
                  </div>
                  {allSizeChoices.map((s) => {
                    const on = s in sizeStock;
                    return (
                      <div
                        key={s}
                        className={`grid grid-cols-[1fr_120px_40px] gap-2 items-center px-3 py-2 border-t border-[#f0f0f0] ${on ? 'bg-white' : 'bg-gray-50/50'}`}
                      >
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggleSize(s)}
                            className="accent-[#1a1a1a]"
                          />
                          Size {s}
                        </label>
                        <input
                          type="number"
                          min="0"
                          disabled={!on}
                          value={on ? sizeStock[s] : ''}
                          onChange={(e) => setPieces(s, e.target.value)}
                          placeholder="0"
                          className="h-9 border border-[#e8e8e8] rounded-lg px-2 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                        />
                        <button
                          type="button"
                          disabled={!on}
                          onClick={() => toggleSize(s)}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-30"
                          title="Remove"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    placeholder="Custom size e.g. 44"
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={addCustomSize}
                    className="h-11 px-4 border border-[#e8e8e8] rounded-lg text-sm font-medium hover:border-[#1a1a1a]"
                  >
                    Add size
                  </button>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Photos * ({filledPhotos}/{MAX_PHOTOS})
                </h3>
                <p className="text-xs text-gray-400 mb-3">Exactly 4 product photos</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {photoSlots.map((slot, i) => {
                    const src = slot?.kind === 'existing' ? slot.url : slot?.kind === 'new' ? slot.preview : null;
                    return (
                      <div key={i} className="relative aspect-[3/4] rounded-xl border-2 border-dashed border-[#e8e8e8] overflow-hidden bg-[#fafafa]">
                        {src ? (
                          <>
                            <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => clearSlot(i)}
                              className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow"
                            >
                              ×
                            </button>
                            <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{i + 1}</span>
                            <label className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[10px] text-center py-1 cursor-pointer opacity-0 hover:opacity-100 transition">
                              Change
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickSlot(i, e)} />
                            </label>
                          </>
                        ) : (
                          <label className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-[#f0f0f0] transition">
                            <Upload size={18} className="text-gray-400" />
                            <span className="text-xs text-gray-500">Photo {i + 1}</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple={i === 0}
                              className="hidden"
                              onChange={(e) => onPickSlot(i, e)}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

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
                  Bestseller
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
