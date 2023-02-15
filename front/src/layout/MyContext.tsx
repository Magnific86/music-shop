import { createContext, FC, useState, useContext } from "react";
import { ChildrenProps } from "../types/propTypes";

interface ContextState {
  theme: string;
  setTheme: (state: string) => void;
}

const MyContext = createContext<ContextState>(null);

const AppProvider = MyContext.Provider;

export const MainProvider: FC<ChildrenProps> = ({ children }) => {
  const [theme, setTheme] = useState("dark");
  return (
    <AppProvider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </AppProvider>
  );
};


export const useAppContext = () => {
  const data = useContext(MyContext);

  if (!data) {
    throw new Error("You cannot use MyContext outside AppProvider!");
  }
  return data;
};
