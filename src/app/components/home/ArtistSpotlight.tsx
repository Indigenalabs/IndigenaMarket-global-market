'use client';

import Link from 'next/link';
import { Star, MapPin, Calendar, Users, ArrowRight, Award } from 'lucide-react';

const spotlightArtist = {
  id: 'spotlight-1',
  name: 'Maria Redfeather',
  title: 'Master Beadwork Artist',
  nation: 'Lakota Nation',
  location: 'South Dakota, USA',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&h=400&fit=crop',
  bio: 'Third-generation beadwork artist preserving traditional Lakota patterns while innovating with contemporary designs. Featured in the Smithsonian and National Museum of the American Indian.',
  specialties: ['Beadwork', 'Traditional Patterns', 'Contemporary Design'],
  stats: {
    artworks: 47,
    sales: 234,
    followers: '12.5K',
    rating: 4.9
  },
  featuredWorks: [
    {
      id: 'w1',
      title: 'Morning Star Earrings',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop',
      price: 180
    },
    {
      id: 'w2',
      title: 'Medicine Wheel Pendant',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=200&fit=crop',
      price: 320
    },
    {
      id: 'w3',
      title: 'Thunderbird Cuff',
      image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=200&h=200&fit=crop',
      price: 450
    }
  ]
};

export default function ArtistSpotlight() {
  return (
    <section className="bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8941f]">
              <Award size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Artist <span className="secondary-gradient">Spotlight</span>
              </h2>
              <p className="text-sm text-gray-500">
                Featured creator of the week. <span className="text-[#d4af37]/60">Sponsored creator feature</span>
              </p>
            </div>
          </div>
          <Link href="/artists" className="flex items-center gap-2 text-[#d4af37] transition-colors hover:text-[#f4e4a6]">
            <span className="text-sm">View Profile</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#141414] transition-all hover:border-[#d4af37]/40">
          <div className="relative h-48 overflow-hidden">
            <img src={spotlightArtist.coverImage} alt={spotlightArtist.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />

            <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-[#d4af37]/40 bg-[#0b0b0b]/75 px-3 py-1.5 backdrop-blur-sm">
              <Star size={14} className="text-[#d4af37]" fill="#d4af37" />
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#d4af37]">Sponsored</span>
            </div>
          </div>

          <div className="relative px-8 pb-8">
            <div className="absolute -top-16 left-8">
              <div className="relative">
                <img
                  src={spotlightArtist.avatar}
                  alt={spotlightArtist.name}
                  className="h-32 w-32 rounded-2xl object-cover shadow-2xl border-4 border-[#141414]"
                />
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#d4af37]">
                  <Award size={16} className="text-black" />
                </div>
              </div>
            </div>

            <div className="pt-20">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 text-3xl font-bold text-white">{spotlightArtist.name}</h3>
                  <p className="mb-2 text-lg text-[#d4af37]">{spotlightArtist.title}</p>

                  <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {spotlightArtist.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {spotlightArtist.nation}
                    </span>
                  </div>

                  <p className="mb-4 max-w-2xl leading-relaxed text-gray-300">{spotlightArtist.bio}</p>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {spotlightArtist.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-1 text-sm text-[#d4af37]"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-6 md:flex-col md:gap-4 md:text-right">
                  <div>
                    <p className="text-2xl font-bold secondary-gradient">{spotlightArtist.stats.artworks}</p>
                    <p className="text-xs text-gray-500">Artworks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold secondary-gradient">{spotlightArtist.stats.sales}</p>
                    <p className="text-xs text-gray-500">Sales</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold secondary-gradient">{spotlightArtist.stats.followers}</p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold secondary-gradient">{spotlightArtist.stats.rating}</p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-[#d4af37]/10 pt-6">
                <h4 className="mb-4 flex items-center gap-2 font-semibold text-white">
                  <Calendar size={16} className="text-[#d4af37]" />
                  Featured Works
                </h4>
                <div className="grid grid-cols-3 gap-4 md:grid-cols-3">
                  {spotlightArtist.featuredWorks.map((work) => (
                    <div
                      key={work.id}
                      className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#d4af37]/10 bg-[#0f0f0f] transition-all hover:border-[#d4af37]/30"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={work.image}
                          alt={work.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-3">
                        <p className="truncate text-sm font-medium text-white">{work.title}</p>
                        <p className="text-sm font-semibold text-[#d4af37]">{work.price} INDI</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/artists" className="rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8941f] px-8 py-3 font-semibold text-black transition-all hover:shadow-lg hover:shadow-[#d4af37]/30">
                  View Full Profile
                </Link>
                <Link href="/digital-arts/commission-request" className="rounded-full border border-[#d4af37]/30 px-8 py-3 font-semibold text-[#d4af37] transition-all hover:bg-[#d4af37]/10">
                  Commission Work
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

