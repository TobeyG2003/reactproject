import '../App.css'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { CgProfile } from "react-icons/cg";
import { FaHeart } from "react-icons/fa";

export function Comment() {
    const [comments, setComments] = useState([]);

    return (
        <div className="comment">
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
                <CgProfile style={{ color: '#ffffff', width: '30px', height: '30px' }} />
                <p style={{ color: '#ffffff', fontSize: '14px' }}>Username</p>
            </div>
            <p style={{ color: '#ffffff', fontSize: '14px' }}>This is a comment.</p>
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'row', marginLeft: 'auto' }}>
                <FaHeart style={{ color: '#ffffff', width: '30px', height: '30px', marginTop: '8px' }} />
                <p style={{ color: '#ffffff', fontSize: '14px', marginTop: '10px' }}>Likes</p>
            </div>
        </div>
    );
}