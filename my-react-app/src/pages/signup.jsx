import { Link } from 'react-router-dom'
import { useState } from 'react'
import '../App.css'
import axios from 'axios'

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

  const [error, setError] = useState({
    usernameError: '',
    displayNameError: '',
    emailError: '',
    passwordError: '',
    confirmPasswordError: ''
  });

  const handleFocus = (field) => {
    setIsFocused({ ...isFocused, [field]: true });
  }

  const handleBlur = (field) => {
    if (user[field] === '') {
      setIsFocused({ ...isFocused, [field]: false });
    }
  }

  const validateForm = () => {
    const nextErrors = {
      usernameError: '',
      displayNameError: '',
      emailError: '',
      passwordError: '',
      confirmPasswordError: ''
    };

    let isValid = true;

    if (user.username.trim() === '') {
      nextErrors.usernameError = 'Please enter a username';
      isValid = false;
    }

    if (user.displayName.trim() === '') {
      nextErrors.displayNameError = 'Please enter a display name';
      isValid = false;
    }

    if (user.email.trim() === '' || !/\S+@\S+\.\S+/.test(user.email)) {
      nextErrors.emailError = 'Please enter a valid email address';
      isValid = false;
    }

    if (user.password === '') {
      nextErrors.passwordError = 'Please enter a password';
      isValid = false;
    } else if (user.password.length < 6) {
      nextErrors.passwordError = 'Password must be at least 6 characters long';
      isValid = false;
    }

    if (user.confirmPassword === '') {
      nextErrors.confirmPasswordError = 'Please re-enter your password';
      isValid = false;
    } else if (user.password !== user.confirmPassword) {
      nextErrors.confirmPasswordError = 'Passwords do not match';
      isValid = false;
    }

    setError(nextErrors);
    return isValid;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form validated');
      try {
        const payload = {
          username: user.username.trim(),
          displayName: user.displayName.trim(),
          email: user.email.trim(),
          password: user.password
        };

        await axios.post('http://localhost:3000/users', payload);
      } catch (error) {
        console.error('Error during signup:', error);
      }
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
          <form noValidate onSubmit={handleSubmit}>
          <div className={`input-container ${isFocused.username ? 'active' : ''}`}>
            <input
              type="text"
              value={user.username}
              onFocus={() => handleFocus('username')}
              onBlur={() => handleBlur('username')}
              onChange={(e) => setUser({...user, username: e.target.value})}
              required
            />
            <label style = {{ color: error.usernameError ? '#b30000' : '' }}>{error.usernameError ? error.usernameError : 'Username'}</label>
          </div>
          <div className={`input-container ${isFocused.displayName ? 'active' : ''}`}>
            <label style = {{ color: error.displayNameError ? '#b30000' : '' }}>{error.displayNameError ? error.displayNameError : 'Display Name'}</label>
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
            <label style = {{ color: error.emailError ? '#b30000' : '' }}>{error.emailError ? error.emailError : 'Email'}</label>
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
            <label style = {{ color: error.passwordError ? '#b30000' : '' }}>{error.passwordError ? error.passwordError : 'Password'}</label>
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
            <label style = {{ color: error.confirmPasswordError ? '#b30000' : '' }}>{error.confirmPasswordError ? error.confirmPasswordError : 'Confirm Password'}</label>
            <input
              type="password"
              value={user.confirmPassword}
              onFocus={() => handleFocus('confirmPassword')}
              onBlur={() => handleBlur('confirmPassword')}
              onChange={(e) => setUser({...user, confirmPassword: e.target.value})}
              required
            />
          </div>
          <button type="submit">Signup</button>
          </form>
          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </>
  )
}
