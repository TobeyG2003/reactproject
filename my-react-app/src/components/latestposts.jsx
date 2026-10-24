import { ActivityFeed } from './activityfeed'

export function LatestPosts() {
  return (
    <ActivityFeed
      endpoint="/fetchlatestactivity"
      emptyMessage="No posts yet."
    />
  )
}