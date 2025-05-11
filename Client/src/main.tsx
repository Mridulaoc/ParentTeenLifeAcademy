import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import store from "../src/Store/store.ts";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import theme from "./theme.ts";
import { ThemeProvider } from "@mui/material";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
        toastStyle={{
          fontSize: "12px",
          color: "#333",
          fontFamily: "Poppins, sans-serif",
          minHeight: "40px",
          padding: "12px 16px",
        }}
      />
      <App />
    </Provider>
  </ThemeProvider>
);
