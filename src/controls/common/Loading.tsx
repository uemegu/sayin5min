import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-2">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-pink-200 rounded-full animate-spin"></div>
        <div className="text-lg text-pink-800">Now Loading</div>
        <div className="mt-4 text-pink-800">
          200MB弱のデータをロードするためWi-Fi環境での利用をお勧めします
        </div>
      </div>
    </div>
  );
};

export default Loading;
