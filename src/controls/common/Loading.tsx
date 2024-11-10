import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-80 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-2">
        <div className="w-12 h-12 border-4 border-gray-500 border-t-gray-800 rounded-full animate-spin"></div>
        <span className="text-lg text-gray-800">Now Loading</span>
      </div>
    </div>
  );
};

export default Loading;
