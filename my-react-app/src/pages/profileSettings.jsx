import { Link, useNavigate } from 'react-router-dom'
import '../App.css'
import { useEffect, useState } from 'react'
import { AuthContext } from '../AuthContext'
import { useContext, useRef } from 'react';
import { CgProfile } from "react-icons/cg";
import axios from 'axios'
import { FaRegTrashCan } from "react-icons/fa6";

export function ProfileSettings() {
  const navigate = useNavigate();
  const { userdata } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const { loginUser } = useContext(AuthContext);

  let verifiedPayload = null;


  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const [ edit, setEdit ] = useState({
    username: false,
    display_name: false,
    email: false,
    profile_picture_url: false,
    bio: false,
    password: false,
    confirmPassword: false
  });

  const [ currentUser, setCurrentUser ] = useState({
    id: userdata?.id || '',
    username: userdata?.username || '',
    display_name: userdata?.display_name || '',
    email: userdata?.email || '',
    profile_picture_url: userdata?.profile_picture_url || '',
    bio: userdata?.bio || '',
    password: '',
  });

   const [ newUser, setNewUser ] = useState({
    id: currentUser?.id || userdata?.id || '',
    username: currentUser?.username || '',
    display_name: currentUser?.display_name || '',
    email: currentUser?.email || '',
    profile_picture_url: currentUser?.profile_picture_url || '',
    bio: currentUser?.bio || '',
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });

  const [isFocused, setIsFocused] = useState(() => ({
    username: !!newUser.username,
    display_name: !!newUser.display_name,
    email: !!newUser.email,
    password: false,
    confirmPassword: false,
    oldPassword: false,
  }));
  
  const [error, setError] = useState({
    usernameError: '',
    displayNameError: '',
    emailError: '',
    passwordError: '',
    confirmPasswordError: '',
    oldPasswordError: '',
  });

  const handleFocus = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  }

  const handleBlur = (field) => {
    if (newUser[field] === '') {
      setIsFocused((prev) => ({ ...prev, [field]: false }));
    }
  }

  const checkUsernameAvailability = async (username) => {
    try {
      const response = await axios.get(`http://localhost:3000/users?username=${username}`);
      return response.data.length === 0;
    } catch (error) {
      console.error('Error checking username: ', error);
      return false;
    }
  }

  const checkEmailAvailability = async (email) => {
    try {
      const response = await axios.get(`http://localhost:3000/users?email=${email}`);
      return response.data.length === 0;
    } catch (error) {
      console.error('Error checking email: ', error);
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
      console.error('Error checking credentials: ', error);
      return false;
    }
  }

  useEffect(() => {
    if (!userdata) {
      navigate('/login');
      return;
    }

    setCurrentUser((prev) => ({
      ...prev,
      id: userdata.id || prev.id,
      username: userdata.username || prev.username,
      display_name: userdata.display_name || prev.display_name,
      email: userdata.email || prev.email,
      profile_picture_url: userdata.profile_picture_url || prev.profile_picture_url,
      bio: userdata.bio || prev.bio,
    }));

    setNewUser((prev) => ({
      ...prev,
      id: userdata.id || prev.id,
      username: userdata.username || prev.username,
      display_name: userdata.display_name || prev.display_name,
      email: userdata.email || prev.email,
      profile_picture_url: userdata.profile_picture_url || prev.profile_picture_url,
      bio: userdata.bio || prev.bio,
    }));
  }, [userdata, navigate]);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await convertToBase64(file);
      setNewUser((prev) => ({ ...prev, profile_picture_url: base64 }));
      setEdit((prev) => ({ ...prev, profile_picture_url: true }));
    } catch (error) {
      console.error("Error converting file:", error);
    }
  };

  const validateForm = async () => {
    const nextErrors = {
      usernameError: '',
      displayNameError: '',
      emailError: '',
      passwordError: '',
      confirmPasswordError: '',
      oldPasswordError: ''
    };

    let isValid = true;
    const trimmedUsername = newUser.username.trim();
    const trimmedEmail = newUser.email.trim();

    if (edit.username) {
      if (trimmedUsername === '') {
        nextErrors.usernameError = 'Please enter a username';
        isValid = false;
      } else if (trimmedUsername !== currentUser.username) {
        const isUsernameAvailable = await checkUsernameAvailability(trimmedUsername);
        if (!isUsernameAvailable) {
          nextErrors.usernameError = 'Username is unavailable';
          isValid = false;
        }
      }
    }

    if (edit.display_name && newUser.display_name.trim() === '') {
      nextErrors.displayNameError = 'Please enter a display name';
      isValid = false;
    }

    if (edit.email) {
      if (trimmedEmail === '' || !/\S+@\S+\.\S+/.test(trimmedEmail)) {
        nextErrors.emailError = 'Please enter a valid email address';
        isValid = false;
      } else if (trimmedEmail !== currentUser.email) {
        const isEmailAvailable = await checkEmailAvailability(trimmedEmail);
        if (!isEmailAvailable) {
          nextErrors.emailError = 'Email is unavailable';
          isValid = false;
        }
      }
    }

    if (edit.password && newUser.password === '') {
      nextErrors.passwordError = 'Please enter a password';
      isValid = false;
    } else if (edit.password && newUser.password.length < 6) {
      nextErrors.passwordError = 'Password must be at least 6 characters long';
      isValid = false;
    }

    if (edit.password && newUser.confirmPassword === '') {
      nextErrors.confirmPasswordError = 'Please re-enter your password';
      isValid = false;
    } else if (edit.password && newUser.password !== newUser.confirmPassword) {
      nextErrors.confirmPasswordError = 'Passwords do not match';
      isValid = false;
    }

    const hasChanges = (
      newUser.profile_picture_url !== currentUser.profile_picture_url ||
      newUser.username !== currentUser.username ||
      newUser.display_name !== currentUser.display_name ||
      newUser.email !== currentUser.email ||
      newUser.bio !== currentUser.bio ||
      newUser.password !== ''
    );

    if (hasChanges) {
      const enteredCurrentPassword = newUser.currentPassword || '';
      const validCredentials = await checkCredentials(currentUser.username, enteredCurrentPassword);
      if (enteredCurrentPassword.trim() === '') {
        nextErrors.oldPasswordError = 'Please enter your current password';
        isValid = false;
      } else if (!validCredentials) {
        nextErrors.oldPasswordError = 'Invalid Password';
        isValid = false;
      }
    }

    setError(nextErrors);
    return isValid;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await validateForm()) {
      try {
        const userId = userdata?.id || currentUser?.id || newUser?.id;
        if (!userId) {
          setError((prev) => ({ ...prev, oldPasswordError: 'Please log in again.' }));
          return;
        }

        const payload = {
          id: userId,
          username: `${newUser.username || currentUser.username || ''}`.trim(),
          display_name: `${newUser.display_name || currentUser.display_name || ''}`.trim(),
          email: `${newUser.email || currentUser.email || ''}`.trim(),
          profile_picture_url: newUser.profile_picture_url || currentUser.profile_picture_url || '',
          bio: `${newUser.bio || currentUser.bio || ''}`.trim()
        };

        if (newUser.password && newUser.password.trim() !== '') {
          payload.password = newUser.password.trim();
        }
        await axios.put(`http://localhost:3000/users/${userId}`, payload);
        setEdit({
          username: false,
          display_name: false,
          email: false,
          profile_picture_url: false,
          bio: false,
          password: false,
        });
        setNewUser((prev) => ({ ...prev, currentPassword: '', password: '', confirmPassword: '' }));
        loginUser(payload);
        navigate('/profilesettings');
      } catch (error) {
        console.error('Error during profile edit:', error);
      }
    }
  }

  return (
    <>
      <section id="profileSettings"
      style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px',
          paddingBottom: '100px',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '20px'
        }}>
        <div className="content"
        style={{
            display: 'flex',
            flexDirection: 'column',
            width: '60%',
            gap: '10px',
            padding: '40px',
            borderRadius: '25px',
            backgroundColor: '#3d3d3d',
            borderColor: '#005bd3',
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: '0 0 5px #005bd3, 0 0 15px #005bd3, 0 0 30px #005bd3'
          }}>
          <h1>Profile Settings</h1>
          <p>Edit your profile details</p>
          <form noValidate onSubmit={handleSubmit}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          {newUser.profile_picture_url ? (
              <img
                className="pfp"
                src={'data:image/png;base64,' + newUser.profile_picture_url}
                alt="Profile"
                style={{ width: '200px', height: '200px', borderRadius: '50%', cursor: 'pointer' }}
                onClick = {handleButtonClick}
              />
          ) : currentUser.profile_picture_url ? (
            <img
              className="pfp"
              src={'data:image/png;base64,' + currentUser.profile_picture_url}
              alt="Profile"
              style={{ width: '200px', height: '200px', borderRadius: '50%', cursor: 'pointer' }}
                onClick = {handleButtonClick}
            />
          ) : (
            <div className='pfp' onClick={handleButtonClick} style={{ cursor: 'pointer' }}>
              <CgProfile
                style={{ color: '#ffffff', width: '200px', height: '200px', borderRadius: '50%' }}
              />
            </div>
          )}
          <input
          ref = {fileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
        <p>Click to Select a New Profile Image
          {(currentUser.profile_picture_url || newUser.profile_picture_url) && (
            <button type="button" style={{ marginLeft: '20px' }} onClick={() => {
              setNewUser((prev) => ({ ...prev, profile_picture_url: '' }));
            }}>
              Remove Profile Image
            </button>
          )}
          {edit.profile_picture_url && (
            <button type="button" style={{ marginLeft: '10px' }} onClick={() => {
              setNewUser((prev) => ({ ...prev, profile_picture_url: currentUser.profile_picture_url }));
              setEdit((prev) => ({ ...prev, profile_picture_url: false }));
            }}>
              <FaRegTrashCan size={15} />
            </button>
          )}
        </p>
        <div style = {{ alignSelf: 'flex-start',}}>
        <h2>User Bio</h2>
        </div>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
        }}>
        {!edit.bio ? (
        <>
        <p>{currentUser.bio || 'No bio available.'}</p>
        <button type="button" style={{ marginLeft: 'auto' }} onClick={() => setEdit((prev) => ({ ...prev, bio: true }))}>Edit</button>
        </> ) : (
        <>
        <textarea
          value={newUser.bio}
          onChange={(e) => setNewUser({ ...newUser, bio: e.target.value })}
          style={{ width: '100%', height: '100px' }}
        />
        <button type="button" style={{ marginLeft: 'auto', height: '50px', width: '50px', marginTop: '10px' }} onClick ={() => { setNewUser((prev) => ({ ...prev, bio: currentUser.bio })); setEdit((prev) => ({ ...prev, bio: false })) }}><FaRegTrashCan size={20} /></button>
        </>
        )}
        </div>
        <div style = {{ alignSelf: 'flex-start',}}>
        <h2>Username - @{currentUser.username}</h2>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            gap: '16px',
          }}>
          { !edit.username ? (
          <><div>Edit your user handle (must be unique)</div><button type="button" style={{ marginLeft: 'auto' }} onClick={() => setEdit((prev) => ({ ...prev, username: true }))}>Edit</button></>
          ) : (
          <><div className={`input-container ${isFocused.username ? 'active' : ''}`}>
              <input
                type="text"
                value={newUser.username}
                onFocus={() => handleFocus('username')}
                onBlur={() => handleBlur('username')}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
              />
              <label style={{ color: error.usernameError ? '#b30000' : '' }}>
                {error.usernameError ? error.usernameError : 'Username (Unique ID)'}
              </label>
            </div><button type="button" style={{ marginLeft: 'auto', height: '50px', width: '50px', marginTop: '10px' }} onClick ={() => { setIsFocused((prev) => ({ ...prev, username: true })); setNewUser((prev) => ({ ...prev, username: currentUser.username })); setEdit((prev) => ({ ...prev, username: false })) }}><FaRegTrashCan size={20} /></button></>
          )}
        </div>
        <div style = {{ alignSelf: 'flex-start',}}>
        <h2>Display Name - {currentUser.display_name}</h2>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            gap: '16px',
          }}>
          { !edit.display_name ? (
          <><div>Edit your display name</div><button type="button" style={{ marginLeft: 'auto' }} onClick={() => { setIsFocused((prev) => ({ ...prev, display_name: true })); setEdit((prev) => ({ ...prev, display_name: true })); }}>Edit</button></>
          ) : (
          <><div className={`input-container ${isFocused.display_name ? 'active' : ''}`}>
              <input
                type="text"
                value={newUser.display_name}
                onFocus={() => handleFocus('display_name')}
                onBlur={() => handleBlur('display_name')}
                onChange={(e) => setNewUser({ ...newUser, display_name: e.target.value })}
                required
              />
              <label style={{ color: error.display_nameError ? '#b30000' : '' }}>
                {error.display_nameError ? error.display_nameError : 'Display Name'}
              </label>
            </div><button type="button" style={{ marginLeft: 'auto', height: '50px', width: '50px', marginTop: '10px' }} onClick ={() => { setIsFocused((prev) => ({ ...prev, display_name: true })); setNewUser((prev) => ({ ...prev, display_name: currentUser.display_name })); setEdit((prev) => ({ ...prev, display_name: false })) }}><FaRegTrashCan size={20} /></button></>
          )}
        </div>
        <div style = {{ alignSelf: 'flex-start',}}>
        <h2>Email - {currentUser.email}</h2>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            gap: '16px',
          }}>
          { !edit.email ? (
          <><div>Edit your email (must be unique)</div><button type="button" style={{ marginLeft: 'auto' }} onClick={() => setEdit((prev) => ({ ...prev, email: true }))}>Edit</button></>
          ) : (
          <><div className={`input-container ${isFocused.email ? 'active' : ''}`}>
              <input
                type="text"
                value={newUser.email}
                onFocus={() => handleFocus('email')}
                onBlur={() => handleBlur('email')}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              <label style={{ color: error.emailError ? '#b30000' : '' }}>
                {error.emailError ? error.emailError : 'Email'}
              </label>
            </div><button type="button" style={{ marginLeft: 'auto', height: '50px', width: '50px', marginTop: '10px' }} onClick ={() => { setIsFocused((prev) => ({ ...prev, email: true })); setNewUser((prev) => ({ ...prev, email: currentUser.email })); setEdit((prev) => ({ ...prev, email: false })) }}><FaRegTrashCan size={20} /></button></>
          )}
        </div>
        <div style = {{ alignSelf: 'flex-start',}}>
        <h2>Change Password</h2>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            gap: '16px',
          }}>
          { !edit.password ? (
          <><div>Edit your account password</div><button type="button" style={{ marginLeft: 'auto' }} onClick={() => setEdit((prev) => ({ ...prev, password: true }))}>Edit</button></>
          ) : (
          <><div className={`input-container ${isFocused.password ? 'active' : ''}`}>
              <input
                type="password"
                value={newUser.password}
                onFocus={() => handleFocus('password')}
                onBlur={() => handleBlur('password')}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
              <label style={{ color: error.passwordError ? '#b30000' : '' }}>
                {error.passwordError ? error.passwordError : 'New Password'}
              </label>
            </div>
            <div className={`input-container ${isFocused.confirmPassword ? 'active' : ''}`}>
              <input
                type="password"
                value={newUser.confirmPassword}
                onFocus={() => handleFocus('confirmPassword')}
                onBlur={() => handleBlur('confirmPassword')}
                onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                required
              />
              <label style={{ color: error.confirmPasswordError ? '#b30000' : '' }}>
                {error.confirmPasswordError ? error.confirmPasswordError : 'Confirm Password'}
              </label>
            </div><button type="button" style={{ marginLeft: 'auto', height: '50px', width: '50px', marginTop: '10px' }} onClick ={() => { setIsFocused((prev) => ({ ...prev, password: false })); setIsFocused((prev) => ({ ...prev, confirmPassword: '' })); setNewUser((prev) => ({ ...prev, password: '' })); setNewUser((prev) => ({ ...prev, confirmPassword: '' })); setEdit((prev) => ({ ...prev, password: false })) }}><FaRegTrashCan size={20} /></button></>
          )}
        </div>
        { (
          newUser.profile_picture_url !== currentUser.profile_picture_url ||
          newUser.username !== currentUser.username ||
          newUser.display_name !== currentUser.display_name ||
          newUser.email !== currentUser.email ||
          newUser.bio !== currentUser.bio ||
          newUser.password !== ''
        ) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            width: '80%',
          }}>
            <div className={`input-container ${isFocused.oldPassword ? 'active' : ''}`}>
              <input
                type="password"
                value={newUser.currentPassword}
                onFocus={() => handleFocus('oldPassword')}
                onBlur={() => handleBlur('oldPassword')}
                onChange={(e) => setNewUser((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
              <label style={{ color: error.oldPasswordError ? '#b30000' : '' }}>
                {error.oldPasswordError ? error.oldPasswordError : 'Current Password'}
              </label>
            </div>
        <button type="submit" style={{ marginTop: '15px', height: '40px', width: '200px' }}>Apply Changes</button>
        </div> )}
      </form>
        </div>
      </section>
    </>
  )
}