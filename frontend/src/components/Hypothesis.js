import React from "react";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import "./Hypothesis.css";

const Hypothesis = () => {
  const [targetIP, setTargetIP] = useState("");
  const [cidr, setCidr] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const clearData = () => {
    return;
  };

  const fetchHypothesis = () => {
    if (!targetIP || !cidr) {
      console.log("Target IP is empty");
      setShowAlert(true);
      return;
    }
  };

  return (
    <>
      <div className="hypothesis-container">
        <h1 className="hypothesis-title">Hypothesis</h1>
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
            To generate hypothesis of possible compromise on the system, please
            enter target IP address and CIDR below. For example:
            192.168.xx.xx/24. <br />
            <Badge bg="warning" text="dark">
              IMPORTANT:
            </Badge>{" "}
            Make sure the IP address you are adding is available to your system
            (You can try pinging the target IP).
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
        <Button type="submit" size="sm" onClick={fetchHypothesis}>
          Start Generating Hypothesis
        </Button>
        <Button variant="danger" size="sm" onClick={clearData}>
          Clear data
        </Button>
      </div>
    </>
  );
};

export default Hypothesis;
