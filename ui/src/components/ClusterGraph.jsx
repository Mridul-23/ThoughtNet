import React, { useEffect, useState } from "react";
import axios from "axios";
import ForceGraph2D from "react-force-graph-2d";

const ClusterGraph = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/cluster/?query=quantum");
        const { texts, labels } = res.data;

        // Build nodes
        const nodes = texts.map((text, i) => ({
          id: i.toString(),
          label: text,
          cluster: labels[i]
        }));

        // Build links (connect nodes of same cluster)
        const links = [];
        labels.forEach((cluster, i) => {
          labels.forEach((c2, j) => {
            if (i < j && cluster === c2) {
              links.push({ source: i.toString(), target: j.toString() });
            }
          });
        });

        setGraphData({ nodes, links });
      } catch (err) {
        console.error("Error fetching ThoughtNet data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full h-screen bg-gray-900 text-white">
      <h1 className="text-xl font-bold p-4">ThoughtNet Graph</h1>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="label"
        nodeAutoColorBy="cluster"
        linkColor={() => "rgba(255,255,255,0.2)"}
        backgroundColor="#111"
      />
    </div>
  );
};

export default ClusterGraph;
