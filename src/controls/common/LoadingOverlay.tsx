import React, { useEffect, useState } from "react";

interface LoadingOverlayProps {
  onClose: () => void;
  loading?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  onClose,
  loading = false,
}) => {
  const [status, setStatus] = useState<"idle" | "active" | "opening">("idle");

  useEffect(() => {
    let timer: any;
    if (loading) {
      if (status === "idle") {
        timer = setTimeout(() => setStatus("active"), 100);
      }
    } else {
      if (status === "active") {
        setStatus("opening");
      } else if (status === "opening") {
        timer = setTimeout(() => {
          onClose();
        }, 600);
      } else if (status === "idle") {
        // If it was never loading, just close
        onClose();
      }
    }
    return () => clearTimeout(timer);
  }, [loading, status, onClose]);

  const isActive = status === "active";

  return (
    <>
      <div
        className={`fixed z-50 inset-x-0 top-0 h-1/4 bg-pink-200 flex items-center justify-center transition-transform duration-500 ${isActive ? "translate-x-0" : "translate-x-full"
          }`}
      ></div>
      <div
        className={`fixed z-50 inset-x-0 top-1/4 h-1/4 bg-pink-50 flex items-center justify-center transition-transform duration-500 ${isActive ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <img
          className="w-52 select-none"
          src="./images/title.png"
          alt="Title Logo"
        />
      </div>
      <div
        className={`fixed z-50 inset-x-0 bottom-1/4 h-1/4 bg-pink-100 flex items-center justify-center transition-transform duration-500 ${isActive ? "translate-x-0" : "translate-x-full"
          }`}
      ></div>
      <div
        className={`fixed z-50 inset-x-0 bottom-0 h-1/4 bg-pink-300 flex items-center justify-center transition-transform duration-500 ${isActive ? "translate-x-0" : "-translate-x-full"
          }`}
      ></div>
    </>
  );
};

export default LoadingOverlay;
