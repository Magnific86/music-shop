import { FC, useEffect } from "react";
import { useAppContext } from "../../layout/MyContext";

export const DarkModeButton: FC = () => {
  const { theme, setTheme } = useAppContext();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "light") {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <button
      className="text-2xl bg-slate-800  text-teal-400 dark:bg-teal-400 dark:text-slate-800 rounded-full px-4 py-2"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme}
    </button>
  );
};
