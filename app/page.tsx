import { getBets } from '@/app/actions/bets'
import { getCurrentSeasonWeek, getPrimetimeGames } from '@/lib/espn'
import { GameCard } from '@/components/game-card'
import { GameSelector } from '@/components/game-selector'
import { WeekNav } from '@/components/week-nav'
import { ShareButton } from '@/components/share-button'
import { BetForm } from '@/components/bet-form'
import { BetTracker } from '@/components/bet-tracker'

export const dynamic = 'force-dynamic'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; game?: string }>
}) {
  const params = await searchParams
  const current = await getCurrentSeasonWeek()

  const week = params.week ? Math.min(18, Math.max(1, Number(params.week))) : current.week
  const games = await getPrimetimeGames(current.season, week, current.seasonType)

  const selected = games.find((g) => g.id === params.game) ?? games[0] ?? null
  const bets = selected ? await getBets(selected.id) : []

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-5 px-4 pb-16 pt-6">
      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-primary">
              Primetime
            </p>
            <h1 className="text-2xl font-bold leading-tight text-balance">Parlay Board</h1>
          </div>
          <ShareButton />
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {current.season} Season · TNF, SNF &amp; MNF
          </p>
          <WeekNav week={week} />
        </div>
      </header>

      {games.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="font-medium">No primetime games scheduled</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Week {week} has no standalone TNF, SNF or MNF games. Try another week.
          </p>
        </div>
      ) : (
        <>
          <GameSelector games={games} selectedId={selected!.id} />
          <GameCard game={selected!} />
          <BetForm gameId={selected!.id} season={current.season} week={week} />
          <BetTracker bets={bets} />
        </>
      )}

      <footer className="mt-auto pt-4 text-center text-xs text-muted-foreground">
        Anyone with this link can add legs. Schedule &amp; odds via ESPN.
      </footer>
    </main>
  )
}
