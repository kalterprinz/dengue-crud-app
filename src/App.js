import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './sidebar';
import AddDengueData from "./component/AddDengueData";
import DengueDataList from "./component/DengueDataList";
import CsvUploader from "./component/CsvUploader";
import MapData from "./component/MapData";
import "./App.css"; // Add the necessary styles here

function App() {
  return (
    <div className="app-container">
      <header>
      <img src="/deng.png" alt="Dengue Icon" className="app-icon" />
        <h1>Dengue Data CRUD App</h1>
      </header>
      
      <Router>
      <div className="app"> 
      <Sidebar />
      <div className="content">
      <Routes>
            <Route path="/data" element={<DengueDataList />} />
            <Route path="/map" element={<MapData />} />
            <Route path="/input" element={
                <div>
                  <section className="add-data-section">
                    <AddDengueData />
                  </section>
                  
                  <section className="csv-upload-section">
                    <CsvUploader />
                  </section>
                </div>
              } /> 
        </Routes>
        </div>
        </div>
        </Router>
    </div>
  );
}

export default App;
