import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-2">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-pink-200 rounded-full animate-spin"></div>
        <span className="text-lg text-pink-800">Now Loading</span>
      </div>
    </div>
  );
};

export default Loading;
