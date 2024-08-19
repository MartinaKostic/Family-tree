import React from "react";
import { Link, useNavigate } from "react-router-dom";
import SignOut from "./SignOut/SignOut";

function Navbar() {
  return (
    <nav className="bg-gray-100 shadow-lg w-full">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link
            to="/"
            className="text-gray-700 hover:text-gray-900 text-lg font-semibold"
          >
            Family Tree App
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-gray-900">
              About Us
            </Link>
            <SignOut></SignOut>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
