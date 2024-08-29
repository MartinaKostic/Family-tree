import React, { useState, useEffect } from "react";
import AlertModal from "./AlertModal";
import { fetchPossibleParents } from "../../api/ApiCalls";

function PersonDetailsModal({ person, onClose, onSave, onDelete }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [data, setData] = useState({
    birthDate: person.birthDate || "",
    deathDate: person.deathDate || "",
    description: person.description || "",
    profession: person.profession || "",
    otherParentName: person.otherParentName || "",
  });
  const [file, setFile] = useState(null);
  const [alertInfo, setAlertInfo] = useState({ open: false, message: "" });
  const [possibleOtherParents, setPossibleOtherParents] = useState([]);

  useEffect(() => {
    // Pre-select otherParentName if only one spouse exists
    if (!isEditMode && person.otherParentName) {
      setData((prevData) => ({
        ...prevData,
        otherParentName: person.otherParentName,
      }));
    }
    if (isEditMode && person.parentId) {
      // Fetch possible parents (spouses) only when in edit mode and parentId is available
      fetchPossibleParents(person.parentId).then((spouses) => {
        setPossibleOtherParents(spouses);
      });
      console.log(possibleOtherParents);
    }
  }, [isEditMode, person.otherParentName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSpouseChange = (e) => {
    setData((prevState) => ({
      ...prevState,
      otherParentName: e.target.value, // Update the selected spouse's name
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      let selected = e.target.files[0];
      setFile(selected);
    }
  };

  const handleSubmit = async () => {
    let formData = new FormData();

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }
    if (file) formData.append("imageUrl", file);

    onSave(person.id, formData);
    setIsEditMode(false);
  };
  const handleDelete = async () => {
    try {
      if (person.isRoot) {
        setAlertInfo({
          open: true,
          message:
            "Deleting the root of the tree is not allowed because it would remove the entire family tree.",
        });
        return;
      }
      await onDelete(person.id);
      setAlertInfo({
        open: true,
        message: "Person deleted successfully.",
      });
    } catch (error) {
      setAlertInfo({
        open: true,
        message: "Error deleting a person",
      });
    }
  };

  if (!person) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg relative">
        {/* Always render AlertModal outside of any conditional block */}
        {alertInfo.open && (
          <AlertModal
            message={alertInfo.message}
            onClose={() => setAlertInfo({ open: false, message: "" })}
            onParentModalClose={onClose}
          />
        )}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{person.name}</h2>

          {isEditMode ? (
            <div>
              <button onClick={handleDelete} className="p-2">
                <img src="/icons/delete.png" alt="Delete" className="w-6 h-6" />
              </button>
              <button onClick={() => setIsEditMode(false)} className="text-sm">
                <img
                  src="/icons/edit.png"
                  alt="Close Edit"
                  className="w-6 h-6"
                />
              </button>
            </div>
          ) : (
            <div>
              <button onClick={handleDelete} className="p-2">
                <img src="/icons/delete.png" alt="Delete" className="w-6 h-6" />
              </button>
              <button onClick={() => setIsEditMode(true)} className="text-sm">
                <img src="/icons/edit.png" alt="Edit" className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
        {/* Display parent names */}
        {!isEditMode && (
          <>
            {person.parentName && person.otherParentName ? (
              <p>
                Parents: {person.parentName} and {person.otherParentName}
              </p>
            ) : (
              person.parentName && <p>Parent: {person.parentName}</p>
            )}
          </>
        )}
        {isEditMode ? (
          <>
            {possibleOtherParents.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Choose the other parent:
                </label>
                <select
                  name="otherParentName"
                  value={data.otherParentName}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  onChange={handleSpouseChange}
                >
                  <option value={person.otherParentName}>
                    {person.otherParentName}
                  </option>
                  {possibleOtherParents.map((spouse) => (
                    <option key={spouse.id} value={spouse.name}>
                      {spouse.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <label className="block text-sm font-medium text-gray-700">
              Add a photo:
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            <label className="block text-sm font-medium text-gray-700">
              Birth date:
              <input
                type="date"
                name="birthDate"
                value={data.birthDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Death date:
              <input
                type="date"
                name="deathDate"
                value={data.deathDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Profession:
              <input
                type="text"
                name="profession"
                value={data.profession}
                placeholder="Profession"
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Description:
              <textarea
                name="description"
                value={data.description}
                onChange={handleInputChange}
                className="m-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="py-1 px-2 bg-green-400 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-75"
              >
                Close
              </button>
              <button
                onClick={handleSubmit}
                className="py-1 px-2 bg-blue-400 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-75"
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            {person.birthDate && <p>Birthdate: {person.birthDate}</p>}
            {person.deathDate && <p>Deathdate: {person.deathDate}</p>}
            {person.description && <p>Description: {person.description}</p>}
            {person.profession && <p>Profession: {person.profession}</p>}
            {person.imageUrl && (
              <img
                src={person.imageUrl}
                alt="Profile"
                className="w-20 h-20 object-cover mt-2"
              />
            )}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="py-1 px-2 bg-green-400 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-75"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PersonDetailsModal;
