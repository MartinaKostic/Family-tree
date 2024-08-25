import React, { useState } from "react";

const FirstSignupModal = ({ onClose }) => {
  const [modalOpen, setModalOpen] = useState(true);

  const handleCloseModal = () => {
    setModalOpen(false);
    onClose(); // Call the onClose prop to manage the state in the parent component
  };

  if (!modalOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={handleCloseModal}
    >
      <div
        className="bg-white p-5 rounded-lg relative w-full max-w-lg"
        onClick={(e) => e.stopPropagation()} // Prevents the modal close when clicking inside the modal
      >
        <h1 className="text-lg font-semibold">Welcome to Your Family Tree!</h1>
        <p className="my-4">
          Get started by exploring the family tree. Here’s what you can do:
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Click on a node:</strong> View and edit details or delete
            nodes.
          </li>
          <li>
            <strong>Hover over a node:</strong> Quickly see more options like
            adding spouses or children.
          </li>
          <li>
            <strong>Drag around:</strong> Explore different branches of your
            family tree.
          </li>
        </ul>
        <button
          onClick={handleCloseModal}
          className="mt-4 py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-lg"
        >
          Start Exploring!
        </button>
      </div>
    </div>
  );
};

export default FirstSignupModal;
