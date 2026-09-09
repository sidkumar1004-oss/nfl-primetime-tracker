'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { PrimetimeGame } from '@/lib/espn'
import { cn } from '@/lib/utils'

export function GameSelector({
  games,
  selectedId,
}: {
  games: PrimetimeGame[]
  selectedId: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function selectGame(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('game', id)
    router.push(`/?${params.toString()}`)
  }

  if (games.length <= 1) return null

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-2">
        {games.map((game) => {
          const active = game.id === selectedId
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => selectGame(game.id)}
              className={cn(
                'flex min-w-[8.5rem] shrink-0 flex-col items-start gap-1 rounded-xl border px-3 py-2.5 text-left transition-colors',
                active
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-muted-foreground/40',
              )}
            >
              <span
                className={cn(
                  'text-[0.65rem] font-bold uppercase tracking-widest',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {game.slot}
              </span>
              <span className="font-mono text-sm font-semibold text-foreground">
                {game.away.abbr} <span className="text-muted-foreground">@</span> {game.home.abbr}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
