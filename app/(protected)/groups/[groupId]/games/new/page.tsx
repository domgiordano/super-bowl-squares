import { CreateGameDialog } from '@/components/games/CreateGameDialog'
import { redirect } from 'next/navigation'

export default async function NewGamePage({
  params
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params

  // Redirect to group page with dialog open
  redirect(`/groups/${groupId}`)
}
