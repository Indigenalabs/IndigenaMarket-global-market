import Link from 'next/link';
import type { ReactNode } from 'react';

type Tone = 'program' | 'community' | 'story' | 'social' | 'treasury';

type Action = {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary';
};

type Stat = {
  label: string;
  value: string;
  note?: string;
};

const toneStyles: Record<Tone, { shell: string; glow: string; frame: string; rail: string }> = {
  program: {
    shell: 'from-[#120f08] via-[#1c1610] to-[#0b0b0b]',
    glow: 'from-[#d6a64f]/30 via-[#e8c98b]/10 to-transparent',
    frame: 'from-[#261a0d]/80 via-[#16110b]/80 to-[#0c0a08]/95',
    rail: 'from-[#d6a64f] via-[#f0d28d] to-[#c7851b]'
  },
  community: {
    shell: 'from-[#081514] via-[#10221e] to-[#0a0f10]',
    glow: 'from-[#4ec5ac]/25 via-[#97f2df]/10 to-transparent',
    frame: 'from-[#102923]/85 via-[#11201c]/85 to-[#0a1010]/95',
    rail: 'from-[#7be0c1] via-[#d4f8e7] to-[#4cb497]'
  },
  story: {
    shell: 'from-[#1b120e] via-[#231714] to-[#0f0d0b]',
    glow: 'from-[#ff9462]/20 via-[#ffe0b5]/10 to-transparent',
    frame: 'from-[#2c1c17]/80 via-[#1d1511]/85 to-[#100d0b]/95',
    rail: 'from-[#ffb46d] via-[#fff0d5] to-[#f26c3b]'
  },
  social: {
    shell: 'from-[#12111d] via-[#18172a] to-[#0b0b11]',
    glow: 'from-[#8fb2ff]/25 via-[#d4dcff]/10 to-transparent',
    frame: 'from-[#221f3e]/80 via-[#151426]/85 to-[#0b0b11]/95',
    rail: 'from-[#8eb2ff] via-[#ebf1ff] to-[#7485ff]'
  },
  treasury: {
    shell: 'from-[#11170d] via-[#1b2514] to-[#0c0f0b]',
    glow: 'from-[#a8d96f]/22 via-[#e8ffd0]/10 to-transparent',
    frame: 'from-[#20301a]/80 via-[#141c10]/85 to-[#0c100b]/95',
    rail: 'from-[#b8ea79] via-[#f0ffd8] to-[#7ca93b]'
  }
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export const surfaceSecondaryActionClass =
  'inline-flex items-center rounded-full border border-white/14 bg-white/6 px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/10';
export const surfacePrimaryActionClass =
  'inline-flex items-center rounded-full bg-[linear-gradient(135deg,#f5dfb2,#d7a04d_55%,#be7a21)] px-5 py-2.5 text-sm font-semibold text-[#120e08] shadow-[0_14px_40px_rgba(215,160,77,0.22)] transition hover:translate-y-[-1px]';
export const surfaceInputClass =
  'w-full rounded-[20px] border border-white/12 bg-black/28 px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-white/30 focus:bg-black/36';
export const surfaceTextareaClass =
  'min-h-[130px] w-full rounded-[24px] border border-white/12 bg-black/28 px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-white/30 focus:bg-black/36';

export function SurfacePage({ tone, children }: { tone: Tone; children: ReactNode }) {
  const style = toneStyles[tone];
  return (
    <main className={cn('min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_28%),#070707] px-4 py-6 text-white md:px-8 md:py-8', `bg-gradient-to-b ${style.shell}`)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.09),transparent_26%),radial-gradient(circle_at_85%_18%,rgba(255,255,255,0.05),transparent_20%)]" />
      <div className={cn('pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full blur-3xl', `bg-gradient-to-br ${style.glow}`)} />
      <div className="relative mx-auto max-w-7xl space-y-8">{children}</div>
    </main>
  );
}

export function SurfaceHero({
  tone,
  eyebrow,
  title,
  description,
  actions = [],
  stats = [],
  image,
  aside
}: {
  tone: Tone;
  eyebrow: string;
  title: string;
  description: string;
  actions?: Action[];
  stats?: Stat[];
  image?: string;
  aside?: ReactNode;
}) {
  const style = toneStyles[tone];
  return (
    <section className={cn('relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] md:p-8 lg:p-10', style.frame)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_24%),linear-gradient(125deg,rgba(255,255,255,0.05),transparent_44%)]" />
      {image ? <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] bg-cover bg-center opacity-30 mix-blend-screen lg:block" style={{ backgroundImage: `url(${image})` }} /> : null}
      <div className="pointer-events-none absolute inset-y-0 right-[38%] hidden w-px bg-gradient-to-b from-transparent via-white/14 to-transparent lg:block" />
      <div className="relative grid gap-8 lg:grid-cols-[1.2fr,0.8fr] lg:items-end">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/68">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[0.94] text-white md:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/74 md:text-[15px]">{description}</p>
          {actions.length ? (
            <div className="mt-7 flex flex-wrap gap-3">
              {actions.map((action) => (
                <Link key={`${action.href}-${action.label}`} href={action.href} className={action.variant === 'secondary' ? surfaceSecondaryActionClass : surfacePrimaryActionClass}>
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        <div className="space-y-4">{aside}</div>
      </div>
      {stats.length ? <SurfaceMetricRibbon tone={tone} stats={stats} className="relative mt-8" /> : null}
    </section>
  );
}

export function SurfaceMetricRibbon({ tone, stats, className }: { tone: Tone; stats: Stat[]; className?: string }) {
  const style = toneStyles[tone];
  return (
    <div className={cn('grid overflow-hidden rounded-[28px] border border-white/10 bg-black/20 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-4', className)}>
      {stats.map((stat, index) => (
        <div key={stat.label} className={cn('relative px-5 py-4 md:px-6 md:py-5', index < stats.length - 1 && 'border-b border-white/8 sm:border-b-0 sm:border-r')}>
          <div className={cn('mb-3 h-[2px] w-14 rounded-full bg-gradient-to-r', style.rail)} />
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/46">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white md:text-[2rem]">{stat.value}</p>
          {stat.note ? <p className="mt-1 text-xs text-white/54">{stat.note}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function SurfaceSectionHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.3em] text-white/46">{eyebrow}</p>
        <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">{title}</h2>
        {description ? <p className="mt-3 text-sm leading-7 text-white/66">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function SurfaceEditorialCard({
  tone,
  title,
  description,
  eyebrow,
  image,
  meta,
  actions
}: {
  tone: Tone;
  title: string;
  description: string;
  eyebrow?: string;
  image?: string;
  meta?: string;
  actions?: ReactNode;
}) {
  const style = toneStyles[tone];
  return (
    <article className="group relative overflow-hidden rounded-[34px] border border-white/10 bg-black/18 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm">
      <div className="grid min-h-[280px] lg:grid-cols-[0.52fr,0.48fr]">
        <div className={cn('relative min-h-[190px] bg-gradient-to-br', style.frame)}>
          {image ? <div className="absolute inset-0 bg-cover bg-center opacity-72 transition duration-500 group-hover:scale-[1.04]" style={{ backgroundImage: `url(${image})` }} /> : null}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.45)_78%)]" />
          <div className="absolute left-5 top-5 rounded-full border border-white/14 bg-black/26 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-white/72">{eyebrow || 'Feature'}</div>
        </div>
        <div className="flex flex-col justify-between px-5 py-5 md:px-6 md:py-6">
          <div>
            <h3 className="max-w-xl text-2xl font-semibold leading-tight text-white">{title}</h3>
            <p className="mt-4 text-sm leading-7 text-white/70">{description}</p>
          </div>
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            {meta ? <p className="text-[11px] uppercase tracking-[0.22em] text-white/46">{meta}</p> : <span />}
            {actions}
          </div>
        </div>
      </div>
    </article>
  );
}

export function SurfaceListStrip({
  eyebrow,
  title,
  description,
  meta,
  accent,
  actions
}: {
  eyebrow?: string;
  title: string;
  description: string;
  meta?: string;
  accent?: string;
  actions?: ReactNode;
}) {
  return (
    <article className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/18 px-5 py-5 backdrop-blur-sm md:px-6 md:py-6">
      <div className="absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,#f1dfb6,#ca8932)]" />
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl pl-2 md:pl-4">
          {eyebrow ? <p className="text-[11px] uppercase tracking-[0.22em] text-white/46">{eyebrow}</p> : null}
          <h3 className="mt-2 text-xl font-semibold text-white md:text-2xl">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-white/68">{description}</p>
          {meta ? <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-white/46">{meta}</p> : null}
        </div>
        <div className="shrink-0">{actions}</div>
      </div>
      {accent ? <p className="mt-4 pl-2 text-xs text-[#f1d28a] md:pl-4">{accent}</p> : null}
    </article>
  );
}
