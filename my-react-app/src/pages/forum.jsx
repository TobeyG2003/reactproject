import { Link, useParams } from 'react-router-dom'
import { Forumpost } from '../components/forumpost'
import { Comment } from '../components/comment'

export function Forum() {

  const { id } = useParams();

  const [ backendData, setBackendData ] = useState (null);

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

    fetchPostData();
    }, []);

  return (
    <>
      <section id="forum">
        <div className="content">
          <h1>Forum</h1>
          <p>This is the content of the Forum page.</p>
          <Forumpost postdata={backendData} isCard={true}   />
          <Comment/>
        </div>
      </section>
    </>
  )
}