import React, { useState } from "react";

const AlertModal = ({ message, onClose, onParentModalClose }) => {
  const [alertOpen, setAlertOpen] = useState(true);

  const handleCloseModal = () => {
    setAlertOpen(false);
    onClose(); // This will set the alertInfo in the parent component
    if (onParentModalClose) {
      onParentModalClose(); // Also close the parent modal if the function is provided
    }
  };

  if (!alertOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={handleCloseModal}
    >
      <div
        className="bg-white p-5 rounded-lg relative"
        onClick={(e) => e.stopPropagation()} // Prevents the modal close when clicking inside the modal
      >
        <h4 className="text-lg font-semibold">Alert</h4>
        <p className="my-4">{message}</p>
        <button
          onClick={handleCloseModal}
          className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
