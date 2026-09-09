'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { addBet } from '@/app/actions/bets'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function BetForm({
  gameId,
  season,
  week,
}: {
  gameId: string
  season: number
  week: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [category, setCategory] = useState<'game' | 'player'>('game')
  const [bettorName, setBettorName] = useState('')
  const [selection, setSelection] = useState('')
  const [odds, setOdds] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit() {
    setError(null)
    startTransition(async () => {
      const res = await addBet({
        gameId,
        season,
        week,
        bettorName,
        betCategory: category,
        selection,
        odds,
      })
      if (res?.error) {
        setError(res.error)
        return
      }
      // Keep the bettor name for quick consecutive entries, clear the leg.
      setSelection('')
      setOdds('')
      router.refresh()
    })
  }

  const inputClass =
    'h-11 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Add a parlay leg
      </h2>

      <div className="grid grid-cols-2 gap-2">
        {(['game', 'player'] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              'h-11 rounded-lg border text-sm font-semibold transition-colors',
              category === c
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:text-foreground',
            )}
          >
            {c === 'game' ? 'Game Prop' : 'Player Prop'}
          </button>
        ))}
      </div>

      <input
        className={inputClass}
        placeholder="Your name"
        value={bettorName}
        onChange={(e) => setBettorName(e.target.value)}
        maxLength={60}
        autoComplete="name"
      />

      <input
        className={inputClass}
        placeholder={
          category === 'player' ? 'e.g. Mahomes 275+ pass yds' : 'e.g. Chiefs -3.5'
        }
        value={selection}
        onChange={(e) => setSelection(e.target.value)}
        maxLength={200}
      />

      <input
        className={cn(inputClass, 'font-mono')}
        placeholder="Odds (e.g. -110 or +150)"
        value={odds}
        onChange={(e) => setOdds(e.target.value)}
        inputMode="text"
        maxLength={20}
      />

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" disabled={isPending} className="h-11 gap-2 font-semibold">
        <Plus className="size-4" />
        {isPending ? 'Adding…' : 'Add leg'}
      </Button>
    </form>
  )
}
