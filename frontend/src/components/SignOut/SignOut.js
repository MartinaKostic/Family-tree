import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../helpers/AuthContext";

function SignOut() {
  let navigate = useNavigate();
  const { setAuthStatus } = useContext(AuthContext);

  const handleSignOut = () => {
    // Clear user token and other relevant details from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("familyName");
    setAuthStatus(false);
    navigate("/");
  };

  return (
    <div className="flex justify-center items-center">
      <button
        onClick={handleSignOut}
        className="btn btn-error px-4 py-1 bg-blue-400 rounded-lg hover:bg-blue-600 transition duration-200 ease-in-out text-white"
      >
        Sign Out
      </button>
    </div>
  );
}

export default SignOut;
