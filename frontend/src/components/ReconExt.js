import React, { useState, useEffect } from "react";
import "./Reconext.css";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

const ReconExt = () => {
  const [data, setData] = useState(
    JSON.parse(localStorage.getItem("data")) || null
  );
  const [cveData, setCveData] = useState(
    JSON.parse(localStorage.getItem("cveData")) || null
  );
  const [exploitData, setExploitData] = useState(
    JSON.parse(localStorage.getItem("exploitData")) || null
  );
  const [targetIP, setTargetIP] = useState("");
  const [cidr, setCidr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showCveButton, setShowCveButton] = useState(false);
  const [fetchingCve, setFetchingCve] = useState(false);
  const [showExploitButton, setShowExploitButton] = useState(false);
  const [fetchingExploit, setFetchingExploit] = useState(false);

  useEffect(() => {
    //to save the data locally
    localStorage.setItem("data", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem("cveData", JSON.stringify(cveData));
  }, [cveData]);

  useEffect(() => {
    localStorage.setItem("exploitData", JSON.stringify(exploitData));
  }, [exploitData]);

  const cleardata = () => {
    setData(null);
    setCveData(null);
    setShowExploitButton(false);
    setFetchingExploit(false);
    setExploitData(null);
    setShowCveButton(false);
  };

  const fetchData = async () => {
    if (!targetIP || !cidr) {
      console.log("Target IP is empty");
      setShowAlert(true);
      return;
    }

    setLoading(true);
    setShowCveButton(false);
    setFetchingCve(false);
    setCveData(null);
    setShowExploitButton(false);
    setFetchingExploit(false);
    setExploitData(null);
    try {
      const response = await fetch(
        `http://localhost:5000/Reconext?target_ip=${targetIP}&cidr=${cidr}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const jsonData = await response.json();
      const parsedData = JSON.parse(jsonData.content);
      console.log(parsedData);
      setData({ content: parsedData });
      setShowCveButton(true);
      setCveData(null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCveData = async () => {
    setCveData(false);
    setFetchingCve(true); // Set fetchingCve to true when fetching CVE data
    setShowExploitButton(false);
    setFetchingExploit(false);
    setExploitData(null);

    try {
      const response = await fetch(
        `http://localhost:5000/Reconext/Cve?target_ip=${targetIP}&cidr=${cidr}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const jsonData = await response.json();
      const parsedData = JSON.parse(jsonData.cve);
      console.log(parsedData);
      setCveData({ cve: parsedData });
    } catch (error) {
      console.log(error);
    } finally {
      setFetchingCve(false); // Set fetchingCve back to false when the request completes
      setShowExploitButton(true);
    }
  };

  const fetchExploitData = async () => {
    setExploitData(false);
    setFetchingExploit(true);

    try {
      const response = await fetch(
        `http://localhost:5000/Reconext/Exploit?target_ip=${targetIP}&cidr=${cidr}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const jsonData = await response.json();
      const parsedExploitData = JSON.parse(jsonData.exploit[0]);
      console.log(parsedExploitData);
      setExploitData({ exploit: parsedExploitData });
    } catch (error) {
      console.log(error);
    } finally {
      setFetchingExploit(false);
    }
  };

  return (
    <>
      <div className="reconext-container">
        <h1 className="reconext-title">Recon External</h1>
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
          Begin Nmap scan
        </Button>
        <Button variant="danger" size="sm" onClick={cleardata}>
          Clear data
        </Button>
        {loading ? (
          <p>
            <strong>Performing Scan on {targetIP} using nmap...</strong>
          </p>
        ) : data && data.content && data.content.length > 0 ? (
          data.content.map((item, index) => (
            <div key={index} className="reconext-item">
              <p>
                <strong>IP Address: </strong>
                {item.IP_Address}
              </p>
              <p>
                <strong>Host Status: </strong>
                {item.Host_Status}
              </p>
              <p>
                <strong>Ports:</strong>
              </p>
              <ul>
                {item.Ports.map((port, index) => (
                  <li key={index}>
                    <p>Port: {port.Port}</p>
                    <p>State: {port.State}</p>
                    <p>Service: {port.Service}</p>
                    <p>Product: {port.Product}</p>
                    <p>Version: {port.Version}</p>
                  </li>
                ))}
              </ul>
              <p>
                <strong>OS CPE: </strong>
                {item.OS_CPE}
              </p>
              <p>
                <strong>Aggressive OS guesses:</strong>
              </p>
              <ul>
                {item.Aggressive_OS_guesses.map((guess, index) => (
                  <li key={index}>
                    <p>Type: {guess.type}</p>
                    <p>Vendor: {guess.vendor}</p>
                    <p>OS Family: {guess.osfamily}</p>
                    <p>OS Generation: {guess.osgen}</p>
                    <p>Accuracy: {guess.accuracy}</p>
                    <p>CPE: {guess.cpe.join(", ")}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : null}
        {showCveButton && (
          <div className="cve-details">
            {!fetchingCve ? (
              <p>
                <strong>
                  Click the below button to get CVE of the above scanned IP
                  address
                </strong>
              </p>
            ) : (
              <p className="loading-message">
                <strong>Getting CVE. Please wait...</strong>
              </p>
            )}
            <Button
              style={{ marginTop: "2vh" }}
              type="submit"
              size="sm"
              onClick={fetchCveData}
            >
              Get CVE
            </Button>
          </div>
        )}
        {cveData && cveData.cve && cveData.cve.length > 0 ? (
          <div className="cve-data">
            <h2 className="cve-header">CVE Details:</h2>
            <ul>
              {cveData.cve.map((cveItem, index) => (
                <li key={index}>
                  <strong>ID:</strong> {cveItem.id}
                  <br />
                  <strong>Published:</strong> {cveItem.published}
                  <br />
                  <strong>Last Modified:</strong> {cveItem.lastModified}
                  <br />
                  <strong>Vulnerability Status:</strong> {cveItem.vulnStatus}
                  <br />
                  <strong>Score:</strong> {cveItem.score.join(", ")}
                  <br />
                  <strong>Description:</strong> {cveItem.description}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {showExploitButton && (
          <div className="exploit-details">
            {!fetchingExploit ? (
              <p>
                <strong>
                  Click the below button to get Exploits of the above CVEs found
                </strong>
              </p>
            ) : (
              <p className="loading-message">
                <strong>Getting Exploits. Please wait...</strong>
              </p>
            )}
            <Button
              style={{ marginTop: "2vh" }}
              type="submit"
              size="sm"
              onClick={fetchExploitData}
            >
              Get Exploits
            </Button>
          </div>
        )}
        {exploitData && exploitData.exploit ? (
          <div className="exploit-data">
            <h2 className="exploit-header">Exploit Details:</h2>
            <ul>
              {Object.entries(exploitData.exploit).map(
                ([cveId, exploitItem], index) => (
                  <li key={index}>
                    <strong>CVE:</strong> {cveId || "N/A"}
                    <br />
                    <strong>Product:</strong> {exploitItem.product || "N/A"}
                    <br />
                    <strong>Service:</strong> {exploitItem.service || "N/A"}
                    <br />
                    <strong>Description:</strong>{" "}
                    {exploitItem.description || "N/A"}
                    <br />
                    {/* Check if there are any exploits for this CVE */}
                    {exploitItem.exploits &&
                    Object.keys(exploitItem.exploits).length > 0 ? (
                      <div>
                        <h5 style={{ color: "red" }}>
                          <strong>Exploits:</strong>
                        </h5>
                        {Object.entries(exploitItem.exploits).map(
                          ([exploitId, details]) => (
                            <div key={exploitId}>
                              <strong>Exploit ID:</strong> {details.id || "N/A"}
                              <br />
                              <strong>Description:</strong>{" "}
                              {details.description || "N/A"}
                              <br />
                              <strong>Type:</strong> {details.type || "N/A"}
                              <br />
                              <strong>Platform:</strong>{" "}
                              {details.platform || "N/A"}
                              <br />
                              <strong>Verified:</strong>{" "}
                              {details.verified === 1 ? "Yes" : "No"}
                              <br />
                              <strong>Port:</strong> {details.port || "N/A"}
                              <br />
                              <strong>Link:</strong>{" "}
                              <a
                                href={details.link || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {details.link || "N/A"}
                              </a>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div>
                        <strong>No exploits found for this CVE.</strong>
                      </div>
                    )}
                  </li>
                )
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default ReconExt;
