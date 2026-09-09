'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, User } from 'lucide-react'
import type { Bet } from '@/lib/db/schema'
import { updateBetResult, deleteBet } from '@/app/actions/bets'
import { combineParlay } from '@/lib/parlay'
import { cn } from '@/lib/utils'

const RESULTS = [
  { value: 'pending', label: 'Pending' },
  { value: 'hit', label: 'Hit' },
  { value: 'miss', label: 'Miss' },
] as const

function resultClasses(result: string, value: string, active: boolean) {
  if (!active) return 'text-muted-foreground hover:text-foreground'
  if (value === 'hit') return 'bg-success text-success-foreground'
  if (value === 'miss') return 'bg-danger text-danger-foreground'
  return 'bg-warning text-warning-foreground'
}

function BetRow({ bet }: { bet: Bet }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function setResult(value: string) {
    if (value === bet.result) return
    startTransition(async () => {
      await updateBetResult(bet.id, value)
      router.refresh()
    })
  }

  function remove() {
    startTransition(async () => {
      await deleteBet(bet.id)
      router.refresh()
    })
  }

  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-background p-3 transition-opacity',
        isPending && 'opacity-50',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span
              className={cn(
                'rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider',
                bet.betCategory === 'player'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-secondary-foreground',
              )}
            >
              {bet.betCategory === 'player' ? 'Player' : 'Game'}
            </span>
            <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <User className="size-3" />
              {bet.bettorName}
            </span>
          </div>
          <p className="text-pretty font-medium leading-snug">{bet.selection}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-sm font-bold text-primary">{bet.odds}</span>
          <button
            type="button"
            onClick={remove}
            aria-label="Delete leg"
            className="text-muted-foreground transition-colors hover:text-danger"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-lg bg-secondary/50 p-1">
        {RESULTS.map((r) => {
          const active = bet.result === r.value
          return (
            <button
              key={r.value}
              type="button"
              onClick={() => setResult(r.value)}
              className={cn(
                'h-8 rounded-md text-xs font-semibold transition-colors',
                resultClasses(bet.result, r.value, active),
              )}
            >
              {r.label}
            </button>
          )
        })}
      </div>
    </li>
  )
}

export function BetTracker({ bets }: { bets: Bet[] }) {
  // The parlay is built from legs that are still live (pending or already hit).
  const liveLegs = bets.filter((b) => b.result !== 'miss')
  const parlay = combineParlay(liveLegs.map((b) => b.odds))
  const hits = bets.filter((b) => b.result === 'hit').length
  const misses = bets.filter((b) => b.result === 'miss').length
  const pending = bets.filter((b) => b.result === 'pending').length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          The Parlay · {bets.length} {bets.length === 1 ? 'leg' : 'legs'}
        </h2>
        {parlay ? (
          <span className="font-mono text-sm font-bold text-primary">
            {parlay.american}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              ({parlay.payout})
            </span>
          </span>
        ) : null}
      </div>

      {bets.length > 0 ? (
        <div className="flex gap-2 text-xs font-medium">
          <span className="flex-1 rounded-lg bg-success/15 px-2 py-1.5 text-center text-success">
            {hits} Hit
          </span>
          <span className="flex-1 rounded-lg bg-warning/15 px-2 py-1.5 text-center text-warning">
            {pending} Pending
          </span>
          <span className="flex-1 rounded-lg bg-danger/15 px-2 py-1.5 text-center text-danger">
            {misses} Miss
          </span>
        </div>
      ) : null}

      {bets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No legs yet. Add the first bet to start the parlay.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {bets.map((bet) => (
            <BetRow key={bet.id} bet={bet} />
          ))}
        </ul>
      )}
    </div>
  )
}
