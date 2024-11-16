import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Plot from 'react-plotly.js';
import "./DengueDataList.css";

const DengueDataList = () => {
  const [dengueData, setDengueData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    location: "",
    cases: "",
    deaths: "",
    date: "",
    regions: "",
  });

  const [filterText, setFilterText] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [barChartRegion, setBarChartRegion] = useState("");

  const [currentPage, setCurrentPage] = useState(1); // State for pagination
  const itemsPerPage = 10; // Number of items per page

  useEffect(() => {
    const fetchData = async () => {
      const dengueCollection = collection(db, "dengueData");
      const dengueSnapshot = await getDocs(dengueCollection);
      const dataList = dengueSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDengueData(dataList);
    };

    fetchData();
  }, []);

  const calculateCorrelation = (x, y) => {
    if (x.length === 0 || y.length === 0 || x.length !== y.length) {
      return null;
    }
    const meanX = x.reduce((a, b) => a + b, 0) / x.length;
    const meanY = y.reduce((a, b) => a + b, 0) / y.length;
    const numerator = x
      .map((xi, i) => (xi - meanX) * (y[i] - meanY))
      .reduce((a, b) => a + b, 0);
    const denominatorX = Math.sqrt(
      x.map((xi) => Math.pow(xi - meanX, 2)).reduce((a, b) => a + b, 0)
    );
    const denominatorY = Math.sqrt(
      y.map((yi) => Math.pow(yi - meanY, 2)).reduce((a, b) => a + b, 0)
    );

    if (denominatorX === 0 || denominatorY === 0) {
      return null;
    }

    return numerator / (denominatorX * denominatorY);
  };

  const regionMap = dengueData.reduce((acc, curr) => {
    if (!acc[curr.regions]) {
      acc[curr.regions] = { cases: [], deaths: [] };
    }
    acc[curr.regions].cases.push(curr.cases);
    acc[curr.regions].deaths.push(curr.deaths);
    return acc;
  }, {});

  const regions = Object.keys(regionMap);
  const correlationMatrix = regions.map((region1) => {
    return regions.map((region2) => {
      if (region1 === region2) return 1;
      const cases1 = regionMap[region1].cases || [];
      const deaths1 = regionMap[region1].deaths || [];
      const cases2 = regionMap[region2].cases || [];
      const deaths2 = regionMap[region2].deaths || [];

      if (!cases1.length || !cases2.length) return null;

      const flattenedCases1 = cases1.flat();
      const flattenedDeaths1 = deaths1.flat();
      const flattenedCases2 = cases2.flat();
      const flattenedDeaths2 = deaths2.flat();

      const correlation = calculateCorrelation(flattenedCases1, flattenedDeaths1);
      return correlation !== null ? correlation : 0;
    });
  });

  const heatmapData = {
    z: correlationMatrix,
    x: regions,
    y: regions,
    type: 'heatmap',
    colorscale: [
      [0, 'magenta'],
      [0.5, 'yellow'],
      [1, 'cyan'],
    ],
    zmin: -1,
    zmax: 1,
    colorbar: {
      title: 'Correlation',
      tickvals: [-1, 0, 1],
      ticktext: ['-1', '0', '1']
    },
    text: correlationMatrix.map(row => row.map(value => value.toFixed(2))),
    texttemplate: '%{text}',
    showscale: true
  };

  const handleDelete = async (id) => {
    const dengueDocRef = doc(db, "dengueData", id);
    try {
      await deleteDoc(dengueDocRef);
      setDengueData(dengueData.filter((data) => data.id !== id));
      alert("Data deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleEdit = (data) => {
    setEditingId(data.id);
    setEditForm({
      location: data.location,
      cases: data.cases,
      deaths: data.deaths,
      date: data.date,
      regions: data.regions,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const dengueDocRef = doc(db, "dengueData", editingId);
    try {
      await updateDoc(dengueDocRef, {
        location: editForm.location,
        cases: Number(editForm.cases),
        deaths: Number(editForm.deaths),
        date: editForm.date,
        regions: editForm.regions,
      });
      setDengueData(
        dengueData.map((data) =>
          data.id === editingId ? { id: editingId, ...editForm } : data
        )
      );
      setEditingId(null);
      alert("Data updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const uniqueRegions = [...new Set(dengueData.map((data) => data.regions))];

  const filteredData = dengueData.filter((data) => {
    return (
      data.location.toLowerCase().includes(filterText.toLowerCase()) &&
      (filterRegion === "" || data.regions === filterRegion)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div className="dengue-data-list">
      <h2>Dengue Data List</h2>

      <div className="filter-container">
        <input
          type="text"
          placeholder="Search..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="filter-input"
        />
        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="filter-dropdown"
        >
          <option value="">All Regions</option>
          {uniqueRegions.map((region, index) => (
            <option key={index} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {editingId ? (
        /* Edit form section */
        <div className="modal">
          <form className="edit-form" onSubmit={handleUpdate}>
            <h3>Edit Data</h3>
            <label>
            Location:
            <div className="input-container">
                <input
                className="inputs"
                type="text"
                value={editForm.location}
                onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                }
                required
                />
            </div>
            </label>

            <label>
            Cases:
            <div className="input-container">
                <input
                className="inputs"
                type="number"
                value={editForm.cases}
                onChange={(e) =>
                    setEditForm({ ...editForm, cases: e.target.value })
                }
                required
                />
            </div>
            </label>

            <label>
            Deaths:
            <div className="input-container">
                <input
                className="inputs"
                type="number"
                value={editForm.deaths}
                onChange={(e) =>
                    setEditForm({ ...editForm, deaths: e.target.value })
                }
                required
                />
            </div>
            </label>
            
            <label>
              Date:
            <div className="input-container">
                <input
                className="inputs"
                type="date"
                value={editForm.date}
                onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                }
                required
                />
            </div>
            </label>
            <label>
            Region:
            <div className="input-container">
                <input
                className="inputs"
                type="text"
                value={editForm.regions}
                onChange={(e) =>
                    setEditForm({ ...editForm, regions: e.target.value })
                }
                required
                />
            </div>
            </label>

            <div className="button-group rar">
              <button type="submit" className="rawr">
                Update Data
              </button>
              <button
                type="button"
                className="nooo"
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )  : null}

      <table className="data-table">
        <thead>
          <tr>
            <th>Location</th>
            <th>Cases</th>
            <th>Deaths</th>
            <th>Date</th>
            <th>Regions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPageData.map((data) => (
            <tr key={data.id}>
              <td>{data.location}</td>
              <td>{data.cases}</td>
              <td>{data.deaths}</td>
              <td>{data.date}</td>
              <td>{data.regions}</td>
              <td className="action-buttons">
                <button className="btn btn-edit" onClick={() => handleEdit(data)}>
                  Edit
                </button>
                <button className="btn btn-delete" onClick={() => handleDelete(data.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-buttons">
        <button className="prev-button" onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <div className="page-indicator">
          Page {currentPage} of {totalPages}
        </div>
        <button className="next-button" onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      <div className="chart-container">
        <h3>Comparison of Dengue Cases and Deaths</h3>
        <ResponsiveContainer width="100%" height={650}>
          <BarChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="location" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="cases" fill="#8884d8" />
            <Bar dataKey="deaths" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>

        <h3>Correlation Heatmap</h3>
        <Plot
          data={[heatmapData]}
          layout={{
            title: "Correlation Heatmap for Each Region",
            xaxis: {
              title: "Regions",
              tickangle: -45,
              tickfont: {
                size: 9, 
              },
              automargin: true,
            },
            yaxis: {
              title: "Regions",
              tickangle: -45,
              tickfont: {
                size: 9, 
              },
              automargin: true,
            },
            width: 800,   // Increased width for larger heatmap
            height: 700,  // Increased height for larger heatmap
            autosize: true,
          }}
        />

      </div>
    </div>
  );
};

export default DengueDataList;
