import React, { useState } from "react";
import "./ValidateHypothesis.css";
import Loader from "./Loader";

const ValidateHypothesis = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("initial");
  const [hypodata, setHypoData] = useState(null);
  const [targetIP, setTargetIP] = useState("");
  const [cidr, setCidr] = useState("");
  const [validateHypothesis, setValidateHypothesis] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      // Ensuring the selected file is a JSON file
      if (selectedFile.type === "application/json") {
        setStatus("initial");
        setFile(selectedFile);
      } else {
        alert("Please select a valid JSON file.");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (file) {
      setStatus("uploading");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const result = await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });

        // const data = await result.json();

        console.log(result);
        setStatus("success");
      } catch (error) {
        console.error(error);
        setStatus("fail");
      }
    }
  };

  const fetchValidateHypotheses = async () => {
    setHypoData(null);
    setValidateHypothesis(true);
    try {
      const response = await fetch(
        `http://localhost:5000/reconext/validatehypotheses?target_ip=${targetIP}&cidr=${cidr}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const jsonData = await response.json();
      console.log(jsonData);
      setHypoData(jsonData);
    } catch (error) {
      console.log(error);
    }
    setValidateHypothesis(false);
  };

  return (
    <>
      <div className="container">
        <div>
          <h4 className="title">
            Upload a JSON log file to validate the vulnerability/exploit
            hypotheses with Windows logs
          </h4>
        </div>
        <div className="input-group">
          <input
            id="file"
            type="file"
            accept=".json"
            onChange={handleFileChange}
          />
        </div>
        {file && (
          <section>
            <strong>File details</strong>
            <ul>
              <li>Name: {file.name}</li>
              <li>Size: {file.size} bytes</li>
            </ul>
          </section>
        )}

        {file && (
          <button onClick={handleUpload} className="submit">
            Upload JSON file
          </button>
        )}
        <div className="upload-result">
          <Result status={status} />
        </div>
        {status === "success" && (
          <div>
            <section className="ip-details">
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
            </section>
            <button
              className="validate-submit"
              onClick={fetchValidateHypotheses}
            >
              Start hypotheses validation process
            </button>
            {validateHypothesis && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  position: "relative", // Change from fixed to relative
                  marginTop: "20px",
                }}
              >
                <Loader />
              </div>
            )}
          </div>
        )}
        {hypodata && (
          <div>
            {hypodata && (
              <div>
                {hypodata.map((item, i) => (
                  <section>
                    <li className="hypo-list" key={i}>
                      {/* Display the hypothesis string */}
                      <span className="hypo-item">
                        <strong style={{ color: "red" }}>HYPOTHESIS: </strong>
                        {item.Hypothesis.Hypothesis}
                      </span>

                      {/* Display matching keywords */}
                      <div className="hypo-item">
                        <strong>Matching Keywords: </strong>
                        {item.MatchingKeywords.join(", ")}
                      </div>

                      {/* Display matching logs */}
                      <div className="hypo-item">
                        <br />
                        <strong style={{ color: "blue" }}>MATCHING LOGS</strong>
                        {item.MatchingLogs.map((log, j) => (
                          <ul key={j}>
                            <li>
                              <strong style={{ color: "#e37b33" }}>
                                LOG {j + 1}
                              </strong>
                              <br />
                              <strong>Date and Time:</strong>{" "}
                              {log["Date and Time"]}
                            </li>
                            <li>
                              <strong>Description:</strong> {log.Description}
                            </li>
                            <li>
                              <strong>Event ID:</strong> {log["Event ID"]}
                            </li>
                            <li>
                              <strong>Level:</strong> {log.Level}
                            </li>
                            <li>
                              <strong>Source:</strong> {log.Source}
                            </li>
                            <li>
                              <strong>Task Category:</strong>{" "}
                              {log["Task Category"]}
                            </li>
                          </ul>
                        ))}
                      </div>
                    </li>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const Result = ({ status }) => {
  if (status === "success") {
    return <p>✅ File uploaded successfully!</p>;
  } else if (status === "fail") {
    return <p>❌ File upload failed!</p>;
  } else if (status === "uploading") {
    return <p>⏳ Uploading selected file...</p>;
  } else {
    return null;
  }
};

export default ValidateHypothesis;
