'use client';

import { useState } from 'react';
import { X, Check, Minus, Star, Clock, Users, Award } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  thumbnail: string;
  instructor: string;
  rating: number;
  reviews: number;
  price: number;
  duration: string;
  lessons: number;
  students: number;
  level: string;
  certificate: boolean;
  features: string[];
}

interface CompareCoursesProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onRemove: (id: string) => void;
}

export default function CompareCourses({ isOpen, onClose, courses, onRemove }: CompareCoursesProps) {
  if (!isOpen || courses.length < 2) return null;

  const comparisonRows = [
    { label: 'Rating', key: 'rating', render: (c: Course) => (
      <div className="flex items-center gap-1">
        <Star size={14} className="text-[#d4af37] fill-[#d4af37]" />
        <span className="text-white">{c.rating}</span>
        <span className="text-gray-500 text-sm">({c.reviews})</span>
      </div>
    )},
    { label: 'Price', key: 'price', render: (c: Course) => (
      <span className="text-[#d4af37] font-medium">{c.price} INDI</span>
    )},
    { label: 'Duration', key: 'duration', render: (c: Course) => (
      <div className="flex items-center gap-1 text-gray-300">
        <Clock size={14} />
        {c.duration}
      </div>
    )},
    { label: 'Lessons', key: 'lessons', render: (c: Course) => (
      <span className="text-gray-300">{c.lessons} lessons</span>
    )},
    { label: 'Students', key: 'students', render: (c: Course) => (
      <div className="flex items-center gap-1 text-gray-300">
        <Users size={14} />
        {c.students.toLocaleString()}
      </div>
    )},
    { label: 'Level', key: 'level', render: (c: Course) => (
      <span className="text-gray-300">{c.level}</span>
    )},
    { label: 'Certificate', key: 'certificate', render: (c: Course) => (
      c.certificate ? (
        <div className="flex items-center gap-1 text-green-400">
          <Check size={16} />
          <span>Yes</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-gray-500">
          <Minus size={16} />
          <span>No</span>
        </div>
      )
    )},
  ];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-auto">
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Compare Courses</h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Comparison Table */}
          <div className="bg-[#141414] rounded-2xl border border-[#d4af37]/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="p-4 text-left text-gray-400 font-medium w-48">Feature</th>
                    {courses.map((course) => (
                      <th key={course.id} className="p-4 min-w-64">
                        <div className="relative">
                          <button
                            onClick={() => onRemove(course.id)}
                            className="absolute -top-2 -right-2 p-1 bg-[#0a0a0a] rounded-full text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                          <img 
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          <h3 className="text-white font-medium text-left line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-gray-400 text-sm text-left">{course.instructor}</p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d4af37]/10">
                  {comparisonRows.map((row) => (
                    <tr key={row.key}>
                      <td className="p-4 text-gray-400 font-medium">{row.label}</td>
                      {courses.map((course) => (
                        <td key={course.id} className="p-4">
                          {row.render(course)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-4"></td>
                    {courses.map((course) => (
                      <td key={course.id} className="p-4">
                        <Link
                          href={`/courses/${course.id}`}
                          className="block w-full py-2.5 bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-black font-medium rounded-lg text-center hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all"
                        >
                          View Course
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
