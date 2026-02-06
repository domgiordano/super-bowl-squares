import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CreateGroupDialog } from '@/components/groups/CreateGroupDialog'
import { JoinGroupInput } from '@/components/groups/JoinGroupInput'
import { GroupList } from '@/components/groups/GroupList'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text">My Groups</h1>
          <p className="text-gray-300 mt-2">Welcome, {user?.email}!</p>
        </div>
        <div className="flex gap-3">
          <JoinGroupInput />
          <CreateGroupDialog />
        </div>
      </div>
      <GroupList groups={groups || []} />
    </div>
  )
}
