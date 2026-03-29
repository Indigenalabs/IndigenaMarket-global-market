'use client';

import { useState } from 'react';
import { FolderOpen, Plus, Edit2, Trash2, Eye, EyeOff, Package, ChevronDown, ChevronUp, CheckCircle, ImageIcon } from 'lucide-react';

interface CollectionItem {
  id: string;
  title: string;
  image: string;
  price: number;
  currency: string;
  category: string;
}

interface MakerCollection {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  items: CollectionItem[];
  isPublished: boolean;
  createdAt: string;
  totalValue: number;
}

const MOCK_COLLECTIONS: MakerCollection[] = [
  {
    id: 'c1',
    name: 'Sacred Ceremony Series',
    description: 'Items intended for ceremonial use — each piece carries elder endorsement and cultural certification.',
    coverImage: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=400&q=80',
    items: [
      { id: '5', title: 'Regalia Dance Fan', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&q=80', price: 420, currency: 'INDI', category: 'regalia' },
      { id: '1', title: 'Hand-Beaded Medicine Bag', image: 'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=100&q=80', price: 185, currency: 'INDI', category: 'beadwork' },
    ],
    isPublished: true,
    createdAt: 'Jan 12, 2026',
    totalValue: 605,
  },
  {
    id: 'c2',
    name: 'Woodland Carvings',
    description: 'Cedar, birch, and soapstone carvings from the Pacific Northwest and Eastern woodlands traditions.',
    coverImage: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&q=80',
    items: [
      { id: '6', title: 'Red Cedar Spirit Carving', image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=100&q=80', price: 890, currency: 'INDI', category: 'carving' },
      { id: '8', title: 'Inuit Soapstone Bear', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=100&q=80', price: 540, currency: 'INDI', category: 'carving' },
    ],
    isPublished: false,
    createdAt: 'Feb 3, 2026',
    totalValue: 1430,
  },
  {
    id: 'c3',
    name: 'Wearable Traditions',
    description: 'Jewelry, moccasins, and wearable craft pieces designed for everyday Indigenous expression.',
    coverImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',
    items: [
      { id: '4', title: 'Sterling Silver Thunderbird Pendant', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&q=80', price: 145, currency: 'INDI', category: 'jewelry' },
      { id: '7', title: 'Métis Floral Beaded Moccasins', image: 'https://images.unsplash.com/photo-1601823984263-b87b5972c2c1?w=100&q=80', price: 295, currency: 'INDI', category: 'textiles' },
    ],
    isPublished: true,
    createdAt: 'Feb 14, 2026',
    totalValue: 440,
  },
];

interface CreateFormState {
  name: string;
  description: string;
}

export default function MakerCollectionManager() {
  const [collections, setCollections] = useState<MakerCollection[]>(MOCK_COLLECTIONS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateFormState>({ name: '', description: '' });
  const [saved, setSaved] = useState(false);

  const togglePublish = (id: string) =>
    setCollections((prev) => prev.map((c) => c.id === id ? { ...c, isPublished: !c.isPublished } : c));

  const deleteCollection = (id: string) =>
    setCollections((prev) => prev.filter((c) => c.id !== id));

  const removeItem = (collectionId: string, itemId: string) =>
    setCollections((prev) => prev.map((c) =>
      c.id === collectionId
        ? { ...c, items: c.items.filter((i) => i.id !== itemId), totalValue: c.items.filter((i) => i.id !== itemId).reduce((s, i) => s + i.price, 0) }
        : c
    ));

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const newCol: MakerCollection = {
      id: `c${Date.now()}`,
      name: form.name,
      description: form.description,
      coverImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&q=80',
      items: [],
      isPublished: false,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      totalValue: 0,
    };
    setCollections((prev) => [...prev, newCol]);
    setForm({ name: '', description: '' });
    setShowCreate(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveEdit = (id: string) => {
    setCollections((prev) => prev.map((c) =>
      c.id === id ? { ...c, name: form.name || c.name, description: form.description || c.description } : c
    ));
    setEditingId(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const startEdit = (col: MakerCollection) => {
    setEditingId(col.id);
    setForm({ name: col.name, description: col.description });
  };

  return (
    <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#d4af37]/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
            <FolderOpen size={16} className="text-[#d4af37]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">My Collections</h3>
            <p className="text-gray-500 text-xs">{collections.length} collections · {collections.filter((c) => c.isPublished).length} published</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-green-400 text-xs">
              <CheckCircle size={12} /> Saved
            </span>
          )}
          <button
            onClick={() => { setShowCreate(true); setEditingId(null); setForm({ name: '', description: '' }); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs font-medium rounded-xl hover:bg-[#d4af37]/20 transition-colors"
          >
            <Plus size={13} />
            New Collection
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="p-5 border-b border-white/5 bg-[#0a0a0a] space-y-3">
          <h4 className="text-white text-sm font-medium">Create New Collection</h4>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Collection name (e.g. Beadwork Stories)"
            className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37]"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe this collection — its cultural significance, theme, story…"
            rows={2}
            className="w-full bg-[#141414] border border-[#d4af37]/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] resize-none"
          />
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2 text-gray-400 border border-white/10 rounded-xl text-sm hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={handleCreate} className="flex-1 py-2 bg-[#d4af37] text-black font-semibold rounded-xl text-sm hover:bg-[#f4e4a6] transition-colors">
              Create Collection
            </button>
          </div>
        </div>
      )}

      {/* Collection list */}
      <div className="divide-y divide-white/5">
        {collections.map((col) => (
          <div key={col.id}>
            {/* Row */}
            <div className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
              {/* Cover */}
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#0a0a0a]">
                {col.coverImage ? (
                  <img src={col.coverImage} alt={col.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={20} className="text-gray-600" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {editingId === col.id ? (
                  <div className="space-y-1.5">
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(col.id)} className="px-3 py-1 bg-[#d4af37] text-black text-xs font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1 text-gray-400 border border-white/10 text-xs rounded-lg hover:text-white transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white text-sm font-medium truncate">{col.name}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${
                        col.isPublished ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-500'
                      }`}>
                        {col.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Package size={10} /> {col.items.length} items</span>
                      <span className="text-[#d4af37]">{col.totalValue} INDI total</span>
                      <span>{col.createdAt}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              {editingId !== col.id && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => togglePublish(col.id)}
                    title={col.isPublished ? 'Unpublish' : 'Publish'}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      col.isPublished ? 'bg-green-500/10 text-green-400 hover:bg-red-500/10 hover:text-red-400' : 'bg-white/5 text-gray-500 hover:bg-green-500/10 hover:text-green-400'
                    }`}
                  >
                    {col.isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button
                    onClick={() => startEdit(col)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 text-gray-500 hover:text-[#d4af37] transition-colors"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === col.id ? null : col.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {expandedId === col.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>
                  <button
                    onClick={() => deleteCollection(col.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Expanded items */}
            {expandedId === col.id && (
              <div className="px-5 pb-4 bg-[#0a0a0a]">
                <p className="text-gray-500 text-xs mb-3 italic">{col.description}</p>
                {col.items.length === 0 ? (
                  <p className="text-gray-600 text-xs py-2">No items in this collection yet. Add items from the marketplace to build it out.</p>
                ) : (
                  <div className="space-y-2">
                    {col.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-[#141414] rounded-xl p-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#0a0a0a]">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{item.title}</p>
                          <p className="text-gray-500 text-xs capitalize">{item.category}</p>
                        </div>
                        <span className="text-[#d4af37] text-xs font-semibold flex-shrink-0">{item.price} {item.currency}</span>
                        <button
                          onClick={() => removeItem(col.id, item.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-[#0a0a0a] flex items-center justify-between">
        <span className="text-gray-600 text-xs">
          {collections.reduce((s, c) => s + c.items.length, 0)} total items across {collections.length} collections
        </span>
        <span className="text-[#d4af37]/60 text-xs">
          Total value: {collections.reduce((s, c) => s + c.totalValue, 0)} INDI
        </span>
      </div>
    </div>
  );
}
