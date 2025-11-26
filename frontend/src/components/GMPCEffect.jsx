import { useEffect } from "react";
import "../styles/GMPCEffect.css";

const GMPCEffect = ({ onClose }) => {
  useEffect(() => {
    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Generate random umbrellas (50 umbrellas)
  const umbrellas = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    animationDelay: Math.random() * 2,
    animationDuration: 2 + Math.random() * 3,
  }));

  // Generate random cloud texts (20 texts)
  const cloudTexts = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 90,
    top: Math.random() * 90,
    animationDelay: Math.random() * 1,
  }));

  return (
    <div className="gmpc-overlay">
      {/* Falling Umbrellas */}
      {umbrellas.map((umbrella) => (
        <div
          key={`umbrella-${umbrella.id}`}
          className="gmpc-umbrella"
          style={{
            left: `${umbrella.left}%`,
            animationDelay: `${umbrella.animationDelay}s`,
            animationDuration: `${umbrella.animationDuration}s`,
          }}
        >
          ☂️
        </div>
      ))}

      {/* Cloud Text "gmpc" */}
      {cloudTexts.map((cloud) => (
        <div
          key={`cloud-${cloud.id}`}
          className="gmpc-cloud-text"
          style={{
            left: `${cloud.left}%`,
            top: `${cloud.top}%`,
            animationDelay: `${cloud.animationDelay}s`,
          }}
        >
          gmpc
        </div>
      ))}
    </div>
  );
};

export default GMPCEffect;
