import AdminSessionRecovery from '@/app/admin/AdminSessionRecovery';

export default function AdminAccessDenied({ title = 'Admin access required' }: { title?: string }) {
  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-3xl rounded-[28px] border border-red-500/20 bg-[#111111] p-8">
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-gray-300">
          This admin surface requires a signed admin session with an allowed platform role.
        </p>
        <AdminSessionRecovery />
      </div>
    </main>
  );
}
