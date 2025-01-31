"use client";

import React from "react";
import EducationPageStructure from "@/components/EducationPageStructure";

// Helper functions
const isEdgeInPath = (edge, path) => {
  if (!path || path.length < 2) return false;
  for (let i = 0; i < path.length - 1; i++) {
    if (
      (edge.source === path[i] && edge.target === path[i + 1]) ||
      (edge.source === path[i + 1] && edge.target === path[i])
    ) {
      return true;
    }
  }
  return false;
};

const findPath = (source, sink, edges, flows) => {
  const visited = new Set();
  const path = [];

  const dfs = (node) => {
    if (node === sink) return true;
    visited.add(node);

    for (const edge of edges) {
      const neighbor =
        edge.source === node
          ? edge.target
          : edge.target === node
          ? edge.source
          : null;

      if (!neighbor || visited.has(neighbor)) continue;

      const residualCapacity =
        edge.source === node
          ? edge.capacity - (flows.get(`${edge.source}-${edge.target}`) || 0)
          : flows.get(`${edge.target}-${edge.source}`) || 0;

      if (residualCapacity > 0) {
        path.push(neighbor);
        if (dfs(neighbor)) return true;
        path.pop();
      }
    }
    return false;
  };

  path.push(source);
  if (dfs(source)) return path;
  return null;
};

const calculateBottleneck = (path, edges, flows) => {
  let bottleneck = Infinity;

  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];

    const edge = edges.find(
      (e) =>
        (e.source === current && e.target === next) ||
        (e.source === next && e.target === current)
    );

    if (edge) {
      let residualCapacity;
      if (edge.source === current) {
        residualCapacity =
          edge.capacity - (flows.get(`${edge.source}-${edge.target}`) || 0);
      } else {
        residualCapacity = flows.get(`${edge.target}-${edge.source}`) || 0;
      }
      bottleneck = Math.min(bottleneck, residualCapacity);
    }
  }

  return bottleneck;
};

const updateFlows = (path, bottleneck, flows) => {
  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];

    const forwardKey = `${current}-${next}`;
    const backwardKey = `${next}-${current}`;

    const existingForwardFlow = flows.get(forwardKey) || 0;
    const existingBackwardFlow = flows.get(backwardKey) || 0;

    if (existingBackwardFlow > 0) {
      flows.set(backwardKey, existingBackwardFlow - bottleneck);
    } else {
      flows.set(forwardKey, existingForwardFlow + bottleneck);
    }
  }
};

const calculateNodeFlows = (nodes, edges) => {
  return nodes.map((node) => {
    const inFlow = edges
      .filter((e) => e.target === node.id)
      .reduce((sum, e) => sum + (e.flow || 0), 0);

    const outFlow = edges
      .filter((e) => e.source === node.id)
      .reduce((sum, e) => sum + (e.flow || 0), 0);

    return {
      ...node,
      inFlow,
      outFlow,
    };
  });
};

const generateSteps = (initialNodes, initialEdges) => {
  const steps = [];
  const flows = new Map();

  // Initialize flows
  initialEdges.forEach((e) => flows.set(`${e.source}-${e.target}`, 0));

  // Initial state
  steps.push({
    graphState: {
      nodes: calculateNodeFlows(initialNodes, initialEdges),
      edges: initialEdges.map((edge) => ({
        ...edge,
        flow: 0,
        highlight: false,
        residualCapacity: edge.capacity,
      })),
      currentPath: [],
      maxFlow: 0,
    },
    explanation:
      "Initial state: All flows are zero. Looking for augmenting path.",
    pseudoCodeLines: [1],
  });

  // Find paths and update flows
  let iteration = 1;
  let path = findPath("E", "C", initialEdges, flows); // Using E as source and C as sink

  while (path) {
    // Calculate bottleneck capacity for this path
    let bottleneck = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
      const edge = initialEdges.find(
        (e) => e.source === path[i] && e.target === path[i + 1]
      );
      if (edge) {
        const currentFlow = flows.get(`${edge.source}-${edge.target}`) || 0;
        bottleneck = Math.min(bottleneck, edge.capacity - currentFlow);
      }
    }

    // Step showing found path
    const currentEdges = initialEdges.map((edge) => ({
      ...edge,
      flow: flows.get(`${edge.source}-${edge.target}`) || 0,
      highlight: path.includes(edge.source) && path.includes(edge.target),
      residualCapacity:
        edge.capacity - (flows.get(`${edge.source}-${edge.target}`) || 0),
    }));

    steps.push({
      graphState: {
        nodes: calculateNodeFlows(initialNodes, currentEdges),
        edges: currentEdges,
        currentPath: path,
        maxFlow: steps[steps.length - 1].graphState.maxFlow,
      },
      explanation: `Iteration ${iteration}: Found augmenting path ${path.join(
        " → "
      )} with bottleneck capacity ${bottleneck}`,
      pseudoCodeLines: [2, "a"],
    });

    // Update flows along the path
    for (let i = 0; i < path.length - 1; i++) {
      const edgeKey = `${path[i]}-${path[i + 1]}`;
      const currentFlow = flows.get(edgeKey) || 0;
      flows.set(edgeKey, currentFlow + bottleneck);
    }

    // Step showing updated flows
    const updatedEdges = initialEdges.map((edge) => ({
      ...edge,
      flow: flows.get(`${edge.source}-${edge.target}`) || 0,
      highlight: path.includes(edge.source) && path.includes(edge.target),
      residualCapacity:
        edge.capacity - (flows.get(`${edge.source}-${edge.target}`) || 0),
    }));

    steps.push({
      graphState: {
        nodes: calculateNodeFlows(initialNodes, updatedEdges),
        edges: updatedEdges,
        currentPath: path,
        maxFlow: steps[steps.length - 1].graphState.maxFlow + bottleneck,
      },
      explanation: `Updated flows along path. Current maximum flow: ${
        steps[steps.length - 1].graphState.maxFlow + bottleneck
      }`,
      pseudoCodeLines: [2, "c"],
    });

    // Find next path
    path = findPath("E", "C", initialEdges, flows);
    iteration++;
  }

  // Final state
  const finalEdges = initialEdges.map((edge) => ({
    ...edge,
    flow: flows.get(`${edge.source}-${edge.target}`) || 0,
    highlight: false,
    residualCapacity:
      edge.capacity - (flows.get(`${edge.source}-${edge.target}`) || 0),
  }));

  steps.push({
    graphState: {
      nodes: calculateNodeFlows(initialNodes, finalEdges),
      edges: finalEdges,
      currentPath: [],
      maxFlow: steps[steps.length - 1].graphState.maxFlow,
    },
    explanation: `Algorithm complete. Maximum flow: ${
      steps[steps.length - 1].graphState.maxFlow
    }`,
    pseudoCodeLines: [3],
  });

  return steps;
};

const generateRandomGraph = (nodeCount = 5) => {
  // Fixed nodes for this specific layout
  const nodes = [
    { id: "A" },
    { id: "B" },
    { id: "C" },
    { id: "D" },
    { id: "E" },
  ];

  // Fixed edges for this specific layout
  const edges = [
    { source: "E", target: "D", capacity: 10, flow: 0 },
    { source: "E", target: "A", capacity: 8, flow: 0 },
    { source: "E", target: "B", capacity: 12, flow: 0 },
    { source: "D", target: "C", capacity: 15, flow: 0 },
  ];

  return { nodes, edges };
};

const NODE_TYPES = {
  SOURCE: { color: "#90EE90" }, // Light green
  SINK: { color: "#FFB6C1" }, // Light pink
  NORMAL: { color: "#FFFFFF" }, // White
};

const EDGE_TYPES = {
  CURRENT_PATH: { color: "#4169E1" }, // Royal blue
  NORMAL: { color: "#000000" }, // Black
};

const FordFulkersonGraphVisualisation = ({ graphState }) => {
  // Adjusted positions to create more space between nodes
  const nodePositions = {
    E: { x: 400, y: 50 }, // Top center
    D: { x: 200, y: 150 }, // Upper left
    A: { x: 600, y: 150 }, // Upper right
    B: { x: 400, y: 250 }, // Bottom center
    C: { x: 200, y: 300 }, // Bottom left - moved lower
  };

  const getFlowLabel = (edge) => {
    const flow = edge.flow || 0;
    const capacity = edge.capacity || "undefined";
    return `${flow}/${capacity}`;
  };

  return (
    <svg width="800" height="450" viewBox="0 0 800 450">
      {" "}
      {/* Increased height */}
      {/* Draw edges */}
      {(graphState?.edges || []).map((edge, idx) => {
        const source = nodePositions[edge.source];
        const target = nodePositions[edge.target];

        // Calculate midpoint of the edge
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;

        return (
          <g key={`edge-${idx}`}>
            {/* Edge line */}
            <line
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={edge.highlight ? "#4169E1" : "#64748b"}
              strokeWidth={edge.highlight ? "3" : "2"}
            />

            {/* Flow/Capacity label - always horizontal */}
            <g transform={`translate(${midX}, ${midY})`}>
              <text
                textAnchor="middle"
                dominantBaseline="text-before-edge"
                fill="#1a365d"
                fontSize="18"
                fontWeight="700"
                dy="-12"
              >
                {getFlowLabel(edge)}
              </text>
            </g>
          </g>
        );
      })}
      {/* Draw nodes with adjusted flow label positions */}
      {Object.entries(nodePositions).map(([id, pos]) => {
        const node = graphState?.nodes?.find((n) => n.id === id);
        const isHighlighted = graphState?.currentPath?.includes(id);

        return (
          <g key={`node-${id}`}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r="25"
              fill="#fff"
              stroke={isHighlighted ? "#4169E1" : "#64748b"}
              strokeWidth={isHighlighted ? "3" : "2"}
            />

            {/* Node label */}
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#000"
              fontSize="16"
              fontWeight="500"
            >
              {id}
            </text>

            {/* Flow labels with increased spacing */}
            <text
              x={pos.x + 45} // Moved to the right of node
              y={pos.y - 10}
              textAnchor="start"
              fill="#2563eb"
              fontSize="14"
              fontWeight="600"
            >
              {`in: ${node?.inFlow || 0}`}
            </text>
            <text
              x={pos.x + 45} // Moved to the right of node
              y={pos.y + 10}
              textAnchor="start"
              fill="#2563eb"
              fontSize="14"
              fontWeight="600"
            >
              {`out: ${node?.outFlow || 0}`}
            </text>
          </g>
        );
      })}
      {/* Legend */}
      <g transform="translate(650, 20)">
        {/* Legend Title */}
        <text x="0" y="0" fill="#1a365d" fontSize="16" fontWeight="700">
          Legend
        </text>

        {/* Edge Weight Example */}
        <g transform="translate(0, 25)">
          <line x1="0" y1="0" x2="40" y2="0" stroke="#64748b" strokeWidth="2" />
          <text x="50" y="5" fill="#1a365d" fontSize="14" fontWeight="600">
            flow/capacity
          </text>
        </g>

        {/* Highlighted Path Example */}
        <g transform="translate(0, 50)">
          <line x1="0" y1="0" x2="40" y2="0" stroke="#4169E1" strokeWidth="3" />
          <text x="50" y="5" fill="#1a365d" fontSize="14" fontWeight="600">
            current path
          </text>
        </g>

        {/* Node Flow Example */}
        <g transform="translate(0, 75)">
          <text x="0" y="5" fill="#2563eb" fontSize="14" fontWeight="600">
            in/out: node flow
          </text>
        </g>
      </g>
    </svg>
  );
};

const FordFulkersonEducationPage = () => {
  const conceptText = {
    introduction: `The Ford-Fulkerson method is a fundamental algorithm for solving the maximum flow problem in a flow network. It works by repeatedly finding augmenting paths from source to sink through any available path-finding strategy. While the basic Ford-Fulkerson method allows for any path-finding approach, a notable improvement called the Edmonds-Karp algorithm specifically uses Breadth-First Search (BFS) to find the shortest augmenting paths.`,
    keyCharacteristics: [
      "Can use any strategy to find augmenting paths (DFS, random, etc.)",
      "Maintains both network and residual graphs",
      "Iteratively increases flow along found paths",
      "Terminates when no augmenting path exists",
      "Runtime varies based on path selection strategy",
      "Edmonds-Karp variation uses BFS for O(VE²) complexity guarantee",
      "Flow Equilibrium: At each node (except source and sink), inflow equals outflow",
    ],
    applications: [
      "Network routing optimization",
      "Bandwidth allocation in telecommunications",
      "Supply chain management",
      "Traffic flow systems",
      "Pipeline distribution networks",
    ],
  };

  const pseudocode = `FORD-FULKERSON Algorithm:
1. Initialize all flows to zero
2. While there exists an augmenting path from source to sink:
   a. Find augmenting path
   b. Calculate bottleneck capacity
   c. Update flows along the path
3. Return total flow when no path exists`;

  // Create initial graph state
  const initialGraph = generateRandomGraph();
  const initialSteps = generateSteps(initialGraph.nodes, initialGraph.edges);

  return (
    <EducationPageStructure
      title="Ford-Fulkerson Algorithm"
      conceptText={conceptText}
      pseudocode={pseudocode}
      generateSteps={() => initialSteps}
      generateNewGraph={generateRandomGraph}
      GraphVisualisationComponent={FordFulkersonGraphVisualisation}
      initialGraphState={initialGraph}
    />
  );
};

export default FordFulkersonEducationPage;
