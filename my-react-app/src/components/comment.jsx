import '../App.css'
import axios from 'axios'
import { use } from 'react';
import { useEffect, useState } from 'react'
import { CgProfile } from "react-icons/cg";
import { FaHeart } from "react-icons/fa";
import TimeAgo from 'timeago-react';
import { Link, useNavigate } from 'react-router-dom'


export function Comment( {commentdata, isCard = true} ) {

    const navigate = useNavigate();

    const [comments, setComments] = useState({
    commentId: commentdata?.id || '',
    username: '',
    userId: commentdata?.user_id || '',
    profilePicture: '',
    date: commentdata?.created_at|| '',
    updatedate: commentdata?.updated_at || '',
    forumName: '',
    forumPicture: '',
    forumId: commentdata?.post_id || '',
    likes: commentdata?.likes_count || 0,
    isLiked: false,
    postContent: commentdata?.content || '',
    postPicture: commentdata?.image_url || '',
    replyCount: commentdata?.reply_total || 0,
    replyChain: commentdata?.reply_chain || 0,
    parentCommentId: commentdata?.parent_comment_id || null,
    replyUsername: '',
    replyUserId: commentdata?.reply_user_id || '',
  });

  const toggleLike = async () => {
    try {
      const response = await axios.post('http://localhost:3000/toggleLikeComment', {
        userId: comments.userId,
        commentId: comments.commentId,
      });
      setComments((prevComments) => ({
        ...prevComments,
        isLiked: response.data.isLiked,
        likes: response.data.likes
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  useEffect(() => {
    async function fetchUserData() {
        // Fetch comments data from the backend
        await axios.post('http://localhost:3000/fetchUser', {
            userId: comments.userId,
        })
        .then((response) => {
            setComments((prevComments) => ({
            ...prevComments,
            username: response.data.username,
            profilePicture: response.data.profile_picture_url
            }));
        })
        .catch((error) => {
            console.error('Error fetching comments:', error);
        });
    }

    async function fetchIsLiked() {
        // Fetch comments data from the backend
        await axios.post('http://localhost:3000/checkLiked', {
            userId: comments.userId,
            commentId: comments.commentId,
        })
        .then((response) => {
            setComments((prevComments) => ({
            ...prevComments,
            isLiked: response.data.isLiked,
            }));
        })
        .catch((error) => {
            console.error('Error fetching comments:', error);
        });
    }

    async function fetchReplyData() {
        // Fetch comments data from the backend
        await axios.post('http://localhost:3000/fetchUser', {
            userId: comments.replyUserId,
        })
        .then((response) => {
            setComments((prevComments) => ({
            ...prevComments,
            replyUsername: response.data.username,
            }));
        })
        .catch((error) => {
            console.error('Error fetching comments:', error);
        });
    }

    async function fetchForumData() {
        // Fetch comments data from the backend
        await axios.post('http://localhost:3000/fetchforumdata', {
            forumId: comments.forumId,
        })
        .then((response) => {
            setComments((prevComments) => ({
            ...prevComments,
            forumName: response.data.name,
            forumPicture: response.data.forum_picture_url
            }));
        })
        .catch((error) => {
            console.error('Error fetching comments:', error);
        });
    }

    fetchReplyData();
    fetchUserData();
    fetchForumData();
    fetchIsLiked();
    }, []);

    return (
        <div className="comment"
            style={{
            }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', }}>
                {comments.profilePicture ? 
            (<img className = "pfp"
              src={'data:image/png;base64,'+comments.profilePicture} 
              alt="Profile" 
              style={{ width: '30px', height: '30x', borderRadius: '50%' }}
              onClick = {() => navigate(`/profile/${comments.userId}`)} 
            />
            ): (
              <div className='pfp' onClick={() => navigate(`/profile/${comments.userId}`)}><CgProfile
              style={{color: '#ffffff', width: '30px', height: '30px', borderRadius: '50%' }}  />
              </div>
            )}
                <p style={{ color: '#ffffff', fontSize: '14px' }}>{comments.replyUsername || 'Unavailable'}</p>
                <p><TimeAgo 
                    datetime={comments.created_at?.replace(' ', 'T') || ''} 
                    locale="en_US" 
                /></p>
                { isCard &&
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        marginLeft: 'auto',
                        alignItems: 'center',
                        gap: '10px',
                    }}>
                {comments.forumPicture ? 
            (<img className = "pfp"
              src={'data:image/png;base64,'+comments.forumPicture} 
              alt="Profile" 
              style={{ width: '30px', height: '30x', borderRadius: '50%' }}
              onClick = {() => navigate(`/forum/${comments.forumId}`)} 
            />
            ): (
              <div className='pfp' onClick={() => navigate(`/forum/${comments.forumId}`)}><CgProfile
              style={{color: '#ffffff', width: '30px', height: '30px', borderRadius: '50%' }}  />
              </div>
            )}
                <p style={{ color: '#ffffff', fontSize: '14px' }} onClick = {() => navigate(`/forum/${comments.forumId}`)}>{comments.forumName || 'Unavailable'}</p>
                </div>
                }
            </div>
            <p style={{ color: '#ffffff', fontSize: '14px' }}>{comments.postContent || 'Unavailable'}</p>
            {comments.postPicture && (
                <img 
                    src={'data:image/png;base64,'+comments.postPicture}
                    alt="Post" 
                    style={{
                width: '100%',
                height: '100%',
                maxWidth: '250px', 
                maxHeight: '200px', 
                objectFit: 'contain',
                borderRadius: '5%',
                border: '1px solid #ffffff',}}
                />
            )}
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'row', marginLeft: 'auto' }}>
                <FaHeart
                    onClick={toggleLike}
                    style={{ color: comments.isLiked ? '#ff0000' : '#ffffff', width: '20px', height: '20px', marginTop: '12px' }} />
                <p style={{ color: '#ffffff', fontSize: '14px', marginTop: '10px', marginLeft: 'auto' }}>{comments.likeCount || 0}</p>
            </div>
        </div>
    );
}