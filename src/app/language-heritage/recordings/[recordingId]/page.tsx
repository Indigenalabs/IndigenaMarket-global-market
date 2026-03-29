'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import HeritageAccessGate from '../../components/HeritageAccessGate';
import LanguageHeritageFrame from '../../components/LanguageHeritageFrame';
import HeritageCardGrid from '../../components/HeritageCardGrid';
import HeritageHeroBanner from '../../components/HeritageHeroBanner';
import {
  exportHeritageCitation,
  fetchRecordingDetail,
  requestHeritageDownload,
  type HeritageCitationExport,
  type LanguageHeritageListing
} from '@/app/lib/languageHeritageApi';

export default function RecordingDetailPage() {
  const params = useParams<{ recordingId: string }>();
  const recordingId = String(params?.recordingId || '');
  const [recording, setRecording] = useState<LanguageHeritageListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState('');
  const [citationExport, setCitationExport] = useState<HeritageCitationExport | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchRecordingDetail(recordingId);
        if (!mounted) return;
        setRecording(data);
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setRecording(null);
        setError((e as Error).message || 'Failed to load recording');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (recordingId) {
      void load();
    } else {
      setLoading(false);
      setRecording(null);
    }

    return () => {
      mounted = false;
    };
  }, [recordingId]);

  async function handleDownload() {
    if (!recording) return;
    try {
      const grant = await requestHeritageDownload(recording.id);
      setActionFeedback(`Download ready: ${grant.fileName}`);
      window.open(grant.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setActionFeedback((e as Error).message || 'Unable to prepare archive download.');
    }
  }

  async function handleCitationExport() {
    if (!recording) return;
    try {
      const citation = await exportHeritageCitation(recording.id);
      setCitationExport(citation);
      setActionFeedback('Citation export prepared.');
    } catch (e) {
      setActionFeedback((e as Error).message || 'Unable to export citation.');
    }
  }

  return (
    <LanguageHeritageFrame
      title={recording ? `Recording: ${recording.title}` : `Recording Detail: ${recordingId}`}
      subtitle="Player, transcript, metadata, and access controls."
    >
      {loading ? <p className="text-sm text-gray-400">Loading recording...</p> : null}
      {!loading && error ? <p className="text-sm text-red-300">{error}</p> : null}
      {!loading && !error && !recording ? <p className="text-sm text-gray-400">Recording not found.</p> : null}

      {recording ? (
        <>
          <HeritageHeroBanner
            eyebrow="Recording Detail"
            title={recording.title}
            description={recording.summary}
            image={recording.image}
            chips={[recording.nation, recording.categoryLabel, `${recording.currency} ${recording.price}`]}
          />
          <div className="flex flex-wrap gap-3">
            <button onClick={handleDownload} className="rounded-full bg-[#d4af37] px-5 py-2 text-sm font-semibold text-black hover:bg-[#f4d370]">
              Download archive files
            </button>
            <button onClick={handleCitationExport} className="rounded-full border border-white/10 px-5 py-2 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white">
              Export citation
            </button>
          </div>
          {actionFeedback ? <div className="rounded-xl border border-[#d4af37]/20 bg-[#101010] px-4 py-3 text-sm text-[#f3deb1]">{actionFeedback}</div> : null}
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
          {recording.accessLevel === 'public' ? (
            <>
              <section className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
                <div className="grid gap-2 text-sm text-gray-300 md:grid-cols-2">
                  <p>Nation: <span className="text-white">{recording.nation}</span></p>
                  <p>Format: <span className="text-white capitalize">{recording.format}</span></p>
                  <p>Access: <span className="text-white">{recording.accessLevel}</span></p>
                  <p>Rating: <span className="text-white">{recording.rating.toFixed(1)} ({recording.reviews})</span></p>
                </div>
              </section>
              <HeritageCardGrid
                title="Related Tags"
                items={recording.tags.map((tag) => ({ title: tag, badge: 'Tag' }))}
              />
            </>
          ) : (
            <HeritageAccessGate
              accessLevel={recording.accessLevel}
              fallbackTitle={`${recording.accessLevel === 'elder-approved' ? 'Elder approval required' : 'Archive access required'} for this recording`}
              fallbackDetail={`"${recording.title}" is governed under ${recording.accessLevel} access rules. Upgrade archive access or request reviewed permission before the full metadata and files unlock.`}
            >
              <section className="rounded-xl border border-[#d4af37]/20 bg-[#101010] p-4">
                <div className="grid gap-2 text-sm text-gray-300 md:grid-cols-2">
                  <p>Nation: <span className="text-white">{recording.nation}</span></p>
                  <p>Format: <span className="text-white capitalize">{recording.format}</span></p>
                  <p>Access: <span className="text-white">{recording.accessLevel}</span></p>
                  <p>Rating: <span className="text-white">{recording.rating.toFixed(1)} ({recording.reviews})</span></p>
                </div>
              </section>
              <HeritageCardGrid
                title="Related Tags"
                items={recording.tags.map((tag) => ({ title: tag, badge: 'Tag' }))}
              />
            </HeritageAccessGate>
          )}
        </>
      ) : null}
    </LanguageHeritageFrame>
  );
}
