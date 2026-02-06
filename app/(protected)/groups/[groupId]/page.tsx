import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { InviteLink } from '@/components/groups/InviteLink'
import { PaymentStatus } from '@/components/groups/PaymentStatus'
import { DeleteGroupButton } from '@/components/groups/DeleteGroupButton'
import { LeaveGroupButton } from '@/components/groups/LeaveGroupButton'
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

  const { data: { user } } = await supabase.auth.getUser()
  const userMember = members?.find(m => m.user_id === user?.id)
  const isAdmin = userMember?.role === 'admin'

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/dashboard" className="text-primary-green hover:text-primary-blue transition-colors mb-4 inline-block font-medium">
          ← Back to Dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text">{group.name}</h1>
            {group.description && (
              <p className="text-gray-300 mt-2">{group.description}</p>
            )}
          </div>
          {isAdmin ? (
            <DeleteGroupButton groupId={groupId} groupName={group.name} />
          ) : (
            user && <LeaveGroupButton groupId={groupId} groupName={group.name} userId={user.id} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-4">Super Bowl LX</h2>
          {games && games.length > 0 ? (
            <div className="space-y-4">
              {games.map(game => (
                <Link
                  key={game.id}
                  href={`/groups/${groupId}/games/${game.id}`}
                  className="block p-6 bg-card rounded-xl shadow-card-glow hover:bg-card-hover border-2 border-border hover:border-primary-green transition-all transform hover:scale-105"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-2xl text-white">{game.name}</h3>
                      <p className="text-gray-300 text-sm mt-2">
                        {game.home_team} vs {game.away_team}
                      </p>
                      <span className="inline-block mt-3 px-3 py-1 text-xs font-bold rounded-lg bg-primary-green/20 text-primary-green border border-primary-green/50">
                        {game.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-primary-blue font-bold text-sm">Click to view board</div>
                      <div className="text-gray-400 text-xs mt-1">→</div>
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

          <PaymentStatus
            groupId={groupId}
            isAdmin={isAdmin}
            buyInAmount={group.buy_in_amount || 0}
          />

          <div className="bg-card p-6 rounded-xl border-2 border-border shadow-card-glow">
            <h3 className="font-bold text-lg text-primary-blue mb-4">Members ({members?.length || 0})</h3>
            <div className="space-y-3">
              {members?.map(member => (
                <div key={member.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-white">
                      {member.profiles?.full_name || member.profiles?.email}
                    </p>
                    {member.role === 'admin' && (
                      <span className="text-xs text-primary-green font-bold">Admin</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
