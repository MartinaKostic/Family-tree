import React, { useRef, useEffect, useState } from "react";
import "./FamilyTree.css";
import useFamilyData from "../hooks/useFamilyData.js";
import FormModal from "./FormModal.js";
import TreeVisualization from "./TreeVisualization.js";

const FamilyTree = () => {
  const {
    data,
    loading,
    error,
    handleAddPerson,
    handleDeletePerson,
    fetchData,
  } = useFamilyData();
  const [personNameToDelete, setPersonNameToDelete] = useState("");
  const [modal, setModal] = useState({ show: false, type: null });

  const openForm = (type, details) => {
    setModal({ show: true, type, details });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="family-tree-container">
      <div
        id="tooltip"
        style={{
          position: "absolute",
          visibility: "hidden",
          background: "lightgrey",
          padding: "5px",
          borderRadius: "5px",
        }}
      >
        Tooltip Text
      </div>

      <input
        type="text"
        value={personNameToDelete}
        onChange={(e) => setPersonNameToDelete(e.target.value)}
        placeholder="Enter name to delete"
      />
      <button
        onClick={() => {
          handleDeletePerson(personNameToDelete);
          setPersonNameToDelete("");
        }}
      >
        Delete Person
      </button>
      <TreeVisualization
        data={data}
        onAddSpouse={(details) => openForm("spouse", details)}
        onAddChild={(details) => openForm("child", details)}
      />
      <FormModal
        show={modal.show}
        title={`Add ${modal.type}`}
        onClose={() => setModal({ show: false, type: null })}
        onSubmit={handleAddPerson}
        details={modal.details}
      />
    </div>
  );
};

export default FamilyTree;
