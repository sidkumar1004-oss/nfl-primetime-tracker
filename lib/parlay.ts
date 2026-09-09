// Parses an American odds string like "+150", "-110", "150" into a number.
export function parseAmerican(odds: string): number | null {
  const cleaned = odds.replace(/[^0-9+-]/g, '')
  if (!cleaned) return null
  const n = Number.parseInt(cleaned, 10)
  if (Number.isNaN(n) || n === 0) return null
  return n
}

function americanToDecimal(american: number): number {
  return american > 0 ? 1 + american / 100 : 1 + 100 / Math.abs(american)
}

function decimalToAmerican(decimal: number): number {
  return decimal >= 2 ? Math.round((decimal - 1) * 100) : Math.round(-100 / (decimal - 1))
}

export function formatAmerican(american: number): string {
  return american > 0 ? `+${american}` : `${american}`
}

// Combines multiple legs (American odds) into a single parlay price.
export function combineParlay(oddsList: string[]): { american: string; payout: string } | null {
  const parsed = oddsList.map(parseAmerican).filter((n): n is number => n !== null)
  if (parsed.length === 0) return null
  const decimal = parsed.reduce((acc, n) => acc * americanToDecimal(n), 1)
  const american = decimalToAmerican(decimal)
  return {
    american: formatAmerican(american),
    payout: `${decimal.toFixed(2)}x`,
  }
}
