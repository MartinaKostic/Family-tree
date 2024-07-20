// api.js
import axios from "axios";

export const fetchFamilyTree = async () => {
  const response = await axios.get("/api/family-tree");
  return response.data;
};

export const addPerson = async (person) => {
  const response = await axios.post("/api/add-person", person);
  return response.data;
};

export const deletePersonByName = async (name) => {
  const response = await axios.delete(`/api/delete-person-by-name/${name}`);
  return response.status === 200;
};
