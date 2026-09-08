import '../App.css'
import axios from 'axios'
import { useEffect, useState, useContext, useRef } from 'react'
import { CgProfile } from "react-icons/cg";
import { FaHeart } from "react-icons/fa";
import TimeAgo from 'timeago-react';
import { Forumpost } from '../components/forumpost'
import { Comment } from '../components/comment'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import { BiCommentDetail } from "react-icons/bi";
import { MdArrowDropDown } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";

export function Activity( {userId} ) {

    const [ activity, setActivity ] = useState([]);

    async function fetchPostData(postId) {
        try {
            const response = await axios.post('http://localhost:3000/fetchpostdata', { postId });
            return response.data;
        } catch (error) {
            console.error('Error fetching post data:', error);
            return null;
        }
    }

    async function fetchCommentData(commentId) {
        try {
            const response = await axios.post('http://localhost:3000/fetchcommentdata', { commentId });
            return response.data;
        } catch (error) {
            console.error('Error fetching comment data:', error);
            return null;
        }
    }

    async function fetchActivity() {
        try {
            // backend endpoint available: /fetchUserActivity
            const response = await axios.post('http://localhost:3000/fetchUserActivity', { userId });
            const rows = response.data || [];

            const detailed = await Promise.all(rows.map(async (row) => {
                if (row.item_type === 'post') {
                    const post = await fetchPostData(row.item_id);
                    return { item_type: 'post', id: row.item_id, data: post };
                } else if (row.item_type === 'comment') {
                    const comment = await fetchCommentData(row.item_id);
                    return { item_type: 'comment', id: row.item_id, data: comment };
                }
                return null;
            }));

            const filtered = detailed.filter(item => item && item.data);
            setActivity(filtered);
        } catch (error) {
            console.error("Error fetching user activity:", error);
        }
    }

    useEffect(() => {
        if (userId) fetchActivity();
    }, [userId]);

    return (
        <div className='itemList'>
                    {activity.length > 0 ? (
                        activity.map((item) =>
                            item.item_type === 'post' ? (
                                <Forumpost
                                    key={`${item.item_type}-${item.id}`}
                                    postdata={item.data}
                                    isCard={true}
                                />
                            ) : (
                                <Comment
                                    key={`${item.item_type}-${item.id}`}
                                    commentdata={item.data}
                                    isCard={true}
                                    isReply={false}
                                />
                            )
                        )
                    ) : (
                        <p style={{ color: '#888888', fontSize: '14px', marginTop: '15px' }}>
                        No Activity  
                        </p>
                    )}
                </div>
    );    
}