import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "./features/app/App";
import ThemeProvider from "./theme/Theme";

import "./i18n";

import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "./theme/global.css";

import { AuthProvider } from "./context/AuthContext";
import { PartyAccessProvider } from "./context/PartyAccessContext";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AuthProvider>
          <PartyAccessProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </PartyAccessProvider>
        </AuthProvider>
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>
);
