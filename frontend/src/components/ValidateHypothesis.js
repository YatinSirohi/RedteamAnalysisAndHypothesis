import React, { useState } from "react";
import "./ValidateHypothesis.css";

const ValidateHypothesis = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("initial");

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      // Ensure the selected file is a JSON file
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

  return (
    <>
    <div className="container">
    <div>
        <h4 className="title">Upload a JSON log file to validate the vulnerability/exploit hypotheses with Windows logs</h4>
    </div>
      <div className="input-group">
        <input id="file" type="file" accept=".json" onChange={handleFileChange} />
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
      {status==="success" && (
        <div>
            <button className="validate-submit">
                Start hypotheses validation process
            </button>
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
