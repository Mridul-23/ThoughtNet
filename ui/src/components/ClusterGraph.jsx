import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import ForceGraph2D from "react-force-graph-2d";
import Modal from "./Modal";
import cloudSrc from "../assets/cloud.png";
import { forceManyBody, forceCollide, forceLink } from "d3-force";
import { FaInfoCircle } from "react-icons/fa";

function drawFallbackCloud(ctx, cx, cy, r, color = "#ffa500") {
  ctx.save();
  ctx.fillStyle = color || "#ffa500";
  ctx.beginPath();
  ctx.arc(cx - r * 0.35, cy, r * 0.7, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.25, cy - r * 0.15, r * 0.9, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.65, cy + r * 0.2, r * 0.55, 0, Math.PI * 2);
  ctx.arc(cx - r * 0.05, cy + r * 0.2, r * 0.65, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = Math.max(1, 1.2 / (window.devicePixelRatio || 1));
  ctx.stroke();
  ctx.restore();
}

function elasticKick(node, strength = 0.6) {
  const a = Math.random() * Math.PI * 2;
  const r = 6 + Math.random() * 6;
  node.vx = Math.cos(a) * r * strength;
  node.vy = Math.sin(a) * r * strength;
}


const ClusterGraph = () => {
  const [query, setQuery] = useState("Is AGI upcoming or still too far?");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const fgRef = useRef();
  const topologyChangedRef = useRef(false);


  // Full graph returned by backend (immutable canonical)
  const [fullData, setFullData] = useState({ nodes: [], links: [] });
  // set of cluster ids that are expanded (show children)
  const [expandedClusters, setExpandedClusters] = useState(new Set());
  // visible graph fed to ForceGraph
  const [displayData, setDisplayData] = useState({ nodes: [], links: [] });

  // keep last displayData nodes positions so we preserve continuity
  const lastNodeMapRef = useRef(new Map());

  // image for cluster clouds
  const cloudImgRef = useRef(null);
  const [cloudLoaded, setCloudLoaded] = useState(false);

  const clusterCenters = useMemo(() => {
    const map = new Map();

    displayData.nodes.forEach(n => {
      if (!n.parent) return;
      if (!map.has(n.parent)) {
        map.set(n.parent, { x: 0, y: 0, c: 0 });
      }
      const m = map.get(n.parent);
      m.x += n.x;
      m.y += n.y;
      m.c++;
    });

    map.forEach(v => {
      v.x /= v.c;
      v.y /= v.c;
    });

    return map;
  }, [displayData.nodes]);


  // load cloud image once
  useEffect(() => {
    const img = new Image();
    img.src = cloudSrc;
    img.onload = () => {
      cloudImgRef.current = img;
      setCloudLoaded(true);
    };
    img.onerror = () => {
      cloudImgRef.current = null;
      setCloudLoaded(false);
      console.warn("Failed to load cloud image; using canvas fallback.");
    };
  }, []);

  // helper to merge previous positions into new nodes to avoid jumping
  const mergePreviousPositions = (nodes) => {
    const map = lastNodeMapRef.current;
    return nodes.map((n) => {
      const prev = map.get(n.id);
      if (!prev) return n;
      // only merge numeric values
      const copy = { ...n };
      if (typeof prev.x === "number") copy.x = prev.x;
      if (typeof prev.y === "number") copy.y = prev.y;
      if (typeof prev.vx === "number") copy.vx = prev.vx;
      if (typeof prev.vy === "number") copy.vy = prev.vy;
      return copy;
    });
  };

  // Visibility helper
  const updateGraphVisibility = useCallback((nodes, links, expandedClusters) => {
    const sanitizedNodes = nodes.map((n) => ({ ...n }));

    // Hierarchy: Root -> SubTopic -> ThoughtCloud -> Evidence
    const visibleNodes = sanitizedNodes.filter((n) => {
      if (n.type === "root") return true;
      if (n.type === "sub_topic") return true; // Always show breakdown
      
      // Toggle logic based on expansion
      if (n.type === 'evidence') {
         // Find edge pointing to this node
         const parentEdge = links.find(l => {
             const t = typeof l.target === 'object' ? l.target.id : l.target;
             return t === n.id;
         });
         if (parentEdge) {
             const sourceId = typeof parentEdge.source === 'object' ? parentEdge.source.id : parentEdge.source;
             return expandedClusters.has(sourceId);
         }
         return false;
      }
      return true; 
    });

    // START FIX: Link Preservation
    const currentDisplayLinks = displayData.links || [];
    const linkMap = new Map();
    currentDisplayLinks.forEach(l => {
       const sId = typeof l.source === 'object' ? l.source.id : l.source;
       const tId = typeof l.target === 'object' ? l.target.id : l.target;
       linkMap.set(`${sId}-${tId}`, l);
    });
    // END FIX

    let merged = mergePreviousPositions(visibleNodes);

    // START FIX: Spawn Logic (prevent chaos)
    const posMap = lastNodeMapRef.current;
    merged = merged.map(n => {
       // If node has x/y, it was merged or already has pos.
       if (typeof n.x === 'number' && typeof n.y === 'number') return n;

       // It's a new node. Find parent.
       const parentLink = links.find(l => {
           const t = typeof l.target === 'object' ? l.target.id : l.target;
           return t === n.id;
       });
       
       if (parentLink) {
           const pId = typeof parentLink.source === 'object' ? parentLink.source.id : parentLink.source;
           const parentPos = posMap.get(pId);
           if (parentPos) {
               const newNode = {
                ...n,
                x: parentPos.x,
                y: parentPos.y
              };

              elasticKick(newNode);
              return newNode;

           }
       }
       return n;
    });
    // END FIX
    
    const visibleIds = new Set(merged.map((n) => n.id));
    
    const visibleLinks = links.map(l => {
        // 'l' might be raw data {source: "id", target: "id"}
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        
        // If both ends are visible, we include it.
        if (visibleIds.has(s) && visibleIds.has(t)) {
             // Prefer the already-simulated link object if it exists
             const existing = linkMap.get(`${s}-${t}`);
             if (existing) return existing;
             return l;
        }
        return null;
    }).filter(Boolean);

    return { nodes: merged, links: visibleLinks };
  }, []);

  // Whenever fullData or expansion set changes, compute visible graph
  useEffect(() => {
    const next = updateGraphVisibility(fullData.nodes, fullData.links, expandedClusters);
    // Before setting, snapshot existing nodes into lastNodeMapRef so merge can find them next time
    const prevNodes = displayData.nodes || [];
    const map = new Map();
    prevNodes.forEach((n) => {
      if (typeof n.x === "number" && typeof n.y === "number") {
        map.set(n.id, { x: n.x, y: n.y, vx: n.vx, vy: n.vy });
      }
    });
    lastNodeMapRef.current = map;

    // merge previous positions into the new visible nodes
    const mergedNodes = mergePreviousPositions(next.nodes);
    setDisplayData({ nodes: mergedNodes, links: next.links });
    
    // We update lastNodeMapRef *after* merge? No, merge uses it.
    // The flow is: 
    // 1. Snapshot current displayData -> lastNodeMapRef
    // 2. Compute next visible nodes -> merged with lastNodeMapRef
    // 3. Set displayData
  }, [fullData, expandedClusters, updateGraphVisibility]);

  // consolidated single physics setup effect — runs whenever displayed data changes
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    // defensive: ensure d3Force exists
    if (typeof fg.d3Force !== "function") {
      console.warn("react-force-graph instance does not expose d3Force; skipping custom forces.");
      return;
    }

    const nodeCount = (displayData?.nodes?.length) || 0;
    const chargeStrength = Math.max(-80, -20 - nodeCount * 0.6); // tuned for a wider range
    const collisionRadius = (node) => {
      if (!node) return 10;
      if (node.type === "root") return 26;
      if (node.type === "cluster") return 20;
      return 8;
    };

    try {
      // charge
      fg.d3Force("charge", forceManyBody().strength(chargeStrength));

      // collision
      fg.d3Force("collision", forceCollide().radius((d) => collisionRadius(d) + 6).strength(0.9));

      // link
      fg.d3Force(
        "link",
        forceLink()
          .id((d) => d.id)
          .distance((link) => {
            const s = typeof link.source === "object" ? link.source : { id: link.source };
            const t = typeof link.target === "object" ? link.target : { id: link.target };

            // Root -> SubTopic
            if (s.type === "root" || t.type === "root") return 180;
            // SubTopic -> Cloud
            if ((s.type === "sub_topic" && t.type === "thought_cloud") || (t.type === "sub_topic" && s.type === "thought_cloud")) return 100;
            // Cloud -> Evidence
            return 60;
          })
          .strength(0.8)
      );

      // cooldown ticks (guarded)
      const ticks = Math.min(200, 50 + Math.floor(nodeCount * 1.5));
      try {
        if ("cooldownTicks" in fg) fg.cooldownTicks = ticks;
        else fg.cooldownTicks = ticks;
      } catch (e) {
        // ignore
      }

      // alpha decay: guard for function presence
      if (typeof fg.d3AlphaDecay === "function") {
        fg.d3AlphaDecay(0.02);
      }

      // resume simulation with a gentle reheat for smooth expansion
      if (topologyChangedRef.current && typeof fg.d3Alpha === "function") {
        fg.d3Alpha(0.25);
        fg.restart();
        topologyChangedRef.current = false;
      } else {
          // fallback
          if (typeof fg.start === "function") fg.start(); 
      }

    } catch (err) {
      console.warn("Failed to apply custom forces:", err);
    }
    
    // NO cleanup removing forces - let them persist
  }, [displayData]);

  // Initial Zoom Fit when loading finishes (new search)
  useEffect(() => {
    if (!loading && hasSearched && fgRef.current) {
        setTimeout(() => {
            try {
               fgRef.current.zoomToFit(1000, 50);
            } catch(e) {}
        }, 500);
    }
  }, [loading, hasSearched]);

  // fetcher
  const fetchData = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/cluster/?query=${encodeURIComponent(query)}`);
      // The new API returns { root_id: "...", nodes: [...], edges: [...] }
      const data = res.data || {};
      
      const nodes = (data.nodes || []).map(n => ({
        ...n,
        // Assign default colors based on type if not present
        color: n.color || (
           n.type === 'root' ? '#ff4b4b' :
           n.type === 'sub_topic' ? '#a855f7' : // Purple
           n.type === 'thought_cloud' ? '#ffa500' : // Orange
           '#00bcd4' // Cyan (evidence)
        ),

        val: n.size || (
           n.type === 'root' ? 30 :
           n.type === 'sub_topic' ? 20 :
           n.type === 'thought_cloud' ? 15 :
           5
        ),
        fullText: n.full_text || n.fullText || ""
      }));

      const links = (data.edges || []).map(e => ({
        source: e.source,
        target: e.target
      }));

      setFullData({ nodes, links });
      // Initially, expand all 'sub_topic' nodes so specific 'clusters' are visible?
      // Or just start clean. Let's expand everything by default or nothing.
      // Let's expand sub_topics by default so users see questions breakdown.

      const initialExpanded = new Set();
      nodes.forEach(n => {
        if (n.type === 'root' || n.type === 'sub_topic') {
           initialExpanded.add(n.id);
        }
      });
      setExpandedClusters(initialExpanded);

    } catch (err) {
      console.error("Error fetching ThoughtNet data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleNodeClick = (node) => {
    if (!node) return;
    if (node.type === "thought_cloud") {
      const newExpanded = new Set(expandedClusters);
      if (newExpanded.has(node.id)) newExpanded.delete(node.id);
      else newExpanded.add(node.id);
      setExpandedClusters(newExpanded);
      // Zoom logic...
      try {
        const fg = fgRef.current;
        fg.centerAt && fg.centerAt(node.x, node.y, 400);
        fg.zoom && fg.zoom(3.0, 800);
      } catch(e) {}
    } else if (node.type === "evidence" || node.type === "leaf") {
      setSelectedNode(node);
      setModalOpen(true);
    } else if (node.type === "root" || node.type === "sub_topic") {
       // Maybe collapse/expand sub-tree? For now just zoom fit or center
       try {
         fgRef.current.centerAt && fgRef.current.centerAt(node.x, node.y, 400);
         fgRef.current.zoom && fgRef.current.zoom(2, 800);
       } catch (e) {}
    }
  };

  // Snapshot / Download
  const handleDownloadJSON = () => {
    if (!fullData || !fullData.nodes || fullData.nodes.length === 0) return;
    const jsonString = JSON.stringify(fullData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `thoughtnet_${query.replace(/\s+/g, "_")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSnapshot = () => {
    try {
        const canvasEl = document.querySelector('canvas');
        if (canvasEl) {
             const dataURL = canvasEl.toDataURL('image/jpeg');
             const link = document.createElement('a');
             link.href = dataURL;
             link.download = `thoughtnet_snapshot_${Date.now()}.jpg`;
             link.click();
        } else {
             alert("Could not find canvas to snapshot.");
        }
    } catch (e) {
        console.error("Snapshot failed", e);
        alert("Snapshot failed due to technical restrictions.");
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Input Container - Animates from center to top */}
      <div
        className={`absolute z-10 w-full flex justify-center transition-all duration-700 ease-in-out ${
          hasSearched ? "top-4" : "top-1/2 -translate-y-1/2"
        }`}
      >
        <div className={`bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-700 transition-all duration-500 ${hasSearched ? "w-auto scale-90" : "w-full max-w-2xl scale-100"}`}>
          {!hasSearched && <h1 className="text-4xl font-bold mb-2 font-mon text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">What's on your mind?</h1>}

          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 p-4 rounded-xl font-mono bg-gray-900/50 text-white border border-gray-600 focus:border-blue-500 focus:outline-none text-lg placeholder-gray-500"
              placeholder="Ask ThoughtNet..."
            />
            <button
              type="submit"
              className={loading ?
                "px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
                : "cssbuttons-io"}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⚪</span> Thinking
                </span>
              ) : <span className="flex-1"> Analyze</span>}
            </button>
          </form>
        </div>
      </div>
      
      {/* Control Tools (Visible only when graph is active) */}
      {hasSearched && !loading && (
          <div className="absolute top-6 right-6 z-20 flex gap-2">
             <button 
                onClick={handleDownloadJSON}
                className="bg-gray-800/80 hover:bg-gray-700 text-white p-3 rounded-lg backdrop-blur-md border border-gray-600 shadow-md transition-all"
                title="Download Graph JSON"
             >
                💾 JSON
             </button>
             <button 
                onClick={handleSnapshot}
                className="bg-gray-800/80 hover:bg-gray-700 text-white p-3 rounded-lg backdrop-blur-md border border-gray-600 shadow-md transition-all text-sm"
                title="Save Snapshot"
             >
                📷 JPG
             </button>
          </div>
      )}

      {/* Info Bubble Easter Egg - Always Visible */}
      <div className="absolute top-6 right-36 z-20 group">
         <div className="w-10 h-10 flex items-center justify-center bg-gray-800/80 backdrop-blur-md rounded-full border border-gray-600 shadow-md cursor-help hover:bg-gray-700 transition-colors">
            <FaInfoCircle className="text-xl text-white" />
         </div>
         <div className="absolute top-12 right-0 w-64 p-4 bg-black/90 backdrop-blur-xl border border-red-500/50 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform translate-y-2 group-hover:translate-y-0">
            <h4 className="text-red-400 font-bold mb-1">⚠️ GLITCH WARNING</h4>
            <p className="text-xs text-gray-300">
               Do NOT press <kbd className="bg-gray-700 px-1 rounded">Ctrl</kbd> + <kbd className="bg-gray-700 px-1 rounded">+</kbd> / <kbd className="bg-gray-700 px-1 rounded">-</kbd> on this canvas. 
               <br/>
               It triggers the <span className="text-purple-400 font-mono">D3_Singularity_Event</span>. 
               <br/>
               (Actually it just zooms the DOM while the canvas stays fixed, misaligning everything. It's a feature, not a bug!)
            </p>
         </div>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={displayData}
        nodeLabel="label"
        nodeAutoColorBy="type"
        linkColor={() => "rgba(255,255,255,0.12)"}
        backgroundColor="#0f172a"
        onNodeClick={handleNodeClick}
        nodeCanvasObject={(node, ctx, globalScale) => {
          clusterCenters.forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, 90, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(168,85,247,0.05)";
            ctx.fill();
          });

          const label = node.label || "";
          const fontSize = Math.max(9, 12 / (globalScale || 1));
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const cloudSize = node.type === "thought_cloud" ? 48 : node.type === "root" ? 64 : node.type === 'sub_topic' ? 40 : 24;
          const r = cloudSize / 2;

          if (node.type === "thought_cloud") {
            if (cloudLoaded && cloudImgRef.current) {
              try {
                ctx.drawImage(cloudImgRef.current, node.x - r, node.y - r, cloudSize, cloudSize);
              } catch (e) {
                drawFallbackCloud(ctx, node.x, node.y, r, node.color);
              }
            } else {
              drawFallbackCloud(ctx, node.x, node.y, r, node.color);
            }
            // Label
            const text = label.length > 28 ? label.slice(0, 28) + "…" : label;
            ctx.fillStyle = "rgba(255,255,255,0.92)";
            ctx.fillText(text, node.x, node.y + r + (fontSize * 0.4));
            
          } else if (node.type === "root") {
            const R = 22;
            ctx.fillStyle = node.color || "#ff4b4b";
            ctx.beginPath();
            ctx.arc(node.x, node.y, R, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.fillStyle = "white";
            const text = label.length > 20 ? label.slice(0, 20) + "…" : label;
            ctx.fillText(text, node.x, node.y + R + (fontSize * 0.4));
            
          } else if (node.type === "sub_topic") {
            const R = 18;
            ctx.fillStyle = node.color || "#a855f7";
            ctx.beginPath();
            ctx.arc(node.x, node.y, R, 0, 2 * Math.PI, false); // Circle for sub-topic
            ctx.fill();
            ctx.fillStyle = "white";
            const text = label.length > 20 ? label.slice(0, 20) + "…" : label;
            ctx.fillText(text, node.x, node.y + R + (fontSize * 0.4));
            
          } else {
            // Evidence / Leaf
            ctx.fillStyle = node.color || "#00bcd4";
            ctx.beginPath();
            ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
            ctx.fill();
          }
        }}

        onRenderFramePre={() => {
          displayData.nodes.forEach(n => {
            delete n.__haloDrawn;
          });
        }}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedNode?.label || "Detail"}
        content={selectedNode?.fullText}
        link={selectedNode?.url}
        source={selectedNode?.source}
        type={selectedNode?.type}
      />
    </div>
  );
};

export default ClusterGraph;
