import React from "react";
import { useReadCypher } from "use-neo4j";
import "./FamilyTree.css";
import { useRef, useEffect } from "react";
import { select } from "d3";
import { hierarchy, tree } from "d3-hierarchy";

const FamilyTree = () => {
  const { loading, error, records } = useReadCypher(`
    MATCH (p:Person)-[:PARENT_OF]->(c:Person)
    RETURN p.name AS parent, collect(c.name) AS children
  `);
  const svgRef = useRef();

  // Initialize an object to store parents and their children
  const parentChildrenMap = {};
  // Loop through each record
  records?.forEach((record) => {
    const parent = record.get("parent");
    const children = record.get("children");

    // If the parent is not already in the map, add it
    //empty array to later add children
    if (!parentChildrenMap[parent]) {
      parentChildrenMap[parent] = [];
    }

    // Filter out children already present in the map
    const newChildren = children.filter(
      (child) => !parentChildrenMap[parent].includes(child)
    );

    // Add the new children to the parent's children list
    parentChildrenMap[parent].push(...newChildren);
  });

  const data = Object.entries(parentChildrenMap).map(([parent, children]) => {
    return {
      name: parent,
      children: children.map((child) => ({ name: child })),
    };
  });

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous SVG elements
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    // Create hierarchy and tree layout
    const root = hierarchy({ children: data }, (d) => d.children);
    const treeLayout = tree().size([800, 400]); // Adjust size based on your space requirements
    const treeData = treeLayout(root);

    // Calculate the center of the SVG container
    const centerX = 800 / 2; // SVG width / 2

    // Adjust the position of the root node to center the tree
    root.x = centerX;

    // Nodes (circles and text)
    svg
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 15)
      .attr("fill", "pink");

    svg
      .selectAll(".label")
      .data(treeData.descendants())
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y + 5)
      .attr("text-anchor", "middle")
      .text((d) => d.data.name);

    // Links (lines between nodes)
    svg
      .selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y)
      .attr("stroke", "black");
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // If there are no records, render a message indicating no data
  if (!records || records.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div>
      {/* Loop through parentChildrenMap to render parents and their children */}
      {/* Object.entries() is a built-in JavaScript method that returns an array of a given object's own enumerable string-keyed property [key, value] pairs. */}
      {/* {Object.entries(parentChildrenMap).map(([parent, children]) => (
        <div key={parent}>
          <h2>Parent: {parent}</h2>
          <ul>
            {children.map((child) => (
              <li key={child}>Child: {child}</li>
            ))}
          </ul>
        </div>
      ))} */}
      <svg ref={svgRef} width={1000} height={500}></svg>
    </div>
  );
};

export default FamilyTree;
