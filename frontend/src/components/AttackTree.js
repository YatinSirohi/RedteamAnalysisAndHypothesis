import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import "./AttackTree.css";
import Graph from "react-graph-vis";
import Loader from "./Loader";
import Alert from "react-bootstrap/Alert";

const AttackTree = () => {
  const [targetIP, setTargetIP] = useState("");
  const [cidr, setCidr] = useState("");
  const [graphData, setGraphData] = useState(null);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [exploitGraphData, setExploitGraphData] = useState(null);

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

  const fetchExploitData = async () => {
    //For exploit graph
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
  const nodeSet = new Set();

  if (exploitGraphData) {
    exploitGraphData.forEach((exploitItem) => {
      const {
        id,
        cve_id,
        description,
        type,
        platform,
        verified,
        port,
        link,
      } = exploitItem;
      const exploitId = targetIP;

      if (!nodeSet.has(exploitId)) {
        nodes.push({
          id: exploitId,
          label: targetIP,
          color: "red",
        });
        nodeSet.add(exploitId);
      }

      if (!nodeSet.has(`CVE-${cve_id}-${id}`)) {
        nodes.push({
          id: `CVE-${cve_id}-${id}`,
          label: cve_id,
          color: "yellow",
        });
        nodeSet.add(`CVE-${cve_id}-${id}`);
      }

      edges.push({
        from: exploitId,
        to: `CVE-${cve_id}-${id}`,
        label: "CVE",
      });

      if (!nodeSet.has(`description-${id}`)) {
        nodes.push({ id: `description-${id}`, label: description });
        nodeSet.add(`description-${id}`);
      }

      edges.push({
        from: `CVE-${cve_id}-${id}`,
        to: `description-${id}`,
        label: "Description",
      });

      if (!nodeSet.has(`type-${id}`)) {
        nodes.push({ id: `type-${id}`, label: type });
        nodeSet.add(`type-${id}`);
      }

      edges.push({
        from: `CVE-${cve_id}-${id}`,
        to: `type-${id}`,
        label: "Type",
      });

      if (!nodeSet.has(`platform-${id}`)) {
        nodes.push({ id: `platform-${id}`, label: platform });
        nodeSet.add(`platform-${id}`);
      }

      edges.push({
        from: `CVE-${cve_id}-${id}`,
        to: `platform-${id}`,
        label: "Platform",
      });

      if (!nodeSet.has(`verified-${id}`)) {
        nodes.push({
          id: `verified-${id}`,
          label: verified !== undefined ? verified.toString() : "N/A",
        });
        nodeSet.add(`verified-${id}`);
      }

      edges.push({
        from: `CVE-${cve_id}-${id}`,
        to: `verified-${id}`,
        label: "Verified",
      });

      if (!nodeSet.has(`port-${id}`)) {
        nodes.push({
          id: `port-${id}`,
          label: port !== undefined ? port.toString() : "N/A",
        });
        nodeSet.add(`port-${id}`);
      }

      edges.push({
        from: `CVE-${cve_id}-${id}`,
        to: `port-${id}`,
        label: "Port",
      });

      if (!nodeSet.has(`link-${id}`)) {
        nodes.push({ id: `link-${id}`, label: link });
        nodeSet.add(`link-${id}`);
      }

      edges.push({
        from: `CVE-${cve_id}-${id}`,
        to: `link-${id}`,
        label: "Link",
      });
    });
  }

  return (
    <>
      <div className="center-container">
        <div className="graph-container">
          <h1 className="graph-title">Graphical Representation</h1>
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
          <Button type="submit" size="sm" onClick={fetchData}>
            Generate Graph
          </Button>
          <Button
            type="submit"
            size="sm"
            variant="warning"
            onClick={fetchExploitData}
            style={{ marginLeft: "1vh", marginTop: "1vh" }}
          >
            Generate Exploit Graph
          </Button>
        </div>
        {loadingGraph && (
          <div>
            <Loader />
          </div>
        )}
        {(graphData || exploitGraphData) && (
          <div className="graph">
            <Graph
              graph={{ nodes, edges }}
              options={graphOptions}
              style={{ height: "500px", width: "100%" }}
            />
          </div>
        )}
        {(graphData || exploitGraphData) && (
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

export default AttackTree;

//Below code is for neo4j graph generation--- Not using
// import React, { useState } from "react";
// import Button from "react-bootstrap/Button";
// import "./AttackTree.css";

// const AttackTree = () => {
//   const [targetIP, setTargetIP] = useState("");
//   const [cidr, setCidr] = useState("");

//   const fetchData = async () => {
//     const response = await fetch(
//       `http://localhost:5000/Reconext/Neo4j?target_ip=${targetIP}&cidr=${cidr}`
//     );
//     if (response.ok) {
//       console.log("Graph generated successfully!");
//     } else {
//       console.error("Failed to generate graph:", response.statusText);
//     }
//   };

//   return (
//     <>
//       <div className="center-container">
//         <div className="graph-container">
//           <h1 className="graph-title">Graphical representation</h1>
//           <p>
//             <strong>
//               Enter the IP address and CIDR to generate the graph having
//               relationships between ports, vulnerabality, exploits etc
//             </strong>
//           </p>
//           <input
//             type="text"
//             value={targetIP}
//             onChange={(e) => setTargetIP(e.target.value)}
//             placeholder="Enter target IP"
//           />
//           <text>
//             <strong> /</strong>
//           </text>
//           <input
//             style={{ marginLeft: "1vh" }}
//             type="number"
//             value={cidr}
//             onChange={(e) => setCidr(e.target.value)}
//             placeholder="Enter CIDR"
//           />
//           <Button type="submit" size="sm" onClick={fetchData}>
//             Generate Graph
//           </Button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default AttackTree;
