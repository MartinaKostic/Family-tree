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
    const spouseLinks = []; // Initialize an array to store links between spouses.

    console.log("Records before forEach:", records);
    console.log("Is records an array here?:", Array.isArray(records));
    // First pass: create node entries
    records?.forEach((record) => {
      const { person } = record;
      if (!person || person.id === undefined || person.id === null) {
        console.error("Invalid or incomplete person data", record);
        return; // Skip this record or handle it as per your error policy
      }
      if (nodes.has(person.id) === false) {
        nodes.set(person.id, {
          ...person,
          children: [],
          spouses: [],
        });
      }
    });
    // Second pass: link children and spouses
    records?.forEach((record) => {
      const { person, children, spouses } = record;
      if (!person || person.id === undefined || person.id === null) {
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
        currentNode.spouses?.push(spouseNode); // ili drukcije?
        spouseLinks.push({ source: person.id, target: spouse.id });
      });
    });
    // Identify root node (you can modify this logic to find the root dynamically)
    const rootId = 4; // For example, root node ID is known
    const rootNode = nodes.get(rootId);

    return { node: rootNode, nodes: Array.from(nodes.values()), spouseLinks };
  };

  useEffect(() => {
    if (!data) return;

    const { node, spouseLinks, nodes } = data;

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

    const root = hierarchy(node, (d) => d?.children);
    treeLayout(root);

    // Create a map of the positions
    const positions = new Map();
    root.descendants().forEach((d) => {
      positions.set(d.data.id, { x: d.x, y: d.y, data: d.data });
    });

    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d) => {
        const sourcePos = positions.get(d.source.data.id);
        const targetPos = positions.get(d.target.data.id);
        if (!sourcePos || !targetPos) {
          console.error(
            "Missing position data for node",
            d.source.data.id,
            d.target.data.id
          );
          return "";
        }
        return `M${sourcePos.x + 50},${sourcePos.y}
              V${(sourcePos.y + targetPos.y) / 2}
              H${targetPos.x + 50}
              V${targetPos.y}`;
      })
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 2);

    spouseLinks.forEach((link) => {
      const sourcePos = positions.get(link.source);
      const targetPos = positions.get(link.target);

      if (!sourcePos || !targetPos) {
        console.error("Source or target position is undefined", link);
        return; // Skip drawing this line
      }

      g.append("line")
        .attr("x1", sourcePos.x)
        .attr("y1", sourcePos.y + 15)
        .attr("x2", targetPos.x)
        .attr("y2", targetPos.y + 15)
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.5);
    });

    // Draw nodes
    const allNodes = root.descendants().concat(
      spouseLinks.map((link) => ({
        ...link,
        x: positions.get(link.target).x,
        y: positions.get(link.target).y,
        data: nodes.find((n) => n.id === link.target),
      }))
    );

    const nodeSelection = g
      .selectAll(".node")
      .data(allNodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    nodeSelection
      .append("rect")
      .attr("width", 100)
      .attr("height", 30)
      .attr("fill", "lightblue");

    nodeSelection
      .append("text")
      .attr("dx", 50)
      .attr("dy", 20)
      .attr("text-anchor", "middle")
      .text((d) => d.data.name);
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
