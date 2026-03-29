'use client';

import { useState } from 'react';
import { 
  Plus, Image as ImageIcon, Edit2, Trash2, Eye, Grid3X3, 
  Layers, DollarSign, BarChart3, MoreVertical, Check
} from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  itemCount: number;
  floorPrice: number;
  volume: number;
  isPublished: boolean;
  createdAt: string;
}

interface CollectionManagerProps {
  collections?: Collection[];
  onCreateCollection: (data: { name: string; description: string }) => void;
  onEditCollection: (id: string, data: { name: string; description: string }) => void;
  onDeleteCollection: (id: string) => void;
  onPublishCollection: (id: string) => void;
  onViewCollection: (id: string) => void;
}

export default function CollectionManager({
  collections = [],
  onCreateCollection,
  onEditCollection,
  onDeleteCollection,
  onPublishCollection,
  onViewCollection
}: CollectionManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });

  const handleCreate = () => {
    if (newCollection.name.trim()) {
      onCreateCollection(newCollection);
      setNewCollection({ name: '', description: '' });
      setShowCreateModal(false);
    }
  };

  const handleEdit = () => {
    if (editingCollection && newCollection.name.trim()) {
      onEditCollection(editingCollection.id, newCollection);
      setEditingCollection(null);
      setNewCollection({ name: '', description: '' });
    }
  };

  const openEditModal = (collection: Collection) => {
    setEditingCollection(collection);
    setNewCollection({ name: collection.name, description: collection.description });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">My Collections</h2>
          <p className="text-gray-400 text-sm">Organize your artworks into themed collections</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Create Collection
        </button>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="text-center py-12 bg-[#141414] rounded-xl border border-dashed border-[#d4af37]/30">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#d4af37]/10 rounded-full flex items-center justify-center">
            <Layers size={32} className="text-[#d4af37]" />
          </div>
          <h3 className="text-white font-semibold mb-2">No Collections Yet</h3>
          <p className="text-gray-400 text-sm mb-4">Create your first collection to organize your artworks</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#d4af37]/10 text-[#d4af37] font-medium rounded-lg hover:bg-[#d4af37]/20 transition-colors"
          >
            Create Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <div 
              key={collection.id}
              className="bg-[#141414] rounded-xl border border-[#d4af37]/20 overflow-hidden group hover:border-[#d4af37]/50 transition-colors"
            >
              {/* Cover Image */}
              <div 
                className="relative h-40 bg-[#0a0a0a] cursor-pointer"
                onClick={() => onViewCollection(collection.id)}
              >
                {collection.coverImage ? (
                  <img 
                    src={collection.coverImage}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={48} className="text-gray-600" />
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onViewCollection(collection.id); }}
                    className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditModal(collection); }}
                    className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    collection.isPublished 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {collection.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold mb-1 truncate">{collection.name}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{collection.description}</p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-[#0a0a0a] rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
                      <Grid3X3 size={12} />
                      Items
                    </div>
                    <span className="text-white font-semibold">{collection.itemCount}</span>
                  </div>
                  <div className="p-2 bg-[#0a0a0a] rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
                      <DollarSign size={12} />
                      Floor
                    </div>
                    <span className="text-white font-semibold">{collection.floorPrice}</span>
                  </div>
                  <div className="p-2 bg-[#0a0a0a] rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mb-1">
                      <BarChart3 size={12} />
                      Volume
                    </div>
                    <span className="text-white font-semibold">{collection.volume}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  {!collection.isPublished && (
                    <button 
                      onClick={() => onPublishCollection(collection.id)}
                      className="flex-1 py-2 bg-[#d4af37] text-black text-sm font-medium rounded-lg hover:bg-[#f4e4a6] transition-colors"
                    >
                      Publish
                    </button>
                  )}
                  <button 
                    onClick={() => openEditModal(collection)}
                    className="flex-1 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#1a1a1a] transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDeleteCollection(collection.id)}
                    className="px-3 py-2 bg-[#DC143C]/10 text-[#DC143C] rounded-lg hover:bg-[#DC143C]/20 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCollection) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#141414] rounded-xl p-6 border border-[#d4af37]/20">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingCollection ? 'Edit Collection' : 'Create Collection'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Collection Name</label>
                <input
                  type="text"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
                  placeholder="e.g., Sacred Spirits Collection"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">Description</label>
                <textarea
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] h-24 resize-none"
                  placeholder="Describe your collection..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCollection(null);
                  setNewCollection({ name: '', description: '' });
                }}
                className="flex-1 py-3 bg-[#0a0a0a] text-white font-medium rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={editingCollection ? handleEdit : handleCreate}
                className="flex-1 py-3 bg-[#d4af37] text-black font-semibold rounded-lg hover:bg-[#f4e4a6] transition-colors"
              >
                {editingCollection ? 'Save Changes' : 'Create Collection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
