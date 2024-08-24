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
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    const updatedData = { ...data, userId };
    let formData = new FormData();
    Object.keys(updatedData).forEach((key) =>
      formData.append(key, updatedData[key])
    );
    formData.append("file", file);

    try {
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
        className="py-6 px-6 bg-white rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Add Root Node</h2>
          <p className="text-sm text-gray-700 mx-10">
            The root node represents the oldest ancestor in your family tree.
            You can always add parents to this node later, expanding the tree
            upwards.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name:
          </label>
          <input
            type="text"
            name="name"
            value={data.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Add a photo:
          </label>
          <input
            type="file"
            name="file"
            onChange={handleFileChange}
            className="mt-1 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Birth date:
          </label>
          <input
            type="date"
            name="birthDate"
            value={data.birthDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Death date:
          </label>
          <input
            type="date"
            name="deathDate"
            value={data.deathDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Profession:
          </label>
          <input
            type="text"
            name="profession"
            value={data.profession}
            onChange={handleChange}
            placeholder="Profession"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description:
          </label>
          <textarea
            name="description"
            value={data.description}
            onChange={handleChange}
            placeholder="Description"
            className="textarea textarea-bordered w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            rows="4"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="py-1 px-2 btn btn-primary bg-blue-400 hover:bg-blue-600 text-white rounded-lg shadow-md"
          >
            Add Root Node
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddRootNode;
