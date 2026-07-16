import { Link } from 'react-router-dom'
import { useState } from 'react'
import '../App.css'

export function Search() {

  const [filter, setFilter] = useState('none')

  const handleFilterChange = (newFilter) => {
    if (newFilter === filter) {
      setFilter('none')
    } else {
      setFilter(newFilter)
    }
  }

  return (
    <>
      <section id="search"
        style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <div className="content">
          <h1>Search</h1>
          <p>This is the content of the Search page.</p>
          <div
            style={{
              display: 'flex',
              width: '100%',
              gap: '16px',
              padding: '16px',
            }}
          >
          <p
            style={{
              display: 'flex',
              width: '100%',
              gap: '12px',
              padding: '16px',
            }}
          >
            Filter by:
            <button onClick={() => handleFilterChange('forums')}>Forums</button>
            <button onClick={() => handleFilterChange('threads')}>Threads</button>
            <button onClick={() => handleFilterChange('users')}>Users</button>
            <button onClick={() => handleFilterChange('posts')}>Tags</button>
            Sort by:
          </p>
          </div>
          <div
            style={{
              display: 'flex',
              width: '100%',
              flexDirection: 'column',
              gap: '10px',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <input type="text" placeholder="Search..." />
          </div>
        </div>
      </section>
    </>
  )
}
