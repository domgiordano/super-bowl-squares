interface Square {
  row: number
  col: number
  user_id: string | null
  profiles?: {
    full_name: string | null
    email: string
  } | null
}

interface Game {
  home_numbers: number[] | null
  away_numbers: number[] | null
}

export function calculateWinner(
  homeScore: number,
  awayScore: number,
  squares: Square[],
  game: Game
) {
  if (!game.home_numbers || !game.away_numbers) {
    return null
  }

  const homeDigit = homeScore % 10
  const awayDigit = awayScore % 10

  const homeIndex = game.home_numbers.indexOf(homeDigit)
  const awayIndex = game.away_numbers.indexOf(awayDigit)

  if (homeIndex === -1 || awayIndex === -1) {
    return null
  }

  const winningSquare = squares.find(
    sq => sq.row === homeIndex && sq.col === awayIndex
  )

  return winningSquare
}
