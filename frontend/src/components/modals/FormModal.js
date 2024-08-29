import React, { useState } from "react";
import { addPerson } from "../../api/ApiCalls";

const FormModal = ({ show, onClose, title, details, getNewData }) => {
  const [newPerson, setNewPerson] = useState({
    firstname: "",
    birthdate: "",
    deathdate: "",
    description: "",
    profession: "",
    otherParentName: "",
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPerson((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleSpouseChange = (e) => {
    console.log(e.target.value);
    setNewPerson((prevState) => ({
      ...prevState,
      otherParentName: e.target.value, // Store the selected spouse's names
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      let selected = e.target.files[0];
      setFile(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const parent2 =
        details.spouses.length === 1
          ? details.spouses[0].name
          : newPerson.otherParentName;
      //id je od nodea kojemu dodajemo spouse ili child!
      const data = {
        ...newPerson,
        id: details.data.id,
        type: title,
        userId: localStorage.getItem("userId"),
        parentName: details.data.name,
        parentId: details.data.id,
        otherParentName: parent2,
      };

      let formData = new FormData();

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          formData.append(key, data[key]);
        }
      }

      formData.append("file", file);

      await addPerson(formData);
      getNewData();
      onClose();
      setNewPerson({
        firstname: "",
        birthdate: "",
        deathdate: "",
        description: "",
        profession: "",
        otherParentName: "",
      });
      setFile(null);
    } catch (error) {
      console.log("ERROR", error);
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-5 rounded-lg relative overflow-y-auto max-h-80 scrollbar-rounded"
        onClick={(e) => e.stopPropagation()}
      >
        {/* title je spouse child ili parent ovisno sta se dodaje */}
        <div className="mb-4">
          <h5 className="text-lg font-medium">Add {title}</h5>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {title === "child" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Parents:
              </label>
              <p className="mt-1">{details.data.name}</p>
              {details.spouses?.length > 1 ? (
                <select
                  name="otherParentId"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  onChange={handleSpouseChange}
                >
                  <option value="">Select other parent</option>
                  {details.spouses.map((spouse, index) => (
                    <option key={index} value={spouse.name}>
                      {spouse.name}
                    </option>
                  ))}
                </select>
              ) : (
                details.spouses.length === 1 && <p>{details.spouses[0].name}</p>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name:
            </label>
            <input
              type="text"
              name="firstname"
              placeholder="Name"
              onChange={handleChange}
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
              onChange={handleFileChange}
              name="pictures"
              id="file"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Birth date:
            </label>
            <input
              type="date"
              name="birthDate"
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
              placeholder="Profession"
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description:
            </label>
            <textarea
              name="description"
              onChange={handleChange}
              placeholder="Enter description here..."
              rows="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="py-1 px-2 bg-green-400 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-75"
            >
              Close
            </button>
            <button
              type="submit"
              className="py-1 px-2 bg-blue-400 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-75"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
