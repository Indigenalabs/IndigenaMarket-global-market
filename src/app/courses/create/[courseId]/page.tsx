'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

// This is a simplified edit page - in production, you'd fetch the existing course data
export default function EditCoursePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = String(params?.courseId || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Mock existing course data
  const courseData = {
    id: courseId,
    title: 'Navajo Weaving Masterclass',
    subtitle: 'Learn traditional techniques from a master artisan',
    description: 'Comprehensive course on Navajo weaving traditions...',
    price: 149,
    category: 'Traditional Arts',
    level: 'Beginner',
    status: 'published'
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/courses/create"
              className="flex items-center gap-2 text-gray-400 hover:text-[#d4af37] transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Studio</span>
            </Link>
            <div className="h-6 w-px bg-[#d4af37]/20" />
            <div>
              <h1 className="text-white font-semibold">Edit Course</h1>
              <p className="text-gray-400 text-sm">{courseData.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm ${
              courseData.status === 'published' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {courseData.status === 'published' ? 'Published' : 'Draft'}
            </span>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all disabled:opacity-50"
            >
              {saving ? (
                <><Loader2 size={18} className="animate-spin" /> Saving...</>
              ) : saved ? (
                <><CheckCircle size={18} /> Saved!</>
              ) : (
                <><Save size={18} /> Save Changes</>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-[#141414] rounded-xl border border-[#d4af37]/20 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Course Title</label>
              <input 
                type="text"
                defaultValue={courseData.title}
                className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Subtitle</label>
              <input 
                type="text"
                defaultValue={courseData.subtitle}
                className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Description</label>
              <textarea 
                rows={4}
                defaultValue={courseData.description}
                className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Price (INDI)</label>
                <input 
                  type="number"
                  defaultValue={courseData.price}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Category</label>
                <select 
                  defaultValue={courseData.category}
                  className="w-full bg-[#0a0a0a] border border-[#d4af37]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37]"
                >
                  <option>Traditional Arts</option>
                  <option>Language Preservation</option>
                  <option>Cultural Heritage</option>
                  <option>Business</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-400 font-medium mb-1">Full Edit Mode</h3>
              <p className="text-gray-400 text-sm">
                For complete course editing including curriculum, media, and advanced settings, 
                use the <Link href="/courses/create" className="text-[#d4af37] hover:underline">Knowledge Keeper Studio</Link>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
