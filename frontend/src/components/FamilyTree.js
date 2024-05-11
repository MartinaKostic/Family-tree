import React, { useRef, useEffect } from "react";
import { useReadCypher } from "use-neo4j";
import { select } from "d3-selection";
import { hierarchy, tree } from "d3-hierarchy";
import "./FamilyTree.css";

const FamilyTree = () => {
  const { loading, error, records } = useReadCypher(`
    MATCH (p:Person)-[:PARENT_OF]->(c:Person)
    OPTIONAL MATCH (p)-[:SPOUSE_OF]-(s:Person)    
    RETURN p.name AS parent, collect(c.name) AS children, collect(s.name) AS spouses
  `);
  const svgRef = useRef();

  const parentChildrenMap = {};
  const spouseLinks = new Set(); // To ensure unique links

  records?.forEach((record) => {
    const parent = record.get("parent");
    const children = record.get("children") || [];
    const spouses = record.get("spouses").filter((spouse) => spouse !== parent);

    if (!parentChildrenMap[parent]) {
      parentChildrenMap[parent] = { children: [], spouses: [] };
    }

    children.forEach((child) => {
      if (!parentChildrenMap[parent].children.includes(child)) {
        parentChildrenMap[parent].children.push(child);
      }
    });

    spouses.forEach((spouse) => {
      if (!parentChildrenMap[parent].spouses.includes(spouse)) {
        parentChildrenMap[parent].spouses.push(spouse);
        const sortedPair = [parent, spouse].sort();
        spouseLinks.add(sortedPair.join("-")); // Add unique pair
      }
    });
  });

  const data = Object.entries(parentChildrenMap).map(
    ([parent, { children, spouses }]) => ({
      name: parent,
      children: children.map((name) => ({ name })),
      spouses,
    })
  );

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", "translate(750,0)");

    const root = hierarchy({ children: data }, (d) => d.children);
    const treeLayout = tree()
      .size([900, 900]) // Adjust the size as needed
      .nodeSize([100, 200]); // Adjust spacing between the nodes
    const treeData = treeLayout(root);

    g.selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("rect")
      .attr("x", (d) => d.x - 50)
      .attr("y", (d) => d.y - 15)
      .attr("width", 100)
      .attr("height", 30)
      .attr("fill", "lightblue");

    g.selectAll(".label")
      .data(treeData.descendants())
      .enter()
      .append("text")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text((d) => d.data.name);

    g.selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("line")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y + 15)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y - 15)
      .attr("stroke", "black");

    // Draw spouse links
    Array.from(spouseLinks).forEach((link) => {
      const [sourceName, targetName] = link.split("-");
      const sourceNode = treeData
        .descendants()
        .find((d) => d.data.name === sourceName);
      const targetNode = treeData
        .descendants()
        .find((d) => d.data.name === targetName);
      if (sourceNode && targetNode) {
        g.append("line")
          .attr("x1", sourceNode.x)
          .attr("y1", sourceNode.y)
          .attr("x2", targetNode.x)
          .attr("y2", targetNode.y)
          .attr("stroke", "blue");
      }
    });
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <svg ref={svgRef} width="100%" height="1000"></svg>
    </div>
  );
};

export default FamilyTree;
