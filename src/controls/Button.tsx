import { FC, ReactNode } from "react";

type ButtonProps = {
  onClick: () => void;
  children: ReactNode;
};

const Button: FC<ButtonProps> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="rounded-full min-w-96 px-6 py-3 bg-sky-500/75 text-white font-bold transition-transform transform hover:scale-110 focus:scale-110 active:scale-110"
    >
      {children}
    </button>
  );
};

export default Button;
