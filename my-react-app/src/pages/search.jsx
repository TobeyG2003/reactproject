import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { MdArrowDropDown } from "react-icons/md";
import '../App.css'
import axios from 'axios'
import { ForumCard } from '../components/forumcard';
import { Forumpost } from '../components/forumpost';
import { FriendCard } from '../components/friendcard';

export function Search() {

  const [search, setSearch] = useState({
    search: '',
    tag: '',
  })
  const [sortBy, setSortBy] = useState('Popular')
  const [isOpen, setIsOpen] = useState({
    filter: false,
    sort: false,
    modal: false
  });
  const dialogRef = useRef(null)
  const tagSearchRequestRef = useRef(0)
  useEffect(() => {
    if (!dialogRef.current) return;

    if (isOpen.modal) {
      dialogRef.current.showModal(); 
    } else {
      dialogRef.current.close();
    }
  }, [isOpen.modal]);
  const dropdownRef = useRef(null);
  const dropdownSortRef = useRef(null);
  const toggleDropdown = () => setIsOpen((prev) => ({...prev, filter: !prev.filter}));
  const toggleSortDropdown = () => setIsOpen((prev) => ({...prev, sort: !prev.sort}));
  const [filter, setFilter] = useState('Forums')
  const [tags, setTags] = useState([])
  const [tagSearchResults, setTagSearchResults] = useState([])
  const [isFocused, setIsFocused] = useState({
    search: false,
    tag: false,
  })
  const [error, setError] = useState('')

  const [searchResults, setSearchResults] = useState([])
  const [searchOffset, setSearchOffset] = useState(0)
  const [hasMoreResults, setHasMoreResults] = useState(true)
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const searchSentinelRef = useRef(null)
  const searchRequestRef = useRef(0)

  const fetchSearchResults = async (offset = 0, replace = false) => {
  if (isLoadingResults) return;

  const requestId = ++searchRequestRef.current;
  setIsLoadingResults(true);

  try {
    const response = await axios.post(
      'http://localhost:3000/searchresults',
      {
        searchTerm: search.search.trim(),
        filter,
        sortBy,
        tags,
        limit: 10,
        offset,
      }
    );

    if (requestId !== searchRequestRef.current) return;

    const data = response.data || [];
    setSearchResults((prev) => replace ? data : [...prev, ...data]);
    setSearchOffset(offset + data.length);
    setHasMoreResults(data.length === 10);
  } finally {
    setIsLoadingResults(false);
  }
};

useEffect(() => {
  const timeoutId = setTimeout(() => {
    setSearchResults([]);
    setSearchOffset(0);
    setHasMoreResults(true);
    fetchSearchResults(0, true);
  }, 300);

  return () => clearTimeout(timeoutId);
}, [search.search, filter, sortBy, tags]);

useEffect(() => {
  const sentinel = searchSentinelRef.current;
  if (!sentinel) return;

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && hasMoreResults && !isLoadingResults) {
      fetchSearchResults(searchOffset, false);
    }
  }, { rootMargin: '200px' });

  observer.observe(sentinel);
  return () => observer.disconnect();
}, [searchOffset, hasMoreResults, isLoadingResults]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen((prev) => ({...prev, filter: false}));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownSortRef.current && !dropdownSortRef.current.contains(event.target)) {
        setIsOpen((prev) => ({...prev, sort: false}));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }))
  }

  const handleBlur = (field) => {
    if (search[field] === '') {
      setIsFocused((prev) => ({ ...prev, [field]: false }))
    }
  }

  const handleLowerCaseTagChange = (event) => {
  if (event.target.value.length > 20) return

  const lowerCaseValue = event.target.value.toLowerCase()
  setSearch((prev) => ({ ...prev, tag: lowerCaseValue }))
  handleTagSearch(lowerCaseValue)
}

  const handleTagSearch = async (searchTerm) => {
  const requestId = ++tagSearchRequestRef.current

  try {
    const response = await axios.post(
      'http://localhost:3000/searchtags',
      { searchTerm: searchTerm.trim() }
    )

    if (requestId === tagSearchRequestRef.current) {
      setTagSearchResults(response.data || [])
    }
  } catch (error) {
    console.error('Error searching tags:', error)
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
        <h1>Search</h1>
        <div className="content"
        style={{
            display: 'flex',
            flexDirection: 'column',
            width: '70%',
            gap: '10px',
            padding: '40px',
            borderRadius: '25px',
            backgroundColor: '#3d3d3d',
            borderColor: '#005bd3',
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: '0 0 5px #005bd3, 0 0 15px #005bd3, 0 0 30px #005bd3',
          }}>
          <div className = "tab-buttons"
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              gap: '16px',
            }}
          >
          <div style = {{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <p>Filter by: {filter}</p>
            <div className="dropdown-container" ref={dropdownRef} style={{ position: "relative", display: "inline-block", height: '30px', }}>
              <MdArrowDropDown size = {30} style = {{color: isOpen.filter? '#ffffff':''}} className="dropdown-button" onClick={toggleDropdown} />
              {isOpen.filter && (
                <ul className="dropdown-menu" style={{ position: "absolute", listStyle: "none", margin: 0, padding: "5px 0", border: "1px solid #ccc", zIndex: 100, width: '150px' }}>
                    <li
                      className = {filter === 'Forums' ? 'dropdownElementSelected' : 'dropdownElement'}
                      onClick={() => {setIsOpen((prev) => ({...prev, filter: false})); setFilter('Forums')}}
                      style={{ padding: "8px 16px", }}
                    >
                      Forums
                    </li>
                    <li 
                      className = {filter === 'Users' ? 'dropdownElementSelected' : 'dropdownElement'}
                      onClick={() => {setIsOpen((prev) => ({...prev, filter: false})); setFilter('Users')}}
                      style={{ padding: "8px 16px", }}
                    >
                      Users
                    </li>
                    <li 
                      className = {filter === 'Posts' ? 'dropdownElementSelected' : 'dropdownElement'}
                      onClick={() => {setIsOpen((prev) => ({...prev, filter: false})); setFilter('Posts')}}
                      style={{ padding: "8px 16px", }}
                    >
                      Posts
                    </li>
                </ul>
              )}
            </div>
            </div>
            <div
              style = {{
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
                alignItems: 'center'
              }}>
                <p>Sort By: {sortBy} </p>
                <div className="dropdown-container" ref={dropdownSortRef} style={{ position: "relative", display: "inline-block", height: '30px' }}>
                      <MdArrowDropDown size = {30} style = {{color: isOpen.sort? '#ffffff':''}} className="dropdown-button" onClick={toggleSortDropdown} />
                      {isOpen.sort && (
                        <ul className="dropdown-menu" style={{ position: "absolute", listStyle: "none", margin: 0, padding: "5px 0", border: "1px solid #ccc", zIndex: 100 }}>
                            <li
                              className = {sortBy === 'Newest' ? 'dropdownElementSelected' : 'dropdownElement'}
                              onClick={() => {setIsOpen((prev) => ({ ...prev, sort: false })); setSortBy('Newest')}}
                              style={{ padding: "8px 16px", }}
                            >
                              Newest
                            </li>
                            <li 
                              className = {sortBy === 'Oldest' ? 'dropdownElementSelected' : 'dropdownElement'}
                              onClick={() => {setIsOpen((prev) => ({ ...prev, sort: false })); setSortBy('Oldest')}}
                              style={{ padding: "8px 16px", }}
                            >
                            Oldest
                            </li>
                            <li 
                              className = {sortBy === 'Most Likes' ? 'dropdownElementSelected' : 'dropdownElement'}
                              onClick={() => {setIsOpen((prev) => ({ ...prev, sort: false })); setSortBy('Most Likes')}}
                              style={{ padding: "8px 16px", }}
                            >
                                                        Most Likes
                            </li>
                        </ul>
                      )}
                    </div>
            </div>
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
            <div style = {{marginTop: '0'}} className={`input-container ${isFocused.search ? 'active' : ''}`}>
              <input
                type="text"
                value={search.search}
                onFocus={() => handleFocus('search')}
                onBlur={() => handleBlur('search')}
                onChange={(event) =>
                  setSearch((prev) => ({ ...prev, search: event.target.value }))}
                required
              />
              <label style={{ color: error.nameError ? '#b30000' : '' }}>
                {error ? error : 'Search'}
              </label>
            </div>
            { filter == 'Forums' && (
              <>
            <h2>Tags</h2>
            <button
                type = 'button'
                onClick = {() => setIsOpen((prev) => ({...prev, modal: true}))}
            >+ Add Tags</button>
        
              <div style={{ display: 'flex', flexDirection: 'row', gap: '14px', flexWrap: 'wrap', marginTop: '10px' }}>
              {tags.map((tag, index) => (
                <div
                    key={index}
                    style={{display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center',}}>
                    <button style={{color: '#ff9999', fontSize: '16px', padding: '0px', margin: '0px', border: 'none', backgroundColor: 'transparent'}}
                    type='button'
                    onClick = {(e) => {
                      e.preventDefault()
                      setTags((prev) => prev.filter((_, i) => i !== index))
                    }}
                    >
                        X
                    </button>
                <div className='tag' style={{ marginRight: '5px' }}>
                  {tag}
                </div>
                </div>
              ))}
            </div></>)}
          </div>
          {filter === 'Forums' &&
            searchResults.map((forum) => (
              <ForumCard key={forum.id} forumid={forum.id} />
            ))}

          {filter === 'Posts' &&
            searchResults.map((post) => (
              <Forumpost key={post.id} postdata={post} />
            ))}

          {filter === 'Users' &&
            searchResults.map((user) => (
              <FriendCard key={user.id} friendId={user.id} />
            ))}
          <div ref={searchSentinelRef} style={{ height: '1px' }} />
          {isLoadingResults && <p>Searching...</p>}
        </div>
        <dialog 
          ref={dialogRef} 
          onClose={() => setIsOpen((prev) => ({...prev, modal: false }))}
          style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              backgroundColor: '#3d3d3d',
              color: '#ffffff',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              width: '45%'
          }}
      >
          <div
          style={{
              display: 'flex',
              flexDirection: 'column',

          }}>
          <button 
              style = {{ alignSelf: 'flex-end', backgroundColor: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer' }}
              type = 'button' onClick={() => setIsOpen((prev) => ({...prev, modal: false }))}>
              X
          </button>
          <h3 style = {{marginTop: '0px'}}>Enter Tag</h3>
          <div className={`input-container ${isFocused.tag ? 'active' : ''}`}>
          <input
              type="text"
              value={search.tag}
              onFocus={() => handleFocus('tag')}
              onBlur={() => handleBlur('tag')}
              onChange={(event) => handleLowerCaseTagChange(event)}
              required
          />
          <label style={{ color: error.tagError ? '#b30000' : '' }}>
              {error.tagError ? error.tagError : 'Enter Tag'}
          </label>
          </div>
          <div>
          {tagSearchResults.map((tag) => (
  <div
    key={tag.id}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginTop: '8px',
    }}
  >
    <div>
      <p style={{ margin: 0, fontWeight: 'bold' }}>{tag.name}</p>
      <p style={{ margin: 0, fontSize: '14px', color: '#ccc' }}>
        Used by {tag.forum_count} {tag.forum_count === 1 ? 'forum' : 'forums'}
      </p>
    </div>

    <button
      type="button"
      style={{ marginLeft: 'auto' }}
      disabled={tags.includes(tag.name)}
      onClick={() => {
        if (!tags.includes(tag.name) && tags.length < 10) {
          setTags((prev) => [...prev, tag.name])
        }
      }}
    >
      {tags.includes(tag.name) ? 'Added' : '+ Add'}
    </button>
  </div>
))}
          </div>
          </div>
        </dialog>
      </section>
    </>
  )
}
