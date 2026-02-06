import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { GameBoard } from '@/components/board/GameBoard'
import { ScoreBoard } from '@/components/games/ScoreBoard'
import Link from 'next/link'

export default async function GamePage({
  params
}: {
  params: Promise<{ groupId: string; gameId: string }>
}) {
  const { groupId, gameId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single()

  if (!game) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const isCreator = game.created_by === user?.id

  async function handleOpenGame() {
    'use server'
    const supabase = await createServerSupabaseClient()
    await supabase
      .from('games')
      .update({ status: 'open' })
      .eq('id', gameId)
  }

  async function handleRandomizeNumbers() {
    'use server'
    const supabase = await createServerSupabaseClient()
    await supabase.rpc('randomize_game_numbers', {
      p_game_id: gameId,
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href={`/groups/${groupId}`} className="text-primary-green hover:text-primary-blue transition-colors mb-4 inline-block font-medium">
          ← Back to Group
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text">{game.name}</h1>
            <p className="text-gray-300 mt-2">
              {game.home_team} vs {game.away_team}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-4 py-2 text-sm font-bold rounded-lg bg-primary-green/20 text-primary-green border border-primary-green/50">
              {game.status}
            </span>
          </div>
        </div>

        {isCreator && (
          <div className="mt-6 flex gap-3">
            {game.status === 'setup' && (
              <form action={handleOpenGame}>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-primary text-black rounded-xl hover:shadow-glow-primary transition-all font-bold"
                >
                  Open for Selection
                </button>
              </form>
            )}
            {game.status === 'open' && (
              <form action={handleRandomizeNumbers}>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-blue text-white rounded-xl hover:shadow-glow-blue transition-all font-bold"
                >
                  Randomize Numbers & Lock
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {user && (
            <GameBoard
              gameId={gameId}
              userId={user.id}
              userEmail={user.email || ''}
              userName={profile?.full_name || undefined}
            />
          )}
        </div>

        <div>
          {game.status !== 'setup' && (
            <ScoreBoard
              gameId={gameId}
              homeTeam={game.home_team}
              awayTeam={game.away_team}
              homeScore={(game as any).home_score || 0}
              awayScore={(game as any).away_score || 0}
              currentQuarter={(game as any).current_quarter || 'pregame'}
              isCreator={isCreator}
            />
          )}

          {/* Quarter Winners */}
          <div className="mt-6 bg-card rounded-xl shadow-card-glow p-6 border-2 border-border">
            <h3 className="font-bold text-lg text-primary-green mb-4">Winners</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-gray-400">Q1:</span>
                <span className="font-medium text-white">-</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-gray-400">Q2 (Half):</span>
                <span className="font-medium text-white">-</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-gray-400">Q3:</span>
                <span className="font-medium text-white">-</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">Final:</span>
                <span className="font-medium text-white">-</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 bg-card rounded-xl p-6 border-2 border-border">
            <h3 className="font-bold text-sm text-primary-blue mb-4">Legend</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-yellow-200 border-2 border-yellow-500 rounded"></div>
                <span className="text-gray-300">Currently Winning</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-600 text-white flex items-center justify-center rounded text-[10px] font-bold">1</div>
                <span className="text-gray-300">Won Quarter (# = quarter)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-100 rounded"></div>
                <span className="text-gray-300">Your Square</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
