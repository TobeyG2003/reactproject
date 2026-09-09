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

    async function fetchFriends() {
        try {
            const response = await axios.post('http://localhost:3000/fetchfriends', {userId: userId})
            setBackendData(response.data);
        } catch (error) {
            console.error('Error fetching Post Data:',error);
        }
    }

    useEffect(() => {

    }, []);

    return (
        <div className='itemList'>
        <FriendCard friendId={1} />
            {backendFriends.length > 0 ? (
                backendFriends.map((friend) => (
                    hi
                ))
            ) : (
                <p style={{ color: '#888888', fontSize: '14px', marginTop: '15px' }}>
                No friends :/
                </p>
            )}
        </div>
    );

}