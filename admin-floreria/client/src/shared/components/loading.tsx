import React from "react";

const spinnerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
};

const dotStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  margin: "0 4px",
  borderRadius: "50%",
  background: "#555",
  animation: "loading-bounce 1s infinite ease-in-out",
};

const Loading: React.FC = () => (
  <div style={spinnerStyle}>
    <span
      style={{
        ...dotStyle,
        animationDelay: "0s",
      }}
    />
    <span
      style={{
        ...dotStyle,
        animationDelay: "0.2s",
      }}
    />
    <span
      style={{
        ...dotStyle,
        animationDelay: "0.4s",
      }}
    />
    <style>
      {`
                @keyframes loading-bounce {
                    0%, 80%, 100% { transform: scale(0.7); opacity: 0.6; }
                    40% { transform: scale(1); opacity: 1; }
                }
            `}
    </style>
  </div>
);

export default Loading;
