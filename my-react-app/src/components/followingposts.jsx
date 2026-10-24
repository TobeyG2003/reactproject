import { ActivityFeed } from './activityfeed'

export function FollowingPosts( { userId } ) {
  return (
    <ActivityFeed
      endpoint="/fetchfollowedposts"
      userId={userId}
      emptyMessage="No posts in followed forums yet."
    />
  )
}