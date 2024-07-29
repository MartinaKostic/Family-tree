import React, { useState } from "react";
import { signIn } from "../../api/ApiCalls";
import { useNavigate } from "react-router-dom";

function SignIn() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  let navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await signIn(formData);
      localStorage.setItem("token", response.token); // Store the token
      localStorage.setItem("userId", response.user.id.low);
      navigate("/familytree");
    } catch (err) {
      setError(err.message || "Failed to sign in");
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 ">
      <form
        onSubmit={handleSubmit}
        className="py-6 px-6 bg-white rounded-lg shadow-md w-full max-w-sm"
      >
        <div className="mb-4">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
            className="input input-bordered w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="input input-bordered w-full"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary px-8 bg-blue-400 rounded hover:bg-blue-600 transition duration-200 ease-in-out text-white  "
        >
          Sign In
        </button>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </form>
    </div>
  );
}

export default SignIn;
