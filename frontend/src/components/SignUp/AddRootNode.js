import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addRootNode } from "../../api/ApiCalls";

function AddRootNode() {
  const [data, setData] = useState({
    name: "",
    birthDate: "",
    deathDate: "",
    profession: "",
    description: "",
  });
  const [file, setFile] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e) => {
    console.log(e.target.files[0]);
    if (e.target.files[0]) {
      let selected = e.target.files[0];
      setFile(selected);
    }
  };

  const handleSubmit = async (e) => {
    const userId = localStorage.getItem("userId");
    e.preventDefault();
    try {
      const updatedData = {
        ...data,
        userId: userId,
      };
      let formData = new FormData();
      for (const key in updatedData) {
        if (updatedData.hasOwnProperty(key)) {
          formData.append(key, updatedData[key]);
        }
      }
      formData.append("file", file);
      await addRootNode(formData);
      navigate("/family-tree");
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
            value={data.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="input input-bordered w-full"
          />
        </div>
        <div className="mb-4">
          <label>
            Birth date:
            <input
              type="date"
              name="birthDate"
              value={data.birthDate}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </label>
        </div>
        <div className="mb-4">
          <label>
            Death date:
            <input
              type="date"
              name="deathDate"
              value={data.deathDate}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </label>
        </div>
        <div className="mb-4">
          <label>
            {" "}
            Profession:
            <input
              type="text"
              name="profession"
              value={data.profession}
              onChange={handleChange}
              placeholder="Profession"
              className="input input-bordered w-full"
            />
          </label>
        </div>
        <div className="mb-4">
          <label>
            Description:
            <textarea
              name="description"
              value={data.description}
              onChange={handleChange}
              placeholder="Description"
              className="textarea textarea-bordered w-full"
            />
          </label>
        </div>
        <input
          type="file"
          name="file"
          onChange={handleFileChange}
          className="mb-4"
        />
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
