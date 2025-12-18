import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="py-3 font-mon text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-800">
          ThoughtNet
        </h1>
        <p className="text-xl text-gray-300 leading-relaxed">
          Explore the universe of ideas. ThoughtNet visualizes the semantic relationships between thoughts, 
          clustering related concepts from across the web into a dynamic network.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">

        {/* Card 1 — Blue Glow */}
        <div className="
          relative p-7 bg-gray-900 rounded-2xl border border-gray-800 cursor-default
          overflow-hidden transition-all duration-500 hover:shadow-[0_10px_25px_rgba(0,0,0,0.45)]


          before:absolute before:inset-0 before:rounded-2xl
          before:bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.35),transparent_65%)]
          before:opacity-0 hover:before:opacity-100
          before:transition-opacity before:duration-500
        ">
          <div className="relative z-10">
            <h3 className="text-xl font-semibold text-blue-400 mb-3">
              Semantic Analysis
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Your query is broken down into core sub-thoughts to capture every nuance.
            </p>
          </div>
        </div>

        {/* Card 2 — Purple Glow */}
        <div className="
          relative p-7 bg-gray-900 rounded-2xl border border-gray-800 cursor-default
          overflow-hidden transition-all duration-500 hover:shadow-[0_10px_25px_rgba(0,0,0,0.45)]

          before:absolute before:inset-0 before:rounded-2xl
          before:bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.35),transparent_65%)]
          before:opacity-0 hover:before:opacity-100
          before:transition-opacity before:duration-500
        ">
          <div className="relative z-10">
            <h3 className="text-xl font-semibold text-purple-400 mb-3">
              Dynamic Clustering
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Related ideas are grouped together, adapting to the complexity of your thought.
            </p>
          </div>
        </div>

        {/* Card 3 — Pink Glow */}
        <div className="
          relative p-7 bg-gray-900 rounded-2xl border border-gray-800 cursor-default
          overflow-hidden transition-all duration-500 hover:shadow-[0_10px_25px_rgba(0,0,0,0.45)]

          before:absolute before:inset-0 before:rounded-2xl
          before:bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.35),transparent_65%)]
          before:opacity-0 hover:before:opacity-100
          before:transition-opacity before:duration-500
        ">
          <div className="relative z-10">
            <h3 className="text-xl font-semibold text-pink-400 mb-3">
              Interactive Graph
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Navigate through thought clouds. Click to expand and explore the details.
            </p>
          </div>
        </div>

      </div>

      <button 
      onClick={() => navigate("/graph")}
      className="cssbuttons-io">
        <span>
          Get Started </span>
      </button>

      </div>
    </div>
  );
};

export default Home;
