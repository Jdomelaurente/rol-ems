import HomeSkeleton from '@/components/home/HomeSkeleton'

export default function Loading() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#FDFBF7] pt-[72px] text-[#222222]">
      <HomeSkeleton withHeader />
    </main>
  )
}
