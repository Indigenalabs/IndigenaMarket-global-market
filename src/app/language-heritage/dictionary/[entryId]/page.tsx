'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import LanguageHeritageFrame from '../../components/LanguageHeritageFrame';
import HeritageHeroBanner from '../../components/HeritageHeroBanner';
import { fetchDictionaryEntry, type HeritageDictionaryEntry } from '@/app/lib/languageHeritageApi';

export default function DictionaryEntryPage() {
  const params = useParams<{ entryId: string }>();
  const entryId = String(params?.entryId || '');
  const [entry, setEntry] = useState<HeritageDictionaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchDictionaryEntry(entryId);
        if (!mounted) return;
        setEntry(data);
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setEntry(null);
        setError((e as Error).message || 'Failed to load dictionary entry');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (entryId) {
      void load();
    } else {
      setLoading(false);
      setEntry(null);
    }

    return () => {
      mounted = false;
    };
  }, [entryId]);

  return (
    <LanguageHeritageFrame
      title={entry ? `Dictionary Entry: ${entry.term}` : `Dictionary Entry: ${entryId}`}
      subtitle="Word definition, pronunciation, and cultural note."
    >
      {loading ? <p className="text-sm text-gray-400">Loading entry...</p> : null}
      {!loading && error ? <p className="text-sm text-red-300">{error}</p> : null}
      {!loading && !error && !entry ? <p className="text-sm text-gray-400">Entry not found.</p> : null}

      {entry ? (
        <>
          <HeritageHeroBanner
            eyebrow="Dictionary Entry"
            title={entry.term}
            description={`Language: ${entry.language} • Part of speech: ${entry.partOfSpeech} • Pronunciation: /${entry.pronunciation}/`}
            image="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1400&h=700&fit=crop"
            chips={['Pronunciation', 'Definitions', 'Cultural Note']}
          />
          <section className="space-y-2 rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
            <ul className="list-disc pl-5 text-sm text-gray-300">
              {entry.definitions.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <div className="rounded-lg border border-white/10 bg-[#0b0b0b] p-3">
              <p className="text-xs uppercase tracking-wide text-[#d4af37]">Examples</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-300">
                {entry.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-400">{entry.culturalNote}</p>
          </section>
        </>
      ) : null}
    </LanguageHeritageFrame>
  );
}
