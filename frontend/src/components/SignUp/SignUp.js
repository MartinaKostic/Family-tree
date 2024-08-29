import React, { useState, useContext } from "react";
import { signUp } from "../../api/ApiCalls";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../helpers/AuthContext";

function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    familyName: "",
  });
  const [error, setError] = useState("");
  const { setAuthStatus } = useContext(AuthContext);
  let navigate = useNavigate();

  // Fixed validation function
  const validatePassword = (password) => {
    return password.length >= 8 && /\d/.test(password);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validatePassword(formData.password)) {
      setError(
        "Password must be at least 8 characters long and include a number"
      );
      return;
    }
    try {
      const response = await signUp(formData);
      localStorage.setItem("token", response.token);
      localStorage.setItem("userId", response.user.id.low);
      localStorage.setItem("familyName", formData.familyName);
      setAuthStatus(true);
      navigate("/add-root-node");
    } catch (err) {
      setError(err.error || "Failed to sign up");
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="py-6 px-6 bg-white rounded-lg shadow-md w-full max-w-sm"
      >
        <div className="mb-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full name"
            required
            className="input input-bordered w-full"
          />
        </div>
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
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
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
        <div className="mb-4">
          <input
            type="text"
            name="familyName"
            value={formData.familyName}
            onChange={handleChange}
            placeholder="Family Name"
            required
            className="input input-bordered w-full"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary px-4 py-1 bg-blue-400 rounded-lg hover:bg-blue-600 transition duration-200 ease-in-out text-white"
        >
          Sign Up
        </button>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </form>
    </div>
  );
}

export default SignUp;
