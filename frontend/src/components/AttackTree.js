import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Badge from 'react-bootstrap/Badge';
import "./AttackTree.css";
import Graph from "react-graph-vis";
import Loader from "./Loader";
import Alert from "react-bootstrap/Alert";

const AttackTree = () => {
  const [targetIP, setTargetIP] = useState("");
  const [cidr, setCidr] = useState("");
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [exploitGraphData, setExploitGraphData] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [grapherror, setGrapherror] = useState(false)

  const clearGraph = () => {
    setExploitGraphData(null);
    setLoadingGraph(false);
  };

  const fetchExploitData = async () => {
    if (!targetIP || !cidr) {
      console.log("Target IP and CIDR cannot be blank");
      setShowAlert(true);
      return;
    }

    setLoadingGraph(true);
    const response = await fetch(
      `http://localhost:5000/Reconext/exploit-graph?target_ip=${targetIP}&cidr=${cidr}`
    );
    if (response.ok) {
      const exploitData = await response.json();
      console.log("Exploit Graph data:", exploitData);
      setExploitGraphData(exploitData);
    } else {
      console.error("Failed to generate exploit graph:", response.statusText);
      setGrapherror(true)
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
  const nodeSet = new Set();

  if (exploitGraphData) {
    exploitGraphData.forEach((cveItem) => {
      const { cve_id, exploits } = cveItem;
      const cveNodeId = `CVE-${cve_id}`;

      if (!nodeSet.has(cveNodeId)) {
        nodes.push({
          id: cveNodeId,
          label: cve_id,
          color: "yellow",
        });
        nodeSet.add(cveNodeId);
      }

      exploits.forEach((exploit) => {
        const {
          id,
          description,
          platform,
          port,
          type,
          verified,
          link,
        } = exploit;
        const exploitNodeId = `Exploit-${id}`;

        if (!nodeSet.has(exploitNodeId)) {
          nodes.push({
            id: exploitNodeId,
            label: description,
            color: "lightblue",
          });
          nodeSet.add(exploitNodeId);
        }

        edges.push({
          from: cveNodeId,
          to: exploitNodeId,
          label: "Exploit",
        });

        const platformNodeId = `Platform-${id}`;
        if (!nodeSet.has(platformNodeId)) {
          nodes.push({
            id: platformNodeId,
            label: `${platform}`,
            color: "green",
          });
          nodeSet.add(platformNodeId);
        }

        edges.push({
          from: exploitNodeId,
          to: platformNodeId,
          label: "Platform",
        });

        const portNodeId = `Port-${id}`;
        if (!nodeSet.has(portNodeId)) {
          nodes.push({
            id: portNodeId,
            label: `${port}`,
            color: "orange",
          });
          nodeSet.add(portNodeId);
        }

        edges.push({
          from: exploitNodeId,
          to: portNodeId,
          label: "Port",
        });

        const typeNodeId = `Type-${id}`;
        if (!nodeSet.has(typeNodeId)) {
          nodes.push({
            id: typeNodeId,
            label: `${type}`,
            color: "purple",
          });
          nodeSet.add(typeNodeId);
        }

        edges.push({
          from: exploitNodeId,
          to: typeNodeId,
          label: "Type",
        });

        const verifiedNodeId = `Verified-${id}`;
        if (!nodeSet.has(verifiedNodeId)) {
          nodes.push({
            id: verifiedNodeId,
            label: `Verified: ${verified}`,
            color: "pink",
          });
          nodeSet.add(verifiedNodeId);
        }

        edges.push({
          from: exploitNodeId,
          to: verifiedNodeId,
          label: "Verified",
        });

        const linkNodeId = `Link-${id}`;
        if (!nodeSet.has(linkNodeId)) {
          nodes.push({
            id: linkNodeId,
            label: link,
            color: "orange",
          });
          nodeSet.add(linkNodeId);
        }

        edges.push({
          from: exploitNodeId,
          to: linkNodeId,
          label: "Link",
        });
      });
    });
  }

  return (
    <>
      <div className="center-container">
        <div className="graph-container">
          <h1 className="graph-title">Attack Tree Graphical Representation</h1>
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
              relationships between ports, vulnerabilities, exploits, etc.
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
          <Button
            type="submit"
            size="sm"
            onClick={fetchExploitData}
            style={{ marginLeft: "1vh", marginTop: "1vh" }}
          >
            Generate Exploit Graph
          </Button>
        </div>
        {loadingGraph && (
          <div>
            <Loader />
            <p style={{marginTop:"1rem"}}>Generating graph, please wait...</p>
          </div>
        )}
        {exploitGraphData && (
          <div className="graph">
            <Graph
              graph={{ nodes, edges }}
              options={graphOptions}
              style={{ height: "500px", width: "100%" }}
            />
          </div>
        )}
        {grapherror && <p>Cannot retreive data</p>}
        {exploitGraphData && (
          <div className="clear-button">
            <Button size="sm" variant="danger" onClick={clearGraph}>
              Clear Graph
            </Button>
          <p style={{marginTop:"2rem"}}>
          <Badge bg="success">NOTES:</Badge><br/>
            1. The above graph is for IP: {targetIP}.<br/>
            2. Please zoom to see each graph nodes.<br/>
            3. Each CVE is connected to exploits found in Offsec ExploitDB.<br/>
            4. CVE for which Exploits are not found are shown as separated graph nodes.<br/>
          </p>
          </div>
        )}
      </div>
    </>
  );
};

export default AttackTree;
