export function SkeletonRow() {
  return (
    <div className="glass rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-5 h-5 rounded-full bg-white/10 flex-shrink-0" />
          <div className="h-3 bg-white/10 rounded-full flex-1 max-w-xs" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 h-6 bg-white/10 rounded-full" />
          <div className="w-12 h-3 bg-white/10 rounded-full hidden sm:block" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-white/10" />
        <div className="flex-1">
          <div className="h-3 bg-white/10 rounded-full w-24 mb-3" />
          <div className="h-6 bg-white/10 rounded-full w-48 mb-3" />
          <div className="h-5 bg-white/10 rounded-full w-20" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 glass rounded-xl">
        {[1,2,3].map(i => (
          <div key={i} className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-white/10" />
            <div className="h-3 bg-white/10 rounded-full w-20" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-white/10 rounded-full w-32 mb-3" />
        <div className="h-8 bg-white/10 rounded-full w-full" />
        <div className="h-8 bg-white/10 rounded-full w-3/4" />
      </div>
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="glass rounded-2xl p-5 text-center animate-pulse">
      <div className="h-8 bg-white/10 rounded-full w-16 mx-auto mb-2" />
      <div className="h-3 bg-white/10 rounded-full w-20 mx-auto" />
    </div>
  )
}