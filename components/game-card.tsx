import type { PrimetimeGame } from '@/lib/espn'
import { MapPin } from 'lucide-react'

function TeamRow({
  team,
  showScore,
}: {
  team: PrimetimeGame['home']
  showScore: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      {team.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={team.logo || '/placeholder.svg'}
          alt={`${team.name} logo`}
          className="size-10 shrink-0 object-contain"
        />
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-bold">
          {team.abbr}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold leading-tight">{team.name}</p>
        {team.record ? (
          <p className="text-xs text-muted-foreground">{team.record}</p>
        ) : null}
      </div>
      {showScore ? (
        <span className="font-mono text-2xl font-bold tabular-nums">{team.score || '0'}</span>
      ) : null}
    </div>
  )
}

export function GameCard({ game }: { game: PrimetimeGame }) {
  const showScore = game.completed || game.inProgress

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="flex items-center justify-between gap-2 border-b border-border bg-secondary/40 px-4 py-2.5">
        <span className="rounded-full bg-primary px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-widest text-primary-foreground">
          {game.slot}
        </span>
        <span
          className={
            game.inProgress
              ? 'text-xs font-semibold text-primary'
              : 'text-xs font-medium text-muted-foreground'
          }
        >
          {game.completed ? 'Final' : game.inProgress ? game.statusDetail || 'Live' : game.kickoff}
        </span>
      </header>

      <div className="flex flex-col gap-4 p-4">
        <TeamRow team={game.away} showScore={showScore} />
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
            at
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <TeamRow team={game.home} showScore={showScore} />
      </div>

      {(game.spread || game.overUnder || game.venue) && (
        <footer className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border px-4 py-3 text-sm">
          {game.spread ? (
            <span className="font-mono font-semibold text-foreground">{game.spread}</span>
          ) : null}
          {game.overUnder ? (
            <span className="font-mono text-muted-foreground">{game.overUnder}</span>
          ) : null}
          {game.venue ? (
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {game.venue}
            </span>
          ) : null}
        </footer>
      )}
    </section>
  )
}
