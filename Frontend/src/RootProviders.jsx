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
    let updateSW;
    import("virtual:pwa-register")
      .then(({ registerSW }) => {
        updateSW = registerSW({
          onNeedRefresh() {
            if (confirm("New content available. Reload?")) {
              updateSW?.();
            }
          },
          onOfflineReady() {
            console.log("App ready to work offline");
          },
        });
      })
      .catch(() => {});
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
