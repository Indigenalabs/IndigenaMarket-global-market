'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import HeritageAccessGate from '../../components/HeritageAccessGate';
import LanguageHeritageFrame from '../../components/LanguageHeritageFrame';
import HeritageHeroBanner from '../../components/HeritageHeroBanner';
import {
  exportHeritageCitation,
  fetchToolDetail,
  requestHeritageDownload,
  type HeritageCitationExport,
  type LanguageHeritageListing
} from '@/app/lib/languageHeritageApi';

export default function ToolDetailPage() {
  const params = useParams<{ toolId: string }>();
  const toolId = String(params?.toolId || '');
  const [tool, setTool] = useState<LanguageHeritageListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [citationExport, setCitationExport] = useState<HeritageCitationExport | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchToolDetail(toolId);
        if (!mounted) return;
        setTool(data);
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setTool(null);
        setError((e as Error).message || 'Failed to load tool');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (toolId) {
      void load();
    } else {
      setLoading(false);
      setTool(null);
    }

    return () => {
      mounted = false;
    };
  }, [toolId]);

  async function handleDownload() {
    if (!tool) return;
    try {
      const grant = await requestHeritageDownload(tool.id);
      setFeedback(`Download ready: ${grant.fileName}`);
      if (grant.downloadUrl) window.open(grant.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setFeedback((e as Error).message || 'Unable to prepare tool download.');
    }
  }

  async function handleCitationExport() {
    if (!tool) return;
    try {
      const citation = await exportHeritageCitation(tool.id);
      setCitationExport(citation);
      setFeedback('Citation export prepared.');
    } catch (e) {
      setFeedback((e as Error).message || 'Unable to export citation.');
    }
  }

  return (
    <LanguageHeritageFrame
      title={tool ? `Tool: ${tool.title}` : `App / Tool Detail: ${toolId}`}
      subtitle="Features, pricing, screenshots, and review summary."
    >
      {loading ? <p className="text-sm text-gray-400">Loading tool...</p> : null}
      {!loading && error ? <p className="text-sm text-red-300">{error}</p> : null}
      {!loading && !error && !tool ? <p className="text-sm text-gray-400">Tool not found.</p> : null}

      {tool ? (
        <>
          <HeritageHeroBanner
            eyebrow="Tool Detail"
            title={tool.title}
            description={tool.summary}
            image={tool.image}
            chips={[tool.keeperName, tool.categoryLabel, `${tool.currency} ${tool.price.toLocaleString()}`]}
          />
          <div className="flex flex-wrap gap-3">
            <button onClick={handleDownload} className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
              Download tool assets
            </button>
            <button onClick={handleCitationExport} className="rounded-full border border-white/10 px-5 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white">
              Export citation
            </button>
          </div>
          {feedback ? <div className="rounded-xl border border-[#d4af37]/20 bg-[#101010] px-4 py-3 text-sm text-[#f3deb1]">{feedback}</div> : null}
          {citationExport ? (
            <section className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
              <p className="text-xs uppercase tracking-wide text-[#d4af37]">Citation export</p>
              <div className="mt-3 space-y-3 text-sm text-gray-300">
                <div><p className="text-white">Plain</p><p>{citationExport.formats.plain}</p></div>
                <div><p className="text-white">MLA</p><p>{citationExport.formats.mla}</p></div>
                <div><p className="text-white">APA</p><p>{citationExport.formats.apa}</p></div>
              </div>
            </section>
          ) : null}
          {tool.accessLevel === 'public' ? (
            <section className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
              <div className="grid gap-2 text-sm text-gray-300 md:grid-cols-2">
                <p>Creator: <span className="text-white">{tool.keeperName}</span></p>
                <p>Format: <span className="text-white capitalize">{tool.format}</span></p>
                <p>Access: <span className="text-white">{tool.accessLevel}</span></p>
                <p>Rating: <span className="text-white">{tool.rating.toFixed(1)} ({tool.reviews})</span></p>
              </div>
            </section>
          ) : (
            <HeritageAccessGate
              accessLevel={tool.accessLevel}
              fallbackTitle={`${tool.accessLevel === 'elder-approved' ? 'Elder approval required' : 'Archive access required'} for this tool`}
              fallbackDetail={`"${tool.title}" is governed under ${tool.accessLevel} access rules. Upgrade archive access or request reviewed permission before the full files unlock.`}
            >
              <section className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
                <div className="grid gap-2 text-sm text-gray-300 md:grid-cols-2">
                  <p>Creator: <span className="text-white">{tool.keeperName}</span></p>
                  <p>Format: <span className="text-white capitalize">{tool.format}</span></p>
                  <p>Access: <span className="text-white">{tool.accessLevel}</span></p>
                  <p>Rating: <span className="text-white">{tool.rating.toFixed(1)} ({tool.reviews})</span></p>
                </div>
              </section>
            </HeritageAccessGate>
          )}
        </>
      ) : null}
    </LanguageHeritageFrame>
  );
}
