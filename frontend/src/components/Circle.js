import React, { useRef, useEffect } from "react";
import { select } from "d3";

const CircleWithData = () => {
  const svgRef = useRef();

  // Generate random data
  const data = [10, 20, 30];

  // useEffect(() => {
  //   const svg = select(svgRef.current);

  //   // Bind data to circles
  //   const circles = svg.selectAll("circle").data(data);

  //   // Enter new circles
  //   circles
  //     .enter()
  //     .append("circle")
  //     .attr("cx", (_, i) => i * 70 + 50) // Adjust positioning based on index
  //     .attr("cy", 50)
  //     .attr("r", (d) => d) // Use data value as radius
  //     .attr("fill", "blue");

  //   // Update existing circles (if any)
  //   circles.attr("cx", (_, i) => i * 70 + 50).attr("r", (d) => d);

  //   // Remove any circles that are no longer needed
  //   circles.exit().remove();
  // }, [data]); // Re-run the effect when data changes
  return (
    <svg>
      <circle cx="150" cy="77" r={(data) => data} />
    </svg>
  );
};

export default CircleWithData;
