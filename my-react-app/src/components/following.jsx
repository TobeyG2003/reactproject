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
import { ForumCard } from './forumcard';

export function Following( { userId } ) {

    const { userdata } = useContext(AuthContext);

    const [ followedForums, setFollowedForums ] = useState([]);

    async function fetchFollowedForums() {
        try {
            const response = await axios.post('http://localhost:3000/fetchfollowed', { userId: userId });
            const forums = (response.data || []).map((r) => ({ id: r.forum_id }));
            setFollowedForums(forums);
            // console.log('Followed forums fetched:', forums);
        } catch (error) {
            console.error('Error fetching followed forums:',error);
        }
    }

    useEffect(() => {
        fetchFollowedForums();
    }, [userId]);

    return (
        <div className='itemList'>
            {followedForums.length > 0 ? (
                followedForums.map((forum) => (
                    <ForumCard key={forum.id} forumid={forum.id} />
                ))
            ) : (
                <p style={{ color: '#888888', fontSize: '14px', marginTop: '15px' }}>
                No followed forums
                </p>
            )}
        </div>
    );

}