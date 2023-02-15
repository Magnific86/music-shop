import { FC } from "react";
import { DismissButtonProps } from "../../types/propTypes";

export const DismissButton: FC<DismissButtonProps> = ({
  dismiss,
  onClick,
  text,
}) => {
  return (
    <div className="">
      <button
        className="text-2xl my-4 bg-slate-800 mx-auto flex text-teal-400 dark:bg-teal-400 dark:text-slate-800 rounded-full px-4 py-2"
        onClick={dismiss ? dismiss : onClick}
      >
        <span className="text-2xl" aria-hidden="true">
          {text}
        </span>
      </button>
    </div>
  );
};
