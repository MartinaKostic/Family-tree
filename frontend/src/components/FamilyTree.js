import React, { useRef, useEffect, useState } from "react";
import { select } from "d3-selection";
import { hierarchy, tree, linkHorizontal, zoom, pointer } from "d3";
import { fetchFamilyTree, addPerson, deletePersonByName } from "./ApiCalls.js";
import "./FamilyTree.css";
import Form from "./Form";

const FamilyTree = () => {
  const [data, setData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [personNameToDelete, setPersonNameToDelete] = useState("");
  const svgRef = useRef();

  const fetchData = async () => {
    try {
      const records = await fetchFamilyTree(); // Properly await the function call
      const transformedData = transformData(records);
      setData(transformedData);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPerson = async (newPerson) => {
    try {
      const response = await addPerson(newPerson);
      const updatedData = transformData(response.data);
      setData(updatedData);
      setShowForm(false);
    } catch (error) {
      console.error("Error adding person:", error);
    }
  };
  const handleDeletePersonByName = async (personName) => {
    if (!personName) return; // Optionally prevent empty inputs

    try {
      // Send a DELETE request to your backend
      const response = await deletePersonByName(personName);
      if (response.status === 200) {
        console.log("Person deleted successfully");
        // Optionally refresh the data or update the state
        fetchData(); // Assuming fetchData is a function that fetches the updated tree
      } else {
        console.error("Failed to delete person");
      }
    } catch (error) {
      console.error(
        "Error deleting person:",
        error.response?.data?.message || error.message
      );
    }
  };

  const transformData = (records) => {
    const nodes = new Map();
    const spouseLinks = [];

    // console.log(records);
    records.forEach((record) => {
      const { person, children, spouses } = record;
      if (!person || person.id === undefined || person.id === null) {
        console.error("Invalid person data", record);
        return; // Skip malformed records
      }

      // Every person has children and spouses arrays
      let nodeData = nodes.get(person.id) || {
        ...person,
        children: [],
        spouses: [],
      };

      // Setup children
      children.forEach((child) => {
        if (child && child.id !== undefined && child.id !== null) {
          nodes.set(
            child.id,
            nodes.get(child.id) || {
              ...child,
              children: [],
              spouses: [],
              id: child.id,
            }
          );
          nodeData.children.push(child.id); // Store child id
        }
      });

      // Setup spouses
      spouses.forEach((spouse) => {
        if (spouse && spouse.id !== undefined && spouse.id !== null) {
          nodes.set(
            spouse.id,
            nodes.get(spouse.id) || {
              ...spouse,
              children: [],
              spouses: [],
              id: spouse.id,
            }
          );
          nodeData.spouses.push(spouse.id); // Store spouse id
          spouseLinks.push({ source: person.id, target: spouse.id });
        }
      });

      nodes.set(person.id, nodeData);
    });

    // Find the root node or default to the first node
    const rootId = 4;
    return {
      root: nodes.get(rootId),
      nodes: Array.from(nodes.values()),
      spouseLinks,
    };
  };

  useEffect(() => {
    if (!data || !data.root) return;

    function updateDimensions() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const svg = select(svgRef.current)
        .attr("width", width)
        .attr("height", height);

      svg.selectAll("*").remove();

      const g = svg.append("g").attr("transform", "translate(50,50)");
      const treeLayout = tree().size([width - 100, height - 100]);
      //we are making hierarchy here. So from nodes children array we take id and find the same node in the nodes (cause id is not enough)
      const root = hierarchy(data.root, (d) =>
        d.children.map((childId) =>
          data.nodes.find((node) => node.id === childId)
        )
      );

      treeLayout(root);
      // Initialize zoom behavior
      const zoomEffect = zoom()
        .scaleExtent([0.5, 3]) // Limit zoom scale
        .on("zoom", (event) => {
          g.attr("transform", event.transform); // Apply new transform to the g element
        });

      svg.call(zoomEffect); // Apply zoom behavior to the SVG element

      g.selectAll(".link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", (d) => {
          const sourceX = d.source.x + 50; // Centers the line to the middle of the node
          const sourceY = d.source.y;
          const targetX = d.target.x + 50; // Centers the line to the middle of the node
          const targetY = d.target.y;
          return `M${sourceX},${sourceY}
                  V${(sourceY + targetY) / 2}
                  H${targetX}
                  V${targetY}`;
        })
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 2);

      g.selectAll(".link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", (d) => {
          // Calculate the middle point between the source and its spouse if any
          let sourceX = d.source.x + nodes.width; // Assuming the node width is 100
          const sourceY = d.source.y;
          const targetX = d.target.x + nodes.width;
          const targetY = d.target.y;

          // If the source has a spouse, adjust the starting x coordinate
          if (d.source.data.spouses.length > 0) {
            const spouseId = d.source.data.spouses[0]; // Assuming only one spouse
            const spouse = data.nodes.find((node) => node.id === spouseId);
            if (spouse) {
              const spouseX = spouse.x + 50; // Assuming the node width is 100
              sourceX = (sourceX + spouseX) / 2; // Middle point between the two
            }
          }

          // Path from the middle point between spouses to the target
          return `M${sourceX},${sourceY}
            V${(sourceY + targetY) / 2}
            H${targetX}
            V${targetY}`;
        })
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 2);

      data.spouseLinks.forEach((link) => {
        //
        const sourceNode = root
          .descendants()
          .find((d) => d.data.id === link.source);
        const targetNode = data.nodes.find((d) => d.id === link.target); // Find from the full dataset

        if (sourceNode && targetNode) {
          // console.log(
          //   `Drawing link between: ${sourceNode.name} and ${targetNode.name}`
          // );
          const offsetX = 150;

          // console.log("target", targetNode.name);
          g.append("path")
            .attr("class", "spouse-link")
            .attr(
              "d",
              linkHorizontal()
                .x((d) => d.y + 30) // x position on the screen should map to y value of the data
                .y((d) => d.x + 15)(
                // y position on the screen should map to x value of the data
                {
                  source: { x: sourceNode.y, y: sourceNode.x }, // Move the spouse node right next to the source node
                  target: {
                    x: sourceNode.y,
                    y: sourceNode.x + offsetX,
                  },
                }
              )
            )
            .attr("stroke", "red")
            .attr("fill", "none");

          // Draw the spouse node
          g.append("rect")
            .attr("x", sourceNode.x + offsetX)
            .attr("y", sourceNode.y) // Align vertically centered
            .attr("width", 100)
            .attr("height", 30)
            .attr("rx", 10) // Adjust rx for horizontal corner radius
            .attr("ry", 10) // Adjust ry for vertical corner radius
            .style("fill", "lightpink");

          console.log(sourceNode, targetNode);

          // Add text label for the spouse
          g.append("text")
            .attr("dy", "1.3em")
            .attr("text-anchor", "middle")
            .attr("x", sourceNode.x + offsetX + 50) // Centering text within the rectangle
            .attr("y", sourceNode.y) // Slightly offset from the top of the rectangle
            .text(targetNode.name);

          g.append("image")
            .attr("xlink:href", targetNode.imageUrl) // Ensure each node data has an imageUrl
            .attr("width", 50) // Set the image size
            .attr("height", 50)
            .attr("x", sourceNode.x + offsetX + 25) // Adjust x to center the image
            .attr("y", sourceNode.y - 50); // Adjust y to place above the text
        }
      });

      const nodes = g
        .selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x},${d.y})`);
      // Append images
      nodes
        .append("image")
        .attr("xlink:href", (d) => d.data.imageUrl) // Ensure each node data has an imageUrl
        .attr("width", 50) // Set the image size
        .attr("height", 50)
        .attr("x", 25) // Adjust x to center the image
        .attr("y", -50); // Adjust y to place above the text
      nodes
        .append("rect")
        .attr("width", 100)
        .attr("height", 30)
        .attr("rx", 10) // Adjust rx for horizontal corner radius
        .attr("ry", 10) // Adjust ry for vertical corner radius
        .attr("fill", "lightblue");

      nodes
        .append("text")
        .attr("dy", "1.3em")
        .attr("x", 50)
        .attr("text-anchor", "middle")
        .text((d) => d.data.name);

      nodes.each(function (d) {
        const node = select(this);
        const nodeWidth = 100; // Assuming a standard width for simplicity
        const nodeHeight = 30; // Assuming a standard height for simplicity

        // Append a group to each node which will contain the icon and text
        const actionGroup = node
          .append("g")
          .attr("class", "action-group")
          .style("visibility", "hidden"); // Start with the group hidden

        // Add the "+" icon to the group, initially not positioned
        const addActionIcon = actionGroup
          .append("image")
          .attr("xlink:href", "/icons/add.png")
          .attr("x", nodeWidth / 2 - 20) // Center the image at the node, adjust as needed
          .attr("y", nodeHeight) // Position it below the node
          .attr("width", 18) // Set the width of the image
          .attr("height", 18) // Set the height of the image
          .attr("class", "add-icon");

        // Create a rectangle for the text bubble, initially not visible
        const textBubble = actionGroup
          .append("rect")
          .style("fill", "white")
          .style("opacity", 0.75)
          .attr("rx", 10) // Rounded corners
          .attr("ry", 10)
          .attr("visibility", "hidden");

        // Add the action text, initially not positioned
        const actionText = actionGroup
          .append("text")
          .attr("class", "action-text")
          .attr("text-anchor", "middle")
          .style("font-size", "10px")
          .style("fill", "black")
          .attr("visibility", "hidden"); // Start hidden

        node
          .on("mouseenter", function (event) {
            const [x, y] = pointer(event, this);
            let action = "";
            let iconX = 0;
            let iconY = 0;

            if (x < nodeWidth / 3) {
              action = "Add Spouse";
              iconX = -10;
              iconY = nodeHeight / 2 - 10;
            } else if (x > (2 * nodeWidth) / 3) {
              action = "Add Spouse";
              iconX = nodeWidth - 10;
              iconY = nodeHeight / 2 - 10;
            } else if (y < nodeHeight) {
              action = "Add Child";
              iconX = nodeWidth / 2 - 10;
              iconY = nodeHeight - 10;
            }

            if (action) {
              addActionIcon.attr("x", iconX).attr("y", iconY);

              // Update and position text based on the action
              actionText
                .text(action)
                .attr("x", iconX)
                .attr("y", iconY - 20)
                .attr("visibility", "visible");

              // Size and position the text bubble
              const textSize = actionText.node().getBBox();
              textBubble
                .attr("x", textSize.x - 5)
                .attr("y", textSize.y - 5)
                .attr("width", textSize.width + 10)
                .attr("height", textSize.height + 10)
                .attr("visibility", "visible");

              // Make the group visible
              actionGroup.style("visibility", "visible");
            }
          })
          .on("mouseleave", function () {
            // Explicitly hide each component
            actionGroup.style("visibility", "hidden");
            textBubble.attr("visibility", "hidden");
            actionText.attr("visibility", "hidden");
          });
      });
      // Handle window resizing
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }
    updateDimensions();
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="family-tree-container">
      <div
        id="tooltip"
        style={{
          position: "absolute",
          visibility: "hidden",
          background: "lightgrey",
          padding: "5px",
          borderRadius: "5px",
        }}
      >
        Tooltip Text
      </div>
      <button
        className="add-person-button"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Close Form" : "Add New Person"}
      </button>
      {showForm && (
        <Form onSubmit={handleAddPerson} onClose={() => setShowForm(false)} />
      )}
      <input
        type="text"
        value={personNameToDelete}
        onChange={(e) => setPersonNameToDelete(e.target.value)}
        placeholder="Enter name to delete"
      />
      <button onClick={() => handleDeletePersonByName(personNameToDelete)}>
        Delete Person
      </button>
      <svg ref={svgRef} width="1000" height="1000"></svg>
    </div>
  );
};

export default FamilyTree;
