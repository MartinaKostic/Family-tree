import React, { useRef, useState, useEffect } from "react";
import { select } from "d3-selection";
import { hierarchy, tree, linkHorizontal, zoom, pointer } from "d3";
import AlertModal from "./modals/AlertModal";

const TreeVisualization = ({
  data,
  onAddSpouse,
  onAddChild,
  onPersonClick,
  onAddParent,
}) => {
  const svgRef = useRef();
  const [alertInfo, setAlertInfo] = useState({ open: false, message: "" });
  // const formatDate = timeFormat("%d.%m.%Y");

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
      const treeLayout = tree()
        .nodeSize([120, 120])
        .separation((a, b) => {
          let siblingSpacing = 1; // Default spacing for siblings without spouses
          if (a.parent === b.parent) {
            if (b.data.spouses && b.data.spouses.length > 0) {
              siblingSpacing = 2;
            }
          }
          return siblingSpacing;
        });

      //hierarchy needed- So from nodes children array we take id and find the same node in the nodes (cause id is not enough)
      const root = hierarchy(data.root, (d) =>
        d.children.map((childId) =>
          data.nodes.find((node) => node.id === childId)
        )
      );

      treeLayout(root);

      // Initialize zoom behavior
      const zoomEffect = zoom()
        .scaleExtent([0.5, 3]) // Limit zoom scale
        .on("zoom", (e) => {
          g.attr("transform", e.transform); // Apply new transform to the g element
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

        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 2);

      //adding the spouses
      data.spouseLinks.forEach((link) => {
        const sourceNode = root
          .descendants()
          .find((d) => d.data.id === link.source);
        const targetNode = data.nodes.find((d) => d.id === link.target);

        if (sourceNode && targetNode) {
          const offsetX = 120;

          // Draw the link
          g.append("path")
            .attr("class", "spouse-link")
            .attr(
              "d",
              linkHorizontal()
                .x((d) => d.y + 60)
                .y((d) => d.x + 15)({
                source: { x: sourceNode.y, y: sourceNode.x },
                target: { x: sourceNode.y, y: sourceNode.x + offsetX },
              })
            )
            .attr("stroke", "#ccc")
            .attr("stroke-width", 2)
            .attr("fill", "none");
          // Group for spouse node
          const spouseNodeGroup = g
            .append("g")
            .attr(
              "transform",
              `translate(${sourceNode.x + offsetX},${sourceNode.y})`
            ) //za modal details
            .on("click", () => {
              onPersonClick(targetNode);
            })
            .on("mouseover", function () {
              // Handle hover to expand both rectangle and image
              select(this)
                .select("rect")
                .style("cursor", "pointer")
                .transition()
                .duration(100)
                .attr("width", 120)
                .attr("height", 36)
                .attr("x", -10)
                .attr("y", -3);

              select(this)
                .select("image")
                .style("cursor", "pointer")
                .transition()
                .duration(100)
                .attr("width", 60)
                .attr("height", 60)
                .attr("x", 20)
                .attr("y", -65);
            })
            .on("mouseout", function () {
              // Handle hover out to shrink both rectangle and image
              select(this)
                .select("rect")
                .transition()
                .duration(100)
                .attr("width", 100)
                .attr("height", 30)
                .attr("x", 0)
                .attr("y", 0);

              select(this)
                .select("image")
                .transition()
                .duration(100)
                .attr("width", 50)
                .attr("height", 50)
                .attr("x", 25)
                .attr("y", -50);
            });

          // Append rectangle
          spouseNodeGroup
            .append("rect")
            .attr("width", 100)
            .attr("height", 30)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", "#b2f2bb");

          // Append text
          spouseNodeGroup
            .append("text")
            .style("cursor", "pointer")
            .attr("x", 50)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .text(targetNode.name);

          if (targetNode.imageUrl) {
            // Append image
            spouseNodeGroup
              .append("image")
              .attr("xlink:href", targetNode.imageUrl)
              .attr("width", 50)
              .attr("height", 50)
              .attr("x", 25)
              .attr("y", -50);
          }
        }
      });

      const nodes = g
        .selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${d.x},${d.y})`)
        //za modal details
        .on("click", (e) => {
          //da vrati podatke osobe
          onPersonClick(e.target.__data__.data);
        })
        .on("mouseover", function () {
          //ovi mouseover i mouse out je da naraste node na hover!
          select(this)
            .select("rect")
            .style("cursor", "pointer")
            .transition()
            .duration(100)
            .attr("width", 120) // Increase width of node
            .attr("height", 36) // Increase height
            .attr("x", -10) // Adjust x to center
            .attr("y", -3); // Adjust y to center

          select(this)
            .selectAll(".node-image")
            .style("cursor", "pointer")
            .transition()
            .duration(100)
            .attr("width", 60)
            .attr("height", 60)
            .attr("x", 20)
            .attr("y", -65);
        })
        .on("mouseout", function () {
          select(this)
            .select("rect")
            .transition()
            .duration(100)
            .attr("width", 100)
            .attr("height", 30)
            .attr("x", 0)
            .attr("y", 0);

          select(this)
            .selectAll(".node-image")
            .transition()
            .duration(100)
            .attr("width", 50) // Return to original size
            .attr("height", 50)
            .attr("x", 25)
            .attr("y", -50);
        });

      // Append images
      //ako nema image da je ne appenda, ako ostavim gore kod mouse selct "image", onda uzme pluseve
      nodes.each(function (d) {
        if (d.data.imageUrl) {
          select(this)
            .append("image")
            .attr("xlink:href", d.data.imageUrl)
            .attr("width", 50)
            .attr("height", 50)
            .attr("x", 25)
            .attr("y", -50)
            .attr("class", "node-image");
        }
      });
      nodes
        .append("rect")
        .attr("width", 100)
        .attr("height", 30)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("fill", "lightblue");

      nodes
        .append("text")
        .style("cursor", "pointer")
        .attr("dy", "1.3em")
        .attr("x", 50)
        .attr("text-anchor", "middle")
        .text((d) =>
          d.data.name.length > 9
            ? `${d.data.name.substring(0, 6)}...`
            : d.data.name
        );

      // nodes
      //   .append("text")
      //   .attr("x", 50) // Center text horizontally
      //   .attr("y", 50) // Position for the dates
      //   .attr("text-anchor", "middle")
      //   .style("font-size", "14px") // Smaller font size for dates
      //   .text((d) =>
      //     d.data.birthDate
      //       ? formatDate(new Date(d.data.birthDate)) +
      //         (d.data.deathDate
      //           ? ` - ${formatDate(new Date(d.data.deathDate))}`
      //           : "")
      //       : ""
      //   ); // Display dates

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
          .style("cursor", "pointer")
          .attr("xlink:href", "/icons/add.png")
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
          .on("mouseenter", function (e) {
            const nodeSelection = select(this); // This selects the current node
            const boundData = nodeSelection.datum(); // This gets the data bound to the node

            const [x, y] = pointer(e, this);
            let action = "";
            let iconX = 0;
            let iconY = 0;

            if (x < nodeWidth / 3) {
              action = "Add Spouse";
              iconX = -20;
              iconY = nodeHeight / 2 - 10;
            } else if (x > (2 * nodeWidth) / 3) {
              action = "Add Spouse";
              iconX = nodeWidth;
              iconY = nodeHeight / 2 - 10;
            } else if (y < nodeHeight / 4 && boundData.data.isRoot) {
              action = "Add Parent";
              iconX = nodeWidth / 2 - 10;
              iconY = -10;
            } else if (y < nodeHeight + 20 && y > nodeHeight - 20) {
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
                .style("cursor", "pointer")
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

              if (action == "Add Spouse") {
                actionGroup.on("click", function (e) {
                  e.stopPropagation();
                  if (
                    boundData.data.spouses &&
                    boundData.data.spouses.length > 0
                  ) {
                    setAlertInfo({
                      open: true,
                      message:
                        "This person already has a spouse. Please delete the existing spouse first.",
                    });
                    return;
                  }
                  e.stopPropagation();
                  onAddSpouse(d);
                });
              } else if (action == "Add Child") {
                actionGroup.on("click", function (e) {
                  e.stopPropagation();
                  onAddChild(d);
                });
              } else if (action == "Add Parent") {
                actionGroup.on("click", function (e) {
                  e.stopPropagation();
                  onAddParent(d);
                });
              }
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
  }, [data, onAddSpouse, onAddChild, onAddParent]);

  return (
    <>
      <svg ref={svgRef}></svg>
      {alertInfo.open && (
        <AlertModal
          message={alertInfo.message}
          onClose={() => setAlertInfo({ open: false, message: "" })}
        />
      )}
    </>
  );
};

export default TreeVisualization;
