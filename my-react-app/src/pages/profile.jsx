import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, useContext, useRef } from 'react'
import { AuthContext } from '../AuthContext'
import { Friends } from  '../components/friends'
import { Likes } from  '../components/likes'
import { Activity } from  '../components/activity'
import { Following } from  '../components/following'
import axios from 'axios'
import { CgProfile } from "react-icons/cg";




export function Profile() {

  
  const navigate = useNavigate();
  const { userdata } = useContext(AuthContext);
  const { id } = useParams();

  const [ user, setUser ] = useState ({
      id: id,
      username: '',
      displayname: '',
      joindate: '',
      profilePicture: '',
      bio: '',
      private: 'public',
      friendsnum: 0,
  });

    const [activeTab, setActiveTab] = useState(0);

    const tabData = [
    { label: 'Activity', content: <Activity/> },
    { label: 'Likes', content: <Likes userId={user.id}/> },
    { label: 'Following', content: <Following userId={user.id}/> },
    { label: `Friends (${user.friendsnum})`, content: <Friends/> },
  ];

  useEffect(() => {
    async function fetchUserData() {
      if (!id) return;
      try {
        const response = await axios.post('http://localhost:3000/fetchUser', { userId: id });
        setUser((prev) => ({
          ...prev,
          username: response.data.username,
          displayname: response.data.display_name,
          bio: response.data.bio,
          joindate: response.data.created_at,
          profilePicture: response.data.profile_picture_url,
          private: response.data.private
        }));
      } catch (error) {
        console.error('Error fetching Post User Data:', error);
      }
    }

    fetchUserData();

  }, [userdata?.id]);

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
            { user.profilePicture ? (
              <img className = "pfp"
                src={'data:image/png;base64,'+user.profilePicture} 
                alt="Profile" 
                style={{ width: '160px', height: '160px', borderRadius: '50%', }}
                onClick = {() => navigate(`/profile/${user.id}`)} 
              />
            ) : (
              <div className='pfp' onClick={() => navigate(`/profile/${user.id}`)}><CgProfile
                style={{color: '#ffffff', width: '160px', height: '160px', borderRadius: '50%' }}  />
              </div>
            )}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}>
              <h1
                style={{
                  marginBottom: '14px',
                }}
                >{user.displayname}</h1>
              <p>@{user.username}</p>
              <p>Joined {user.joindate}</p>
              <button style = {{ marginTop: '10px'}}>Add Friend</button>
            </div>
          </div>
          <p style = {{ marginTop: '10px'}}>{user.bio}</p>
          </div>
          <div className="tabs-container">
      <div className="tab-buttons">
        {tabData.map((tab, index) => (
          <div
            key={index}
            className={`${activeTab === index ? 'navbarLinkSelected' : 'navbarLink'}`}
            onClick={() => setActiveTab(index)}
            style={{}}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div className="tab-content">
        {tabData[activeTab].content}
      </div>
    </div>
        </div>
      </section>
    </>
  )
}