import { Link, useLocation } from "react-router-dom";
import '../App.css'
import { useState } from "react";
import { AuthContext } from '../AuthContext'
import { useContext } from 'react';
import { CgProfile } from "react-icons/cg";

export function Navbar() {
  const { userdata, logoutUser } = useContext(AuthContext);

  const location = useLocation(); 
  const currentPath = location.pathname;

  return (
    <>
    <div style={{
      width: '100%',
      boxSizing: 'border-box',
      padding: '10px',
      height: '40px',
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
      <p>React Forum</p>
    </div>
      <Link to="/" className={currentPath === '/' ? "navbarLinkSelected" : "navbarLink"}
        onClick={() => setOpenPage('page1')}
      >
        Go to Page 1
      </Link>
      <Link to="/page2" className={currentPath === '/page2' ? "navbarLinkSelected" : "navbarLink"}
        onClick={() => setOpenPage('page2')}
      >
        Go to Page 2
      </Link>
      <Link to="/search" className={currentPath === '/search' ? "navbarLinkSelected" : "navbarLink"}
        onClick={() => setOpenPage('search')}
      >
        Search
      </Link>
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
      <Link className='navbarLink' onClick={logoutUser}>
        Logout
      </Link>
      {userdata ? (
        <div
          style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}
          >
          <p>welcome {userdata.display_name}</p>
          {userdata.profile_picture_url ? 
            (<img 
              src={'data:image/png;base64,'+userdata.profile_picture_url} 
              alt="Profile" 
              style={{ width: '40px', height: '40px', borderRadius: '50%' }} 
            />
            ): (
              <CgProfile
              style={{ width: '40px', height: '40px', borderRadius: '50%' }}  />
            )}
        </div>
      ) : (
        <div
        style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
          <p>no user</p>
        </div>
      )}
      </div>
    </>
  )
}