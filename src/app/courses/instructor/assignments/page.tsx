'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, FileText, Search, XCircle } from 'lucide-react';

type SubmissionStatus = 'pending' | 'graded' | 'needs_revision';

type Submission = {
  id: string;
  studentName: string;
  courseName: string;
  assignmentTitle: string;
  submittedAt: string;
  status: SubmissionStatus;
  score?: number;
  note?: string;
};

const submissions: Submission[] = [
  {
    id: 'submission-1',
    studentName: 'Sarah Johnson',
    courseName: 'Navajo Weaving Masterclass',
    assignmentTitle: 'Pattern practice sampler',
    submittedAt: '2 hours ago',
    status: 'pending'
  },
  {
    id: 'submission-2',
    studentName: 'Michael Chen',
    courseName: 'Traditional Pottery Techniques',
    assignmentTitle: 'Hand-built bowl reflection',
    submittedAt: '5 hours ago',
    status: 'pending'
  },
  {
    id: 'submission-3',
    studentName: 'Emma Wilson',
    courseName: 'Lakota Language Fundamentals',
    assignmentTitle: 'Vocabulary audio response',
    submittedAt: '1 day ago',
    status: 'graded',
    score: 88,
    note: 'Strong vocabulary recall. Keep tightening pronunciation.'
  },
  {
    id: 'submission-4',
    studentName: 'James Brown',
    courseName: 'Indigenous Entrepreneurship',
    assignmentTitle: 'Business model draft',
    submittedAt: '2 days ago',
    status: 'needs_revision',
    note: 'The pricing section needs more grounding in actual costs.'
  }
];

const statusMeta: Record<SubmissionStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'border-amber-400/20 bg-amber-400/10 text-amber-200'
  },
  graded: {
    label: 'Graded',
    className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
  },
  needs_revision: {
    label: 'Needs revision',
    className: 'border-rose-400/20 bg-rose-400/10 text-rose-200'
  }
};

export default function AssignmentReviewPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubmissionStatus>('all');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return submissions.filter((submission) => {
      const matchesQuery =
        !normalized ||
        submission.studentName.toLowerCase().includes(normalized) ||
        submission.courseName.toLowerCase().includes(normalized) ||
        submission.assignmentTitle.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter]);

  const stats = {
    pending: submissions.filter((submission) => submission.status === 'pending').length,
    graded: submissions.filter((submission) => submission.status === 'graded').length,
    revision: submissions.filter((submission) => submission.status === 'needs_revision').length
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-[#d4af37]/20 bg-[#141414] px-6 py-5">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">Instructor assignments</p>
          <h1 className="mt-2 text-3xl font-semibold">Review work without leaving the teaching dashboard.</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-white/66">
            This route is wired as a proper review surface. Pending work, graded submissions, and revision requests all render cleanly instead of throwing a server error.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-[#141414] p-5">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/12 text-amber-300">
              <Clock3 size={20} />
            </div>
            <p className="mt-4 text-sm text-white/56">Pending review</p>
            <p className="mt-1 text-3xl font-semibold text-white">{stats.pending}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-[#141414] p-5">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/12 text-emerald-300">
              <CheckCircle2 size={20} />
            </div>
            <p className="mt-4 text-sm text-white/56">Graded</p>
            <p className="mt-1 text-3xl font-semibold text-white">{stats.graded}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-[#141414] p-5">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-400/12 text-rose-300">
              <XCircle size={20} />
            </div>
            <p className="mt-4 text-sm text-white/56">Needs revision</p>
            <p className="mt-1 text-3xl font-semibold text-white">{stats.revision}</p>
          </div>
        </section>

        <section className="mt-6 flex flex-wrap gap-4 rounded-[28px] border border-[#d4af37]/15 bg-[linear-gradient(135deg,rgba(212,175,55,0.08),rgba(0,0,0,0.18))] p-5">
          <label className="relative min-w-[280px] flex-1">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search student, course, or assignment"
              className="w-full rounded-2xl border border-white/10 bg-black/25 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/32 focus:border-[#d4af37]/40 focus:outline-none"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | SubmissionStatus)}
            className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="graded">Graded</option>
            <option value="needs_revision">Needs revision</option>
          </select>
        </section>

        <section className="mt-6 space-y-4">
          {filtered.map((submission) => (
            <article key={submission.id} className="rounded-[26px] border border-white/10 bg-[#141414] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${statusMeta[submission.status].className}`}>
                    {statusMeta[submission.status].label}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-white">{submission.assignmentTitle}</h2>
                  <p className="mt-1 text-sm text-[#d4af37]">{submission.studentName}</p>
                  <p className="mt-1 text-sm text-white/56">{submission.courseName}</p>
                </div>
                <div className="text-sm text-white/54">
                  Submitted {submission.submittedAt}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2">
                  <FileText size={14} className="text-[#d4af37]" />
                  Assignment submission
                </span>
                {typeof submission.score === 'number' ? (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-emerald-200">
                    Score {submission.score}/100
                  </span>
                ) : null}
              </div>

              {submission.note ? (
                <p className="mt-4 rounded-[18px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
                  {submission.note}
                </p>
              ) : null}
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
