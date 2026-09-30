import '../App.css'
import axios from 'axios'
import { useEffect, useState, useContext, useRef } from 'react'
import { CgProfile } from "react-icons/cg";
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'
import { BiCommentDetail } from "react-icons/bi";
import { MdArrowDropDown } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";

export function NewForum() {

    const { userdata } = useContext(AuthContext);

    const [ tags, setTags ] = useState([]);
    const [ forum, setForum ] = useState({
        id: '',
        title: '',
        image: '',
        createdAt: '',
        ownedby: userdata.id,
        description: ''
    });

    return (
        <p>likes tab</p>
    );
}