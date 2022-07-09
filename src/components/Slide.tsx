import React from "react";

const Slide = ({ children, style }) => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        scrollSnapAlign: "center",
        fontSize: "large",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Slide;
