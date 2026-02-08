import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { InviteLink } from '@/components/groups/InviteLink'
import { PaymentStatus } from '@/components/groups/PaymentStatus'
import { GroupInfo } from '@/components/groups/GroupInfo'
import { DeleteGroupButton } from '@/components/groups/DeleteGroupButton'
import { LeaveGroupButton } from '@/components/groups/LeaveGroupButton'
import { AddMemberDialog } from '@/components/groups/AddMemberDialog'
import { ClaimMemberButton } from '@/components/groups/ClaimMemberButton'
import Link from 'next/link'

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (!group) {
    notFound()
  }

  const { data: members } = await supabase
    .from('group_members')
    .select('*, profiles(*)')
    .eq('group_id', groupId)

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  // Count total squares claimed across all games (user_id OR display_name)
  const gameIds = games?.map(g => g.id) || []
  const { count: totalSquaresSold } = await supabase
    .from('squares')
    .select('*', { count: 'exact', head: true })
    .or('user_id.not.is.null,display_name.not.is.null')
    .in('game_id', gameIds)

  const { data: { user } } = await supabase.auth.getUser()
  const userMember = members?.find(m => m.user_id === user?.id)
  const isAdmin = userMember?.role === 'admin'

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/dashboard" className="text-primary-green hover:text-primary-blue transition-colors mb-4 inline-block font-medium">
          ← Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text break-words">{group.name}</h1>
            {group.description && (
              <p className="text-gray-300 mt-2 text-sm sm:text-base">{group.description}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            {isAdmin ? (
              <DeleteGroupButton groupId={groupId} groupName={group.name} />
            ) : (
              user && <LeaveGroupButton groupId={groupId} groupName={group.name} userId={user.id} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Super Bowl LX</h2>
          {games && games.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {games.map(game => (
                <Link
                  key={game.id}
                  href={`/groups/${groupId}/games/${game.id}`}
                  className="block p-4 sm:p-6 bg-card rounded-xl shadow-card-glow hover:bg-card-hover border-2 border-border hover:border-primary-green transition-all active:scale-[0.98] sm:hover:scale-105"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg sm:text-xl lg:text-2xl text-white truncate sm:whitespace-normal">{game.name}</h3>
                      <p className="text-gray-300 text-xs sm:text-sm mt-1 sm:mt-2">
                        {game.home_team} vs {game.away_team}
                      </p>
                      <span className="inline-block mt-2 sm:mt-3 px-3 py-1 text-xs font-bold rounded-lg bg-primary-green/20 text-primary-green border border-primary-green/50">
                        {game.status}
                      </span>
                    </div>
                    <div className="flex items-center sm:flex-col sm:text-right gap-2 sm:gap-0">
                      <div className="text-primary-blue font-bold text-xs sm:text-sm">View board</div>
                      <div className="text-gray-400 text-xs sm:mt-1">→</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-card p-6 rounded-xl border-2 border-border">
              <p className="text-gray-400">Game board is being created...</p>
              <p className="text-gray-500 text-sm mt-2">If this persists, try refreshing the page.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <InviteLink inviteCode={group.invite_code} />

          <GroupInfo
            buyInAmount={group.buy_in_amount || 0}
            payoutQ1={group.payout_q1 || 25}
            payoutQ2={group.payout_q2 || 25}
            payoutQ3={group.payout_q3 || 25}
            payoutFinal={group.payout_final || 25}
            totalSquaresSold={totalSquaresSold || 0}
          />

          <PaymentStatus
            groupId={groupId}
            gameIds={gameIds}
            isAdmin={isAdmin}
            buyInAmount={group.buy_in_amount || 0}
          />

          <div className="bg-card p-6 rounded-xl border-2 border-border shadow-card-glow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-primary-blue">Members ({members?.length || 0})</h3>
              {isAdmin && <AddMemberDialog groupId={groupId} />}
            </div>
            <div className="space-y-3">
              {members?.map(member => {
                const isUnclaimed = !member.user_id && (member as any).display_name
                return (
                  <div key={member.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-white">
                        {(member as any).display_name || member.profiles?.full_name || member.profiles?.email || 'Unknown'}
                        {isUnclaimed && (
                          <span className="text-xs text-yellow-400 ml-2">(unclaimed)</span>
                        )}
                      </p>
                      {member.role === 'admin' && (
                        <span className="text-xs text-primary-green font-bold">Admin</span>
                      )}
                    </div>
                    {isUnclaimed && (
                      <ClaimMemberButton
                        groupId={groupId}
                        memberId={member.id}
                        displayName={(member as any).display_name}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
