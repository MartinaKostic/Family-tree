import React, { useState } from "react";
import { signIn } from "../ApiCalls";

function SignIn() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await signIn(formData);
      console.log("Signin success:", data);
      // Redirect or manage the user state
    } catch (err) {
      setError(err.message || "Failed to sign in");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <button type="submit">Sign In</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}

export default SignIn;
