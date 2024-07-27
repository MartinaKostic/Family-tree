import React, { useState } from "react";

function PersonDetailsModal({ person, onClose, onSave }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    birthDate: person.birthDate || "",
    deathDate: person.deathDate || "",
    description: person.description || "",
    profession: person.profession || "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    onSave(person.id, formData);
    setIsEditMode(false);
  };

  if (!person) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-md shadow-lg relative">
        {isEditMode ? (
          <div className="absolute top-4 right-4">
            <button onClick={() => setIsEditMode(false)} className="text-sm">
              <img src="/icons/edit.png" alt="Close Edit" className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="absolute top-4 right-4">
            <button onClick={() => setIsEditMode(true)} className="text-sm">
              <img src="/icons/edit.png" alt="Edit" className="w-6 h-6" />
            </button>
          </div>
        )}

        <h2 className="text-xl font-bold mb-4">{person.name}</h2>

        {isEditMode ? (
          <>
            <label className="block">
              Birthdate:
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="input input-bordered w-full max-w-xs mt-1"
              />
            </label>
            <label className="block">
              Deathdate:
              <input
                type="date"
                name="deathDate"
                value={formData.deathDate}
                onChange={handleInputChange}
                className="input input-bordered w-full max-w-xs mt-1"
              />
            </label>
            <label className="block">
              Description:
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="textarea textarea-bordered w-full mt-1"
              />
            </label>
            <label className="block">
              Profession:
              <input
                type="text"
                name="profession"
                value={formData.profession}
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
