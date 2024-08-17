import React, { useState }  from 'react'
import Button from "react-bootstrap/Button";
import "./AttackTree.css";
import Graph from "react-graph-vis";
import Loader from "./Loader";
import Alert from "react-bootstrap/Alert";

const RepresentState = () => {
  const [targetIP, setTargetIP] = useState("");
  const [cidr, setCidr] = useState("");
  const [graphData, setGraphData] = useState(null);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const clearGraph = () => {
    setGraphData(null);
    setLoadingGraph(false);
  };

  const fetchData = async () => {
    //for state representation graph
    if (!targetIP || !cidr) {
      console.log("Target IP and CIDR cannot be blank");
      setShowAlert(true);
      return;
    }

    setLoadingGraph(true);
    const response = await fetch(
      `http://localhost:5000/Reconext/graph?target_ip=${targetIP}&cidr=${cidr}`
    );
    if (response.ok) {
      const data = await response.json();
      console.log("Graph data:", data);
      setGraphData(data);
    } else {
      console.error("Failed to generate graph:", response.statusText);
    }
    setLoadingGraph(false);
  };

  const graphOptions = {
    layout: {
      hierarchical: "grid",
    },
    edges: {
      arrows: "to",
      smooth: true,
    },
    physics: {
      enabled: true,
    },
  };

  const nodes = [];
  const edges = [];

  if (graphData) {
    graphData.forEach((hostInfo) => {
      const { IP_Address, Host_Status, Ports } = hostInfo;
      nodes.push({ id: IP_Address, label: IP_Address, color: "brown" });
      nodes.push({ id: Host_Status, label: Host_Status, color: "green" });
      edges.push({ from: IP_Address, to: Host_Status, label: "Host Status" });
      Ports.forEach((port) => {
        const { Port, State, Service, Product, Version } = port;
        const portId = `${IP_Address}-${Port}`;
        nodes.push({ id: portId, label: `Port ${Port}`, color: "orange" });
        edges.push({ from: IP_Address, to: portId, label: "Has Port" });
        if (State !== undefined) {
          nodes.push({ id: `state-${portId}`, label: State });
          edges.push({
            from: portId,
            to: `state-${portId}`,
            label: "Has State",
          });
        } else {
          nodes.push({ id: `state-${portId}`, label: "N/A" });
          edges.push({
            from: portId,
            to: `state-${portId}`,
            label: "Has State",
          });
        }
        if (Service !== undefined) {
          nodes.push({ id: `service-${portId}`, label: Service });
          edges.push({
            from: portId,
            to: `service-${portId}`,
            label: "Has Service",
          });
        } else {
          nodes.push({ id: `service-${portId}`, label: "N/A" });
          edges.push({
            from: portId,
            to: `service-${portId}`,
            label: "Has Service",
          });
        }
        if (Product !== undefined) {
          nodes.push({
            id: `product-${portId}`,
            label: Product,
            color: "yellow",
          });
          edges.push({
            from: portId,
            to: `product-${portId}`,
            label: "Has Product",
          });
        } else {
          nodes.push({ id: `product-${portId}`, label: "N/A" });
          edges.push({
            from: portId,
            to: `product-${portId}`,
            label: "Has Product",
          });
        }
        if (Version !== undefined) {
          nodes.push({ id: `version-${portId}`, label: Version });
          edges.push({
            from: portId,
            to: `version-${portId}`,
            label: "Has Version",
          });
        } else {
          nodes.push({ id: `version-${portId}`, label: "N/A" });
          edges.push({
            from: portId,
            to: `version-${portId}`,
            label: "Has Version",
          });
        }
      });
    });
  }

  return (
    <>
      <div className="center-container">
        <div className="graph-container">
          <h1 className="graph-title">State Graphical Representation</h1>
          {showAlert && (
            <Alert
              variant="danger"
              onClose={() => setShowAlert(false)}
              dismissible
            >
              <Alert.Heading>Target IP and CIDR cannot be blank</Alert.Heading>
              <p>Please enter target IP and CIDR and try again!</p>
            </Alert>
          )}
          <p>
            <strong>
              Enter the IP address and CIDR to generate the graph having
              relationships between ports, vulnerabilities, services, etc.
            </strong>
          </p>
          <input
            type="text"
            value={targetIP}
            onChange={(e) => setTargetIP(e.target.value)}
            placeholder="Enter target IP"
          />
          <text>
            <strong> /</strong>
          </text>
          <input
            style={{ marginLeft: "1vh" }}
            type="number"
            value={cidr}
            onChange={(e) => setCidr(e.target.value)}
            placeholder="Enter CIDR"
          />
          <Button type="submit" size="sm" onClick={fetchData}>
            Generate Graph
          </Button>
        </div>
        {loadingGraph && (
          <div>
            <Loader />
          </div>
        )}
        {(graphData) && (
          <div className="graph">
            <Graph
              graph={{ nodes, edges }}
              options={graphOptions}
              style={{ height: "500px", width: "100%" }}
            />
          </div>
        )}
        {(graphData) && (
          <div className="clear-button">
            <Button size="sm" variant="danger" onClick={clearGraph}>
              Clear Graph
            </Button>
          </div>
        )}
      </div>
    </>
  );
};


export default RepresentState
