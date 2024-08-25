import React, { useContext } from "react";
import { Link } from "react-router-dom";
import SignOut from "./SignOut/SignOut";
import { AuthContext } from "../helpers/AuthContext";

function Navbar() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <nav className="bg-gray-100 shadow-lg w-full">
      <div className="max-w mx-auto px-8">
        <div className="flex justify-between items-center py-4">
          <Link
            to="/"
            className="text-gray-700 hover:text-gray-900 text-lg font-semibold"
          >
            Family Tree App
          </Link>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/family-tree"
                  className="text-gray-700 hover:text-gray-900"
                >
                  My Family Tree
                </Link>
                <Link to="/about" className="text-gray-700 hover:text-gray-900">
                  About Us
                </Link>
                <SignOut />
              </>
            ) : (
              <Link to="/about" className="text-gray-700 hover:text-gray-900">
                About Us
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
