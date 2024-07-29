import axiosInstance from "./axiosInstance";
import { transformData } from "../helpers/transformData";

const fetchRootNode = async () => {
  try {
    const response = await axiosInstance.get("/get-root-node");
    return response.data;
  } catch (error) {
    console.error("Error fetching root node:", error);
  }
};

export const fetchFamilyTree = async () => {
  const rootNode = await fetchRootNode();
  if (rootNode) {
    const response = await axiosInstance.get("/family-tree");
    const data = response.data;
    const records = transformData(data, rootNode);
    return records;
  }
};

export const addPerson = async (data) => {
  console.log("adding person");
  const response = await axiosInstance.post("/add-person", data);
  return response;
};

export const deletePersonByName = async (name) => {
  const response = await axiosInstance.delete(
    `/api/delete-person-by-name/${name}`
  );
  return response.status === 200;
};

export const editPerson = async (personId, updateData) => {
  try {
    const response = await axiosInstance.put(
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
    const response = await axiosInstance.post("/signup", userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const signIn = async (userData) => {
  try {
    const response = await axiosInstance.post("/signin", userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const addRootNode = async (rootNodeDetails) => {
  try {
    const response = await axiosInstance.post(
      "/create-root-node",
      rootNodeDetails,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data; // This will return the created root node details from the server
  } catch (error) {
    console.error(
      "Failed to add root node:",
      error.response ? error.response.data : error.message
    );
    throw error; // Re-throw to handle it in the calling component for user feedback
  }
};
