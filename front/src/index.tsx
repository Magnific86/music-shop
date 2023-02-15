import ReactDOM from "react-dom/client";
import { App } from "./App";
import { Layout } from "./layout/Layout";
import { MainProvider } from "./layout/MyContext";
import "./styles/tailwind.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <MainProvider>
    <Layout>
      <App />
    </Layout>
  </MainProvider>
);
