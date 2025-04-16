import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const recaptchaVerifier = useRef(null);

  useEffect(() => {
    const checkUser = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const user = null; // ← fake user, change to {} to simulate logged in
      setIsAuthenticated(true);
      // setIsAuthenticated(!!user);
      setIsLoading(false);
    };
    checkUser();
  }, []);

  const login = async (phoneNumber) => {
    try {
      // const provider = new PhoneAuthProvider(auth);
      // const id = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier.current);
      // setVerificationId(id);
      // return id;
    } catch (error) {
      console.error('Login error', error);
      throw error;
    }
  };

  const confirmCode = async (code) => {
    try {

    } catch (error) {
      console.error('Code confirmation error', error);
      throw error;
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!user) throw new Error('No user is currently logged in');

    try {
    
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const getCurrentUserData = async () => {
    if (!user) throw new Error('No user is currently logged in');
  
    try {
     
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoading, user, isAuthenticated, login, confirmCode, logout, updateUserProfile, getCurrentUserData }} // ✅ added updateUserProfile
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthContextProvider');
  }
  return value;
};
