const Top: React.FC<{ onStart: () => void; onContinue: () => void }> = ({
  onStart,
  onContinue,
}) => {
  return (
    <div className="top-menu h-screen w-screen flex flex-col items-center justify-center text-white gap-4">
      <img className="w-96" src="./images/title.png"></img>
      <button
        className="bg-pink-500 px-6 py-3 mb-4 rounded hover:bg-pink-400 text-xl mt-16"
        onClick={onStart}
      >
        はじめから
      </button>
      <button
        className="bg-pink-500 px-6 py-3 rounded hover:bg-pink-400 text-xl"
        onClick={onContinue}
      >
        つづきから
      </button>
      <img
        className="h-full w-full fixed opacity-15 pointer-events-none"
        src="./images/top_background.png"
      ></img>
    </div>
  );
};

export default Top;
