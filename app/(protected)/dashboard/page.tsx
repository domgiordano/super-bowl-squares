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
    <div className="container mx-auto py-6 sm:py-8 px-4">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text">My Groups</h1>
            <p className="text-gray-300 mt-1 sm:mt-2 text-sm sm:text-base truncate">Welcome, {user?.email}!</p>
          </div>
        </div>

        {/* Action buttons - prominent on mobile */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 sm:flex-initial">
            <JoinGroupInput />
          </div>
          <div className="flex-1 sm:flex-initial">
            <CreateGroupDialog />
          </div>
        </div>
      </div>

      <GroupList groups={groups || []} />
    </div>
  )
}
