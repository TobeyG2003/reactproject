import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useContext } from 'react'
import axios from 'axios'
import { Forumpost } from '../components/forumpost'
import { Comment } from '../components/comment'
import { BiCommentDetail } from "react-icons/bi";
import { MdArrowDropDown } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import { AuthContext } from '../AuthContext'
import '../App.css'


export function Post() {

  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const { userdata } = useContext(AuthContext);

  const { id } = useParams();

  const [ backendData, setBackendData ] = useState(null);
  const [ backendComments, setBackendComments ] = useState([]);
  const [ sortBy, setSortBy ] = useState('Newest');

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const dropdownRef = useRef(null);

  const [ newComment, setNewComment ] = useState ({
    isAdd: false,
    content: '',
    image: '',
  });

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

  async function addComment() {
    try {
      await axios.post('http://localhost:3000/addcomment', {
        postId: id,
        userId: userdata?.id,
        content: newComment.content,
        imageurl: newComment.image,
      });
      await fetchPostData();
      await fetchCommentData();
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchPostData() {
      try {
        const response = await axios.post('http://localhost:3000/fetchpostdata', { postId: id });
        setBackendData(response.data);
      } catch (error) {
        console.error('Error fetching Post Data:', error);
      }
  }

  async function fetchCommentData() {
      try {
        const response = await axios.post('http://localhost:3000/fetchcomments', { postId: id });
        setBackendComments(response.data);
      } catch (error) {
        console.error('Error fetching Comment Data:', error);
      }
  }

  useEffect(() => {
    fetchPostData();
    fetchCommentData();
  }, [id]);

  return (
    <>
      <section className="forum">
        <h1></h1>
        <div className="content"
          style = {{
            width: '100%'
          }}
        >
          <div style = {{ width: '70%', margin: '0 auto'}}>
          <Forumpost postdata={backendData} isCard={false}   />
          </div>
          <div
            style = {{
              display: 'flex',
              flexDirection: 'row',
              gap: '10px',
              width: '70%',
              margin: '0 auto 16px auto',
            }}>
            { !newComment.isAdd &&
            <button
              onClick={() => userdata ? 
                setNewComment({...newComment, isAdd: true })
                : navigate('/login')
              }

            > 
              <BiCommentDetail style={{color: '#ffffff', width: '15px', height: '15px', marginBottom: '-3px', paddingRight: '5px'}}/> 
              Add a Comment
            </button>
            }
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
                              className = {sortBy === 'Popular' ? 'dropdownElementSelected' : 'dropdownElement'}
                              onClick={() => {setIsOpen(false); setSortBy('Popular')}}
                              style={{ padding: "8px 16px", }}
                            >
                            Popular
                            </li>
                        </ul>
                      )}
                    </div>
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
                  <button onClick={async () => { await addComment();
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
          <div className="comments-section" style={{ margin: '30px auto 0 auto', width: '70%', display: 'flex', flexDirection: 'column',}}>
        <h3 style={{ color: '#ffffff', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
          Comments ({backendComments.length})
        </h3>
        {backendComments.length > 0 ? (
          backendComments.map((comment) => (
            <Comment 
              key={comment.id}
              commentdata={comment} 
              isCard={false}
              postId = {id}
              isReply = {false}
              onCommentAdded={async () => { await fetchPostData(); await fetchCommentData(); }}
            />
          ))
        ) : (
          <p style={{ color: '#888888', fontSize: '14px', marginTop: '15px' }}>
            No comments yet. Be the first to reply!
          </p>
        )}
      </div>
        </div>
      </section>
    </>
  )
}