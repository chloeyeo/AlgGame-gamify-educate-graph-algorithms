import React, { useMemo } from "react";
import { useRouter } from "next/navigation";

const Sidebar = ({ isOpen, onClose, onAlgorithmSelect, selectedAlgorithm }) => {
  const router = useRouter();
  const [selectedMainAlgorithm, setSelectedMainAlgorithm] =
    React.useState(null);

  const algorithms = useMemo(
    () => ({
      Traversal: ["Depth-First Search (DFS)", "Breadth-First Search (BFS)"],
      "Shortest Path": ["Dijkstra's", "A*"],
      "Minimum Spanning Tree": ["Kruskal's", "Prim's"],
      "Network Flow": ["Ford-Fulkerson"],
      Matching: ["Hungarian (Kuhn-Munkres)"],
    }),
    []
  );

  React.useEffect(() => {
    if (selectedAlgorithm) {
      const mainAlgo = Object.entries(algorithms).find(([, subAlgos]) =>
        subAlgos.includes(selectedAlgorithm)
      );
      if (mainAlgo) {
        setSelectedMainAlgorithm(mainAlgo[0]);
      }
    }
  }, [selectedAlgorithm, algorithms]);

  const handleMainAlgorithmClick = (algorithm) => {
    setSelectedMainAlgorithm(
      algorithm === selectedMainAlgorithm ? null : algorithm
    );
  };

  const handleSubAlgorithmClick = (subAlgorithm) => {
    onAlgorithmSelect(subAlgorithm);
    navigateToPage(subAlgorithm);
  };

  const navigateToPage = (algorithm) => {
    let path = "/education"; // Default to education mode

    if (algorithm.includes("Depth-First Search")) {
      path += "/traversal/dfs";
    } else if (algorithm.includes("Breadth-First Search")) {
      path += "/traversal/bfs";
    } else if (algorithm.includes("Dijkstra's")) {
      path += "/shortest-path/dijkstras";
    } else if (algorithm.includes("A*")) {
      path += "/shortest-path/astar";
    } else if (algorithm.includes("Kruskal's")) {
      path += "/minimum-spanning-tree/kruskals";
    } else if (algorithm.includes("Prim's")) {
      path += "/minimum-spanning-tree/prims";
    } else if (algorithm.includes("Ford-Fulkerson")) {
      path += "/network-flow/ford-fulkerson";
    } else if (algorithm.includes("Hungarian (Kuhn-Munkres)")) {
      path += "/matching/hungarian-kuhn-munkres";
    }

    router.push(path);
  };

  return (
    <div
      className={`fixed top-16 sm:top-20 pt-2 pb-40 w-64 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] bg-white transition-transform transition-opacity overflow-y-auto no-scrollbar
                    transition-all duration-300 ease-in-out z-30 ${
                      isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
    >
      <div className="p-4 overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-xl font-semibold mb-4">Algorithms</h2>
        <div>
          {Object.entries(algorithms).map(([mainAlgorithm, subAlgorithms]) => (
            <div key={mainAlgorithm} className="mb-2">
              <button
                onClick={() => handleMainAlgorithmClick(mainAlgorithm)}
                className={`block w-full text-left px-4 py-2 rounded ${
                  selectedMainAlgorithm === mainAlgorithm
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {mainAlgorithm}
              </button>
              {selectedMainAlgorithm === mainAlgorithm && (
                <div className="ml-4 mt-2">
                  {subAlgorithms.map((subAlgorithm) => (
                    <button
                      key={subAlgorithm}
                      onClick={() => handleSubAlgorithmClick(subAlgorithm)}
                      className={`block w-full text-left px-4 py-2 rounded ${
                        selectedAlgorithm === subAlgorithm
                          ? "bg-blue-300 text-white"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {subAlgorithm}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
