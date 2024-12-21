import { FC, ReactNode } from "react";

type ButtonProps = {
  onClick: () => void;
  children: ReactNode;
  className?: string;
};

const Button: FC<ButtonProps> = ({ onClick, children, className }) => {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-l-lg min-w-96 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold transition-transform transform hover:scale-110 focus:scale-110 active:scale-110 ${className}`}
    >
      {children}
      <span className="absolute bottom-[0px] right-[-20px] rotate-180 w-0 h-0 border-[10px] border-transparent border-t-pink-500 border-r-pink-500  pointer-events-none"></span>
    </button>
  );
};

export default Button;
