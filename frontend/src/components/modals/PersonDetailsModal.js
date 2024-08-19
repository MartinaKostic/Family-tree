import React, { useState } from "react";

function PersonDetailsModal({ person, onClose, onSave, onDelete }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [data, setData] = useState({
    birthDate: person.birthDate || "",
    deathDate: person.deathDate || "",
    description: person.description || "",
    profession: person.profession || "",
  });
  const [file, setFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prevState) => ({
      ...prevState,
      [name]: value,
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
    console.log(data);
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }
    if (file) formData.append("imageUrl", file);
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    onSave(person.id, formData);
    setIsEditMode(false);
  };
  const handleDelete = async () => {
    try {
      await onDelete(person.id);
      alert("Person deleted successfully");
      onClose(); // Close modal after deletion
    } catch (error) {
      alert("Error deleting person");
      console.error(error);
    }
  };

  if (!person) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg relative">
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
        {isEditMode ? (
          <>
            <label className="block">
              Birthdate:
              <input
                type="date"
                name="birthDate"
                value={data.birthDate}
                onChange={handleInputChange}
                className="input input-bordered w-full max-w-xs mt-1"
              />
            </label>
            <label className="block">
              Deathdate:
              <input
                type="date"
                name="deathDate"
                value={data.deathDate}
                onChange={handleInputChange}
                className="input input-bordered w-full max-w-xs mt-1"
              />
            </label>
            <label className="block">
              Description:
              <textarea
                name="description"
                value={data.description}
                onChange={handleInputChange}
                className="textarea textarea-bordered w-full mt-1"
              />
            </label>
            <input type="file" onChange={handleFileChange} className="mb-4" />
            <label className="block">
              Profession:
              <input
                type="text"
                name="profession"
                value={data.profession}
                onChange={handleInputChange}
                className="input input-bordered w-full max-w-xs mt-1"
              />
            </label>

            <button onClick={handleSubmit} className="btn btn-primary mt-4">
              Save
            </button>
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
          </>
        )}

        <button onClick={onClose} className="btn btn-ghost mt-4">
          Close
        </button>
      </div>
    </div>
  );
}

export default PersonDetailsModal;
