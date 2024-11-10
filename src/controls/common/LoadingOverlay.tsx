import React, { useEffect, useState } from "react";

interface LoadingOverlayProps {
  onClose: () => void;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setIsActive(true);
    setTimeout(() => {
      setIsActive(false); // 2秒後にスライドアウト開始
      setTimeout(onClose, 500); // スライドアウトアニメーションが完了したらonCloseを呼び出し
    }, 2000);
  }, [onClose]);

  return (
    <div
      className={`fixed z-50 inset-0 flex items-center justify-center bg-white transition-transform duration-500 ${
        isActive ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <img className="w-52" src="./images/title.png" alt="Title Logo" />
    </div>
  );
};

export default LoadingOverlay;
