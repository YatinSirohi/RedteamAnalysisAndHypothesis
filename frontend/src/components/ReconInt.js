import React from "react";
import Button from "react-bootstrap/Button";
import "./ReconInt.css";

const ReconInt = () => {
  const openReconInt = async () => {
    try {
      window.open("http://localhost:5001/", "_blank");
    } catch (error) {
      console.error("Error opening:", error);
    }
  };

  return (
    <div>
      <div className="instructions-container">
        <h1 className="h1-heading">Recon-Internal</h1>
        <Button
          className="open-terminal-btn"
          type="submit"
          size="sm"
          onClick={openReconInt}
        >
          Start Internal-Recon
        </Button>
        <p
          style={{
            display: "inline-block",
            marginLeft: "10px",
            verticalAlign: "middle",
            fontSize: "17px",
            color: "#333",
          }}
        >
          <strong>
            NOTE: Please read the instructions below to use internal-recon module. Click on the button to open the module
          </strong>
        </p>

        <h1 className="sub-heading">1. Recon-internal Module</h1>
        <ul>
          <li>
            <strong>InternalRecon.py</strong>: Python script to perform internal
            reconnaissance in an Active Directory network.
          </li>
          <ul>
            <li>
              <strong>Required Python Packages:</strong> argparse, getpass,
              subprocess
            </li>
            <li>
              <strong>External Tools:</strong>
              <ul>
                <li>Impacket (GetUserSPNs.py) – For Kerberoasting</li>
                <li>
                  BloodHound (bloodhound-python) – For Active Directory
                  enumeration
                </li>
                <li>CrackMapExec – For SMB enumeration</li>
                <li>
                  nxc – Network reconnaissance tool for checks like LDAP
                  signing, ZeroLogon, and noPAC
                </li>
              </ul>
            </li>
            <li>
              <strong>Access to Domain Controller (DC):</strong> Requires valid
              credentials (username, password, domain, dc_ip).
            </li>
            <li>
              <strong>Command to Run:</strong>
              <pre style={{ backgroundColor: "#e0e0e0", padding: "10px", borderRadius: "5px" }}>
                <code>python3 InternalRecon.py -u &lt;username&gt; -p &lt;password&gt;
                -d &lt;domain&gt; -i &lt;dc_ip&gt; -s &lt;scope&gt;</code>
              </pre>
            </li>
          </ul>

          <li>
            <strong>Internalrecon_output.txt</strong>: Output from
            InternalRecon.py
          </li>
          <li>
            <strong>text_to_json_output.py</strong>: Converts text output to
            JSON format.
          </li>
          <li>
            <strong>InternalReconOutput.json</strong>: Final reconnaissance
            output in JSON format.
          </li>
        </ul>

        <h1 className="sub-heading">2. Hypothesis-generation Module</h1>
        <ul>
          <li>
            <strong>HypothesesGenerator.py</strong>: Generates hypotheses based
            on internal reconnaissance data.
          </li>
          <li>
            <strong>Inputs:</strong> InternalReconOutput.json, MITREattack.json
          </li>
          <li>
            <strong>MITREattack.json</strong>: Contains a list of attack
            techniques from the MITRE ATT&CK framework.
          </li>
          <li>
            <strong>hypotheses_output.json</strong>: Generated hypotheses,
            including evidence, MITRE techniques, severity, etc.
          </li>
        </ul>

        <h1 className="sub-heading">3. Hypothesis-validation Module</h1>
        <ul>
          <li>
            <strong>validation.py</strong>: Validates security hypotheses using
            log data.
          </li>
          <li>
            <strong>Inputs:</strong> hypotheses_output.json,
            MITREattack_eventid.json, logSummary.csv
          </li>
          <li>
            <strong>Outputs:</strong> updated_hypotheses.json – validated
            hypotheses with log-based evidence.
          </li>
        </ul>

        <h1 className="sub-heading">4. Hypothesis-ranking Module</h1>
        <ul>
          <li>
            <strong>Ranking.py</strong>: Ranks hypotheses based on severity,
            criticality, and evidence.
          </li>
          <li>
            <strong>Outputs:</strong>{" "}
            updated_hypotheses_with_scores_and_ranks.json – final hypotheses
            with ranking details.
          </li>
        </ul>

        <h1 className="sub-heading">
          5. BloodHound Enumeration & Attack Tree Module
        </h1>
        <ul>
          <li>
            <strong>BloodHound_Enumeration</strong>: JSON files from BloodHound
            enumeration.
          </li>
          <li>
            <strong>BloodHound_AttackTree</strong>: Files containing images and
            JSON from BloodHound analysis.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ReconInt;
