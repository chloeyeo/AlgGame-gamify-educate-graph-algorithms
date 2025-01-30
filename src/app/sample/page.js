"use client";

import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

const initialGraphState = {
  nodes: [
    { id: "S", x: 100, y: 300 }, // Source
    { id: "A", x: 300, y: 200 },
    { id: "B", x: 500, y: 200 },
    { id: "C", x: 300, y: 400 },
    { id: "D", x: 500, y: 400 },
    { id: "T", x: 700, y: 300 }, // Sink
  ],
  edges: [
    { source: "S", target: "A", capacity: 10, flow: 0 },
    { source: "S", target: "C", capacity: 8, flow: 0 },
    { source: "A", target: "B", capacity: 6, flow: 0 },
    { source: "A", target: "C", capacity: 4, flow: 0 },
    { source: "B", target: "T", capacity: 8, flow: 0 },
    { source: "C", target: "D", capacity: 9, flow: 0 },
    { source: "D", target: "B", capacity: 5, flow: 0 },
    { source: "D", target: "T", capacity: 10, flow: 0 },
  ],
  currentPath: [],
  maxFlow: 0,
};

const FordFulkersonPage = () => {
  const [graphState, setGraphState] = useState(initialGraphState);
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;

    // Set up SVG
    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", height);

    // Define arrow marker
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-10 -10 20 20")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M-6.75,-6.75 L 0,0 L -6.75,6.75")
      .attr("fill", "#64748b");

    // Draw edges
    graphState.edges.forEach((edge) => {
      const source = graphState.nodes.find((n) => n.id === edge.source);
      const target = graphState.nodes.find((n) => n.id === edge.target);

      // Draw edge line
      svg
        .append("path")
        .attr("d", `M${source.x},${source.y} L${target.x},${target.y}`)
        .attr("stroke", "#64748b")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("marker-end", "url(#arrowhead)");

      // Add edge label (capacity/flow)
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;

      svg
        .append("text")
        .attr("x", midX)
        .attr("y", midY - 10)
        .attr("text-anchor", "middle")
        .attr("fill", "#1e293b")
        .attr("font-size", "14px")
        .text(`${edge.flow}/${edge.capacity}`);
    });

    // Draw nodes
    const nodeGroups = svg
      .selectAll(".node")
      .data(graphState.nodes)
      .enter()
      .append("g")
      .attr("class", "node");

    // Node circles
    nodeGroups
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 25)
      .attr("fill", (d) => {
        if (d.id === "S") return "#22c55e"; // Source: green
        if (d.id === "T") return "#ef4444"; // Sink: red
        return "#ffffff"; // Other nodes: white
      })
      .attr("stroke", "#64748b")
      .attr("stroke-width", 2);

    // Node labels
    nodeGroups
      .append("text")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#1e293b")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text((d) => d.id);

    // Add legend
    const legend = svg.append("g").attr("transform", "translate(20, 20)");

    // Legend boxes
    const legendItems = [
      { color: "#22c55e", label: "Source Node" },
      { color: "#ef4444", label: "Sink Node" },
      { color: "#ffffff", label: "Internal Node" },
    ];

    legendItems.forEach((item, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 25})`);

      g.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", item.color)
        .attr("stroke", "#64748b")
        .attr("stroke-width", 2);

      g.append("text")
        .attr("x", 30)
        .attr("y", 15)
        .attr("fill", "#1e293b")
        .text(item.label);
    });
  }, [graphState]);

  return (
    <main className="flex flex-col p-6 items-center justify-center min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Ford-Fulkerson Maximum Flow Graph
      </h1>

      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
            <svg ref={svgRef} />
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">
            Maximum Flow: {graphState.maxFlow}
          </p>
        </div>
      </div>
    </main>
  );
};

export default FordFulkersonPage;
