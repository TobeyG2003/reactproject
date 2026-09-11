import '../App.css'
import axios from 'axios'
import { useEffect, useState, useContext, useRef } from 'react'
import { CgProfile } from "react-icons/cg";
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import { BiCommentDetail } from "react-icons/bi";
import { MdArrowDropDown } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";

export function FriendCard({ friendId }) {

    const navigate = useNavigate();
    const { userdata } = useContext(AuthContext);

    const [ user, setUser ] = useState ({
      id: friendId,
      username: '',
      displayname: '',
      profilePicture: '',
      status: '',
      isSender: false
    });

    async function fetchUserData() {
        try {
            const response = await axios.post('http://localhost:3000/fetchUser', { userId: friendId });
            setUser((prev) => ({
                ...prev,
                username: response.data.username,
                displayname: response.data.display_name,
                profilePicture: response.data.profile_picture_url
            }));
        } catch (error) {
            console.error('Error fetching User Data:', error);
        }
    }

    async function checkFriendStatus() {
  try {
    const response = await axios.post('http://localhost:3000/fetchfriendstatus', { 
      userId: userdata.id, 
      friendId: friendId 
    });
    
    setUser((prev) => ({ 
      ...prev, 
      status: response.data.status,
      isSender: response.data.isSender 
    }));
    
    console.log('Friend status:', response.data.status);
  } catch (error) {
    console.error('Error checking friend status:', error);
  }
}

    async function handleFriendButton() {
        if (user.status === 'pending') {
            try {
                await axios.post('http://localhost:3000/cancelfriendrequest', { userId: userdata?.id, friendId: friendId });
                setUser((prev) => ({
                    ...prev,
                    status: ''
                }));
            } catch (error) {
                console.error('Error canceling friend request:', error);
            }
        } else if (user.status === 'accepted') {
            try {
                await axios.post('http://localhost:3000/unfriend', { userId: userdata?.id, friendId: friendId });
                setUser((prev) => ({
                    ...prev,
                    status: ''
                }));
            } catch (error) {
                console.error('Error removing friend:', error);
            }
        } else {
            try {
                await axios.post('http://localhost:3000/sendfriendrequest', { userId: userdata?.id, friendId: friendId });
                setUser((prev) => ({
                    ...prev,
                    status: 'pending',
                    isSender: true
                }));
            } catch (error) {
                console.error('Error sending friend request:', error);
            }
        }
    }

  async function handleAcceptRequest() {
    try {
      await axios.post('http://localhost:3000/acceptfriendrequest', { userId: userdata?.id, friendId: friendId });
      setUser((prev) => ({
        ...prev,
          status: 'accepted'
      }));
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  }

  async function handleDeclineRequest() {
    try {
      await axios.post('http://localhost:3000/declinefriendrequest', { userId: userdata?.id, friendId: friendId });
      setUser((prev) => ({
        ...prev,
          status: ''
      }));
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  }

    useEffect(() => {
  if (userdata?.id && friendId) {
    checkFriendStatus();
  }
  fetchUserData();
}, [userdata?.id, friendId]);
    return (
        <div
            style = {{borderBottom: '1px solid #3a3a3a', padding: '10px'}}>
          <div className="profilebanner" style ={{gap: '10px'}}>
            { user.profilePicture ? (
              <img className = "pfp"
                src={'data:image/png;base64,'+user.profilePicture} 
                alt="Profile" 
                style={{ width: '48px', height: '48px', borderRadius: '50%', }}
                onClick = {() => navigate(`/profile/${user.id}`)} 
              />
            ) : (
              <div className='pfp' onClick={() => navigate(`/profile/${user.id}`)}><CgProfile
                style={{color: '#ffffff', width: '48px', height: '48px', borderRadius: '50%' }}  />
              </div>
            )}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                marginTop: '5px'
              }}>
              <h2 className = 'navbarLink'
                style={{
                  marginBottom: '0px', fontSize: '18px', fontWeight: 'bold', color: '#ffffff'
                }}
                onClick = {() => navigate(`/profile/${user.id}`)}
                
                >{user.displayname}</h2>
              <p>@{user.username}</p>
            </div>
              {userdata?.id !== user.id && userdata && (
                user.status === 'pending' ? (
                  user.isSender ? (
                    <button onClick={handleFriendButton} style={{ marginTop: '5px', marginLeft: 'auto' }}>Pending</button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', marginTop: '5px', marginLeft: 'auto' }}>
                      <button onClick={handleAcceptRequest} >Accept Request</button>
                      <button onClick={handleDeclineRequest} >Decline Request</button>
                    </div>
                  )
                ) : user.status === 'accepted' ? (
                  <button onClick={handleFriendButton} style={{ marginTop: '5px', marginLeft: 'auto' }}>Friends</button>
                ) : (
                  <button onClick={handleFriendButton} style={{ marginTop: '5px', marginLeft: 'auto' }}>Add Friend</button>
                )
              )}
          </div>
          </div>
    );
}