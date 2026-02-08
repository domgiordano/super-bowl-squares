import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { ClaimIdentityDialog } from '@/components/groups/ClaimIdentityDialog'

export default async function JoinGroupPage({
  params
}: {
  params: Promise<{ inviteCode: string }>
}) {
  const { inviteCode } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminClient = createAdminClient()

  const { data: group } = await adminClient
    .from('groups')
    .select('*')
    .eq('invite_code', inviteCode)
    .single()

  if (!group) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto bg-card p-8 rounded-2xl border-2 border-border shadow-glow-primary">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Invalid Invite</h1>
          <p className="text-gray-400">This invite link is not valid.</p>
        </div>
      </div>
    )
  }

  // Check if user is already a member
  const { data: existingMember } = await adminClient
    .from('group_members')
    .select('*')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()

  if (existingMember) {
    redirect(`/groups/${group.id}`)
  }

  // Check for unclaimed display_name members
  const { data: unclaimedMembers } = await adminClient
    .from('group_members')
    .select('id, display_name')
    .eq('group_id', group.id)
    .is('user_id', null)
    .not('display_name', 'is', null)

  // If there are unclaimed members, show the claim identity UI
  if (unclaimedMembers && unclaimedMembers.length > 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <ClaimIdentityDialog
          groupId={group.id}
          groupName={group.name}
          unclaimedMembers={unclaimedMembers.map(m => ({
            id: m.id,
            display_name: m.display_name!,
          }))}
        />
      </div>
    )
  }

  // No unclaimed members, auto-join as new member
  const { error } = await adminClient
    .from('group_members')
    .insert({
      group_id: group.id,
      user_id: user.id,
      role: 'member',
    })

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto bg-card p-8 rounded-2xl border-2 border-border shadow-glow-primary">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-400">Failed to join group. Please try again.</p>
        </div>
      </div>
    )
  }

  redirect(`/groups/${group.id}`)
}
