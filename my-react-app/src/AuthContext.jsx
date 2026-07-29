import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userdata, setUserdata] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      setUserdata(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = (data) => {
    localStorage.setItem('user_session', JSON.stringify(data));
    setUserdata(data);
  };

  const logoutUser = () => {
    localStorage.removeItem('user_session');
    setUserdata(null);
  };

  return (
    <AuthContext.Provider value={{ userdata, loginUser, logoutUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};