import React from "react";

const AlertModal = ({ message }) => {
  const [, setAlertOpen] = useState(false);

  const handleCloseModal = () => {
    setAlertOpen(false);
  };

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
          className="py-2 px-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
