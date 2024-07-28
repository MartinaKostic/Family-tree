import React, { useState } from "react";
import SignIn from "./SignIn/SignIn";
import SignUp from "./SignUp/SignUp";

function Home() {
  const [isSigningIn, setIsSigningIn] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center  bg-gray-100 p-4">
      <div className="text-center space-y-4 pt-36">
        <h1 className="text-4xl font-bold">Welcome to Our Family Tree App</h1>
        <button
          onClick={() => setIsSigningIn(!isSigningIn)}
          className="px-6 py-2 bg-green-400 text-white rounded hover:bg-green-600 transition duration-200 ease-in-out"
        >
          {isSigningIn
            ? "Need an account? Sign Up"
            : "Already have an account? Sign In"}
        </button>
      </div>
      <div className="mt-8 w-full max-w-md ">
        {isSigningIn ? <SignIn /> : <SignUp />}
      </div>
    </div>
  );
}

export default Home;
