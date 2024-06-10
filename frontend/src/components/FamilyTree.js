import React, { useRef, useEffect, useState } from "react";
import { select } from "d3-selection";
import { hierarchy, tree } from "d3-hierarchy";
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
        console.log(response);
        const records = response.data;
        console.log(response.data);
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
    const nodes = new Map(); // Initialize a Map to store nodes with unique IDs.
    const spouseLinks = []; // Initialize an array to store links between spouses.
    const parentSet = new Set(); // Initialize a Set to keep track of all child IDs.The set syntax binds an object property to a function to be called when there is an attempt to set that property

    records.forEach((record) => {
      const parent = record.parent;
      if (!parent) {
        console.error("Missing parent in record:", record);
        return;
      }

      const parentId = parent.id;
      if (parentId === undefined || parentId === null) {
        console.error("Missing parent ID in record:", record);
        return;
      }

      const children = record.children?.map((child) => ({
        ...child,
        id: child.id,
      }));

      const spouses = record.spouses?.map((spouse) => ({
        ...spouse,
        id: spouse.id,
      }));
      //Check and Add Parent: If the parent ID is not already in the nodes map, add it with empty children and spouses arrays.
      if (!nodes.has(parentId)) {
        nodes.set(parentId, {
          ...parent,
          id: parentId,
          children: [],
          spouses: [],
        });
      }
      //Adding Children and Spouses to Parent Node
      children.forEach((child) => {
        if (!nodes.has(child.id)) {
          nodes.set(child.id, { ...child, children: [], spouses: [] });
        }
        nodes.get(parentId).children.push(nodes.get(child.id));
        parentSet.add(child.id);
      });

      spouses.forEach((spouse) => {
        if (!nodes.has(spouse.id)) {
          nodes.set(spouse.id, { ...spouse, children: [], spouses: [] });
        }
        nodes.get(parentId).spouses.push(nodes.get(spouse.id));
        spouseLinks.push({ source: parentId, target: spouse.id });
      });
    });
    //ode san hardcodirala na paula-> tria dodat neki property za root nodea
    const rootId = 4;
    // isto je sta go tu pise ????????? to:  Determine the root node by finding a node that is not anyone's child- Array.from(nodes.keys()).find((id) => !parentSet.has(id)); ili 5 npr
    const rootNode = nodes.get(rootId);
    console.log("rootnode", rootNode);
    if (!rootNode) {
      console.error("Root node not found. Check the data.");
      return {
        node: { children: [] }, // Return a default empty structure
        spouseLinks,
        nodes: Array.from(nodes.values()),
      };
    }

    return {
      node: rootNode,
      spouseLinks,
      nodes: Array.from(nodes.values()),
    };
  };

  useEffect(() => {
    if (!data) return;

    const { node, spouseLinks, nodes } = data;
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1000;
    const height = 1000;
    const g = svg.append("g").attr("transform", "translate(50,50)");

    const root = hierarchy(node, (d) => d.children);
    const treeLayout = tree().size([width - 100, height - 100]);
    treeLayout(root);

    // Create a map of the positions
    const positions = new Map();
    root.descendants().forEach((d) => {
      positions.set(d.data.id, { x: d.x, y: d.y, data: d.data });
    });

    // Determine spouse positioning
    spouseLinks.forEach((link) => {
      const sourcePos = positions.get(link.source);
      //check if it has siblings-so i know where to position spouse
      const siblings = sourcePos ? sourcePos.data.children || [] : [];
      let offset = 200; // default offset for spouse

      // Determine if there's space to place spouse on the right
      let placeRight = true;
      siblings.forEach((sibling) => {
        if (positions.get(sibling.id).x > sourcePos.x) {
          placeRight = false; // space is occupied, place spouse on left
        }
      });

      if (!positions.has(link.target)) {
        positions.set(link.target, {
          x: sourcePos.x + (placeRight ? offset : -offset),
          y: sourcePos.y,
        });
      }
    });

    // Draw the links between parents and children, and between spouses
    //+50added so that lines start from tthe center of a rectangle
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d) => {
        return `M${positions.get(d.source.data.id).x + 50},${
          positions.get(d.source.data.id).y
        }
                V${
                  (positions.get(d.source.data.id).y +
                    positions.get(d.target.data.id).y) /
                  2
                }
                H${positions.get(d.target.data.id).x + 50}
                V${positions.get(d.target.data.id).y}`;
      })
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 2);

    // Draw spouse links
    spouseLinks.forEach((link) => {
      const sourcePos = positions.get(link.source);
      const targetPos = positions.get(link.target);
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
