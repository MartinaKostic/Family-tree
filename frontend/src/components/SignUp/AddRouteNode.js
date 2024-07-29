import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addRootNode } from "../../api/ApiCalls";

function AddRootNode() {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    deathDate: "",
    job: "",
    description: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("userId");
      const completeFormData = { ...formData, userId };
      await addRootNode(completeFormData);
      navigate("/familytree"); // Adjust the navigation target as needed
    } catch (error) {
      console.error("Failed to add root node:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="py-6 px-6 bg-white rounded-lg shadow-md w-full max-w-md"
      >
        <div className="mb-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="input input-bordered w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            required
            className="input input-bordered w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="date"
            name="deathDate"
            value={formData.deathDate}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="job"
            value={formData.job}
            onChange={handleChange}
            placeholder="Job"
            className="input input-bordered w-full"
          />
        </div>
        <div className="mb-4">
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="textarea textarea-bordered w-full"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary px-8 rounded bg-blue-500 hover:bg-blue-600 text-white"
        >
          Add Root Node
        </button>
      </form>
    </div>
  );
}

export default AddRootNode;
