import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from "react-leaflet";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import "./MapData.css";
import philippineData from './../data/ph.json';
import "leaflet/dist/leaflet.css";

const MapData = () => {
    const [dengueData, setDengueData] = useState([]);
    const [geoJsonData, setGeoJsonData] = useState(philippineData);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dengueCollection = collection(db, "dengueData");
                const dengueSnapshot = await getDocs(dengueCollection);
                const dataList = dengueSnapshot.docs.map((doc) => ({
                    region: doc.data().regions,
                    cases: doc.data().cases
                }));

                // Combine cases from the same region
                const aggregatedData = dataList.reduce((acc, curr) => {
                    const region = curr.region;
                    if (acc[region]) {
                        acc[region] += curr.cases;
                    } else {
                        acc[region] = curr.cases;
                    }
                    return acc;
                }, {});

                const aggregatedList = Object.keys(aggregatedData).map(region => ({
                    region,
                    cases: aggregatedData[region]
                }));

                setDengueData(aggregatedList);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        fetchData();
    }, []);

    const getColor = (cases) => {
        return cases > 100000 ? '#800026' : // Deep red
               cases > 90000  ? '#BD0026' : // Strong red
               cases > 80000  ? '#E31A1C' : // Bright red
               cases > 70000  ? '#FF4D1A' : // Bright reddish-orange
               cases > 60000  ? '#FF6F3C' : // Bright orange
               cases > 50000  ? '#FF924A' : // Vivid orange
               cases > 40000  ? '#FFB566' : // Bright light orange
               cases > 30000  ? '#FFDA80' : // Bright pale orange
               cases > 20000  ? '#FFF200' : // Bright yellow
               cases > 10000  ? '#FFEB00' : // Vivid yellow
                                '#FFE500';  // Warm bright yellow
    };

    const normalizeString = (str) => str.toUpperCase().trim();

    const styleFeature = (feature) => {
        const regionName = normalizeString(feature.properties.name);
        const regionData = dengueData.find(data => normalizeString(data.region) === regionName);
        const cases = regionData ? regionData.cases : 0;
        return {
            fillColor: getColor(cases),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    };

    const onEachFeature = (feature, layer) => {
        const regionName = normalizeString(feature.properties.name);
        const regionData = dengueData.find(data => normalizeString(data.region) === regionName);
        const cases = regionData ? regionData.cases : 0;
        layer.bindTooltip(
            `<strong>${feature.properties.name}</strong><br>Cases: ${cases}`,
            { direction: "center", className: "custom-tooltip", permanent: false }
        );
    };

    return (
        <div className="map-container">
            <h1>Philippines Dengue Cases Choropleth Map</h1>
            <MapContainer 
                center={[12.8797, 121.7740]}
                zoom={6}
                className="leaflet-container"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
                />
                {dengueData.length > 0 && (
                    <GeoJSON 
                        data={geoJsonData}
                        style={styleFeature}
                        onEachFeature={onEachFeature}
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default MapData;
