'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1)

export function WeekNav({ week }: { week: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function goToWeek(next: number) {
    if (next < 1 || next > 18) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('week', String(next))
    // Reset the selected game so we land on the first game of the new week.
    params.delete('game')
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
      <button
        type="button"
        onClick={() => goToWeek(week - 1)}
        disabled={week <= 1}
        aria-label="Previous week"
        className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="size-5" />
      </button>

      <label className="sr-only" htmlFor="week-select">
        Select week
      </label>
      <div className="relative">
        <select
          id="week-select"
          value={week}
          onChange={(e) => goToWeek(Number(e.target.value))}
          className="h-9 appearance-none rounded-full bg-transparent px-3 text-center text-sm font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {WEEKS.map((w) => (
            <option key={w} value={w} className="bg-card text-foreground">
              Week {w}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => goToWeek(week + 1)}
        disabled={week >= 18}
        aria-label="Next week"
        className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  )
}
