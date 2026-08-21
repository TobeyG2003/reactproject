import '../App.css'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { CgProfile } from "react-icons/cg";
import { FaHeart } from "react-icons/fa";
import { BiCommentDetail } from "react-icons/bi";
import TimeAgo from 'timeago-react';
import { Link, useParams, useNavigate } from 'react-router-dom'

export function Forumpost({postdata, isCard = true}) {
  const [post, setPost] = useState({
    postId: postdata?.id || '',
    forumId: postdata?.forum_id || '',
    userId: postdata?.user_id || '',
    username: '',
    profilePicture: '',
    postTitle: postdata?.title || '',
    postContent: postdata?.content || '',
    postDate: postdata?.created_at || '',
    postUpdate: postdata?.updated_at || '',
    postLikes: postdata?.likes_count || 0,
    isLiked: false,
    postImage: postdata?.image_url || '',
    forumName: '',
    forumPicture: '',
    postRepliesCount: postdata?.replies_num || 0,
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (postdata) {
      setPost((prev) => ({
        ...prev,
        postId: postdata.id || '',
        forumId: postdata.forum_id || postdata.formum_id || '',
        userId: postdata.user_id || '',
        postTitle: postdata.title || '',
        postContent: postdata.content || '',
        postDate: postdata.created_at || '',
        postUpdate: postdata.updated_at || '',
        postLikes: postdata.likes_count || 0,
        postImage: postdata.image_url || '',
        postRepliesCount: postdata.replies_num || 0,
      }));
    }
  }, [postdata]);

  const toggleLike = async () => {
    try {
      const response = await axios.post('http://localhost:3000/toggleLike', {
        userId: post.userId,
        postId: post.postId,
      });
      setPost((prevPost) => ({
        ...prevPost,
        isLiked: response.data.isLiked,
        postLikes: response.data.likes,
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  useEffect(() => {
    if (!post.userId && !post.postId && !post.forumId) return;
    async function fetchUserData() {
      if (!post.userId) return;
      try {
        const response = await axios.post('http://localhost:3000/fetchUser', { userId: post.userId });
        setPost((prevPost) => ({
          ...prevPost,
          username: response.data.username,
          profilePicture: response.data.profile_picture_url
        }));
      } catch (error) {
        console.error('Error fetching Post User Data:', error);
      }
    }

    async function fetchIsLiked() {
      if (!post.userId || !post.postId) return;
      try {
        const response = await axios.post('http://localhost:3000/checkLiked', { 
          userId: post.userId, 
          postId: post.postId, 
        });
        setPost((prevPost) => ({ ...prevPost, isLiked: response.data.isLiked }));
      } catch (error) {
        console.error('Error fetching post liked:', error);
      }
    }

    async function fetchForumData() {
      if (!post.forumId) return;
      try {
        const response = await axios.post('http://localhost:3000/fetchforumdata', { forumId: post.forumId });
        setPost((prevPost) => ({
          ...prevPost,
          forumName: response.data.name,
          forumPicture: response.data.forum_picture_url
        }));
      } catch (error) {
        console.error('Error fetching forum data:', error);
      }
    }

    fetchUserData();
    fetchForumData();
    fetchIsLiked();
  }, [post.userId, post.postId, post.forumId]);

  return (
    <div className="forumpost">
        <div
        style = {{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px'
        }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between", 
          width: "100%", 
        }}>
  <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
    {post.profilePicture ? (
      <img
        className="pfp"
        src={"data:image/png;base64," + post.profilePicture}
        alt="Profile"
        style={{ width: "30px", height: "30px", borderRadius: "50%" }} 
        onClick={() => navigate(`/profile/${post.userId}`)}
      />
    ) : (
      <div className="pfp" onClick={() => navigate(`/profile/${post.userId}`)}>
        <CgProfile style={{ color: "#ffffff", width: "30px", height: "30px", borderRadius: "50%" }} />
      </div>
    )}
    <p style={{ color: "#ffffff", fontSize: "14px" }} onClick={() => navigate(`/profile/${post.userId}`)}>
      {post.username || "Unavailable"}
    </p>
    <p>
      <TimeAgo datetime={post.postDate ? post.postDate.replace(" ", "T") : ""} locale="en_US" />
    </p>
  </div>
    {isCard && (
      <div
        style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "10px",
      }}>
          {post.forumPicture ? 
            (<img className = "pfp"
              src={'data:image/png;base64,'+post.forumPicture} 
              alt="Profile" 
              style={{ width: '30px', height: '30px', borderRadius: '50%' }}
              onClick = {() => navigate(`/forum/${post.forumId}`)} 
            />
            ): (
              <div className='pfp' onClick={() => navigate(`/forum/${post.forumId}`)}><CgProfile
              style={{color: '#ffffff', width: '30px', height: '30px', borderRadius: '50%' }}  />
              </div>
            )}
                <p style={{ color: '#ffffff', fontSize: '14px' }} onClick = {() => navigate(`/forum/${post.forumId}`)}>{post.forumName || 'Unavailable'}</p>
                </div>
                )}
          </div>
          <h2
            style = {{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
           }}
          >{post.postTitle}</h2>
          <p
          style = {{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
           }}
          >{post.postContent}</p>
          {post.postImage && (
                <img 
                    src={'data:image/png;base64,'+post.postImage}
                style={{
                width: '100%',
                height: '100%',
                maxWidth: '500px', 
                maxHeight: '400px', 
                objectFit: 'contain',
                borderRadius: '5%',
                border: '1px solid #ffffff',}}
            /> )}
        </div>
        <div style ={{ display: 'flex', gap: '10px', flexDirection: 'row',  }}>
            <BiCommentDetail style={{color: '#ffffff', width: '20px', height: '20px', marginTop: '12px'}} />
            <p style={{color: '#ffffff', fontSize: '14px', marginTop: '10px'}}>{post.postRepliesCount}</p>
            <div 
            style={{ display: 'flex', gap: '10px', flexDirection: 'row', marginLeft: 'auto' }}>
                <FaHeart
                    onClick={toggleLike}
                    style={{ color: post.isLiked ? '#ff0000' : '#ffffff', width: '20px', height: '20px', marginTop: '12px' }} />
                <p style={{color: '#ffffff', fontSize: '14px', marginTop: '10px',}}>{post.postLikes}</p>
            </div>
          </div>
    </div>
  );
}