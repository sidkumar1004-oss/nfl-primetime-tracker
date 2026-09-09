import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const bets = pgTable('bets', {
  id: serial('id').primaryKey(),
  gameId: text('game_id').notNull(),
  season: integer('season').notNull(),
  week: integer('week').notNull(),
  bettorName: text('bettor_name').notNull(),
  // 'game' for game props, 'player' for player props
  betCategory: text('bet_category').notNull().default('game'),
  selection: text('selection').notNull(),
  odds: text('odds').notNull(),
  // 'pending' | 'hit' | 'miss'
  result: text('result').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Bet = typeof bets.$inferSelect
