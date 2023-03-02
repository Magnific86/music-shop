import ReactDOM from "react-dom/client";
import { App } from "./App";
import { Layout } from "./layout/Layout";
import { MainProvider } from "./layout/MyContext";
import "./styles/tailwind.css";
import { Utils } from "./Utils";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <MainProvider>
    <Layout>
      <App />
      <Utils />
    </Layout>
  </MainProvider>
);
