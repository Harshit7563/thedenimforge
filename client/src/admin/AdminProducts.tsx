import { useEffect, useMemo, useState, type FormEvent, type ChangeEvent, type ReactNode } from 'react';
import { adminApi } from '../lib/adminApi';
import { api, type Category } from '../lib/api';
import { ADMIN_PRODUCT_CATEGORY_SLUGS, UNLIMITED_STOCK } from '../lib/categories';
import { Trash2, Plus, X, Upload, Pencil, Star } from 'lucide-react';

const MENS_SIZES = ['28', '30', '32', '34', '36', '38', '40', '42'];
const KIDS_SIZES = ['4', '6', '8', '10', '12', '14'];
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

function unlimitedStockFor(sizes: string[]): SizeStock {
  return Object.fromEntries(sizes.map((s) => [s, String(UNLIMITED_STOCK)]));
}

function sizesForCategorySlug(slug?: string) {
  return slug === 'kids-jeans' ? KIDS_SIZES : MENS_SIZES;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [sizeStock, setSizeStock] = useState<SizeStock>(unlimitedStockFor(MENS_SIZES));
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>(Array(MAX_PHOTOS).fill(null));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');

  const filledPhotos = photoSlots.filter(Boolean).length;
  const enabledSizes = Object.keys(sizeStock);
  const productCategories = useMemo(
    () => categories.filter((c) => (ADMIN_PRODUCT_CATEGORY_SLUGS as readonly string[]).includes(c.slug)),
    [categories]
  );

  const selectedCategory = productCategories.find((c) => String(c.id) === form.category_id);

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
    api
      .getCategories({ for: 'admin' })
      .then((cats) => {
        const only = cats.filter((c) =>
          ['mens-jeans', 'womens-jeans', 'kids-jeans'].includes(c.slug)
        );
        setCategories(only);
      })
      .catch(() => {});
    load();
  }, []);

  useEffect(() => {
    load(filterCategory);
  }, [filterCategory]);

  const applyCategorySizes = (categoryId: string) => {
    const cat = productCategories.find((c) => String(c.id) === categoryId);
    setSizeStock(unlimitedStockFor(sizesForCategorySlug(cat?.slug)));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSizeStock(unlimitedStockFor(MENS_SIZES));
    resetPhotos();
    setError('');
    setOkMsg('');
    setShowForm(true);
  };

  const openEdit = (p: ProductRow) => {
    const catId = String(p.category_id || '');
    const cat = productCategories.find((c) => String(c.id) === catId);
    const sizes = Array.isArray(p.sizes) && (p.sizes as string[]).length
      ? (p.sizes as string[])
      : sizesForCategorySlug(cat?.slug);

    setEditingId(p.id as string);
    setForm({
      name: String(p.name || ''),
      short_description: String(p.short_description || ''),
      description: String(p.description || ''),
      category_id: catId,
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
    setSizeStock(unlimitedStockFor(sizes));
    const images = Array.isArray(p.images) ? (p.images as string[]) : [];
    resetPhotos(images);
    setError('');
    setOkMsg('');
    setShowForm(true);
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

  const makeMainPhoto = (slotIndex: number) => {
    if (slotIndex === 0) return;
    setPhotoSlots((prev) => {
      const next = [...prev];
      const [picked] = next.splice(slotIndex, 1);
      next.unshift(picked);
      while (next.length < MAX_PHOTOS) next.push(null);
      return next.slice(0, MAX_PHOTOS);
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
    if (!form.category_id) return setError('Category select karo (Men / Women / Kids)');
    if (!form.wholesale_price) return setError('Wholesale price required');
    if (!enabledSizes.length) return setError('Sizes missing');
    if (filledPhotos < MAX_PHOTOS) {
      return setError(`4 photos upload karo (${filledPhotos}/4)`);
    }

    const size_stock: Record<string, number> = {};
    for (const s of enabledSizes) {
      size_stock[s] = UNLIMITED_STOCK;
    }
    const stock = UNLIMITED_STOCK * enabledSizes.length;

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
        sku: editingId ? (form.sku.trim() || undefined) : undefined, // new: server auto DF-xxxxxx
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.length} products · category: Men / Women / Kids only
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`${inputClass} sm:w-52`}
          >
            <option value="">All Categories</option>
            {productCategories.map((c) => (
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
                <th className="text-left p-3 font-semibold">Sizes</th>
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
                const stockNum = Number(p.stock || 0);
                const unlimited = stockNum >= UNLIMITED_STOCK;
                return (
                  <tr key={p.id as string} className="border-t border-[#f0f0f0]">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={imgs[0] || '/images/products/jeans-mens-blue-1.jpg'}
                            alt=""
                            className="w-12 h-14 object-cover rounded-md bg-gray-100"
                          />
                          {imgs[0] && (
                            <span className="absolute -top-1 -left-1 bg-[#c41e3a] text-white text-[8px] font-bold px-1 rounded">
                              MAIN
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{p.name as string}</p>
                          <p className="text-xs text-gray-400">{p.sku as string}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{imgs.length}/4 photos</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{(p.category_name as string) || '—'}</td>
                    <td className="p-3 text-xs text-gray-600 max-w-[200px]">
                      {sizes.join(', ') || '—'}
                    </td>
                    <td className="p-3">₹{p.wholesale_price as string}</td>
                    <td className="p-3">{p.moq as number}</td>
                    <td className="p-3 font-medium text-green-700">{unlimited ? 'Unlimited' : stockNum}</td>
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
                  'Category * (Men / Women / Kids only)',
                  <select
                    required
                    value={form.category_id}
                    onChange={(e) => {
                      const id = e.target.value;
                      setForm({ ...form, category_id: id });
                      applyCategorySizes(id);
                    }}
                    className={inputClass}
                  >
                    <option value="">Select category</option>
                    {productCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-[#5c6775] -mt-2">
                  What&apos;s New aur Bulk Orders me ye product automatic dikhega — alag category select nahi karni.
                </p>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                </div>
                <p className="text-xs text-gray-400">SKU automatic generate hoga (jaise DF-482913).</p>
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
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Size & pieces</h3>
                  <p className="text-xs text-green-700 mt-1 font-medium">
                    Automatic · all sizes unlimited (no pieces fill karna)
                    {selectedCategory ? ` · ${selectedCategory.name}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-green-200 bg-green-50/50">
                  {enabledSizes.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-green-200 rounded-full text-sm font-medium"
                    >
                      Size {s}
                      <span className="text-[10px] uppercase tracking-wide text-green-700 font-bold">Unlimited</span>
                    </span>
                  ))}
                  {!enabledSizes.length && (
                    <span className="text-xs text-gray-500">Category select karo — sizes auto set ho jayenge</span>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Photos * ({filledPhotos}/{MAX_PHOTOS})
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Exactly 4 photos. <strong>Photo 1 = Main pic</strong> (product card & listing pe yahi dikhegi).
                  Baaki gallery me.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {photoSlots.map((slot, i) => {
                    const src = slot?.kind === 'existing' ? slot.url : slot?.kind === 'new' ? slot.preview : null;
                    const fileName = slot?.kind === 'new' ? slot.file.name : null;
                    const isMain = i === 0 && Boolean(src);
                    return (
                      <div
                        key={i}
                        className={`relative aspect-[3/4] rounded-xl border-2 overflow-hidden bg-[#fafafa] ${
                          isMain ? 'border-[#c41e3a]' : 'border-dashed border-[#e8e8e8]'
                        }`}
                      >
                        {src ? (
                          <>
                            <img src={src} alt={fileName || `Photo ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-1.5 gap-1">
                              {isMain ? (
                                <span className="inline-flex items-center gap-0.5 bg-[#c41e3a] text-white text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded">
                                  <Star size={10} fill="currentColor" /> Main
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => makeMainPhoto(i)}
                                  className="bg-black/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded hover:bg-[#c41e3a]"
                                >
                                  Set main
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => clearSlot(i)}
                                className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow shrink-0"
                              >
                                ×
                              </button>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 bg-black/65 text-white px-1.5 py-1.5">
                              <p className="text-[10px] font-semibold">Photo {i + 1}{isMain ? ' · Main' : ''}</p>
                              {fileName && (
                                <p className="text-[9px] text-white/80 truncate" title={fileName}>{fileName}</p>
                              )}
                              {slot?.kind === 'existing' && (
                                <p className="text-[9px] text-white/70">Uploaded</p>
                              )}
                              {slot?.kind === 'new' && (
                                <p className="text-[9px] text-amber-200">New · will upload on save</p>
                              )}
                            </div>
                            <label className="absolute inset-0 cursor-pointer">
                              <span className="sr-only">Change photo {i + 1}</span>
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickSlot(i, e)} />
                            </label>
                          </>
                        ) : (
                          <label className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-[#f0f0f0] transition p-2 text-center">
                            <Upload size={18} className="text-gray-400" />
                            <span className="text-xs text-gray-500 font-medium">
                              {i === 0 ? 'Main photo' : `Photo ${i + 1}`}
                            </span>
                            <span className="text-[10px] text-gray-400">Tap to upload</span>
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
                {filledPhotos > 0 && (
                  <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-[#f7f8fa] border border-[#e4e7ec]">
                    {photoSlots[0] && (
                      <img
                        src={photoSlots[0].kind === 'existing' ? photoSlots[0].url : photoSlots[0].preview}
                        alt="Main preview"
                        className="w-14 h-16 object-cover rounded-md ring-2 ring-[#c41e3a]"
                      />
                    )}
                    <div className="text-sm">
                      <p className="font-semibold text-[#0f1724]">Main pic preview</p>
                      <p className="text-xs text-gray-500">
                        Listing cards, search aur homepage pe pehli photo dikhegi.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                  Featured
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_new} onChange={(e) => setForm({ ...form, is_new: e.target.checked })} />
                  Highlight as New
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
