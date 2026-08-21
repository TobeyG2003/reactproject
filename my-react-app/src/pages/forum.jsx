import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Forumpost } from '../components/forumpost'
import { Comment } from '../components/comment'

export function Forum() {

  const { id } = useParams();

  const [ backendData, setBackendData ] = useState(null);
  const [ backendComments, setBackendComments ] = useState([]);

  useEffect(() => {
    async function fetchPostData() {
        // Fetch comments data from the backend
        await axios.post('http://localhost:3000/fetchpostdata', {
            postId: id,
        })
        .then((response) => {
            setBackendData(response.data);
        })
        .catch((error) => {
            console.error('Error fetching Post Data:', error);
        });
    }

    async function fetchCommentData() {
        // Fetch comments data from the backend
        await axios.post('http://localhost:3000/fetchcomments', {
            postId: id,
        })
        .then((response) => {
            setBackendComments(response.data);
        })
        .catch((error) => {
            console.error('Error fetching Comment Data:', error);
        });
    }

    fetchPostData();
    fetchCommentData();
    }, [id]);

  return (
    <>
      <section id="forum">
        <div className="content">
          <h1>Forum</h1>
          <p>This is the content of the Forum page.</p>
          <Forumpost postdata={backendData} isCard={true}   />
          <div className="comments-section" style={{ marginTop: '30px' }}>
        <h3 style={{ color: '#ffffff', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
          Comments ({backendComments.length})
        </h3>

        {backendComments.length > 0 ? (
          backendComments.map((comment) => (
            <Comment 
              key={comment.id}
              commentdata={comment} 
              isCard={false}
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