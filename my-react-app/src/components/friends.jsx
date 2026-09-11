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
import { FriendCard } from './friendcard';


export function Friends({ userId }) {

    const [ backendFriends, setBackendFriends ] = useState([]);
    const [ pendingRequests, setPendingRequests ] = useState([]);
    const [ sentRequests, setSentRequests ] = useState([]);
    const { userdata } = useContext(AuthContext);

    async function fetchFriends() {
        try {
            const target = userId || userdata?.id;
            if (!target) return;
            const response = await axios.post('http://localhost:3000/fetchfriends', { userId: target })
            setBackendFriends(response.data);
        } catch (error) {
            console.error('Error fetching Post Data:',error);
        }
    }

    async function fetchPendingRequests() {
        try {
            const response = await axios.post('http://localhost:3000/fetchfriendrequests', {userId: userId})
            setPendingRequests(response.data);
            console.log('Pending Requests fetched:', response.data);
        } catch (error) {
            console.error('Error fetching Pending Requests:', error);
        }
    }

    async function fetchSentRequests() {
        try {
            const response = await axios.post('http://localhost:3000/fetchsentrequests', {userId: userId})
            setSentRequests(response.data);
            console.log('Sent Requests fetched:', response.data);
        } catch (error) {
            console.error('Error fetching Pending Requests:', error);
        }
    }

    useEffect(() => {
        fetchFriends();
        fetchPendingRequests();
        fetchSentRequests();
    }, [userId, userdata?.id]);

    return (
        <div className='itemList'>
        {sentRequests.length > 0 && String(userId || userdata?.id) === String(userdata?.id) && (
                    <>
                    <h2 style={{alignSelf: 'flex-start'}}>Sent Requests</h2>
                    {sentRequests.map((friend) => (
                        <FriendCard key={friend.friend_id} friendId={friend.friend_id} />
                    ))}
                    </>
                )}
        {pendingRequests.length > 0 && String(userId || userdata?.id) === String(userdata?.id) && (
                    <>
                    <h2 style={{alignSelf: 'flex-start'}}>Incoming Requests</h2>
                    {pendingRequests.map((friend) => (
                        <FriendCard key={friend.user_id} friendId={friend.user_id} />
                    ))}
                    </>
                )}
        <h2 style={{alignSelf: 'flex-start'}}>Friends</h2>
            {backendFriends.length > 0 ? (
                backendFriends.map((friend) => (
                    <FriendCard key={friend.friend_id} friendId={friend.friend_id} />
                ))
            ) : (
                <p style={{ color: '#888888', fontSize: '14px', marginTop: '15px' }}>
                No friends :/
                </p>
            )}
        </div>
    );

}