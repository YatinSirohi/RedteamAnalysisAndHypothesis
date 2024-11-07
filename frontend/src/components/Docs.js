import React from "react";

const Docs = () => {
  return (
    <div>
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          lineHeight: "1.6",
          color: "#333",
          backgroundColor: "#f9f9f9",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            color: " rgb(211, 17, 43)",
            fontSize: "24px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Setup Instructions
        </h2>
        <ol style={{ paddingLeft: "20px" }}>
          <li style={{ marginBottom: "15px" }}>
            Clone the code using the below command (Git must be installed):
            <pre
              style={{
                backgroundColor: "#e0e0e0",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <code>
                git clone
                https://github.com/YatinSirohi/RedteamAnalysisAndHypothesis.git
              </code>
            </pre>
          </li>
          <li style={{ marginBottom: "15px" }}>
            Run the below command to install the node modules:
            <pre
              style={{
                backgroundColor: "#e0e0e0",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <code>npm i</code>
            </pre>
          </li>
          <li style={{ marginBottom: "15px" }}>
            Run the below command to install Python packages (Pip and Python
            must be installed):
            <pre
              style={{
                backgroundColor: "#e0e0e0",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <code>
                pip install nmap json nvdlib pyxploitdb flask flask_cors nltk
              </code>
            </pre>
          </li>
          <li style={{ marginBottom: "15px" }}>
            Navigate to the folder ‘RedteamAnalysisAndHypothesis’ in VSCode.
          </li>
          <li style={{ marginBottom: "15px" }}>
            Create a split terminal from{" "}
            <strong>Terminal &gt; Split Terminal</strong>. You will need three
            terminals.
          </li>
          <li style={{ marginBottom: "15px" }}>
            In one terminal, navigate to the backend folder and run flask server
            using these commands:
            <pre
              style={{
                backgroundColor: "#e0e0e0",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <code>cd backend</code>
            </pre>
            <pre
              style={{
                backgroundColor: "#e0e0e0",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <code>flask run</code>
            </pre>
            In another terminal, navigate to the frontend folder and run web
            interface using these commands:
            <pre
              style={{
                backgroundColor: "#e0e0e0",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <code>cd frontend</code>
            </pre>
            <pre
              style={{
                backgroundColor: "#e0e0e0",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <code>npm start</code>
            </pre>
          </li>
          The web interface will open in the browser.
          <br />
          In a third terminal, navigate to{" "}
          <strong>backend &gt; Internal-Recon &gt; my_flask_app</strong> folder
          and run flask server using these commands:
          <pre
            style={{
              backgroundColor: "#e0e0e0",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <code>cd backend/Internal-Recon/my_flask_app</code>
          </pre>
          <pre
            style={{
              backgroundColor: "#e0e0e0",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <code>flask run</code>
          </pre>
        </ol>

        <h3
          style={{
            color: " rgb(211, 17, 43)",
            fontSize: "24px",
            marginTop: "30px",
          }}
        >
          Troubleshooting
        </h3>
        <p
          style={{
            backgroundColor: "#ffe4e1",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          If you face any error saying any Python module is not reachable,
          please try changing the Python interpreter.
        </p>
        <h3
          style={{
            color: " blue",
            fontSize: "24px",
            marginTop: "30px",
          }}
        >
          Important notes
        </h3>
        <p
          style={{
            backgroundColor: "#ffe4e1",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <li style={{ marginBottom: "15px" }}>
            Application works primarily for Windows machine.
          </li>
          <li style={{ marginBottom: "15px" }}>
            Application currently works for one IP Address.
          </li>
          <li style={{ marginBottom: "15px" }}>
            Make sure you have python, NodeJS installed in your system.
          </li>
        </p>
      </div>
    </div>
  );
};

export default Docs;
