import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import "./AttackTree.css";
import Graph from "react-graph-vis";
import Loader from "./Loader";
import Alert from "react-bootstrap/Alert";
import "./Loader.css";

const AttackTree = () => {
  const [targetIP, setTargetIP] = useState(
    JSON.parse(localStorage.getItem("targetIP")) || ""
  );
  const [cidr, setCidr] = useState("");
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [exploitGraphData, setExploitGraphData] = useState(
    JSON.parse(localStorage.getItem("exploitGraphData")) || null
  );
  const [showAlert, setShowAlert] = useState(false);
  const [grapherror, setGrapherror] = useState(false);

  useEffect(() => {
    //to save the data locally
    localStorage.setItem("exploitGraphData", JSON.stringify(exploitGraphData));
  }, [exploitGraphData]);

  useEffect(() => {
    //to save the data locally
    localStorage.setItem("targetIP", JSON.stringify(targetIP));
  }, [targetIP]);

  const clearGraph = () => {
    setExploitGraphData(null);
    setLoadingGraph(false);
    setTargetIP("");
    setCidr("");
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
      setExploitGraphData(exploitData[0][targetIP]); // Adjusted for your data structure
    } else {
      console.error("Failed to generate exploit graph:", response.statusText);
      setGrapherror(true);
    }
    setLoadingGraph(false);
  };

  const graphOptions = {
    layout: {
      hierarchical: {
        enabled: true,
        levelSeparation: 200,
        nodeSpacing: 500,
      },
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
      const { CVE, Product, Service, Exploits } = cveItem;

      const cveNodeId = `CVE-${CVE}`;
      if (!nodeSet.has(cveNodeId)) {
        nodes.push({
          id: cveNodeId,
          label: CVE,
          color: "yellow",
        });
        nodeSet.add(cveNodeId);
      }

      const productNodeId = `Product-${CVE}`;
      if (!nodeSet.has(productNodeId)) {
        nodes.push({
          id: productNodeId,
          label: Product,
          color: "lightgreen",
        });
      }

      edges.push({
        from: cveNodeId,
        to: productNodeId,
        label: "Product",
      });

      // Create node for Service
      const serviceNodeId = `Service-${CVE}`;
      if (!nodeSet.has(serviceNodeId)) {
        nodes.push({
          id: serviceNodeId,
          label: Service,
          color: "lightblue",
        });
      }

      edges.push({
        from: cveNodeId,
        to: serviceNodeId,
        label: "Service",
      });

      // Process exploits if they exist
      Exploits.forEach((exploit) => {
        const {
          "Exploit ID": id,
          "Exploit Description": exploitDescription,
          Link,
          Type,
        } = exploit;
        const exploitNodeId = `Exploit-${id}`;

        // Create exploit node
        if (!nodeSet.has(exploitNodeId)) {
          nodes.push({
            id: exploitNodeId,
            label: exploitDescription,
            color: "orange",
          });
          nodeSet.add(exploitNodeId);
        }

        edges.push({
          from: cveNodeId,
          to: exploitNodeId,
          label: "Exploit",
        });

        // Create node for Link
        const linkNodeId = `Link-${id}`;
        if (!nodeSet.has(linkNodeId)) {
          nodes.push({
            id: linkNodeId,
            label: Link,
            color: "red",
          });
          nodeSet.add(linkNodeId);
        }

        edges.push({
          from: exploitNodeId,
          to: linkNodeId,
          label: "Link",
        });

        const typeNodeId = `Type-${id}`;
        nodes.push({
          id: typeNodeId,
          label: Type,
          color: "#8a8d64",
        });

        edges.push({
          from: exploitNodeId,
          to: typeNodeId,
          label: "Type",
        });
      });
    });
  }

  return (
    <>
      <div className="center-container">
        {!exploitGraphData && (
          <div className="graph-container">
            <h1 className="graph-title">
              Attack Tree Graphical Representation
            </h1>
            {showAlert && (
              <Alert
                variant="danger"
                onClose={() => setShowAlert(false)}
                dismissible
              >
                <Alert.Heading>
                  Target IP and CIDR cannot be blank
                </Alert.Heading>
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
              style={{ marginLeft: "1vh" }}
            >
              Generate Exploit Graph
            </Button>
          </div>
        )}
        {loadingGraph && (
          <div className="loader-container">
            <Loader />
          </div>
        )}
        {exploitGraphData && (
          <div style={{ marginTop: "15rem" }} className="graph">
            <Graph
              graph={{ nodes, edges }}
              options={graphOptions}
              style={{ height: "800px", width: "100%" }}
            />
          </div>
        )}
        {grapherror && <p>Cannot retreive data</p>}
        {exploitGraphData && (
          <div className="clear-button">
            <Button size="sm" variant="danger" onClick={clearGraph}>
              Clear Graph
            </Button>
            <p style={{ marginTop: "2rem", alignItems: "center" }}>
              <Badge bg="success">NOTES:</Badge>
              <br />
              1. The above graph is for IP: {targetIP}.<br />
              2. Please zoom to see each graph nodes.
              <br />
              3. Each CVE is connected to exploits found in Offsec ExploitDB.
              <br />
              4. CVE for which Exploits are not found are shown as separated
              graph nodes.
              <br />
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default AttackTree;
