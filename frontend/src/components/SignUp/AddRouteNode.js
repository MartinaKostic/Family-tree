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
      await addRootNode(formData);
      navigate("/familytree");
    } catch (error) {
      console.error("Failed to add root node:", error);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="deathDate"
          value={formData.deathDate}
          onChange={handleChange}
        />
        <input
          type="text"
          name="job"
          value={formData.job}
          onChange={handleChange}
          placeholder="Job"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-green-400 text-white rounded hover:bg-green-600 transition duration-200 ease-in-out"
        >
          Add Root Node
        </button>
      </form>
    </div>
  );
}

export default AddRootNode;
