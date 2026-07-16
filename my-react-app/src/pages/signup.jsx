import { Link } from 'react-router-dom'
import { useState } from 'react'
import '../App.css'

export function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button>Signup</button>
          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </>
  )
}
