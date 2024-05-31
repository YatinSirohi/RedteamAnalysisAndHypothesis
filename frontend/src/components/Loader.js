import React from "react";
import { ColorRing } from "react-loader-spinner";
import "./Loader.css";

const Loader = () => {
  return (
    <div className="loader-container">
      <ColorRing
        visible={true}
        height={40}
        width={40}
        ariaLabel="color-ring-loading"
        wrapperClass="color-ring-wrapper"
        colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
      />
    </div>
  );
};

export default Loader;
