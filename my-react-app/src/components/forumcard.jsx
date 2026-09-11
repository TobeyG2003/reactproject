import '../App.css'
import axios from 'axios'
import { useEffect, useState, useContext, useRef } from 'react'
import { CgProfile } from "react-icons/cg";
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import { BiCommentDetail } from "react-icons/bi";
import { MdArrowDropDown } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";

export function ForumCard({ forumid }) {

    const navigate = useNavigate();
    const { userdata } = useContext(AuthContext);

    const [ newCard, setNewCard ] = useState ({
        id: forumid,
        forumName: '',
        forumPicture: '',
        desc: '',
        followers: 0,
        isFollowed : false
    });

    const [ tags, setTags ] = useState([])

    async function toggleFollow() {
        if (!userdata || !forumid) return;
        try {
      const response = await axios.post('http://localhost:3000/toggleFollow', {
        userId: userdata?.id,
        forumId: forumid,
      });
      setNewCard((prevCard) => ({
        ...prevCard,
                isFollowed: response.data.isFollowing,
        followers: response.data.followers
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
    }

    async function fetchIsFollowing() {
        if (!userdata?.id || !forumid) return;
        try {
            const response = await axios.post('http://localhost:3000/fetchisfollowing', { userId: userdata?.id, forumId: forumid });
            setNewCard((prevCard) => ({
                ...prevCard,
                isFollowed: response.data.isFollowing
            }));
        } catch (error) {
            console.error('Error fetching following status:', error);
        }
    }

    async function fetchForumData() {
        if (!forumid) return;
        try {
        const response = await axios.post('http://localhost:3000/fetchforumdata', { forumId: forumid });
        setNewCard((prevCard) => ({
          ...prevCard,
          forumName: response.data.name,
          forumPicture: response.data.forum_picture_url,
          desc: response.data.description,
          followers: response.data.followers_count
        }));
      } catch (error) {
        console.error('Error fetching forum data:', error);
      }
    }

    async function fetchTags() {
        try {
            const response = await axios.post('http://localhost:3000/fetchforumtags', { forumId: forumid });
            setTags(response.data);
        } catch (error) {
            console.error('Error fetching tags:', error)
        }
    }

    useEffect(() => {
        fetchForumData();
        fetchTags();
        fetchIsFollowing();
    }, [forumid, userdata?.id]);

    return (
        <div className="forumpost" style = {{padding: '8px'}}>
            <div style = {{
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
                marginBottom: '-28px',
            }}>
                {newCard.forumPicture ? (
                    <img className='pfp' src={'data:image/png;base64,'+newCard.forumPicture} alt="Forum" style={{ width: '60px', height: '60px', borderRadius: '50%', }}
                    onClick={() => navigate(`/forums/${forumid}`)}/>
                ) : (
                    <CgProfile className='pfp' style={{color: '#ffffff', width: '60px', height: '60px', borderRadius: '50%' }} 
                    onClick={() => navigate(`/forums/${forumid}`)}/>
                )}
                <div style = {{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',}}>
                    <h2 style = {{ margin: 0 }}>{newCard.forumName}</h2>
                    <p style = {{ color: 'white', fontSize: '14px'}}>{newCard.followers} Followers</p>
                </div>
                <button
                    style={{
                        marginLeft: 'auto',
                        backgroundColor: newCard.isFollowed ? '#007bff' : 'transparent',
                        color: 'white',
                        border: newCard.isFollowed ? 'none' : '1px solid white',
                        borderRadius: '16px',
                        height: '32px',
                        padding: '0 16px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        marginTop: '20px',
                    }}
                    onClick={toggleFollow}
                >
                    {newCard.isFollowed ? 'Following' : 'Follow'}
                </button>
            </div>
            <div
                style = {{
                    display: 'flex',
                    flexDirection: 'row',
                    marginBottom: '-24px',
                }}
            >
                {tags.map((tag, index) => (
                    <div key={index} className='tag' style={{ marginRight: '5px' }}>
                        {tag}
                    </div>
                ))}
            </div>
            <p style = {{ color: 'white', fontSize: '14px', alignSelf: 'flex-start',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            }}>{newCard.desc}</p>
        </div>
    );
}