import React, { useEffect, useState } from "react";
import FormModal from "./modals/FormModal.js";
import PersonDetailsModal from "./modals/PersonDetailsModal.js";
import TreeVisualization from "./TreeVisualization.js";
import { fetchFamilyTree, deletePerson, editPerson } from "../api/ApiCalls.js";
import { useFirstSignup } from "../helpers/FirstSignupContext.js";
import FirstSignupModal from "./modals/FirstSignupModal.js";

const FamilyTree = () => {
  const [modal, setModal] = useState({ show: false, type: null });
  const [data, setData] = useState(null);
  //za details modal
  const [activePerson, setActivePerson] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const familyName = localStorage.getItem("familyName");
  const { isNewRootAdded, setIsNewRootAdded } = useFirstSignup();

  const openForm = (type, details) => {
    let modalData = { ...details };

    if (type === "child" && details) {
      // Simulate fetching spouse details for the given parent
      //nadi roditelj node (koji ima details id)
      const parentNode = details.data;
      // //spremi njegove spouse ids
      const spouseIds = parentNode ? parentNode.spouses : [];

      // Fetch spouse details
      const spouseDetails = spouseIds
        .map((spouseId) => data.nodes.find((node) => node.id === spouseId))
        .filter((spouse) => spouse !== undefined); // Ensure all found spouses are valid
      //ako je tip child onda ce details jos imat i spouses u sebix
      modalData = {
        ...details,
        spouses: spouseDetails,
      };
    }

    setModal({ show: true, type, details: modalData });
  };

  const fetchData = async () => {
    const records = await fetchFamilyTree();
    setData(records);
  };

  const handlePersonClick = (person) => {
    setActivePerson(person);
    setIsModalOpen(true);
  };
  const handleCloseWelcomeModal = () => {
    setIsNewRootAdded(false); // Reset the flag when the modal is closed
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveModal = async (id, updates) => {
    const person = await editPerson(id, updates);
    setActivePerson(person);
    fetchData();
  };

  const handleDeleteModal = async (id) => {
    const success = await deletePerson(id);
    if (success) {
      fetchData();
    } else {
      throw new Error("Failed to delete person");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  /* 
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
 */
  return (
    <div className="flex flex-col items-center p-5 bg-gray-100">
      {isNewRootAdded && <FirstSignupModal onClose={handleCloseWelcomeModal} />}
      {familyName && (
        <h1 className="text-3xl text-center text-gray-800 tracking-wide rounded-lg p-1 shadow-lg ">
          {familyName} Family Tree
        </h1>
      )}
      <div className="mt-8">
        <TreeVisualization
          data={data}
          onAddSpouse={(details) => openForm("spouse", details)}
          onAddChild={(details) => openForm("child", details)}
          onPersonClick={handlePersonClick}
          onAddParent={(details) => openForm("parent", details)}
        />
      </div>
      {isModalOpen && (
        <PersonDetailsModal
          person={activePerson}
          onClose={handleCloseModal}
          onSave={handleSaveModal}
          onDelete={handleDeleteModal}
        />
      )}
      <FormModal
        show={modal.show}
        title={modal.type}
        onClose={() => setModal({ show: false, type: null })}
        details={modal.details} // This now includes parentData when type is 'child'
        getNewData={fetchData}
      />
    </div>
  );
};

export default FamilyTree;
