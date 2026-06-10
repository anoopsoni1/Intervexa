import { StrictMode, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { store } from "./store/index.js";
import { queryClient } from "./lib/queryClient.js";
import { ToastProvider } from "./context/ToastContext";

export default function RootProviders() {
useEffect(() => {
  import("virtual:pwa-register").then(({ registerSW }) => {
    const updateSW = registerSW({
      immediate: true,

      onNeedRefresh() {
        if (window.confirm("A new version is available. Reload now?")) {
          updateSW(true);
        }
      },

      onOfflineReady() {
        console.log("Offline ready");
      },
    });
  });
}, []);

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <ToastProvider>
            <Outlet />
            <Analytics />
          </ToastProvider>
        </Provider>
      </QueryClientProvider>
    </StrictMode>
  );
}
