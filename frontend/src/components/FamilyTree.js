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

  // useEffect(() => {
  //   if (!data) return;

  //   const { node, spouseLinks, nodes } = data;
  //   const svg = select(svgRef.current);
  //   svg.selectAll("*").remove();

  //   const width = 1000;
  //   const height = 1000;
  //   const g = svg.append("g").attr("transform", "translate(50,50)");

  //   const root = hierarchy(node, (d) => d.children);
  //   const treeLayout = tree().size([width - 100, height - 100]);
  //   treeLayout(root);

  //   // Create a map of the positions to adjust spouses
  //   const positions = new Map();
  //   root.descendants().forEach((d) => {
  //     positions.set(d.data.id, { x: d.x, y: d.y });
  //   });

  //   // Include spouses in positions map with initial placement to the left
  //   spouseLinks.forEach((link) => {
  //     if (!positions.has(link.target)) {
  //       const sourcePos = positions.get(link.source);
  //       positions.set(link.target, { x: sourcePos.x - 200, y: sourcePos.y });
  //     }
  //   });

  //   // Draw spouse links and calculate midpoints
  //   const spouseMidpoints = new Map();

  //   spouseLinks.forEach((link) => {
  //     const sourcePos = positions.get(link.source);
  //     const targetPos = positions.get(link.target);

  //     if (sourcePos && targetPos) {
  //       targetPos.y = sourcePos.y; // Align the spouse node horizontally with the source node

  //       g.append("line")
  //         .attr("x1", sourcePos.x)
  //         .attr("y1", sourcePos.y)
  //         .attr("x2", targetPos.x)
  //         .attr("y2", targetPos.y)
  //         .attr("stroke", "blue")
  //         .attr("stroke-width", 2)
  //         .attr("stroke-opacity", 0.5)
  //         .attr("stroke-dasharray", "5,5");

  //       const midpointX = (sourcePos.x + targetPos.x) / 2;
  //       spouseMidpoints.set(link.source, { x: midpointX, y: sourcePos.y + 15 });
  //       spouseMidpoints.set(link.target, { x: midpointX, y: targetPos.y + 15 });
  //     }
  //   });

  //   // Draw parent-child links
  //   g.selectAll(".link")
  //     .data(root.links())
  //     .enter()
  //     .append("path")
  //     .attr("class", "link")
  //     .attr("d", (d) => {
  //       const source = spouseMidpoints.get(d.source.data.id) || d.source;
  //       return `M${source.x},${source.y}V${
  //         source.y + (d.target.y - source.y) / 2
  //       }H${d.target.x}V${d.target.y}`;
  //     })
  //     .attr("fill", "none")
  //     .attr("stroke", "#ccc")
  //     .attr("stroke-width", 2);

  //   // Draw nodes
  //   const allNodes = root.descendants().concat(
  //     spouseLinks.map((link) => ({
  //       id: link.target,
  //       x: positions.get(link.target).x,
  //       y: positions.get(link.target).y,
  //       data: nodes.find((n) => n.id === link.target),
  //     }))
  //   );
  //   const nodeSelection = g
  //     .selectAll(".node")
  //     .data(allNodes)
  //     .enter()
  //     .append("g")
  //     .attr("class", "node")
  //     .attr("transform", (d) => `translate(${d.x},${d.y})`);

  //   nodeSelection
  //     .append("rect")
  //     .attr("width", 100)
  //     .attr("height", 30)
  //     .attr("fill", "lightblue");

  //   nodeSelection
  //     .append("text")
  //     .attr("dx", 50)
  //     .attr("dy", 20)
  //     .attr("text-anchor", "middle")
  //     .text((d) => d.data.name);
  // }, [data]);

  // useEffect(() => {
  //   if (!data) return;

  //   const { node, spouseLinks, nodes } = data;
  //   const svg = select(svgRef.current);
  //   svg.selectAll("*").remove();

  //   const width = 1000;
  //   const height = 1000;
  //   const g = svg.append("g").attr("transform", "translate(50,50)");

  //   const root = hierarchy(node, (d) => d.children);
  //   const treeLayout = tree().size([width - 100, height - 100]);
  //   treeLayout(root);

  //   // Create a map of the positions to adjust spouses
  //   const positions = new Map();
  //   root.descendants().forEach((d) => {
  //     positions.set(d.data.id, { x: d.x - 70, y: d.y });
  //   });

  //   // Include spouses in positions map with initial placement to the left
  //   spouseLinks.forEach((link) => {
  //     if (!positions.has(link.target)) {
  //       const sourcePos = positions.get(link.source);
  //       positions.set(link.target, { x: sourcePos.x - 300, y: sourcePos.y });
  //     }
  //   });

  //   // Draw spouse links
  //   spouseLinks.forEach((link) => {
  //     const sourcePos = positions.get(link.source);
  //     const targetPos = positions.get(link.target);

  //     if (sourcePos && targetPos) {
  //       targetPos.y = sourcePos.y; // Align the spouse node horizontally with the source node

  //       g.append("line")
  //         .attr("x1", sourcePos.x)
  //         .attr("y1", sourcePos.y + 15)
  //         .attr("x2", targetPos.x)
  //         .attr("y2", targetPos.y + 15)
  //         .attr("stroke", "blue")
  //         .attr("stroke-width", 2)
  //         .attr("stroke-opacity", 0.5);
  //     }
  //   });

  //   // Draw parent-child links
  //   g.selectAll(".link")
  //     .data(root.links())
  //     .enter()
  //     .append("path")
  //     .attr("class", "link")
  //     .attr("d", (d) => {
  //       return `M${d.source.x + 50},${d.source.y}V${
  //         d.source.y + (d.target.y - d.source.y) / 2
  //       }H${d.target.x + 50}V${d.target.y}`;
  //     })
  //     .attr("fill", "none")
  //     .attr("stroke", "#ccc")
  //     .attr("stroke-width", 2);

  //   // Draw nodes
  //   const allNodes = root.descendants().concat(
  //     spouseLinks.map((link) => ({
  //       id: link.target,
  //       x: positions.get(link.target).x,
  //       y: positions.get(link.target).y,
  //       data: nodes.find((n) => n.id === link.target),
  //     }))
  //   );
  //   const nodeSelection = g
  //     .selectAll(".node")
  //     .data(allNodes)
  //     .enter()
  //     .append("g")
  //     .attr("class", "node")
  //     .attr("transform", (d) => `translate(${d.x},${d.y})`);

  //   nodeSelection
  //     .append("rect")
  //     .attr("width", 100)
  //     .attr("height", 30)
  //     .attr("fill", "lightblue");

  //   nodeSelection
  //     .append("text")
  //     .attr("dx", 50)
  //     .attr("dy", 20)
  //     .attr("text-anchor", "middle")
  //     .text((d) => d.data.name);
  // }, [data]);

  // useEffect(() => {
  //   if (!data) return;

  //   const { node, spouseLinks, nodes } = data;
  //   const svg = select(svgRef.current);
  //   svg.selectAll("*").remove();

  //   const width = 1000;
  //   const height = 1000;
  //   const g = svg.append("g").attr("transform", "translate(50,50)");

  //   const root = hierarchy(node, (d) => d.children);
  //   const treeLayout = tree().size([width - 100, height - 100]);
  //   treeLayout(root);

  //   // Create a map of the positions to adjust spouses
  //   const positions = new Map();
  //   const siblingPositions = new Map();

  //   root.descendants().forEach((d) => {
  //     positions.set(d.data.id, { x: d.x, y: d.y });
  //     if (!siblingPositions.has(d.parent?.data.id)) {
  //       siblingPositions.set(d.parent?.data.id, []);
  //     }
  //     siblingPositions.get(d.parent?.data.id).push(d);
  //   });

  //   // Include spouses in positions map with initial placement to the right
  //   spouseLinks.forEach((link) => {
  //     const sourcePos = positions.get(link.source);
  //     if (sourcePos) {
  //       const siblings = siblingPositions.get(link.source);
  //       let spouseX = sourcePos.x + 200;

  //       // If the source has siblings, ensure the spouse doesn't overlap
  //       if (siblings) {
  //         const sibling = siblings.find((s) => s.x === sourcePos.x);
  //         if (sibling) {
  //           // If the source is in the middle of siblings, adjust the spouse position
  //           const siblingIndex = siblings.indexOf(sibling);
  //           const middleIndex = Math.floor(siblings.length / 2);
  //           if (siblingIndex < middleIndex) {
  //             spouseX = sourcePos.x + 200;
  //           } else {
  //             spouseX = sourcePos.x - 200;
  //           }
  //         }
  //       }
  //       positions.set(link.target, { x: spouseX, y: sourcePos.y });
  //     }
  //   });

  //   // Draw spouse links
  //   spouseLinks.forEach((link) => {
  //     const sourcePos = positions.get(link.source);
  //     const targetPos = positions.get(link.target);

  //     if (sourcePos && targetPos) {
  //       targetPos.y = sourcePos.y; // Align the spouse node horizontally with the source node

  //       g.append("line")
  //         .attr("x1", sourcePos.x)
  //         .attr("y1", sourcePos.y + 15)
  //         .attr("x2", targetPos.x)
  //         .attr("y2", targetPos.y + 15)
  //         .attr("stroke", "blue")
  //         .attr("stroke-width", 2)
  //         .attr("stroke-opacity", 0.5)
  //         .attr("stroke-dasharray", "5,5");
  //     }
  //   });

  //   // Draw parent-child links
  //   g.selectAll(".link")
  //     .data(root.links())
  //     .enter()
  //     .append("path")
  //     .attr("class", "link")
  //     .attr("d", (d) => {
  //       const source = d.source;
  //       return `M${source.x + 50},${source.y}V${
  //         source.y + (d.target.y - source.y) / 2
  //       }H${d.target.x + 50}V${d.target.y}`;
  //     })
  //     .attr("fill", "none")
  //     .attr("stroke", "#ccc")
  //     .attr("stroke-width", 2);

  //   // Draw nodes
  //   const allNodes = root.descendants().concat(
  //     spouseLinks.map((link) => ({
  //       id: link.target,
  //       x: positions.get(link.target).x,
  //       y: positions.get(link.target).y,
  //       data: nodes.find((n) => n.id === link.target),
  //     }))
  //   );

  //   const nodeSelection = g
  //     .selectAll(".node")
  //     .data(allNodes)
  //     .enter()
  //     .append("g")
  //     .attr("class", "node")
  //     .attr("transform", (d) => `translate(${d.x},${d.y})`);

  //   nodeSelection
  //     .append("rect")
  //     .attr("width", 100)
  //     .attr("height", 30)
  //     .attr("fill", "lightblue");

  //   nodeSelection
  //     .append("text")
  //     .attr("dx", 50)
  //     .attr("dy", 20)
  //     .attr("text-anchor", "middle")
  //     .text((d) => d.data.name);
  // }, [data]);

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

    // Create a map of the positions to adjust spouses
    const positions = new Map();
    root.descendants().forEach((d) => {
      positions.set(d.data.id, { x: d.x, y: d.y });
    });

    // Adjust the positions of spouses
    spouseLinks.forEach((link) => {
      if (!positions.has(link.target)) {
        const sourcePos = positions.get(link.source);
        // Adjust the position to the right of the source node
        positions.set(link.target, { x: sourcePos.x - 150, y: sourcePos.y });
      }
    });

    // Draw spouse links
    spouseLinks.forEach((link) => {
      const sourcePos = positions.get(link.source);
      const targetPos = positions.get(link.target);

      if (sourcePos && targetPos) {
        targetPos.y = sourcePos.y; // Align the spouse node horizontally with the source node

        g.append("line")
          .attr("x1", sourcePos.x)
          .attr("y1", sourcePos.y + 15)
          .attr("x2", targetPos.x)
          .attr("y2", targetPos.y + 15)
          .attr("stroke", "blue")
          .attr("stroke-width", 2)
          .attr("stroke-opacity", 0.5);
      }
    });

    // Draw parent-child links
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d) => {
        return `M${d.source.x + 50},${d.source.y}V${
          d.source.y + (d.target.y - d.source.y) / 2
        }H${d.target.x + 50}V${d.target.y}`;
      })
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 2);

    // Draw nodes
    const allNodes = root.descendants().concat(
      spouseLinks.map((link) => ({
        id: link.target,
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
