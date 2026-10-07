import '../App.css'
import axios from 'axios'
import { useEffect, useState, useContext, useRef, use } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import { FaRegTrashCan } from "react-icons/fa6";


export function NewPost() {
    const navigate = useNavigate();

    const fileInputRef = useRef(null);

    const { userdata } = useContext(AuthContext);

    const { id } = useParams();

    const [post, setPost] = useState({
        postId: '',
        forumId: id,
        userId: userdata.id || '',
        postTitle: '',
        postContent: '',
        postImage: '',
        forumName: '',
    });

    const [isFocused, setIsFocused] = useState(() => ({
    postTitle: !!post.postTitle,
    postContent: !!post.postContent,
  }));
  
  const [error, setError] = useState({
    titleError: '',
    contentError: '',
    submitError: '',
  });

    const handleFocus = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  }

  const handleBlur = (field) => {
    if (post[field] === '') {
      setIsFocused((prev) => ({ ...prev, [field]: false }));
    }
  }

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
      setPost((prev) => ({ ...prev, postImage: rawBase64 }));
    } catch (error) {
      console.error("Error converting file:", error);
    }
  };
  const handleEditUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await convertToBase64(file);
      const rawBase64 = base64.split(',')[1];
      setEditComment((prev) => ({ ...prev, image: rawBase64 }));
    } catch (error) {
      console.error("Error converting file:", error);
    }
  };

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

    useEffect(() => {
        if (!post.forumId) navigate('/');
        if (!userdata?.id) navigate('/login');
        fetchForumData();
    }, [post.forumId]);

    const validateForm = async () => {
    const nextErrors = {
      titleError: '',
      contentError: '',
      submitError: '',
    };

    let isValid = true;
    const trimmedTitle = post.postTitle.trim();
    const trimmedContent = post.postContent.trim();

    if (trimmedTitle === '') {
      nextErrors.titleError = 'Please enter a title';
      isValid = false;
    }

    if (trimmedTitle.length > 200) {
      nextErrors.titleError = 'Title cannot exceed 200 characters';
      isValid = false;
    }

    if (trimmedContent === '') {
      nextErrors.contentError = 'Please enter content';
      isValid = false;
    }

    if (trimmedContent.length > 15000) {
      nextErrors.contentError = 'Content cannot exceed 15,000 characters';
      isValid = false;
    }

    setError(nextErrors);
    return isValid;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await validateForm()) {
      try {
        if (!userdata?.id) {
          navigate('/login');
          return;
        }

        const payload = {
            forumId: post.forumId,
            userId: userdata.id,
            title: post.postTitle,
            content: post.postContent,
            imageurl: post.postImage,
            
        };

        const response = await axios.post(`http://localhost:3000/addpost`, { ...payload });
        console.log('Post created successfully:', response.data);
        navigate(`/post/${response.data.postId}`);
      } catch (error) {
        console.error('Error during post submission:', error);
        setError((prev) => ({
          ...prev,
          submitError: error.response?.data?.error || 'Could not create the post. Please try again.',
        }));
      }
    }
  }

    return (
        <>
              <section id="page2"
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '25px',
                  marginBottom: '25px',
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
                    <form noValidate onSubmit={handleSubmit}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <h1
                    style={{
                        fontSize: 'clamp(2rem, 3vw, 3.5rem)',
                        lineHeight: 1.1,
                        maxWidth: '100%',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                    }}
                >New Post in {post.forumName}</h1>
                <div
                     style={{
                  width: '100%',
                  boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '40px',
                        borderRadius: '25px',
                        backgroundColor: '#3d3d3d',
                        borderColor: '#005bd3',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        boxShadow: '0 0 5px #005bd3, 0 0 15px #005bd3, 0 0 30px #005bd3'
                    }}>
                    <h2>Post Title</h2>
                    <div className={`input-container ${isFocused.postTitle ? 'active' : ''}`}>
              <input
                type="text"
                value={post.postTitle}
                onFocus={() => handleFocus('postTitle')}
                onBlur={() => handleBlur('postTitle')}
                onChange={(e) => setPost({ ...post, postTitle: e.target.value })}
                required
              />
              <label style={{ color: error.titleError ? '#b30000' : '' }}>
                {error.titleError ? error.titleError : 'Post Title'}
              </label>
            </div>
                    <h2>Post Content</h2>
                    <textarea 
                    value={post.postContent} 
                    onChange={(e) => setPost({ ...post, postContent: e.target.value })} 
                    style={{ width: '100%', height: '150px' }} 
                    />
                    {error.contentError && <p role="alert" style={{ color: '#ff9999' }}>{error.contentError}</p>}
                    {error.submitError && <p role="alert" style={{ color: '#ff9999' }}>{error.submitError}</p>}
                    {post.postImage && (
                  <img 
                    src={'data:image/png;base64,' + post.postImage}
                  style={{
                    display: 'block',
                    alignSelf: 'center',
                    marginTop: '10px',
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '400px',
                    boxSizing: 'border-box',
                    borderRadius: '5%',
                    border: '1px solid #ffffff',
                  }}
              /> )}
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}> 
                    <input
                        ref = {fileInputRef} 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                    <button type="button" onClick={handleButtonClick}> Add Image </button>
                    { post.postImage &&
                    <button 
                        type="button" 
                        style={{ 
                        marginLeft: '10px', 
                        backgroundColor: '#ff0000', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                        }} 
                        onClick={() => { setPost((prev) => ({ ...prev, postImage: '' })); }}
                    > 
                        <FaRegTrashCan size={16} style={{ display: 'block' }} /> 
                    </button> 
                    }
                    </div>
                  <button
                    style={{
                        marginTop: '10px',
                        width: '25%',
                        height: '40px',
                        alignSelf: 'center',
                    }}
                    type="submit">
                    Create Post
                  </button> 
                </div>
                </form>
                </div>
              </section>
            </>
    );
}