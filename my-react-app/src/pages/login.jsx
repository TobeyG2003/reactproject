import { Link } from 'react-router-dom'
import { useState } from 'react'
import '../App.css'

export function Login() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <>
      <section id="login"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="content">
          <h1>Login</h1>
          <p>Please enter your credentials to log in.</p>
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
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button>Login</button>

          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </section>
    </>
  )
}
