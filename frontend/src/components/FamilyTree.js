import React, { useRef, useEffect, useState } from "react";
import { useReadCypher } from "use-neo4j";
import { select } from "d3-selection";
import { hierarchy, tree } from "d3-hierarchy";
import "./FamilyTree.css";
import "./Form";

const FamilyTree = () => {
  const { loading, error, records } = useReadCypher(`
    MATCH (p:Person)-[:PARENT_OF]->(c:Person)
    OPTIONAL MATCH (p)-[:SPOUSE_OF]-(s:Person)
    RETURN p, collect(DISTINCT c) AS children, collect(DISTINCT s) AS spouses
  `);
  const svgRef = useRef();

  const [data, setData] = useState(null);

  useEffect(() => {
    if (records) {
      const nodes = new Map();
      const spouseLinks = [];

      records.forEach((record) => {
        const parent = record.get("p").properties;
        const parentId = record.get("p").identity.low;
        const children = record.get("children").map((child) => ({
          ...child.properties,
          id: child.identity.low,
        }));
        const spouses = record.get("spouses").map((spouse) => ({
          ...spouse.properties,
          id: spouse.identity.low,
        }));

        if (!nodes.has(parentId)) {
          nodes.set(parentId, {
            ...parent,
            id: parentId,
            children: [],
            spouses: [],
          });
        }

        children.forEach((child) => {
          if (!nodes.has(child.id)) {
            nodes.set(child.id, { ...child, children: [], spouses: [] });
          }
          nodes.get(parentId).children.push(nodes.get(child.id));
        });

        spouses.forEach((spouse) => {
          if (!nodes.has(spouse.id)) {
            nodes.set(spouse.id, { ...spouse, children: [], spouses: [] });
          }
          nodes.get(parentId).spouses.push(nodes.get(spouse.id));
          spouseLinks.push({ source: parentId, target: spouse.id });
        });
      });

      const rootId = 5; // Replace this with the actual root ID
      const rootNode = nodes.get(rootId);

      setData({
        node: rootNode,
        spouseLinks,
        nodes: Array.from(nodes.values()),
      });
    }
  }, [records]);

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

    // Include spouses in positions map with initial placement to the left
    spouseLinks.forEach((link) => {
      if (!positions.has(link.target)) {
        const sourcePos = positions.get(link.source);
        positions.set(link.target, { x: sourcePos.x - 100, y: sourcePos.y });
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
          .attr("y1", sourcePos.y)
          .attr("x2", targetPos.x)
          .attr("y2", targetPos.y)
          .attr("stroke", "blue")
          .attr("stroke-width", 2)
          .attr("stroke-opacity", 0.5)
          .attr("stroke-dasharray", "5,5");
      }
    });

    // Draw parent-child links
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d) => {
        return `M${d.source.x},${d.source.y + 15}V${
          d.source.y + (d.target.y - d.source.y) / 2
        }H${d.target.x}V${d.target.y - 15}`;
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
    <div>
      <svg ref={svgRef} width="1000" height="1000"></svg>
    </div>
  );
};

export default FamilyTree;
