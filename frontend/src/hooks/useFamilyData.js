import { useState, useEffect } from "react";
import {
  fetchFamilyTree,
  addPerson,
  deletePersonByName,
} from "../components/ApiCalls";

const useFamilyData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const records = await fetchFamilyTree();
      setData(transformData(records)); // Assuming transformData is available
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const handleAddPerson = async (newPerson) => {
    try {
      const updatedRecords = await addPerson(newPerson);
      setData(transformData(updatedRecords));
    } catch (error) {
      setError(error);
    }
  };

  const handleDeletePerson = async (personName) => {
    try {
      const success = await deletePersonByName(personName);
      if (success) {
        fetchData();
      } else {
        throw new Error("Failed to delete person");
      }
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const transformData = (records) => {
    const nodes = new Map();
    const spouseLinks = [];

    // console.log(records);
    records.forEach((record) => {
      const { person, children, spouses } = record;
      if (!person || person.id === undefined || person.id === null) {
        console.error("Invalid person data", record);
        return; // Skip malformed records
      }

      // Every person has children and spouses arrays
      let nodeData = nodes.get(person.id) || {
        ...person,
        children: [],
        spouses: [],
      };

      // Setup children
      children.forEach((child) => {
        if (child && child.id !== undefined && child.id !== null) {
          nodes.set(
            child.id,
            nodes.get(child.id) || {
              ...child,
              children: [],
              spouses: [],
              id: child.id,
            }
          );
          nodeData.children.push(child.id); // Store child id
        }
      });

      // Setup spouses
      spouses.forEach((spouse) => {
        if (spouse && spouse.id !== undefined && spouse.id !== null) {
          nodes.set(
            spouse.id,
            nodes.get(spouse.id) || {
              ...spouse,
              children: [],
              spouses: [],
              id: spouse.id,
            }
          );
          nodeData.spouses.push(spouse.id); // Store spouse id
          spouseLinks.push({ source: person.id, target: spouse.id });
        }
      });

      nodes.set(person.id, nodeData);
    });

    // Find the root node or default to the first node
    const rootId = 4;
    return {
      root: nodes.get(rootId),
      nodes: Array.from(nodes.values()),
      spouseLinks,
    };
  };

  return {
    data,
    loading,
    error,
    handleAddPerson,
    handleDeletePerson,
    fetchData,
  };
};

export default useFamilyData;
