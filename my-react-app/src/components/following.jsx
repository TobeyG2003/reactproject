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

export function Following() {

    return (
        <div className='itemList'>
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