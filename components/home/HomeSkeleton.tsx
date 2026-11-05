function SkeletonBlock({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    />
  )
}

function HeaderSkeleton() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#222222]/10 bg-[#FDFBF7]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <SkeletonBlock className="h-5 w-40 bg-[#1E5336]/15" />
        <div className="hidden items-center gap-8 lg:flex">
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonBlock key={i} className="h-2.5 w-14 bg-[#222222]/10" delay={i * 70} />
          ))}
        </div>
        <SkeletonBlock className="hidden h-3 w-28 bg-[#1E5336]/15 sm:block" />
        <SkeletonBlock className="h-6 w-6 bg-[#1E5336]/15 lg:hidden" />
      </div>
    </header>
  )
}

function HeroSkeleton() {
  return (
    <section className="relative w-full min-h-[560px] overflow-hidden bg-[#1E5336] sm:min-h-[640px] md:min-h-[720px] lg:min-h-[820px]">
      <div className="relative mx-auto flex max-w-[1440px] min-h-[560px] flex-col justify-between px-4 py-6 sm:min-h-[640px] sm:px-6 sm:py-8 md:min-h-[720px] md:px-10 md:py-10 lg:min-h-[820px] lg:px-16 lg:py-14">
        <div className="flex justify-between">
          <SkeletonBlock className="h-2.5 w-28 bg-[#FDFBF7]/20" />
          <SkeletonBlock className="hidden h-2.5 w-24 bg-[#FDFBF7]/20 sm:block" delay={80} />
        </div>

        <div className="max-w-3xl">
          <div className="space-y-3">
            <SkeletonBlock className="h-10 w-[78%] bg-[#FDFBF7]/15 sm:h-16 md:h-24 lg:h-32" />
            <SkeletonBlock className="h-10 w-[62%] bg-[#FDFBF7]/15 sm:h-16 md:h-24 lg:h-32" delay={90} />
            <SkeletonBlock className="h-10 w-[45%] bg-[#FDFBF7]/15 sm:h-16 md:h-24 lg:h-32" delay={180} />
          </div>
          <div className="mt-5 space-y-2 sm:mt-8">
            <SkeletonBlock className="h-3 w-64 max-w-full bg-[#FDFBF7]/15" delay={120} />
            <SkeletonBlock className="h-3 w-52 max-w-full bg-[#FDFBF7]/15" delay={200} />
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:mt-9 sm:flex-row sm:gap-3">
            <SkeletonBlock className="h-10 w-44 border border-[#FDFBF7]/25 bg-[#FDFBF7]/10" delay={140} />
            <SkeletonBlock className="h-10 w-36 bg-[#FDFBF7]/10" delay={220} />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#FDFBF7]/30 pt-4 sm:flex-row sm:justify-between">
          <SkeletonBlock className="h-2.5 w-40 bg-[#E1A728]/30" />
          <SkeletonBlock className="h-2.5 w-32 bg-[#FDFBF7]/20" delay={90} />
        </div>
      </div>
    </section>
  )
}

function CheckBookingSkeleton() {
  return (
    <section className="bg-white px-6 py-14 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 border border-[#222222]/10 bg-[#F3F0EC] p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-14 lg:p-14">
          <div>
            <SkeletonBlock className="h-2.5 w-28 bg-[#E1A728]/40" />
            <SkeletonBlock className="mt-4 h-8 w-64 max-w-full bg-[#1E5336]/15 sm:h-10" delay={60} />
            <SkeletonBlock className="mt-2 h-8 w-40 bg-[#1E5336]/15 sm:h-10" delay={120} />
            <div className="mt-4 space-y-2">
              <SkeletonBlock className="h-3 w-full max-w-md bg-[#222222]/10" delay={80} />
              <SkeletonBlock className="h-3 w-4/5 max-w-sm bg-[#222222]/10" delay={140} />
            </div>
            <div className="mt-6 flex gap-2">
              <SkeletonBlock className="h-6 w-16 bg-[#1E5336]/10" delay={100} />
              <SkeletonBlock className="h-6 w-16 bg-[#E1A728]/25" delay={160} />
              <SkeletonBlock className="h-6 w-16 bg-[#222222]/10" delay={220} />
            </div>
          </div>

          <div>
            <div className="flex gap-2">
              <SkeletonBlock className="h-12 flex-1 border border-[#222222]/10 bg-[#FDFBF7]" />
              <SkeletonBlock className="h-12 w-32 border border-[#222222]/10 bg-white" delay={70} />
            </div>
            <SkeletonBlock className="mt-5 h-36 w-full border border-[#222222]/10 bg-white" delay={120} />
          </div>
        </div>
      </div>
    </section>
  )
}

function FacilitiesSkeleton() {
  return (
    <section className="bg-[#F3F0EC] px-6 py-16 sm:py-24 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <SkeletonBlock className="h-2.5 w-24 bg-[#E1A728]/40" />
            <SkeletonBlock className="mt-4 h-9 w-72 max-w-full bg-[#1E5336]/15 sm:h-12 md:h-16" />
            <SkeletonBlock className="mt-2 h-9 w-52 bg-[#1E5336]/15 sm:h-12 md:h-16" delay={80} />
          </div>
          <div className="max-w-xs space-y-2">
            <SkeletonBlock className="h-3 w-full bg-[#222222]/10" />
            <SkeletonBlock className="h-3 w-4/5 bg-[#222222]/10" delay={70} />
          </div>
        </div>

        <div className="my-12 flex gap-2 overflow-hidden pb-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonBlock key={i} className="h-8 w-24 bg-[#222222]/10" delay={i * 60} />
          ))}
        </div>

        <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <article key={i}>
              <SkeletonBlock className="aspect-[4/5] w-full bg-[#1E5336]/10" delay={i * 90} />
              <div className="pt-5">
                <div className="flex items-center justify-between gap-3">
                  <SkeletonBlock className="h-2.5 w-20 bg-[#E1A728]/35" delay={i * 90} />
                  <SkeletonBlock className="h-5 w-16 bg-[#222222]/10" delay={i * 90} />
                </div>
                <SkeletonBlock className="mt-3 h-6 w-36 bg-[#1E5336]/15" delay={i * 90} />
                <div className="mt-2 space-y-2">
                  <SkeletonBlock className="h-2.5 w-full bg-[#222222]/10" delay={i * 90} />
                  <SkeletonBlock className="h-2.5 w-3/4 bg-[#222222]/10" delay={i * 90} />
                </div>
                <div className="mt-5 flex justify-end border-t border-[#222222]/15 pt-4">
                  <SkeletonBlock className="h-4 w-4 bg-[#1E5336]/15" delay={i * 90} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function PoolHouseSkeleton() {
  return (
    <section className="w-full px-6 py-16 sm:py-24 lg:px-10 lg:py-36">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_.9fr]">
        <SkeletonBlock className="min-h-[320px] w-full bg-[#1E5336]/10 sm:min-h-[440px] lg:min-h-[540px]" />
        <div className="flex flex-col justify-between py-4">
          <div>
            <SkeletonBlock className="h-2.5 w-28 bg-[#E1A728]/40" />
            <SkeletonBlock className="mt-5 h-10 w-full bg-[#1E5336]/15 sm:h-12 md:h-16" />
            <SkeletonBlock className="mt-2 h-10 w-3/4 bg-[#1E5336]/15 sm:h-12 md:h-16" delay={80} />
            <div className="mt-6 space-y-2 sm:mt-8">
              <SkeletonBlock className="h-3 w-full max-w-sm bg-[#222222]/10" />
              <SkeletonBlock className="h-3 w-5/6 max-w-sm bg-[#222222]/10" delay={70} />
              <SkeletonBlock className="h-3 w-2/3 max-w-sm bg-[#222222]/10" delay={140} />
            </div>
          </div>
          <SkeletonBlock className="mt-10 h-4 w-36 bg-[#1E5336]/15 sm:mt-16" delay={120} />
        </div>
      </div>
    </section>
  )
}

function QueueSkeleton() {
  return (
    <section className="bg-[#1E5336] px-6 py-16 sm:py-24 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <SkeletonBlock className="h-2.5 w-16 bg-[#E1A728]/35" />
            <SkeletonBlock className="mt-4 h-9 w-72 max-w-full bg-[#FDFBF7]/15 sm:h-12 md:h-16" />
            <SkeletonBlock className="mt-2 h-9 w-52 bg-[#FDFBF7]/15 sm:h-12 md:h-16" delay={80} />
          </div>
          <SkeletonBlock className="h-2.5 w-32 bg-[#FDFBF7]/20" delay={60} />
        </div>

        <div className="mt-10 flex gap-2 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <SkeletonBlock key={i} className="h-9 w-24 bg-[#FDFBF7]/10" delay={i * 70} />
          ))}
        </div>

        <div className="mt-6 border border-[#FDFBF7]/20 p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>
                <SkeletonBlock className="h-2.5 w-20 bg-[#FDFBF7]/20" delay={i * 80} />
                <SkeletonBlock className="mt-3 h-7 w-16 bg-[#FDFBF7]/15" delay={i * 80} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CtaSkeleton() {
  return (
    <section className="w-full px-6 py-16 text-center sm:py-24 lg:px-10 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <SkeletonBlock className="mx-auto h-2.5 w-24 bg-[#E1A728]/40" />
        <SkeletonBlock className="mx-auto mt-5 h-10 w-4/5 max-w-3xl bg-[#1E5336]/15 sm:h-14 md:h-20" />
        <SkeletonBlock className="mx-auto mt-3 h-10 w-3/5 max-w-2xl bg-[#1E5336]/15 sm:h-14 md:h-20" delay={80} />
        <SkeletonBlock className="mx-auto mt-10 h-14 w-48 border border-[#1E5336]/20 bg-[#1E5336]/5" delay={120} />
      </div>
    </section>
  )
}

function FooterSkeleton() {
  return (
    <footer className="border-t border-[#222222]/10 px-6 py-12 sm:py-16 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <SkeletonBlock className="h-8 w-36 bg-[#1E5336]/15" />
          <SkeletonBlock className="mt-4 h-6 w-56 max-w-full bg-[#1E5336]/10" delay={60} />
          <SkeletonBlock className="mt-2 h-6 w-44 max-w-full bg-[#1E5336]/10" delay={120} />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <SkeletonBlock className="h-2.5 w-20 bg-[#E1A728]/35" delay={i * 70} />
            <div className="mt-4 space-y-2">
              <SkeletonBlock className="h-3 w-full bg-[#222222]/10" delay={i * 70} />
              <SkeletonBlock className="h-3 w-4/5 bg-[#222222]/10" delay={i * 70} />
              <SkeletonBlock className="h-3 w-3/5 bg-[#222222]/10" delay={i * 70} />
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col justify-between gap-4 border-t border-[#222222]/10 pt-5 sm:mt-16 sm:flex-row">
        <SkeletonBlock className="h-2.5 w-48 bg-[#222222]/10" />
        <div className="flex flex-wrap gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonBlock key={i} className="h-2.5 w-14 bg-[#222222]/10" delay={i * 60} />
          ))}
        </div>
      </div>
    </footer>
  )
}

export default function HomeSkeleton({ withHeader = false }: { withHeader?: boolean }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading home page…</span>
      <div aria-hidden="true">
        {withHeader && <HeaderSkeleton />}
        <HeroSkeleton />
        <CheckBookingSkeleton />
        <FacilitiesSkeleton />
        <PoolHouseSkeleton />
        <QueueSkeleton />
        <CtaSkeleton />
        <FooterSkeleton />
      </div>
    </div>
  )
}
