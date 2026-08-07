import { Link, useNavigate } from 'react-router-dom'
import { useState, useContext  } from 'react'
import '../App.css'
import axios from 'axios'
import { AuthContext } from '../AuthContext'

export function Login() {

  const { loginUser } = useContext(AuthContext);

  const navigate = useNavigate();

  const [user, setUser] = useState({
    username: '',
    password: '',
  });

  /*const [userdata, setUserdata] = useState({
    id: '',
    username: '',
    display_name: '',
    email: '',
    profile_picture_url: '',
  })*/

  const [isFocused, setIsFocused] = useState({
    username: false,
    password: false,
  });

  const [error, setError] = useState({
    usernameError: '',
    passwordError: '',

  });

  let verifiedPayload = null;

  const handleFocus = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  }

  const handleBlur = (field) => {
    if (user[field] === '') {
      setIsFocused((prev) => ({ ...prev, [field]: false }));
    }
  }

  const checkUsernameExists = async (username) => {
    try {
      const response = await axios.get(`http://localhost:3000/users?username=${username}`);
      return response.data.length === 1;
    } catch (error) {
      console.error('Error checking username: ', error);
      return false;
    }
  }

  const checkCredentials = async (username, password) => {
    try {
      const response = await axios.post(`http://localhost:3000/login`, {
        username: username,
        password: password
      });
      if (response.data) {
      verifiedPayload = {
        id: response.data.id,
        username: response.data.username,
        display_name: response.data.display_name,
        email: response.data.email,
        profile_picture_url: response.data.profile_picture_url,
        bio: response.data.bio,
      };
      return true;
    }
      return false;
    } catch (error) {
      console.error('Error checking username: ', error);
      return false;
    }
  }

  const validateForm = async () => {
    const nextErrors = {
      usernameError: '',
      passwordError: '',
    };

    let isValid = true;
    const trimmedUsername = user.username.trim();

    if (trimmedUsername === '') {
      nextErrors.usernameError = 'Please enter a username';
      isValid = false;
    } else {
      const doesUsernameExist = await checkUsernameExists(trimmedUsername);
      if (!doesUsernameExist) {
        nextErrors.usernameError = 'User does not exist';
        isValid = false;
      }
    }

    const validCredentials = await checkCredentials(trimmedUsername, user.password.trim());
    if (user.password === '') {
      nextErrors.passwordError = 'Please enter a password';
      isValid = false;
    } else if (!validCredentials) { //check user and pass together
      nextErrors.passwordError = 'Invalid Password';
      isValid = false;
    }

    setError(nextErrors);
    return isValid;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await validateForm()) {
      try {
        console.log("logged in")
        loginUser(verifiedPayload);
        navigate('/');
      } catch (error) {
        console.error('Error during login:', error);
      }
    }
  }

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
          <p>Please fill out the form to sign in.</p>
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
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                required
              />
              <label style={{ color: error.usernameError ? '#b30000' : '' }}>
                {error.usernameError ? error.usernameError : 'Username (Unique ID)'}
              </label>
            </div>
            <div className={`input-container ${isFocused.password ? 'active' : ''}`}>
              <label style={{ color: error.passwordError ? '#b30000' : '' }}>
                {error.passwordError ? error.passwordError : 'Password'}
              </label>
              <input
                type="password"
                value={user.password}
                onFocus={() => handleFocus('password')}
                onBlur={() => handleBlur('password')}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                required
              />
            </div>
            <button type="submit">Login</button>
          </form>
          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </>
  )
}
