import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css'; // Optional: for styling

const Sidebar = () => {
  const [inputMenuOpen, setInputMenuOpen] = useState(false);

  const toggleInputMenu = () => {
    setInputMenuOpen(!inputMenuOpen);
  };

  return (
    <div className="sidebar">
      <ul>
        <li>
          <NavLink to="/data">
            <button className="sidebar-button">Data List</button>
          </NavLink>
        </li>
        <li>
          <NavLink to="/map">
            <button className="sidebar-button">Map Data</button>
          </NavLink>
        </li>
        <li>
          <NavLink to="/input">
            <button className="sidebar-button">Input</button>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
