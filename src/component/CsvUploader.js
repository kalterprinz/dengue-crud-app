import React, { useState } from 'react';
import { db } from './firebase'; // Import Firebase configuration
import { collection, addDoc } from 'firebase/firestore';
import "./CsvUploader.css";

function CsvUploader() {
  const [csvFile, setCsvFile] = useState(null);

  const handleFileChange = (event) => {
    setCsvFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!csvFile) {
      alert("Please select a CSV file to upload.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split('\n');
      const data = [];

      // Parse CSV rows assuming columns: location, cases, deaths, date, regions
      rows.forEach((row, index) => {
        const columns = row.split(',');
        if (columns.length >= 5 && index > 0) { // Skip header row
          data.push({
            location: columns[0].trim(),
            cases: Number(columns[1].trim()),
            deaths: Number(columns[2].trim()),
            date: columns[3].trim(),
            regions: columns[4].trim(),
          });
        }
      });

      try {
        const batch = data.map(async (item) => {
          await addDoc(collection(db, 'dengueData'), item);
        });

        await Promise.all(batch);
        window.location.reload();
      } catch (error) {
        console.error('Error uploading CSV data:', error);
      }
    };

    reader.readAsText(csvFile);
  };

  return (
    <div className="csv-uploader">
      <h2>Upload CSV</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button className="upl" onClick={handleFileUpload}>Upload CSV</button>
    </div>
  );
}

export default CsvUploader;