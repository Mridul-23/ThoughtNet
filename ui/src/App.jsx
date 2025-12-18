import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import ClusterGraph from "./components/ClusterGraph";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Info from "./components/Info";
import "./App.css";

function App() {
  const location = useLocation();

  return (
    <div className="App flex flex-col min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex-grow" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/graph" element={<ClusterGraph />} />
          <Route path="/info" element={<Info />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
