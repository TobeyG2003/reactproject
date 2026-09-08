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


export function Likes({ userId }) {

    const [likes, setLikes] = useState([]);

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

    async function fetchLikes() {
        try {
            const response = await axios.post('http://localhost:3000/fetchlikes', { userId: userId })
            const rows = response.data || [];

            const detailed = await Promise.all(rows.map(async (row) => {
                if (row.post_id) {
                    const post = await fetchPostData(row.post_id);
                    return { kind: 'post', data: post, likeRow: row };
                } else if (row.comment_id) {
                    const comment = await fetchCommentData(row.comment_id);
                    return { kind: 'comment', data: comment, likeRow: row };
                }
                return null;
            }));

            const filtered = detailed.filter(item => item && item.data);
            setLikes(filtered);
            //console.log('Likes fetched and resolved:', filtered)
        } catch (error) {
            console.error('Error fetching likes:', error)
        }
    }

    useEffect(() => {
        if (userId) fetchLikes()
    }, [userId])

    return (
        <div className='itemList'>
                    {likes.length > 0 ? (
                        likes.map((item) =>
                            item.kind === 'post' ? (
                                <Forumpost
                                    key={`${item.kind}-${item.likeRow.id}`}
                                    postdata={item.data}
                                    isCard={true}
                                />
                            ) : (
                                <Comment
                                    key={`${item.kind}-${item.likeRow.id}`}
                                    commentdata={item.data}
                                    isCard={true}
                                    isReply={false}
                                />
                            )
                        )
                    ) : (
                        <p style={{ color: '#888888', fontSize: '14px', marginTop: '15px' }}>
                        No liked content
                        </p>
                    )}
                </div>
    );
}