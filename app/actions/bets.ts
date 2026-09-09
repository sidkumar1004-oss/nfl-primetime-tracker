'use server'

import { db } from '@/lib/db'
import { bets, type Bet } from '@/lib/db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getBets(gameId: string): Promise<Bet[]> {
  if (!gameId) return []
  return db.select().from(bets).where(eq(bets.gameId, gameId)).orderBy(asc(bets.createdAt))
}

export async function addBet(input: {
  gameId: string
  season: number
  week: number
  bettorName: string
  betCategory: string
  selection: string
  odds: string
}) {
  const bettorName = input.bettorName.trim()
  const selection = input.selection.trim()
  const odds = input.odds.trim()
  const betCategory = input.betCategory === 'player' ? 'player' : 'game'

  if (!input.gameId || !bettorName || !selection || !odds) {
    return { error: 'Please fill in your name, the bet, and the odds.' }
  }

  await db.insert(bets).values({
    gameId: input.gameId,
    season: input.season,
    week: input.week,
    bettorName: bettorName.slice(0, 60),
    betCategory,
    selection: selection.slice(0, 200),
    odds: odds.slice(0, 20),
    result: 'pending',
  })

  revalidatePath('/')
  return { success: true }
}

export async function updateBetResult(id: number, result: string) {
  const valid = ['pending', 'hit', 'miss']
  if (!valid.includes(result)) return { error: 'Invalid result' }
  await db.update(bets).set({ result }).where(eq(bets.id, id))
  revalidatePath('/')
  return { success: true }
}

export async function deleteBet(id: number) {
  await db.delete(bets).where(and(eq(bets.id, id)))
  revalidatePath('/')
  return { success: true }
}
