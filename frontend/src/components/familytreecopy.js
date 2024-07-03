import React, { useRef, useEffect, useState } from "react";
import { select } from "d3-selection";
import { hierarchy, tree } from "d3-hierarchy";
import { zoom, transition, linkHorizontal } from "d3";
import axios from "axios";
import "./FamilyTree.css";
import Form from "./Form";

const FamilyTree = () => {
  const [data, setData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const svgRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/family-tree");
        //console.log(response);
        const records = response.data;
        console.log("data", response.data);
        console.log(
          "Type of records:",
          typeof records,
          Array.isArray(records) ? " - Array" : " - Not an array"
        );
        const transformedData = transformData(records);
        setData(transformedData);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddPerson = async (newPerson) => {
    try {
      const response = await axios.post("/api/add-person", newPerson);
      const updatedData = transformData(response.data);
      setData(updatedData);
      setShowForm(false); // Close the form after successful submission
    } catch (error) {
      console.error("Error adding person:", error);
    }
  };

  const transformData = (records) => {
    const nodes = new Map(); // Temporary storage for easy access to nodes by ID
    console.log("Records before forEach:", records);
    console.log("Is records an array here?:", Array.isArray(records));
    // First pass: create node entries
    records?.forEach((record) => {
      const { person } = record;
      if (!person) {
        console.error("Invalid person data", record);
        return; // Skip this record or handle it as per your error policy
      }
      if (!nodes.has(person.id)) {
        nodes.set(person.id, {
          ...person,
          children: [],
          spouses: [], // You can decide to visualize spouses as edges or as nodes
        });
      }
    });
    // Second pass: link children and spouses
    records?.forEach((record) => {
      const { person, children, spouses } = record;
      if (!person) {
        console.error("Invalid person data", record);
        return; // Skip this record or handle it as per your error policy
      }
      const currentNode = nodes.get(person?.id);

      children?.forEach((child) => {
        const childNode = nodes.get(child?.id);
        currentNode.children?.push(childNode);
      });

      // Optional: Handle spouses if you wish to visualize them as links or additional nodes
      spouses?.forEach((spouse) => {
        const spouseNode = nodes.get(spouse?.id);
        currentNode.spouses?.push(spouseNode); // Or handle differently
      });
    });
    // Identify root node (you can modify this logic to find the root dynamically)
    const rootId = 4; // For example, root node ID is known
    const rootNode = nodes.get(rootId);

    return { node: rootNode, nodes: Array.from(nodes.values()) };
  };

  useEffect(() => {
    if (!data) return;

    const rootNode = transformData(data); // Assume data is already structured correctly

    if (!rootNode) {
      console.error("No root node available to draw the family tree.");
      return;
    }

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1000;
    const height = 800;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const treeLayout = tree().size([
      width - margin.left - margin.right,
      height - margin.top - margin.bottom,
    ]);

    const root = hierarchy(rootNode, (d) => d.children);

    treeLayout(root);

    // Nodes
    const nodes = g
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    nodes.append("circle").attr("r", 10).style("fill", "#555");

    nodes
      .append("text")
      .attr("dy", ".35em")
      .attr("x", (d) => (d.children ? -13 : 13))
      .style("text-anchor", (d) => (d.children ? "end" : "start"))
      .text((d) => d.data.name);

    // Links
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)
      );

    // Spouses as additional links
    g.selectAll(".spouse-link")
      .data(
        root.descendants().flatMap((d) =>
          d.data.spouses?.map((spouse) => ({
            source: d,
            target: nodes.data().find((n) => n.data.id === spouse.id),
          }))
        )
      )
      .enter()
      .append("path")
      .attr("class", "spouse-link")
      .attr(
        "d",
        linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)
      )
      .attr("stroke", "red"); // Different color for spouse links
  }, [data]);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="family-tree-container">
      <button
        className="add-person-button"
        onClick={() => setShowForm((prevShowForm) => !prevShowForm)}
      >
        {showForm ? "Close Form" : "Add New Person"}
      </button>
      {showForm && (
        <Form
          onSubmit={(newPerson) => handleAddPerson(newPerson)}
          onClose={() => setShowForm(false)}
        />
      )}
      <svg ref={svgRef} width="1000" height="1000"></svg>
    </div>
  );
};
export default FamilyTree;
