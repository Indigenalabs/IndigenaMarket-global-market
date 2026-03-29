'use client';

import CoursesMarketplace from '@/app/components/marketplace/CoursesMarketplace';
import Link from 'next/link';
import { Plus, GraduationCap } from 'lucide-react';

export default function CoursesPage() {
  return (
    <>
      {/* Header */}
      <header className="bg-[#141414] border-b border-[#d4af37]/20 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                  <GraduationCap size={24} className="text-[#d4af37]" />
                </div>
                <div>
                  <h1 className="text-white font-semibold text-lg">Courses</h1>
                  <p className="text-gray-400 text-sm">Sacred Learning Center</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link 
                href="/courses/my-courses"
                className="px-4 py-2 text-gray-400 hover:text-[#d4af37] transition-colors"
              >
                My Courses
              </Link>
              <Link 
                href="/courses/paths"
                className="px-4 py-2 text-gray-400 hover:text-[#d4af37] transition-colors"
              >
                Learning Paths
              </Link>
              <Link 
                href="/courses/create"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
              >
                <Plus size={18} />
                Create Course
              </Link>
            </div>
          </div>
        </header>

        {/* Courses Marketplace Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <CoursesMarketplace />
        </main>
    </>
  );
}
