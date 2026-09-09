const SCOREBOARD = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard'

export type Team = {
  abbr: string
  name: string
  logo: string
  record: string
  score: string
}

export type PrimetimeGame = {
  id: string
  dateUTC: string
  slot: string
  kickoff: string
  venue: string
  statusName: string
  statusDetail: string
  completed: boolean
  inProgress: boolean
  home: Team
  away: Team
  spread: string
  overUnder: string
}

export type SeasonWeek = {
  season: number
  week: number
  seasonType: number
}

function etParts(iso: string): { weekday: string; hour: number } {
  const d = new Date(iso)
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
  })
  const parts = fmt.formatToParts(d)
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? ''
  let hour = Number.parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10)
  if (Number.isNaN(hour) || hour === 24) hour = 0
  return { weekday, hour }
}

function formatKickoff(iso: string): string {
  return (
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso)) + ' ET'
  )
}

// Decides whether a game is a standalone / primetime window rather than part
// of the Sunday afternoon slate, and returns a base label for its window.
function classify(iso: string): { primetime: boolean; base: string } {
  const { weekday, hour } = etParts(iso)
  switch (weekday) {
    case 'Thu':
      // Thanksgiving daytime games kick off before ~5pm ET; standard TNF is at night.
      return { primetime: true, base: hour < 17 ? 'Thanksgiving' : 'Thursday Night' }
    case 'Fri':
      return { primetime: true, base: hour < 17 ? 'Black Friday' : 'Friday Night' }
    case 'Wed':
      return { primetime: true, base: 'Kickoff' }
    case 'Sat':
      return { primetime: hour >= 16, base: 'Saturday' }
    case 'Mon':
      return { primetime: true, base: 'Monday Night' }
    case 'Sun':
      return { primetime: hour >= 19, base: 'Sunday Night' }
    default:
      return { primetime: false, base: '' }
  }
}

function slotLabel(base: string, weekdayCount: number): string {
  if (base === 'Thursday Night') return 'TNF'
  if (base === 'Sunday Night') return 'SNF'
  if (base === 'Monday Night') return 'MNF'
  // Thanksgiving / Black Friday / Saturday / Kickoff keep their descriptive base.
  return base
}

type RawCompetitor = {
  homeAway: string
  score?: string
  team: { abbreviation?: string; displayName?: string; shortDisplayName?: string; logo?: string }
  records?: { summary?: string }[]
}

export async function getCurrentSeasonWeek(): Promise<SeasonWeek> {
  try {
    const res = await fetch(SCOREBOARD, { next: { revalidate: 300 } })
    const data = await res.json()
    const season = data?.season?.year ?? new Date().getFullYear()
    const seasonType = data?.season?.type ?? 2
    const week = data?.week?.number ?? 1
    return { season, week, seasonType }
  } catch {
    return { season: new Date().getFullYear(), week: 1, seasonType: 2 }
  }
}

export async function getPrimetimeGames(
  season: number,
  week: number,
  seasonType = 2,
): Promise<PrimetimeGame[]> {
  const url = `${SCOREBOARD}?dates=${season}&seasontype=${seasonType}&week=${week}`
  let events: any[] = []
  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    const data = await res.json()
    events = Array.isArray(data?.events) ? data.events : []
  } catch {
    return []
  }

  const primetime = events
    .map((e) => {
      const comp = e?.competitions?.[0]
      if (!comp) return null
      const info = classify(e.date)
      if (!info.primetime) return null

      const competitors: RawCompetitor[] = comp.competitors ?? []
      const homeRaw = competitors.find((c) => c.homeAway === 'home')
      const awayRaw = competitors.find((c) => c.homeAway === 'away')
      if (!homeRaw || !awayRaw) return null

      const toTeam = (c: RawCompetitor): Team => ({
        abbr: c.team.abbreviation ?? '',
        name: c.team.shortDisplayName ?? c.team.displayName ?? c.team.abbreviation ?? '',
        logo: c.team.logo ?? '',
        record: c.records?.[0]?.summary ?? '',
        score: c.score ?? '',
      })

      const odds = comp.odds?.[0]
      const status = e.status?.type
      const weekdayKey = etParts(e.date).weekday

      return {
        id: String(e.id),
        dateUTC: e.date,
        base: info.base,
        weekdayKey,
        kickoff: formatKickoff(e.date),
        venue: comp.venue?.fullName ?? '',
        statusName: status?.name ?? 'STATUS_SCHEDULED',
        statusDetail: status?.shortDetail ?? '',
        completed: Boolean(status?.completed),
        inProgress: status?.state === 'in',
        home: toTeam(homeRaw),
        away: toTeam(awayRaw),
        spread: odds?.details ?? '',
        overUnder: odds?.overUnder != null ? `O/U ${odds.overUnder}` : '',
      }
    })
    .filter((g): g is NonNullable<typeof g> => g !== null)
    .sort((a, b) => new Date(a.dateUTC).getTime() - new Date(b.dateUTC).getTime())

  // Count games per weekday so we can keep Thanksgiving-style labels descriptive.
  const dayCounts = primetime.reduce<Record<string, number>>((acc, g) => {
    acc[g.weekdayKey] = (acc[g.weekdayKey] ?? 0) + 1
    return acc
  }, {})

  return primetime.map(({ base, weekdayKey, ...rest }) => ({
    ...rest,
    slot: slotLabel(base, dayCounts[weekdayKey] ?? 1),
  }))
}
