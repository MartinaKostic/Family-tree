import React from "react";

const FormModal = ({ show, onClose, onSubmit, title }) => {
  if (!show) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    onSubmit(formData);
    onClose(); // Close modal after submit
  };

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5 className="modal-title">{title}</h5>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Form fields go here */}
            <input type="text" name="name" required />
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormModal;
