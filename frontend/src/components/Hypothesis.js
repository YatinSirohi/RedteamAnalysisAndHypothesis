import React from "react";
import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import "./Hypothesis.css";
import Loader from "./Loader";
import "./HypothesisLoader.css";

const Hypothesis = () => {
  const [targetIP, setTargetIP] = useState("");
  const [cidr, setCidr] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [hypothesisData, setHypothesisData] = useState(
    JSON.parse(localStorage.getItem("hypothesisData")) || null
  );
  const [gethypothesis, setGethypothesis] = useState(false);

  useEffect(() => {
    //to save the data locally
    localStorage.setItem("hypothesisData", JSON.stringify(hypothesisData));
  }, [hypothesisData]);

  const clearData = () => {
    setHypothesisData(null);
    setGethypothesis(false);
  };

  const fetchHypothesis = async () => {
    if (!targetIP || !cidr) {
      console.log("Target IP is empty");
      setShowAlert(true);
      return;
    }
    setGethypothesis(true);
    const response = await fetch(
      `http://localhost:5000/Reconext/hypothesis?target_ip=${targetIP}&cidr=${cidr}`
    );
    if (response.ok) {
      const data = await response.json();
      console.log("Hypothesis data:", data);
      setGethypothesis(false);
      setHypothesisData(data);
    } else {
      console.error("Failed to generate exploit graph:", response.statusText);
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
        {gethypothesis && (
          <div className="hypothesis-loader">
            <Loader />
            <p>Generating Hypotheses, please wait...</p>
          </div>
        )}
        {hypothesisData && (
          <div className="hypothesis-list">
            {hypothesisData.map((item, index) => (
              <div key={index} className="hypothesis-item">
                <strong>Hypothesis {index + 1}:</strong> {item.Hypothesis}
                <br />
                <br />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Hypothesis;
