import React, { useState } from "react";

const Form = ({ onSubmit, onClose }) => {
  const [newPerson, setNewPerson] = useState({
    name: "",
    parent1: "",
    parent2: "",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewPerson({
      ...newPerson,
      [name]: value,
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (newPerson.name && newPerson.parent1 && newPerson.parent2) {
      onSubmit(newPerson);
      onClose();
    } else {
      alert("All fields are required.");
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={newPerson.name}
            onChange={handleFormChange}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Parent 1 Name:
          <input
            type="text"
            name="parent1"
            value={newPerson.parent1}
            onChange={handleFormChange}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Parent 2 Name:
          <input
            type="text"
            name="parent2"
            value={newPerson.parent2}
            onChange={handleFormChange}
            required
          />
        </label>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default Form;
