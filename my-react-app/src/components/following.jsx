import '../App.css'
import axios from 'axios'
import { useEffect, useState, useContext, } from 'react'
import { AuthContext } from '../AuthContext'
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