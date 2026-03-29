'use client';

import { BookOpen, Calendar, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  featured?: boolean;
}

const articles: Article[] = [
  {
    id: '1',
    title: 'The Future of Indigenous Art in the Digital Age',
    excerpt: 'How NFTs and blockchain technology are empowering Indigenous artists to preserve and share their culture while reaching global audiences.',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=400&fit=crop',
    category: 'Culture',
    author: 'Sarah Mitchell',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop',
    date: 'Feb 20, 2026',
    readTime: '5 min read',
    featured: true
  },
  {
    id: '2',
    title: 'Artist Spotlight: Traditional Beadwork Meets Digital',
    excerpt: 'An interview with Maria Redfeather on blending centuries-old techniques with modern digital art.',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    category: 'Artist Profile',
    author: 'James Blackwood',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
    date: 'Feb 18, 2026',
    readTime: '8 min read'
  },
  {
    id: '3',
    title: 'Understanding NFT Royalties for Artists',
    excerpt: 'A comprehensive guide to how royalties work and why they matter for Indigenous creators.',
    image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=300&fit=crop',
    category: 'Education',
    author: 'David Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop',
    date: 'Feb 15, 2026',
    readTime: '6 min read'
  },
  {
    id: '4',
    title: 'Platform Update: New Features for Collectors',
    excerpt: 'Introducing personalized recommendations, advanced search, and more tools to discover amazing Indigenous art.',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=300&fit=crop',
    category: 'News',
    author: 'Indigena Team',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop',
    date: 'Feb 12, 2026',
    readTime: '3 min read'
  }
];

export default function BlogNews() {
  const featuredArticle = articles.find(a => a.featured);
  const regularArticles = articles.filter(a => !a.featured);

  return (
    <section className="py-16 px-6 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#b8941f] rounded-lg flex items-center justify-center">
              <BookOpen size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Stories & News</h2>
              <p className="text-gray-400 text-sm">Insights from our community</p>
            </div>
          </div>
          <Link 
            href="/blog"
            className="flex items-center gap-1 text-[#d4af37] hover:text-[#f4e4a6] transition-colors"
          >
            View All
            <ChevronRight size={18} />
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured Article */}
          {featuredArticle && (
            <div className="group lg:row-span-2">
              <div className="relative h-full bg-[#141414] rounded-2xl border border-[#d4af37]/10 overflow-hidden hover:border-[#d4af37]/30 transition-all">
                <div className="relative h-64 lg:h-80 overflow-hidden">
                  <img 
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-[#d4af37] text-black text-xs font-bold rounded-full">
                      {featuredArticle.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 group-hover:text-[#d4af37] transition-colors">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-gray-400 mb-4 line-clamp-2">{featuredArticle.excerpt}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={featuredArticle.authorAvatar}
                        alt={featuredArticle.author}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-white text-sm">{featuredArticle.author}</p>
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <Calendar size={12} />
                          <span>{featuredArticle.date}</span>
                          <span>•</span>
                          <Clock size={12} />
                          <span>{featuredArticle.readTime}</span>
                        </div>
                      </div>
                    </div>
                    <Link href="/blog" className="flex items-center gap-1 text-[#d4af37] hover:gap-2 transition-all">
                      Read <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regular Articles */}
          <div className="space-y-4">
            {regularArticles.map((article) => (
              <div 
                key={article.id}
                className="group flex gap-4 bg-[#141414] rounded-xl border border-[#d4af37]/10 p-4 hover:border-[#d4af37]/30 transition-all cursor-pointer"
              >
                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <img 
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[#d4af37] text-xs font-medium">{article.category}</span>
                  <h4 className="text-white font-semibold mb-1 truncate group-hover:text-[#d4af37] transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-2">{article.excerpt}</p>
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
