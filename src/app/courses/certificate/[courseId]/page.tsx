'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Award, CheckCircle2, ChevronLeft, Download, ExternalLink, Shield } from 'lucide-react';
import {
  fetchCourseById,
  fetchCourseCertificateStatus,
  issueCourseCertificatePurchase,
  type CourseCertificateRecord,
  type CourseRecord
} from '@/app/lib/coursesMarketplaceApi';

export default function CertificatePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = String(params?.courseId || '');
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [certificate, setCertificate] = useState<CourseCertificateRecord | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [courseResult, certificateResult] = await Promise.all([
          fetchCourseById(courseId),
          fetchCourseCertificateStatus(courseId)
        ]);
        if (cancelled) return;
        setCourse(courseResult);
        setCertificate(certificateResult?.certificate ?? null);
        setCompleted(Boolean(certificateResult?.completed));
      } catch (error) {
        if (cancelled) return;
        setFeedback(error instanceof Error ? error.message : 'Unable to load certificate status.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (courseId) void load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  async function handleIssue() {
    try {
      setIssuing(true);
      setFeedback('');
      const result = (await issueCourseCertificatePurchase(courseId)) as { certificate?: CourseCertificateRecord };
      if (result.certificate) {
        setCertificate(result.certificate);
        setFeedback('Certificate issued and recorded.');
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to issue certificate.');
    } finally {
      setIssuing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-[#d4af37]/20 bg-[#141414] px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link href="/courses/my-courses" className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#d4af37]">
            <ChevronLeft size={16} /> Back to My Courses
          </Link>
          <div className="text-sm text-gray-400">Course certificate</div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {loading ? <p className="text-sm text-gray-400">Loading certificate status...</p> : null}
        {feedback ? <div className="mb-6 rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-sm text-[#f3deb1]">{feedback}</div> : null}

        <section className="rounded-[28px] border border-[#d4af37]/25 bg-[#101010] p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Verified completion</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">{course?.title || 'Course certificate'}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-300">
                Completion certificates are paid verification products. Finish the course, issue the certificate, then download or share the verification record.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Certificate fee</p>
              <p className="mt-1 text-2xl font-semibold text-[#d4af37]">$25.00</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Course status</p>
              <p className="mt-2 text-lg font-semibold text-white">{completed ? 'Completed' : 'In progress'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Certificate state</p>
              <p className="mt-2 text-lg font-semibold text-white">{certificate ? 'Issued' : 'Not issued'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Verification</p>
              <p className="mt-2 text-lg font-semibold text-white">{certificate ? certificate.certificateId : 'Pending purchase'}</p>
            </div>
          </div>
          {certificate ? (
            <div className="mt-6 rounded-[24px] border border-[#d4af37]/20 bg-[#d4af37]/10 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">XRPL trust layer</p>
                  <h2 className="mt-2 text-lg font-semibold text-white">Certificate proof is anchored and shareable</h2>
                </div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white">
                  {certificate.trustStatus || 'pending'}
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Stat label="Trust record" value={certificate.trustRecordId || 'Pending link'} />
                <Stat label="XRPL transaction" value={certificate.xrplTransactionHash || 'Pending anchor'} />
                <Stat label="Token ID" value={certificate.xrplTokenId || 'Pending token'} />
                <Stat label="Ledger index" value={certificate.xrplLedgerIndex || 'Pending ledger'} />
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Anchor URI</p>
                <p className="mt-2 break-all text-sm text-white">{certificate.anchorUri || 'Pending anchor URI'}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {!certificate ? (
              <button
                onClick={handleIssue}
                disabled={issuing || !completed}
                className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370] disabled:opacity-60"
              >
                {issuing ? 'Issuing...' : completed ? 'Pay and issue certificate' : 'Finish course first'}
              </button>
            ) : (
              <>
                <a
                  href={`/api/courses/${courseId}/certificate-pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black hover:bg-[#f4d370]"
                >
                  <Download size={16} className="mr-2 inline-block" /> Download certificate
                </a>
                <a
                  href={certificate.verificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/10 px-5 py-3 text-sm text-gray-300 hover:border-[#d4af37]/30 hover:text-white"
                >
                  <ExternalLink size={16} className="mr-2 inline-block" /> Open verification link
                </a>
              </>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-[#101010] p-6 md:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 p-2 text-[#d4af37]">
              <Award size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Issuance rules</p>
              <h2 className="mt-1 text-xl font-semibold text-white">What this purchase unlocks</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <CheckCircle2 size={18} className="text-emerald-300" />
              <p className="mt-3 text-sm font-medium text-white">Verified completion record</p>
              <p className="mt-2 text-sm leading-6 text-gray-400">Creates a permanent course certificate record tied to your course completion.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <Shield size={18} className="text-[#d4af37]" />
              <p className="mt-3 text-sm font-medium text-white">Trust and verification</p>
              <p className="mt-2 text-sm leading-6 text-gray-400">Adds a verifiable certificate ID and shareable validation link for portfolios or job applications.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <Download size={18} className="text-sky-300" />
              <p className="mt-3 text-sm font-medium text-white">Download-ready artifact</p>
              <p className="mt-2 text-sm leading-6 text-gray-400">Unlocks a downloadable certificate document after successful issuance.</p>
            </div>
          </div>
          {certificate ? (
            <div className="mt-6 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 p-4 text-sm text-[#f3deb1]">
              Issued on {new Date(certificate.issuedAt).toLocaleDateString('en-AU')} · {certificate.currency} {certificate.amount.toFixed(2)}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <p className="mt-2 break-all text-sm text-white">{value}</p>
    </div>
  );
}
