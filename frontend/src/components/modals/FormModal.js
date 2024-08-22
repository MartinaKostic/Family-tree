import React, { useEffect, useState } from "react";
import { addPerson } from "../../api/ApiCalls";

const FormModal = ({ show, onClose, title, details, getNewData }) => {
  const [newPerson, setNewPerson] = useState({
    firstname: "",
    birthdate: "",
    deathdate: "",
    description: "",
    profession: "",
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPerson((prevState) => ({
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

  const handleSubmit = async (e) => {
    const userId = localStorage.getItem("userId");
    e.preventDefault();

    try {
      const data = {
        ...newPerson,
        id: details.data.id,
        type: title,
        userId: userId,
      };

      let formData = new FormData();

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          formData.append(key, data[key]);
        }
      }

      formData.append("file", file);

      await addPerson(formData);

      console.log("aaaaaaaaaaaaaaaaaaa");

      getNewData();
      onClose();
      setNewPerson({
        firstname: "",
        birthdate: "",
        deathdate: "",
        description: "",
        profession: "",
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
            <label>
              Birth date:
              <input
                type="date"
                name="birthdate"
                onChange={handleChange}
              />{" "}
            </label>
            <label>
              Death date:
              <input type="date" name="deathdate" onChange={handleChange} />
            </label>
            <textarea
              name="description"
              onChange={handleChange}
              placeholder="Enter description here..."
              rows="4"
              cols="50"
            />
            <input
              type="text"
              name="profession"
              placeholder="profession"
              onChange={handleChange}
            />
            <input
              type="file"
              onChange={handleFileChange}
              name="pictures"
              id="file"
            />

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
