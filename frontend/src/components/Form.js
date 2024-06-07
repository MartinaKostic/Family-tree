import React, { useState } from "react";

const Form = ({ onSubmit, onClose }) => {
  const [newPerson, setNewPerson] = useState({
    name: "",
    parent1: "",
    parent2: "",
    siblingOf: "",
    spouseOf: "",
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
    if (newPerson.name) {
      onSubmit(newPerson);
      onClose();
    } else {
      alert("Name is required.");
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
          />
        </label>
      </div>
      <div>
        <label>
          Sibling Of:
          <input
            type="text"
            name="siblingOf"
            value={newPerson.siblingOf}
            onChange={handleFormChange}
          />
        </label>
      </div>
      <div>
        <label>
          Spouse Of:
          <input
            type="text"
            name="spouseOf"
            value={newPerson.spouseOf}
            onChange={handleFormChange}
          />
        </label>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default Form;
