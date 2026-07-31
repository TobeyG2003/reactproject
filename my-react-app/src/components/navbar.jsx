import { Link, useLocation, useNavigate } from "react-router-dom";
import '../App.css'
import { useState, useEffect, useRef } from "react";
import { AuthContext } from '../AuthContext'
import { useContext } from 'react';
import { CgProfile } from "react-icons/cg";
import { MdArrowDropDown } from "react-icons/md";

export function Navbar() {
  const navigate = useNavigate();
  
  const { userdata, logoutUser } = useContext(AuthContext);

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const dropdownRef = useRef(null);

  const location = useLocation(); 
  const currentPath = location.pathname;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
    <div style={{
      width: '100%',
      boxSizing: 'border-box',
      padding: '10px',
      height: '45px',
      display: 'flex', 
      flexDirection: 'row', 
      gap: '16px',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1b357a',
      backgroundImage: 'linear-gradient(to bottom, #1b357a 20%, #242424 140%)',
      borderBottom: '1px solid #2a334b',
    }}>
      <div
      style={{ marginRight: 'auto', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}
    >
      <p style={{color: '#ffffff'}}>React Forum</p>
    </div>
      <Link to="/" className={currentPath === '/' ? "navbarLinkSelected" : "navbarLink"}>
        Go to Page 1
      </Link>
      <Link to="/page2" className={currentPath === '/page2' ? "navbarLinkSelected" : "navbarLink"}>
        Go to Page 2
      </Link>
      <Link to="/search" className={currentPath === '/search' ? "navbarLinkSelected" : "navbarLink"}>
        Search
      </Link>
      {userdata ? (
        <div
          style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}
          >
            <div className="dropdown-container" ref={dropdownRef} style={{ position: "relative", display: "inline-block", height: '30px' }}>
      <MdArrowDropDown size = {30} style = {{color: isOpen? '#ffffff':''}} className="dropdown-button" onClick={toggleDropdown} />
      {isOpen && (
        <ul className="dropdown-menu" style={{ position: "absolute", listStyle: "none", margin: 0, padding: "5px 0", border: "1px solid #ccc", zIndex: 100 }}>
            <li 
              onClick={() => handleOptionClick(option)}
              style={{ padding: "8px 16px", }}
            >
              <Link to="/profilesettings" className={currentPath === '/profilesettings' ? "navbarLinkSelected" : "navbarLink"}
        onClick={() => setOpenPage('search')}
      >
        Profile Settings
      </Link>
            </li>
            <li 
              onClick={() => handleOptionClick(option)}
              style={{ padding: "8px 16px",}}
            >
              <Link className='navbarLink' onClick={logoutUser}>
        Logout
      </Link>
            </li>
        </ul>
      )}
    </div>
          <p style={{color: '#ffffff'}}>Welcome, {userdata.display_name}!</p>
          {userdata.profile_picture_url ? 
            (<img class = "pfp"
              src={'data:image/png;base64,'+userdata.profile_picture_url} 
              alt="Profile" 
              style={{ width: '35px', height: '35px', borderRadius: '50%' }} 
            />
            ): (
              <div className='pfp' onClick={() => navigate('/profile')}><CgProfile
              style={{color: '#ffffff', width: '35px', height: '35px', borderRadius: '50%' }}  />
              </div>
            )}
        </div>
      ) : (
        <div
        style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
          <Link to="/login" className={currentPath === '/login' ? "navbarLinkSelected" : "navbarLink"}
        onClick={() => setOpenPage('login')}
      >
        Login
      </Link>
      <Link to="/signup" className={currentPath === 'signup' ? "navbarLinkSelected" : "navbarLink"}
        onClick={() => setOpenPage('signup')}
      >
        Signup
      </Link>
        </div>
      )}
      </div>
    </>
  )
}