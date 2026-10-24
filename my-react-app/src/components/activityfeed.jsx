import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Forumpost } from './forumpost'
import { Comment } from './comment'

const PAGE_SIZE = 10

export function ActivityFeed({ endpoint, userId, emptyMessage, includesComments = false }) {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState('')
  const sentinelRef = useRef(null)
  const generationRef = useRef(0)
  const offsetRef = useRef(0)
  const loadingRef = useRef(false)
  const hasMoreRef = useRef(true)
  const requestPageRef = useRef(null)

  const requestPage = useCallback(async (offset, generation) => {
    if (loadingRef.current || !hasMoreRef.current) return

    loadingRef.current = true
    setIsLoading(true)
    setError('')

    try {
      const response = await axios.post(`http://localhost:3000${endpoint}`, {
        userId,
        limit: PAGE_SIZE,
        offset,
      })

      if (generation !== generationRef.current) return

      const nextItems = Array.isArray(response.data) ? response.data : []
      setItems((previousItems) => offset === 0 ? nextItems : [...previousItems, ...nextItems])
      offsetRef.current = offset + nextItems.length
      hasMoreRef.current = nextItems.length === PAGE_SIZE
      setHasMore(hasMoreRef.current)
    } catch (fetchError) {
      if (generation === generationRef.current) {
        console.error(`Error fetching activity from ${endpoint}:`, fetchError)
        setError('Could not load activity.')
      }
    } finally {
      if (generation === generationRef.current) {
        loadingRef.current = false
        setIsLoading(false)
      }
    }
  }, [endpoint, userId])

  requestPageRef.current = requestPage

  useEffect(() => {
    const generation = ++generationRef.current
    offsetRef.current = 0
    loadingRef.current = false
    hasMoreRef.current = true
    setItems([])
    setHasMore(true)
    setError('')
    requestPageRef.current?.(0, generation)

    return () => {
      generationRef.current += 1
    }
  }, [endpoint, userId])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestPageRef.current?.(offsetRef.current, generationRef.current)
      }
    }, { rootMargin: '200px' })

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="itemList">
      {items.map((item) => {
        const key = `${item.item_type || 'post'}-${item.id}`
        if (includesComments && item.item_type === 'comment') {
          return <Comment key={key} commentdata={item} />
        }
        return <Forumpost key={key} postdata={item} />
      })}
      {items.length === 0 && !isLoading && !error && (
        <p style={{ color: '#888888', fontSize: '14px', marginTop: '15px' }}>{emptyMessage}</p>
      )}
      {isLoading && (
        <p style={{ color: '#888888', fontSize: '14px', marginTop: '15px' }} role="status">
          Loading activity...
        </p>
      )}
      {error && (
        <div style={{ color: '#ff8a8a', marginTop: '15px' }}>
          <p>{error}</p>
          <button type="button" onClick={() => requestPageRef.current?.(offsetRef.current, generationRef.current)}>
            Retry
          </button>
        </div>
      )}
      <div ref={sentinelRef} aria-hidden="true" style={{ height: '1px' }} />
      {!hasMore && items.length > 0 && (
        <p style={{ color: '#888888', fontSize: '14px', marginTop: '15px' }}>You’re all caught up.</p>
      )}
    </div>
  )
}