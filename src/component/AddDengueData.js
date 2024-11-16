import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import "./AddDengueData.css";

const AddDengueData = () => {
  const [location, setLocation] = useState("");
  const [cases, setCases] = useState("");
  const [deaths, setDeaths] = useState("");
  const [date, setDate] = useState("");
  const [regions, setRegions] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "dengueData"), {
        location,
        cases: Number(cases),
        deaths: Number(deaths),
        date,
        regions,
      });
      setLocation("");
      setCases("");
      setDeaths("");
      setDate("");
      setRegions("");
      window.location.reload();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="add-dengue-data">
      <h2>Add Dengue Data</h2>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Location:
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </label>
        <label>
          Cases:
          <input
            type="number"
            value={cases}
            onChange={(e) => setCases(e.target.value)}
            required
          />
        </label>
        <label>
          Deaths:
          <input
            type="number"
            value={deaths}
            onChange={(e) => setDeaths(e.target.value)}
            required
          />
        </label>
        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <label>
          Regions:
          <input
            type="text"
            value={regions}
            onChange={(e) => setRegions(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary">Add Data</button>
      </form>
    </div>
  );
};

export default AddDengueData;
