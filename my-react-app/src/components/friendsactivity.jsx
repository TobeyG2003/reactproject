import { ActivityFeed } from './activityfeed'

export function FriendsActivity( { userId } ) {
  return (
    <ActivityFeed
      endpoint="/fetchfriendactivity"
      userId={userId}
      emptyMessage="No recent friend activity."
      includesComments
    />
  )
}