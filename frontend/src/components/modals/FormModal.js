import React, { useState } from "react";
import { addPerson } from "../ApiCalls";

const FormModal = ({ show, onClose, title, details, getNewData }) => {
  const [newPerson, setNewPerson] = useState({
    firstname: "",
    birthdate: "",
  });

  const handleChange = (event) => {
    console.log(details);
    const { name, value } = event.target;
    setNewPerson((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = {
        ...newPerson,
        id: details.data.id,
        type: title,
      };
      console.log(data);
      const res = await addPerson(data);
      console.log("RESSS", res);
      getNewData();
      onClose();
      setNewPerson({ firstname: "", birthdate: "" });
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
        className="bg-white p-5 rounded-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h5 className="text-lg font-medium">Add {title}</h5>
        </div>
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <input
              type="text"
              name="firstname"
              placeholder="first name"
              onChange={handleChange}
              required
            />

            <input type="date" name="birthdate" onChange={handleChange} />
            <div>
              <button type="submit">Submit</button>
              <button type="button" onClick={onClose}>
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormModal;
