import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ReconInt from "./components/ReconInt";
import ReconExt from "./components/ReconExt";
import RepresentState from "./components/RepresentState";
import AttackTree from "./components/AttackTree";
import Docs from "./components/Docs";
import Home from "./components/Home";
import Hypothesis from "./components/Hypothesis";
import ValidateHypothesis from "./components/ValidateHypothesis";

function App() {
  return (
    <>
      <Router>
        <div className="App">
          <Navbar />
          <div className="pages">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Docs" element={<Docs />} />
              <Route path="/ReconExt" element={<ReconExt />} />
              <Route path="/ReconInt" element={<ReconInt />} />
              <Route path="/RepresentState" element={<RepresentState />} />
              <Route path="/AttackTree" element={<AttackTree />} />
              <Route path="/Hypothesis" element={<Hypothesis />} />
              <Route
                path="/ValidateHypothesis"
                element={<ValidateHypothesis />}
              />
            </Routes>
          </div>
        </div>
      </Router>
    </>
  );
}

export default App;
