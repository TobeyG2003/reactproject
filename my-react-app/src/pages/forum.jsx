import '../App.css'
import axios, { create } from 'axios'
import { useEffect, useState, useContext, useRef } from 'react'
import { CgProfile } from "react-icons/cg";
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import { MdArrowDropDown } from "react-icons/md";
import { Forumpost } from '../components/forumpost';

export function Forum() {

    const navigate = useNavigate();

    const { userdata } = useContext(AuthContext);
    const { id } = useParams();
    const [ forum, setForum ] = useState({
        id: id,
        title: '',
        image: '',
        createdAt: '',
        ownedby: '',
        followersnum: 0,
        description: '',
        followed: false
    });

    const [ posts, setPosts ] = useState([]);
    const [ tags, setTags ] = useState([]);

    const [ sortBy, setSortBy ] = useState('Newest');
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

    function DateDisplay({ sqlTimestamp }) {
        const formattedDate = new Date(sqlTimestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        return formattedDate;
    }

    async function fetchForumData() {
        try {
            const response = await axios.post('http://localhost:3000/fetchforumdata', { forumId: id });
            setForum((prev) => ({
                ...prev,
                title: response.data.name,
                image: response.data.forum_picture_url,
                createdAt: response.data.created_at,
                ownedby: response.data.owned_by,
                followersnum: response.data.followers_count,
                description: response.data.description
            }));
        } catch (error) {
            console.error('Error fetching forum data:', error);
        }
    }

    async function fetchForumPosts() {
        try {
            const response = await axios.post('http://localhost:3000/fetchforumposts', { forumId: id });
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching forum posts:', error);
        }
    }

    async function fetchTags() {
        try {
            const response = await axios.post('http://localhost:3000/fetchforumtags', { forumId: id });
            setTags(response.data);
        } catch (error) {
            console.error('Error fetching tags:', error)
        }
    }

    async function fetchIsFollowing() {
        if (!userdata?.id || !id) return;
        try {
            const response = await axios.post('http://localhost:3000/fetchisfollowing', { userId: userdata?.id, forumId: id });
            setForum((prevForum) => ({
                ...prevForum,
                followed: response.data.isFollowing
            }));
        } catch (error) {
            console.error('Error fetching following status:', error);
        }
    }

    async function toggleFollow() {
        if (!userdata || !id) return;
        try {
      const response = await axios.post('http://localhost:3000/toggleFollow', {
        userId: userdata?.id,
        forumId: id,
      });
      setForum((prevForum) => ({
        ...prevForum,
            followed: response.data.isFollowing,
        followersnum: response.data.followers
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
    }

    useEffect(() => {
        fetchForumData();
        fetchForumPosts();
        fetchTags();
        fetchIsFollowing();
    }, [id]);

    const sortedPosts = [...posts].sort((postA, postB) => {
        if (sortBy === 'Most Likes') {
            return Number(postB.likes_count || 0) - Number(postA.likes_count || 0);
        }

        const dateA = new Date((postA.created_at || '').replace(' ', 'T')).getTime();
        const dateB = new Date((postB.created_at || '').replace(' ', 'T')).getTime();
        return sortBy === 'Oldest' ? dateA - dateB : dateB - dateA;
    });

    return (
    <>
        <section id="page2"
            style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginTop: '25px'
            }}>
            <div className="content"
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '70%',
                gap: '10px',
                //backgroundColor: 'lightblue',
            }}
            >
            <div
                style = {{borderBottom: '1px solid', padding: '10px'}}>
            <div className="profilebanner">
                { forum.image ? (
                <img className = "pfp"
                    src={'data:image/png;base64,'+forum.image} 
                    alt="Profile" 
                    style={{ width: '160px', height: '160px', borderRadius: '50%', }}
                    onClick = {() => navigate(`/forum/${forum.id}`)} 
                />
                ) : (
                <div className='pfp' onClick={() => navigate(`/forum/${forum.id}`)}><CgProfile
                    style={{color: '#ffffff', width: '160px', height: '160px', borderRadius: '50%' }}  />
                </div>
                )}
                <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    marginTop: '16px'
                }}>
                <h1
                    style={{
                        marginBottom: '0px',
                        fontSize: 'clamp(2rem, 3vw, 3.5rem)',
                        lineHeight: 1.1,
                        maxWidth: '100%',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                    }}
                    >{forum.title}</h1>
                    <div style = {{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '10px',
                        alignItems: 'center'
                    }}>
                    <button
                        style={{
                            backgroundColor: forum.followed ? '#007bff' : 'transparent',
                            color: 'white',
                            border: forum.followed ? 'none' : '1px solid white',
                            borderRadius: '16px',
                            height: '32px',
                            padding: '0 16px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            marginTop: '20px',
                        }}
                        onClick={toggleFollow}
                    >
                        {forum.followed ? 'Following' : 'Follow'}
                    </button>
                    {/*forum.ownedby === userdata?.id*/ true && (
                <Link to={`/forum/${id}/edit`} style={{ marginLeft: 'auto', marginTop: '20px' }}>
                    <button
                        style = {{
                            borderRadius: '16px',
                            height: '32px',
                            padding: '0 16px',
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}
                    >
                        Edit Forum
                    </button>
                </Link>
                )}
                    </div>
                </div>
            </div>
            <div style = {{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '2px',
                        alignItems: 'center',
                        marginTop: '10px',
                    }}>
                        {tags.map((tag, index) => (
                    <div key={index} className='tag' style={{ marginRight: '5px' }}>
                        {tag}
                    </div>
                ))}
                    </div>
                <div
                    style = {{
                        display: 'flex',
                        flexDirection: 'row',}}
                >
                <p style = {{ marginTop: '10px', marginRight: '20px'}}>{forum.followersnum} Followers</p>
                <p style = {{ marginTop: '10px' }}>Created {DateDisplay({ sqlTimestamp: forum.createdAt })}</p>
                </div>
            <p style = {{ marginTop: '10px',}}>{forum.description}</p>
            </div>
            <div className="tab-buttons">
                <button
                    style={{
                        height: '32px',
                        padding: '0 16px',
                        fontSize: '14px',
                        border: '1px solid white',
                    }}
                    onClick={() => navigate(`/newpost/${id}`)}
                >+ Add a Post</button>
                <div
              style = {{
                marginLeft: 'auto',
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
              }}>
                <p>Sort By: </p>
                <div className="dropdown-container" ref={dropdownRef} style={{ position: "relative", display: "inline-block", height: '30px' }}>
                      <MdArrowDropDown size = {30} style = {{color: isOpen? '#ffffff':''}} className="dropdown-button" onClick={toggleDropdown} />
                      {isOpen && (
                        <ul className="dropdown-menu" style={{ position: "absolute", listStyle: "none", margin: 0, padding: "5px 0", border: "1px solid #ccc", zIndex: 100 }}>
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
                            <li 
                                                            className = {sortBy === 'Most Likes' ? 'dropdownElementSelected' : 'dropdownElement'}
                                                            onClick={() => {setIsOpen(false); setSortBy('Most Likes')}}
                              style={{ padding: "8px 16px", }}
                            >
                                                        Most Likes
                            </li>
                        </ul>
                      )}
                    </div>
            </div>
            </div>
            {posts.length > 0 ? (
                      sortedPosts.map((post) => (
                        <Forumpost 
                          key={post.id}
                          postdata={post} 
                          isCard={true}
                        />
                      ))
                    ) : (
                      <p style={{ color: '#888888', fontSize: '14px', marginTop: '15px' }}>
                        No comments yet. Be the first to reply!
                      </p>
                    )}
            </div>
        </section>
    </>
    );
}