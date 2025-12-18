import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHexagon } from "react-icons/fi"; 

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="w-full sticky top-0 z-50 bg-gray-950/50 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link 
          to="/"
          className="flex items-center gap-3 group"
        >
          <FiHexagon className="text-white/80 text-3xl group-hover:text-white transition-colors duration-200" />
          
          <span className="text-xl font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors">
            ThoughtNet
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full border border-white/10">
          <NavLink to="/" currentPath={location.pathname}>Home</NavLink>
          <NavLink to="/graph" currentPath={location.pathname}>Graph</NavLink>
          <NavLink to="/info" currentPath={location.pathname}>Info</NavLink>
        </div>

      </div>
    </nav>
  );
};

const NavLink = ({ to, children, currentPath }) => {
  const isActive = currentPath === to;

  return (
    <Link
      to={to}
      className={`
        relative px-5 py-2 rounded-full text-sm font-medium 
        transition-all duration-300
        ${isActive 
          ? "text-white bg-white/10"
          : "text-white/60 hover:text-white hover:bg-white/10"
        }
      `}
    >
      {children}
    </Link>
  );
};

export default Navbar;
