import { useNavigate } from 'react-router-dom'
import '../App.css'
import { useEffect, useState } from 'react'
import { AuthContext } from '../AuthContext'
import { useContext, useRef } from 'react'
import { CgProfile } from "react-icons/cg";

import axios from 'axios'

export function NewForum() {
  const navigate = useNavigate()
  const { userdata } = useContext(AuthContext)
  const fileInputRef = useRef(null)
  const dialogRef = useRef(null)
  const modSearchRequestRef = useRef(0)

    const [isOpen, setIsOpen] = useState(false)

   useEffect(() => {
    if (!dialogRef.current) return;

    if (isOpen) {
      dialogRef.current.showModal(); 
    } else {
      dialogRef.current.close();
    }
  }, [isOpen]);

  const [forum, setForum] = useState({
    id: '',
    name: '',
    description: '',
    image: '',
    tag: '',
    moderator: '',
  })

  const [ tags, setTags ] = useState([])

  const [isFocused, setIsFocused] = useState({
    name: false,
    description: false,
    tag: false,
    moderator: false,
  })

  const [moderators, setModerators] = useState([])
  const [searchResults, setSearchResults] = useState([])

  const [error, setError] = useState({
    nameError: '',
    descriptionError: '',
    moderatorError: '',
  })

  useEffect(() => {
    if (!userdata) {
      navigate('/login')
    }
  }, [userdata, navigate])

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFocus = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }))
  }

  const handleBlur = (field) => {
    if (forum[field] === '') {
      setIsFocused((prev) => ({ ...prev, [field]: false }))
    }
  }

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file)
      fileReader.onload = () => resolve(fileReader.result)
      fileReader.onerror = (error) => reject(error)
    })
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const base64 = await convertToBase64(file)
      const rawBase64 = base64.split(',')[1]
      setForum((prev) => ({ ...prev, image: rawBase64 }))
    } catch (error) {
      console.error('Error converting file:', error)
    }
  }

  const checkForumnameAvailability = async (name) => {
    try {
      const response = await axios.post('http://localhost:3000/checkforumname', { forumName: name })
      return !response.data.exists
    } catch (error) {
      console.error('Error checking forum name: ', error)
      return false
    }
  }

  const handleModSearch = async (searchTerm) => {
    const requestId = ++modSearchRequestRef.current
    const trimmedSearchTerm = searchTerm.trim()

    if (!trimmedSearchTerm) {
      setSearchResults([])
      setError((prev) => ({ ...prev, moderatorError: '' }))
      return
    }

    try {
      const response = await axios.post('http://localhost:3000/searchusers', { searchTerm: trimmedSearchTerm })
      if (requestId !== modSearchRequestRef.current) return

      setSearchResults(response.data)
      setError((prev) => ({
        ...prev,
        moderatorError: response.data.length === 0
          ? 'No users found with that username or display name.'
          : '',
      }))
    } catch (error) {
      if (requestId !== modSearchRequestRef.current) return
      setSearchResults([])
      console.error('Error searching users: ', error)
    }
  }

  /*const getModList = async (forumid) => {
    try {
      const response = await axios.post('http://localhost:3000/fetchmodlist', { forumId: forumid })
      return response.data.mods || []
    } catch (error) {
      console.error('Error fetching moderator list: ', error)
      return []
    }
  }*/

  const createForum = async () => {
    try {
      const response = await axios.post('http://localhost:3000/createforum', {
        name: forum.name.trim(),
        description: forum.description.trim(),
        owned_by: userdata.id,
        image: forum.image,
      })
      setForum((prev) => ({ ...prev, id: response.data.forumId }))
      return response.data
    } catch (error) {
      console.error('Error creating forum: ', error)
      throw error
    }
  }

  const addTags = async (forumId, tag) => {
    try {
      await axios.post('http://localhost:3000/addtagtoforum', { forumId: forumId, tagName: tag })
    } catch (error) {
      console.error('Error adding tags: ', error)
      throw error
    }
  }

  const validateForm = async () => {
    const nextErrors = {
      nameError: '',
      descriptionError: '',
    }

    let isValid = true
    const trimmedName = forum.name.trim()
    const trimmedDescription = forum.description.trim()

    if (trimmedName === '') {
      nextErrors.nameError = 'Please enter a forum name'
      isValid = false
    } else if (trimmedName.length > 40) {
      nextErrors.nameError = 'Forum name must be 40 characters or less'
      isValid = false
    } else if (!(await checkForumnameAvailability(trimmedName))) {
      nextErrors.nameError = 'Forum name is already taken'
      isValid = false
    }

    if (trimmedDescription === '') {
      nextErrors.descriptionError = 'Please enter a description'
      isValid = false
    } else if (trimmedDescription.length > 500) {
      nextErrors.descriptionError = 'Description must be 500 characters or less'
      isValid = false
    }

    setError(nextErrors)
    return isValid
  }

  const handleLowerCaseChange = (e) => {
    const lowerCaseValue = e.target.value.toLowerCase()
    setForum((prev) => ({ ...prev, name: lowerCaseValue }))
  }

  const handleLowerCaseTagChange = (e) => {
    if (e.target.value.length > 20) {
      return
    }
    const lowerCaseValue = e.target.value.toLowerCase()
    setForum((prev) => ({ ...prev, tag: lowerCaseValue }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (await validateForm()) {
      console.log('Forum ready to submit:', forum)
      const forumData = await createForum()
      for (const tag of tags) {
        await addTags(forumData.forumId, [tag])
      }
      for (const mod of moderators) {
        await axios.post('http://localhost:3000/addmoderator', { forumId: forumData.forumId, userId: mod.id, status: 'mod' })
      }
      await axios.post('http://localhost:3000/addmoderator', { forumId: forumData.forumId, userId: userdata.id, status: 'owner' })
      navigate(`/forum/${forumData.forumId}`)
    }
  }

  if (!userdata) {
    return null
  }

  return (
    <>
      <section
        id="profileSettings"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px',
          paddingBottom: '100px',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '20px',
        }}
      >
        <div
          className="content"
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
            boxShadow: '0 0 5px #005bd3, 0 0 15px #005bd3, 0 0 30px #005bd3',
          }}
        >
          <h1>Create a New Forum</h1>
          <p>Start a space for your community.</p>

          <form
            noValidate
            onSubmit={handleSubmit}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                gap: '12px',
              }}
            >
            {forum.image ? (
                <img
                    className="pfp"
                    src={'data:image/png;base64,' + forum.image}
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
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button type="button" onClick={handleButtonClick}>
                  Upload Image
                </button>
                {forum.image && (
                  <button
                    type="button"
                    onClick={() => setForum((prev) => ({ ...prev, image: '' }))}
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
            <h2 style={{ margin: 0 }}>Forum Name</h2>
            <div style = {{marginTop: '0'}} className={`input-container ${isFocused.name ? 'active' : ''}`}>
              <input
                type="text"
                value={forum.name}
                onFocus={() => handleFocus('name')}
                onBlur={() => handleBlur('name')}
                onChange={handleLowerCaseChange}
                required
              />
              <label style={{ color: error.nameError ? '#b30000' : '' }}>
                {error.nameError ? error.nameError : 'Forum Name'}
              </label>
            </div>

            <div style={{ width: '100%' }}>
              <div style={{ alignSelf: 'flex-start', marginBottom: '8px' }}>
                <h2 style={{ margin: 0 }}>Description</h2>
              </div>
              <textarea
                value={forum.description}
                onFocus={() => handleFocus('description')}
                onBlur={() => handleBlur('description')}
                onChange={(event) =>
                  setForum((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Tell people what this forum is about"
                style={{
                  width: '100%',
                  minHeight: '140px',
                  padding: '12px',
                  borderRadius: '18px',
                  border: error.descriptionError
                    ? '1px solid #b30000'
                    : isFocused.description
                      ? '1px solid #ffffff'
                      : '1px solid #ccc',
                  backgroundColor: '#202020',
                  color: '#ffffff',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: isFocused.description ? '0 0 0 2px rgba(255,255,255,0.12)' : 'none',
                }}
              />
              {error.descriptionError && (
                <div style={{ color: '#ff8a8a', marginTop: '8px' }}>{error.descriptionError}</div>
              )}
            </div>
            <h2>Tags</h2>
              {tags.length < 10 && (
            <div
                style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
                alignItems: 'center',
                width: '60%',
                marginTop: '-10px',}}>
                <div className={`input-container ${isFocused.tag ? 'active' : ''}`}>
              <input
                type="text"
                value={forum.tag}
                onFocus={() => handleFocus('tag')}
                onBlur={() => handleBlur('tag')}
                onChange={handleLowerCaseTagChange}
                required
              />
              <label>
                Enter a tag
              </label>
            </div>
                <button
                style={{ fontSize: '24px',}}
                type='button'
                onClick = {(e) => {
                  e.preventDefault()
                    if (forum.tag.trim() !== '' && !tags.includes(forum.tag.trim())) {
                      setTags((prev) => [...prev, forum.tag.trim()])
                      setForum((prev) => ({ ...prev, tag: '' }))
                    }
                }}
                >
                +
                </button>
            </div>
              )}
            <div style={{ display: 'flex', flexDirection: 'row', gap: '14px', flexWrap: 'wrap', marginTop: '-10px' }}>
              {tags.map((tag, index) => (
                <div
                    style={{display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center',}}>
                    <button style={{color: '#ff9999', fontSize: '16px', padding: '0px', margin: '0px', border: 'none', backgroundColor: 'transparent'}}
                    type='button'
                    onClick = {(e) => {
                      e.preventDefault()
                      setTags((prev) => prev.filter((_, i) => i !== index))
                    }}
                    >
                        X
                    </button>
                <div key={index} className='tag' style={{ marginRight: '5px' }}>
                  {tag}
                </div>
                </div>
              ))}
            </div>

            <h2>Moderators</h2>
            <button
                type = 'button'
                onClick = {() => setIsOpen(true)}
            >+ Add Moderator</button>
            <div style = {{display: 'flex', flexDirection: 'row', gap: '24px', flexWrap: 'wrap'}}>
            {moderators.map((mod) => (
                <div key={mod.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <button style={{color: '#ff9999', fontSize: '16px', padding: '0px', margin: '0px', border: 'none', backgroundColor: 'transparent'}}
                    type='button'
                    onClick = {(e) => {
                      e.preventDefault()
                      setModerators((prev) => prev.filter((m) => m.id !== mod.id))}}
                    >
                        X
                    </button>
                  {mod.profile_picture_url ? (
                    <img className = 'pfp' onClick={() =>navigate(`/profile/${mod.id}`)} src={'data:image/png;base64,' + mod.profile_picture_url} alt={mod.username} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  ) : (
                    <div className='pfp' onClick={() =>navigate(`/profile/${mod.id}`)} style={{ cursor: 'pointer' }}>
                      <CgProfile
                      style={{ color: '#ffffff', width: '40px', height: '40px', borderRadius: '50%' }}
                    />
                  </div>)}
                  <div>
                        <p style={{ margin: '0', fontWeight: 'bold' }}>{mod.username}</p>
                        <p style={{ margin: '0', fontSize: '14px', color: '#ccc' }}>{mod.display_name}</p>
                  </div>
                </div>
            ))}
            </div>
            <button type="submit" style={{ marginTop: '10px', width: '220px' }}>
              Create Forum
            </button>
            <dialog 
                ref={dialogRef} 
                onClose={() => setIsOpen(false)}
                style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    backgroundColor: '#3d3d3d',
                    color: '#ffffff',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    width: '33%'
                }}
            >
                <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',

                }}>
                <button 
                    style = {{ alignSelf: 'flex-end', backgroundColor: 'transparent', border: 'none', fontSize: '16px', cursor: 'pointer' }}
                    type = 'button' onClick={() => setIsOpen(false)}>
                    X
                </button>
                <h3 style = {{marginTop: '0px'}}>Enter Unique User ID</h3>
                <div className={`input-container ${isFocused.moderator ? 'active' : ''}`}>
                <input
                    type="text"
                    value={forum.moderator}
                    onFocus={() => handleFocus('moderator')}
                    onBlur={() => handleBlur('moderator')}
                    onChange={e => {
                      const searchTerm = e.target.value
                      setForum((prev) => ({ ...prev, moderator: searchTerm }))
                      handleModSearch(searchTerm)
                    }}
                    required
                />
                <label style={{ color: error.moderatorError ? '#b30000' : '' }}>
                    {error.moderatorError ? error.moderatorError : 'Moderator User ID'}
                </label>
                </div>
                <div>
                {searchResults.map((user) => (
                    <div key={user.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    {user.profile_picture_url ? (
                        <img className='pfp' onClick={() =>navigate(`/profile/${user.id}`)} src={'data:image/png;base64,' +user.profile_picture_url} alt={user.username} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    ) : (
                  <div className='pfp' onClick={() =>navigate(`/profile/${user.id}`)} style={{ cursor: 'pointer' }}>
                    <CgProfile
                      style={{ color: '#ffffff', width: '40px', height: '40px', borderRadius: '50%' }}
                    />
                  </div>)}
                    <div>
                        <p style={{ margin: '0', fontWeight: 'bold' }}>{user.username}</p>
                        <p style={{ margin: '0', fontSize: '14px', color: '#ccc' }}>{user.display_name}</p>
                    </div>
                    { user.id === userdata.id ? (
                      <button
                        style = {{ marginLeft: 'auto', '--bg-color': '#b30000', '--hover-color': '#d60000', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'not-allowed' }}
                        type='button'
                        disabled
                      >
                        You (Owner)
                      </button>
                    ) :
                    
                    moderators.some(mod => mod.id === user.id) ? (
                      <button
                        style = {{ marginLeft: 'auto', '--bg-color': '#b30000', '--hover-color': '#d60000', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                        type='button'
                        onClick={() => {
                          setModerators((prev) => [...prev.filter(mod => mod.id !== user.id)])
                        }}
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        style = {{ marginLeft: 'auto',color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                        type='button'
                      onClick={() => {
                        if (!moderators.some(mod => mod.id === user.id)) {
                          setModerators((prev) => [...prev, user])
                        }
                      
                      }}
                    
                    >+ Add</button>)}
                    </div>
                ))}
                </div>
                </div>
            </dialog>
          </form>
        </div>
      </section>
    </>
  )
}