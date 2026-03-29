import { findCourseCertificate } from '@/app/lib/courseCertificates';

export default async function CourseCertificateVerifyPage({
  params
}: {
  params: Promise<{ courseId: string; studentActorId: string }>;
}) {
  const { courseId, studentActorId } = await params;
  const certificate = await findCourseCertificate(courseId, studentActorId);

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-3xl rounded-[30px] border border-[#d4af37]/20 bg-[#111111] p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Certificate Verification</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Course Certificate Status</h1>
        {!certificate ? (
          <div className="mt-6 rounded-[24px] border border-red-500/20 bg-red-500/10 p-5">
            <p className="text-lg font-semibold text-white">Certificate not found</p>
            <p className="mt-2 text-sm text-gray-300">
              No issued certificate matches this course and learner record.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-5">
              <p className="text-lg font-semibold text-white">Verified certificate</p>
              <p className="mt-2 text-sm text-gray-300">
                This certificate was issued through Indigena Global Market and is currently marked <strong>{certificate.status}</strong>.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Detail label="Certificate ID" value={certificate.certificateId} />
              <Detail label="Course ID" value={certificate.courseId} />
              <Detail label="Learner" value={certificate.studentActorId} />
              <Detail label="Issued" value={new Date(certificate.issuedAt).toLocaleString()} />
              <Detail label="Amount" value={`${certificate.currency} ${certificate.amount}`} />
              <Detail label="Verification URL" value={certificate.verificationUrl} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{label}</p>
      <p className="mt-2 break-all text-sm text-white">{value}</p>
    </div>
  );
}
