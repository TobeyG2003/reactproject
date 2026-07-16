import { Link } from "react-router-dom";
import '../App.css'
import { useState } from "react";

export function Navbar() {

  const [openPage, setOpenPage] = useState('page1');

  return (
    <>
    <div style={{ 
      width: '100%',
      padding: '10px',
      height: '30px',
      display: 'flex', 
      flexDirection: 'row', 
      gap: '16px',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1b357a',
      backgroundImage: 'linear-gradient(to bottom, #1b357a 20%, #242424 140%)',
      borderBottom: '1px solid #2a334b',
    }}>
      <Link to="/" className={openPage === 'page1' ? "navbarLinkSelected" : "navbarLink"}
        onClick={() => setOpenPage('page1')}
      >
        Go to Page 1
      </Link>
      <Link to="/page2" className={openPage === 'page2' ? "navbarLinkSelected" : "navbarLink"}
        onClick={() => setOpenPage('page2')}
      >
        Go to Page 2
      </Link>
      <Link to="/search" className={openPage === 'search' ? "navbarLinkSelected" : "navbarLink"}
        onClick={() => setOpenPage('search')}
      >
        Search
      </Link>
      <Link to="/login" className={openPage === 'login' ? "navbarLinkSelected" : "navbarLink"}
        onClick={() => setOpenPage('login')}
      >
        Login
      </Link>
      <Link to="/signup" className={openPage === 'signup' ? "navbarLinkSelected" : "navbarLink"}
        onClick={() => setOpenPage('signup')}
      >
        Signup
      </Link>
      </div>
    </>
  )
}