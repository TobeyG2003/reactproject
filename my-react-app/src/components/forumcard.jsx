import '../App.css'
import axios from 'axios'
import { useEffect, useState, useContext, useRef } from 'react'
import { CgProfile } from "react-icons/cg";
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import { BiCommentDetail } from "react-icons/bi";
import { MdArrowDropDown } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";

export function ForumCard(forumid) {

    const [ newCard, setNewCard ] = useState ({
        id: forumid,
        forumName: '',
        forumPicture: '',
        desc: '',
    });

    const [ tags, setTags ] = useState([])

    async function fetchForumData() {
        if (!post.forumId) return;
        try {
        const response = await axios.post('http://localhost:3000/fetchforumdata', { forumId: forumid });
        setNewCard((prevCard) => ({
          ...prevCard,
          forumName: response.data.name,
          forumPicture: response.data.forum_picture_url,
          desc: response.data.description
        }));
      } catch (error) {
        console.error('Error fetching forum data:', error);
      }
    }

    async function fetchTags() {
        try {

        } catch (error) {
            
        }
    }

    return (
        <p>likes tab</p>
    );
}