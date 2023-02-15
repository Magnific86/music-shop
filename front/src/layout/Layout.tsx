import { FC } from "react";
import { DarkModeButton } from "../components/buttons/DarkModeButton";
import { ChildrenProps } from "../types/propTypes";


export const Layout: FC<ChildrenProps> = ({ children }) => {
  return (
    <div className="min-h-screen container mx-auto bg-teal-400 text-slate-800 dark:bg-slate-800 dark:text-teal-400 font-mainFont ">
      <DarkModeButton />
      <div className="flex justify-center flex-col gap-6 items-center">
      {children}
      </div>
    </div>
  );
};
