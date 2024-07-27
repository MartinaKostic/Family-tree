import React, { useEffect, useState } from "react";
import FormModal from "./modals/FormModal.js";
import PersonDetailsModal from "./modals/PersonDetailsModal.js";
import TreeVisualization from "./TreeVisualization.js";
import { fetchFamilyTree, deletePersonByName, editPerson } from "./ApiCalls.js";
import SignUp from "./SignUp/SignUp.js";

const FamilyTree = () => {
  const [personNameToDelete, setPersonNameToDelete] = useState("");
  const [modal, setModal] = useState({ show: false, type: null });
  const [data, setData] = useState(null);
  //za details modal
  const [activePerson, setActivePerson] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openForm = (type, details) => {
    setModal({ show: true, type, details });
  };

  const handleDeletePerson = async (personName) => {
    const success = await deletePersonByName(personName);
    if (success) {
      fetchData();
    } else {
      throw new Error("Failed to delete person");
    }
  };

  const fetchData = async () => {
    const records = await fetchFamilyTree();
    setData(records);
  };
  const handlePersonClick = (person) => {
    setActivePerson(person);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveModal = async (id, updates) => {
    const person = await editPerson(id, updates);
    setActivePerson(person);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);
  /* 
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
 */
  return (
    <div className="flex flex-col items-center p-5 bg-[rgb(255,239,239)]">
      <SignUp></SignUp>
      <input
        type="text"
        value={personNameToDelete}
        onChange={(e) => setPersonNameToDelete(e.target.value)}
        placeholder="Enter name to delete"
      />
      <button
        className=""
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
        onPersonClick={handlePersonClick}
      />
      {isModalOpen && (
        <PersonDetailsModal
          person={activePerson}
          onClose={handleCloseModal}
          onSave={handleSaveModal}
        />
      )}
      <FormModal
        show={modal.show}
        title={modal.type}
        onClose={() => setModal({ show: false, type: null })}
        details={modal.details}
        getNewData={fetchData}
      />
    </div>
  );
};

export default FamilyTree;
