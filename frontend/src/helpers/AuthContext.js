import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user ID exists in localStorage to set initial auth state
    const userId = localStorage.getItem("userId");
    setIsAuthenticated(userId !== null);
  }, []);

  // Define a method to update auth state which can be called on login/logout
  const setAuthStatus = (authStatus) => {
    setIsAuthenticated(authStatus);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
