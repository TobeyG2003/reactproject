import '../App.css'
import axios from 'axios'
import { useEffect, useState, useContext, useRef } from 'react'
import { CgProfile } from "react-icons/cg";
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../AuthContext'


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