import { Link } from 'react-router-dom'
import { useState } from 'react'
import '../App.css'

export function Signup() {
  const [user, setUser] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isFocused, setIsFocused] = useState({
    username: false,
    displayName: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  }

  const handleBlur = (field) => {
    if (user[field] === '') {
      setIsFocused({ ...isFocused, [field]: false });
    }
  }

  return (
    <>
      <section id="signup"
      style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <div className="content">
          <h1>Signup</h1>
          <p>Please fill out the form to create an account.</p>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '50%',
            gap: '16px',
            padding: '40px',
            borderRadius: '25px',
            backgroundColor: '#3d3d3d',
            borderColor: '#005bd3',
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: '0 0 5px #005bd3, 0 0 15px #005bd3, 0 0 30px #005bd3'
          }}
        >
          <div className={`input-container ${isFocused.username ? 'active' : ''}`}>
            <input
              type="text"
              value={user.username}
              onFocus={() => handleFocus('username')}
              onBlur={() => handleBlur('username')}
              onChange={(e) => setUser({...user, username: e.target.value})}
              required
            />
            <label>Username</label>
          </div>
          <div className={`input-container ${isFocused.displayName ? 'active' : ''}`}>
            <label>Display Name</label>
            <input
              type="text"
              value={user.displayName}
              onFocus={() => handleFocus('displayName')}
              onBlur={() => handleBlur('displayName')}
              onChange={(e) => setUser({...user, displayName: e.target.value})}
              required
            />
          </div>
          <div className={`input-container ${isFocused.email ? 'active' : ''}`}>
            <label>Email</label>
            <input
              type="email"
              value={user.email}
              onFocus={() => handleFocus('email')}
              onBlur={() => handleBlur('email')}
              onChange={(e) => setUser({...user, email: e.target.value})}
              required
            />
          </div>
          <div className={`input-container ${isFocused.password ? 'active' : ''}`}>
            <label>Password</label>
            <input
              type="password"
              value={user.password}
              onFocus={() => handleFocus('password')}
              onBlur={() => handleBlur('password')}
              onChange={(e) => setUser({...user, password: e.target.value})}
              required
            />
          </div>
          <div className={`input-container ${isFocused.confirmPassword ? 'active' : ''}`}>
            <label>Confirm Password</label>
            <input
              type="password"
              value={user.confirmPassword}
              onFocus={() => handleFocus('confirmPassword')}
              onBlur={() => handleBlur('confirmPassword')}
              onChange={(e) => setUser({...user, confirmPassword: e.target.value})}
              required
            />
          </div>
          <button>Signup</button>
          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </>
  )
}
