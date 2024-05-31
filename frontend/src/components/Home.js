import React from "react";

const Home = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", paddingTop: "5vh", paddingLeft: "5em", paddingRight: "5em", maxWidth: "100%", overflow: "auto" }}>
      <div style={{ padding: "40px", border: "4mm ridge rgba(50, 211, 220, .6)" }}>
        <p>
          The aim of the project is to use red-teams and context information to
          enable the generation of potential methods that were used to compromise
          a system/network. The project will involve two major tasks:
          <br />
          <br />
          <strong>Red-Team Based Analysis:</strong> Attackers use a wide range of
          tools to analyze targets to ensure that they have the best chance of
          achieving their goals. These tools are very effective at identifying
          gaps and weaknesses in cyber defenses and commonly provide very detailed
          local-context information that is then used to determine the best avenue
          to attack a target. This gives the attackers an advantage of blue-team
          (defense) tools that are designed from a general security perspective
          and rarely take into account the local context information (such as
          blocking ports that are used by applications without understanding how
          the applications work). We will use machine learning to learn the key
          context information from the target asset based on the output of
          dedicated hacker tools (such as Bloodhound), information that will be
          then used to drive the forensic investigation.
          <br />
          <br />
          <strong>Automated-Hypotheses-Generation-and-Validation:</strong> This
          task will use the information generated from the Red-Team Based Analysis
          task to generate a list of possible breach hypotheses that supported by
          the evidence collected from the target asset. Moreover, the data
          extracted from both the target asset and the intelligence feeds will be
          re-organized to enable a faster investigation as it will be tied in to
          the hypotheses generated. This task will involve an iterative process:
          first, the context knowledge will be used to determine whether or not
          any of the learned classes of attacks derived previously are applicable.
          Next, a more detailed analysis will be undertaken that uses low-level
          specific target asset information (such as IoCs) to identify which
          hypotheses, if any, are supported by the low-level evidence. The key
          difference of the project is that unlike the standard forensics approach
          that is user initiated, in this the investigation will be local context
          driven with the investigator being required to double check the
          framework identified breach explanations (hypotheses).
        </p>
      </div>
    </div>
  );
};

export default Home;
