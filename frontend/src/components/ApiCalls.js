import axios from "axios";
import { transformData } from "../helpers/transformData";

const fetchRootNode = async () => {
  try {
    const response = await axios.get("/api/get-root-node");
    return response.data;
  } catch (error) {
    console.error("Error fetching root node:", error);
  }
};

export const fetchFamilyTree = async () => {
  const rootNode = await fetchRootNode();
  if (rootNode) {
    const response = await axios.get("/api/family-tree");
    const data = response.data;
    const records = transformData(data, rootNode);
    return records;
  }
};

export const addPerson = async (data) => {
  console.log("adding person");
  const response = await axios.post("/api/add-person", data);
  return response;
};

export const deletePersonByName = async (name) => {
  const response = await axios.delete(`/api/delete-person-by-name/${name}`);
  return response.status === 200;
};

export const editPerson = async (personId, updateData) => {
  try {
    const response = await axios.put(
      `/api/update-person/${personId}`,
      updateData
    );
    return response.data; // Assuming the response includes the updated data
  } catch (error) {
    console.error("Error updating person:", error);
    throw error; // Re-throw to handle it in the calling component
  }
};

export const signUp = async (userData) => {
  try {
    const response = await axios.post("api/signup", userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const signIn = async (userData) => {
  try {
    const response = await axios.post("api/signin", userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
