import { useContext, useState, useRef, useEffect, } from 'react'
import '../App.css'
import { AuthContext } from '../AuthContext'
import { MdArrowDropDown } from "react-icons/md";
import { ForumCard } from '../components/forumcard';
import { LatestPosts } from  '../components/latestposts'
import { FollowingPosts } from  '../components/followingposts'
import { FriendsActivity } from  '../components/friendsactivity'
import axios from 'axios'
import { Link, useNavigate, } from 'react-router-dom'

const PAGE_SIZE = 3

export function Page1() {

  const navigate = useNavigate();
  const { userdata } = useContext(AuthContext);
  const [ forums, setforums ] = useState([]);
  const [ pageIndex, setPageIndex ] = useState(0)
  const [ hasMore, setHasMore ] = useState(true)
  const [ isLoadingForums, setIsLoadingForums ] = useState(false)
  const fetchGenerationRef = useRef(0)

  const [activeTab, setActiveTab] = useState(0);
  const [visitedTabs, setVisitedTabs] = useState(() => new Set([0]))

  const authPrompt = (feedName) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '24px 12px' }}>
      <p>Sign in to view {feedName}.</p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Link to="/login" style={{ backgroundColor: '#1b357a', color: '#ffffff', padding: '8px 16px', borderRadius: '25px', textDecoration: 'none' }}>
          Sign in
        </Link>
        <Link to="/signup" style={{ backgroundColor: '#1b357a', color: '#ffffff', padding: '8px 16px', borderRadius: '25px', textDecoration: 'none' }}>
          Sign up
        </Link>
      </div>
    </div>
  )

  const tabData = [
    { label: 'Posts', content: <LatestPosts/> },
    { label: 'Followed Forums', content: userdata?.id ? <FollowingPosts userId={userdata.id}/> : authPrompt('posts from followed forums') },
    { label: 'Friend Activity', content: userdata?.id ? <FriendsActivity userId={userdata.id}/> : authPrompt('friend activity') },
  ];

  const [ sortBy, setSortBy ] = useState('Popular');
    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => setIsOpen((prev) => !prev);
    const dropdownRef = useRef(null);

    useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const generation = ++fetchGenerationRef.current
    let cancelled = false

    setforums([])
    setPageIndex(0)
    setHasMore(true)
    setIsLoadingForums(true)

    axios.post('http://localhost:3000/fetchhomeforums', { orderBy: sortBy, offset: 0 })
      .then((response) => {
        if (cancelled || generation !== fetchGenerationRef.current) return
        const firstPage = (response.data || []).map((forum) => ({ id: forum.forum_id }))
        setforums(firstPage)
        setHasMore(firstPage.length === PAGE_SIZE)
      })
      .catch((error) => {
        if (cancelled || generation !== fetchGenerationRef.current) return
        console.error('Error fetching forums:', error)
        setHasMore(false)
      })
      .finally(() => {
        if (!cancelled && generation === fetchGenerationRef.current) {
          setIsLoadingForums(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [sortBy])

  async function goToNextPage() {
    if (isLoadingForums) return

    const nextPageIndex = pageIndex + 1
    const nextOffset = nextPageIndex * PAGE_SIZE

    if (nextOffset < forums.length) {
      setPageIndex(nextPageIndex)
      return
    }

    if (!hasMore) return

    const generation = fetchGenerationRef.current
    setIsLoadingForums(true)
    try {
      const response = await axios.post('http://localhost:3000/fetchhomeforums', {
        orderBy: sortBy,
        offset: forums.length,
      })
      if (generation !== fetchGenerationRef.current) return

      const nextForums = (response.data || []).map((forum) => ({ id: forum.forum_id }))
      setforums((prev) => [...prev, ...nextForums])
      setHasMore(nextForums.length === PAGE_SIZE)
      if (nextForums.length > 0) setPageIndex(nextPageIndex)
    } catch (error) {
      if (generation === fetchGenerationRef.current) {
        console.error('Error fetching forums:', error)
      }
    } finally {
      if (generation === fetchGenerationRef.current) {
        setIsLoadingForums(false)
      }
    }
  }

  const visibleForums = forums.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE)

  return (
    <>
      <section id="home"
        style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, rgba(55, 0, 255, 0.3) 0%, rgba(0, 0, 0, 0) 300px)',
          marginBottom: '200px'

        }}>
        <h1 style = {{ color: 'white', textShadow: '5px 5px 7px rgba(0, 0, 0, 0.7)' }}>Find Your Space</h1>
        <div className="content" style={{
            display: 'flex',
            flexDirection: 'column',
            width: '70%',
            //backgroundColor: 'lightblue',
          }} >
          <div style = {{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            borderBottom: '1px solid',
            marginBottom: '10px'
           }}>
          <h2>Discover a new forum</h2>
          <Link to={`/newforum`} style={{ }}>
              <button
                  style = {{
                      borderRadius: '16px',
                      height: '32px',
                      padding: '0 16px',
                      fontSize: '14px',
                      cursor: 'pointer',
                  }}
              >
                  Create a New Forum
              </button>
          </Link>
          <div
            style = {{
              marginLeft: 'auto',
              display: 'flex',
              flexDirection: 'row',
              gap: '10px',
            }}>
              <p>Sort By: {sortBy} </p>
              <div className="dropdown-container" ref={dropdownRef} style={{ position: "relative", display: "inline-block", height: '30px' }}>
                    <MdArrowDropDown size = {30} style = {{color: isOpen? '#ffffff':''}} className="dropdown-button" onClick={toggleDropdown} />
                    {isOpen && (
                      <ul className="dropdown-menu" style={{ position: "absolute", listStyle: "none", margin: 0, padding: "5px 0", border: "1px solid #ccc", zIndex: 100 }}>
          
                          <li 
                            className = {sortBy === 'Popular' ? 'dropdownElementSelected' : 'dropdownElement'}
                            onClick={() => {setIsOpen(false); setSortBy('Popular')}}
                            style={{ padding: "8px 16px", }}
                          >
                            Popular
                          </li>
                          <li
                            className = {sortBy === 'Newest' ? 'dropdownElementSelected' : 'dropdownElement'}
                            onClick={() => {setIsOpen(false); setSortBy('Newest')}}
                            style={{ padding: "8px 16px", }}
                          >
                            Newest
                          </li>
                          <li 
                            className = {sortBy === 'Oldest' ? 'dropdownElementSelected' : 'dropdownElement'}
                            onClick={() => {setIsOpen(false); setSortBy('Oldest')}}
                            style={{ padding: "8px 16px", }}
                          >
                          Oldest
                          </li>
                      </ul>
                    )}
                  </div>
            </div>
          </div>
          <div
            style = {{display: 'flex', flexDirection: 'column', width: '100%'}}>
            {visibleForums.length > 0 ? (
                visibleForums.map((forum) => (
                    <ForumCard key={forum.id} forumid={forum.id} />
                ))
            ) : (
                <p style={{ color: '#888888', fontSize: '14px', marginTop: '15px' }}>
                {isLoadingForums ? 'Loading forums...' : 'No forums found'}
                </p>
            )}
          </div>
          <div style = {{display: 'flex', flexDirection: 'row', gap: '10px', width: '100%', justifyContent: 'center', paddingTop: '10px', borderTop: '1px solid'}}>
            <button
              type="button"
              disabled={pageIndex === 0 || isLoadingForums}
              onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
            >{'<'}</button>
            <button
              type="button"
              disabled={isLoadingForums || (!hasMore && (pageIndex + 1) * PAGE_SIZE >= forums.length)}
              onClick={goToNextPage}
            >{'>'}</button>
          </div>
          <h2 style = {{alignSelf: 'flex-start'}}>Latest Activity</h2>
          <div className="tabs-container">
      <div className="tab-buttons">
        {tabData.map((tab, index) => (
          <div
            key={index}
            className={`${activeTab === index ? 'navbarLinkSelected' : 'navbarLink'}`}
            onClick={() => {
              setActiveTab(index)
              setVisitedTabs((previous) => new Set(previous).add(index))
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div className="tab-content" style={{ minHeight: '420px', overflowAnchor: 'none' }}>
        {tabData.map((tab, index) => visitedTabs.has(index) && (
          <div key={tab.label} hidden={activeTab !== index}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
        </div>
      </section>
    </>
  )
}