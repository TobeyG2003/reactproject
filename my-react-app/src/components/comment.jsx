import '../App.css'
import axios from 'axios'
import { useEffect, useState, useContext, useRef } from 'react'
import { CgProfile } from "react-icons/cg";
import { FaHeart } from "react-icons/fa";
import TimeAgo from 'timeago-react';
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import { BiCommentDetail } from "react-icons/bi";
import { MdArrowDropDown } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";



export function Comment( {commentdata, isCard = true, postId = null, isReply = false, onCommentAdded} ) {

    const navigate = useNavigate();

    const { userdata } = useContext(AuthContext)

    const fileInputRef = useRef(null);

    const [ viewReplies, setViewReplies ] = useState('false')
    const [ addReply, setAddReply ] = useState('null')
    const [ backendReplies, setBackendReplies ] = useState([]); 

    const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await convertToBase64(file);
      const rawBase64 = base64.split(',')[1];
      setNewComment((prev) => ({ ...prev, image: rawBase64 }));
    } catch (error) {
      console.error("Error converting file:", error);
    }
  };

  async function addNewReply() {
    try {
      const resp = await axios.post('http://localhost:3000/addcomment', {
        postId: postId,
        userId: userdata.id,
        content: newComment.content,
        imageurl: newComment.image,
        parentCommentId: comments.commentId,
        replychain: (comments.replyChain + 1),
      });

      setComments((prev) => ({ ...prev, replyCount: (prev.replyCount || 0) + 1 }));

      await fetchReplies();

      if (onCommentAdded && typeof onCommentAdded === 'function') {
        try { await onCommentAdded(); } catch (e) { /* ignore */ }
      }

      return resp.data;
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

 async function fetchReplies() {
        // Fetch comments data from the backend
        await axios.post('http://localhost:3000/fetchreplies', {
            commentId: comments.commentId,
        })
        .then((response) => {
            setBackendReplies(response.data);
            console.log(response.data)
        })
        .catch((error) => {
            console.error('Error fetching reply Data:', error);
        });
    }

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
    replyChain: commentdata?.reply_chain_count || 0,
    parentCommentId: commentdata?.parent_comment_id || null,
    replyUsername: '',
    replyUserId: commentdata?.reply_user_id || '',
    replySpacing: 0,
  });

  const [ newComment, setNewComment ] = useState ({
    isAdd: false,
    content: '',
    image: '',
  });

  useEffect(() => {
    if (commentdata) {
      setComments((prev) => ({
        ...prev,
        commentId: commentdata.id || '',
        userId: commentdata.user_id || '',
        date: commentdata.created_at || '',
        updatedate: commentdata.updated_at || '',
        forumId: commentdata.post_id || '',
        likes: commentdata.likes_count || 0,
        postContent: commentdata.content || '',
        postPicture: commentdata.image_url || '',
        replyCount: commentdata.reply_total || 0,
        replyChain: commentdata.reply_chain_count || 0,
        parentCommentId: commentdata.parent_comment_id || null,
        replyUserId: commentdata.reply_user_id || '',
      }));
      if (comments.replyChain > 8) {
        setComments((prevComments) => ({
        ...prevComments,
        replySpacing: 8
      }));
      } else {
        setComments((prevComments) => ({
        ...prevComments,
        replySpacing: comments.replyChain
      }));
      }
    }
  }, [commentdata]);

  const toggleLike = async () => {
    try {
      const response = await axios.post('http://localhost:3000/toggleLike', {
        userId: userdata?.id,
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
    if (!comments.userId && !comments.commentId && !comments.forumId) return;

    async function fetchUserData() {
      if (!comments.userId) return;
      try {
        const response = await axios.post('http://localhost:3000/fetchUser', { userId: comments.userId });
        setComments((prevComments) => ({
          ...prevComments,
          username: response.data.username,
          profilePicture: response.data.profile_picture_url
        }));
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    }

    async function fetchIsLiked() {
      if (!userdata?.id || !comments.commentId) return;
      try {
        const response = await axios.post('http://localhost:3000/checkLiked', {
          userId: userdata.id,
          commentId: comments.commentId,
        });
        setComments((prevComments) => ({ ...prevComments, isLiked: response.data.isLiked }));
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    }

    async function fetchReplyData() {
      if (!comments.replyUserId) return;
      try {
        const response = await axios.post('http://localhost:3000/fetchUser', { userId: comments.replyUserId });
        setComments((prevComments) => ({ ...prevComments, replyUsername: response.data.username }));
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    }

    async function fetchForumData() {
      if (!comments.forumId) return;
      try {
        const response = await axios.post('http://localhost:3000/fetchforumdata', { forumId: comments.forumId });
        setComments((prevComments) => ({
          ...prevComments,
          forumName: response.data.name,
          forumPicture: response.data.forum_picture_url
        }));
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    }

    fetchReplyData();
    fetchUserData();
    fetchForumData();
    fetchIsLiked();
  }, [comments.userId, comments.commentId, comments.replyUserId, comments.forumId, userdata?.id]);

    return (
      <>
        <div className="comment"
            style={{
              ...(!isCard && { border: '0px', backgroundColor: 'transparent', borderBottom: '1px solid', borderRadius: '0'}),
              ...(isReply && { borderColor: '#3a3a3a', borderLeft: '3px dotted #414141', borderBlockEnd: ''}),
              ...(isReply && { transform: `translateX(${Math.min(comments.replySpacing || 0, 8) * 16}px)` }),
            }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', }}>
                {comments.profilePicture ? 
            (<img className = "pfp"
              src={'data:image/png;base64,'+comments.profilePicture} 
              alt="Profile" 
              style={{ width: '30px', height: '30px', borderRadius: '50%' }}
              onClick = {() => navigate(`/profile/${comments.userId}`)} 
            />
            ): (
              <div className='pfp' onClick={() => navigate(`/profile/${comments.userId}`)}><CgProfile
              style={{color: '#ffffff', width: '30px', height: '30px', borderRadius: '50%' }}  />
              </div>
            )}
                <p style={{ color: '#ffffff', fontSize: '14px' }} onClick={() => navigate(`/profile/${comments.userId}`)}>{comments.username || 'Unavailable'}</p>
                <p>
                    <TimeAgo datetime={comments.date ? comments.date.replace(' ', 'T') : ''} locale="en_US" />
                </p>
                {comments.replyChain > 0 && (
                    <>
                    <div>
                        replying to 
                    </div>
                    <div
                      className='navbarLink'
                      style={{
                        fontSize: '13pt',
                        cursor: 'pointer',
                      }}
                      onClick = {() => navigate(`/profile/${comments.replyUserId}`)} 
>
                      {comments.replyUsername}</div>
                    </>
                 )}
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
              style={{ width: '30px', height: '30px', borderRadius: '50%' }}
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
            <p style={{ color: '#ffffff', fontSize: '14px', marginRight: 'auto'}}>{comments.postContent || 'Unavailable'}</p>
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
                border: '1px solid #ffffff',
                alignSelf: 'center'}}
                />
            )}
            <div 
              style = {{ display: 'flex', flexDirection: 'row'}}>
            <div
              style = {{ display: 'flex', flexDirection: 'row', gap: '10px'}}>
              <BiCommentDetail style={{color: '#ffffff', width: '20px', height: '20px', marginTop: '12px'}} />
              <p
                style={{ color: '#ffffff', fontSize: '14px', marginTop: '10px'}}
                >{comments.replyCount}</p>
            </div>
            { !isCard && ( <>
              { comments.replyCount != 0 && (
            <div className = "dropdown-button"
              onClick = {() => {setViewReplies(!viewReplies), viewReplies && fetchReplies()}}
              style = {{ ...(!viewReplies && {color: '#3a64da'}), display: 'flex', flexDirection: 'row', gap: '0px', marginLeft: '10px', marginTop: '8px'}}>
              <MdArrowDropDown
                size = {30}/>
                <p
                style = {{fontSize: '14px', marginTop: '2px'}}
                >{!viewReplies ? 'Hide replies' : 'View replies'}</p>
            </div>)}
            { !newComment.isAdd &&
            <button
              onClick={() => userdata ? 
                setNewComment({...newComment, isAdd: true })
                : navigate('/login')
              }
              style = {{ height: '25px', marginTop: '10px', marginLeft: '10px', alignSelf: 'center'}}
            > 
              <BiCommentDetail style={{color: '#ffffff', width: '15px', height: '15px', marginBottom: '-3px', paddingRight: '5px'}}/> 
              Reply
            </button>
            }</>)}
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'row', marginLeft: 'auto' }}>
                <FaHeart
                    onClick={toggleLike}
                    style={{ color: comments.isLiked ? '#ff0000' : '#ffffff', width: '20px', height: '20px', marginTop: '12px', cursor: 'pointer' }} />
                <p style={{ color: '#ffffff', fontSize: '14px', marginTop: '10px', marginLeft: 'auto' }}>{comments.likes || 0}</p>
            </div>
            </div>
            { newComment.isAdd &&
              <div style={{ width: '70%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}> 
                <textarea 
                  value={newComment.content} 
                  onChange={(e) => setNewComment({ ...newComment, content: e.target.value })} 
                  style={{ width: '100%', height: '150px' }} 
                />
                {newComment.image && (
                  <img 
                    src={'data:image/png;base64,' + newComment.image}
                  style={{
                  marginTop :'10px',
                  width: '100%',
                  height: '100%',
                  maxWidth: '200px', 
                  maxHeight: '160px', 
                  objectFit: 'contain',
                  borderRadius: '5%',
                  border: '1px solid #ffffff',}}
              /> )}
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: '10px', alignSelf: 'stretch' }}> 
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}> 
                    <input
                      ref = {fileInputRef} 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <button onClick={handleButtonClick}> Add Image </button>
                    { newComment.image &&
                    <button 
                      type="button" 
                      style={{ 
                        marginLeft: '10px', 
                        backgroundColor: '#ff0000', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }} 
                      onClick={() => { setNewComment((prev) => ({ ...prev, image: '' })); }}
                    > 
                      <FaRegTrashCan size={16} style={{ display: 'block' }} /> 
                    </button> 
                    }
                  </div> 
  
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}> 
                    <button onClick={async () => { await addNewReply();
                        setNewComment((prev) => ({ ...prev, image: '' })); 
                        setNewComment((prev) => ({...prev, content: ''}));
                        setNewComment((prev) => ({...prev, isAdd: false}));
                      }} > 
                      Submit 
                    </button> 
                    <button 
                      type="button" 
                      style={{ marginLeft: '10px', backgroundColor: '#ff0000' }} 
                      onClick={() => {setNewComment((prev) => ({ ...prev, image: '' })); 
                        setNewComment((prev) => ({...prev, content: ''}));
                        setNewComment((prev) => ({...prev, isAdd: false}));
                      }}
                    > 
                      Cancel 
                    </button> 
                  </div> 
                </div> 
              </div>
            }
        </div>
        {backendReplies.length > 0 && !viewReplies && (
          backendReplies.map((comment) => (
            <Comment 
              key={comment.id}
              commentdata={comment} 
              isCard={false}
              postId = {postId}
              isReply ={true}
            />
          ))
        )}
      </>
    );
}