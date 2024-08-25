import React, { createContext, useContext, useState } from "react";

const FirstSignupContext = createContext();

export const useFirstSignup = () => useContext(FirstSignupContext);

export const FirstSignupProvider = ({ children }) => {
  const [isNewRootAdded, setIsNewRootAdded] = useState(false);

  const value = {
    isNewRootAdded,
    setIsNewRootAdded,
  };

  return (
    <FirstSignupContext.Provider value={value}>
      {children}
    </FirstSignupContext.Provider>
  );
};
