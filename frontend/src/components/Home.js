import React from "react";

const Home = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: "5vh",
        paddingLeft: "5em",
        paddingRight: "5em",
        maxWidth: "100%",
        overflow: "auto",
      }}
    >
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          lineHeight: "1.6",
          color: "#333",
          backgroundColor: "#f9f9f9",
          padding: "20px",
          border: "4mm ridge rgba(50, 211, 220, .6)",
        }}
      >
        <p>
          The aim of this application is to use red-teams and context information to
          enable the generation of potential methods that were used to
          compromise a system/network. The application performs two major tasks:
          <br />
          <br />
          <strong>Red-Team Based Analysis:</strong> Attackers use a wide range
          of tools to analyze targets to ensure that they have the best chance
          of achieving their goals. These tools are very effective at
          identifying gaps and weaknesses in cyber defenses and commonly provide
          very detailed local-context information that is then used to determine
          the best avenue to attack a target. This gives the attackers an
          advantage of blue-team (defense) tools that are designed from a
          general security perspective and rarely take into account the local
          context information (such as blocking ports that are used by
          applications without understanding how the applications work). This
          application uses Nmap to find potential open ports and vulnerabilities
          in the services running on those ports, and then find potential
          exploits available in ExploitDb.
          <br />
          <br />
          <strong>Hypotheses Generation and Validation:</strong> This
          application uses the information generated from the Red-Team Based
          Analysis task to generate a list of possible breach hypotheses,
          supported by the evidence collected from the target machine. Every
          vulnerability found becomes one attack surface and hence it's
          considered as one hypothesis of exploit. These hypotheses are matched
          with event logs to validate how an attack might have happened. For
          this, well known offensive cyber security keywords are matched with
          the windows event logs.
        </p>
      </div>
    </div>
  );
};

export default Home;
