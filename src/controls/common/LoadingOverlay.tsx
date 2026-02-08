import React, { useEffect, useState } from "react";

interface LoadingOverlayProps {
  onClose: () => void;
  loading?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  onClose,
  loading = false,
}) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(true);
    if (!loading) {
      const timer = setTimeout(() => {
        setIsActive(false);
        setTimeout(onClose, 500);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    if (isActive && !loading) {
      const timer = setTimeout(() => {
        setIsActive(false);
        setTimeout(onClose, 500);
      }, 500); // Wait a bit before sliding out if it was a long load
      return () => clearTimeout(timer);
    }
  }, [isActive, loading, onClose]);

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
