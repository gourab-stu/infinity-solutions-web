import { useState, useEffect } from "react";
import { Sidebar, Header } from "./components/common/HeaderAndSidebar";
import { ToastContainer } from "./components/common/ModalAndToast";
import type { ToastMessage } from "./components/common/ModalAndToast";
import { SplashScreen } from "./components/common/SplashScreen";
import { BillingTerminal } from "./components/billing/BillingTerminal";
import { SalesHistory } from "./components/sales/SalesHistory";
import { InventoryManager } from "./components/inventory/InventoryManager";
import { PurchaseManager } from "./components/purchase/PurchaseManager";
import { PartyManager } from "./components/parties/PartyManager";
import { AnalyticsDashboard } from "./components/analytics/AnalyticsDashboard";
import { SettingsManager } from "./components/settings/SettingsManager";
import type { StoreSettings } from "./types";
import { api } from "./services/api";

export function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<string>("billing");
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Stock Watch Counts for Sidebar Badges
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [nearExpiryCount, setNearExpiryCount] = useState<number>(0);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
  ) => {
    const id = String(Date.now() + Math.random());
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Health check & Initial metadata
  useEffect(() => {
    checkBackendHealth();
    loadStoreSettings();
    loadStockAlertMetrics();

    const interval = setInterval(() => {
      checkBackendHealth();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const checkBackendHealth = async () => {
    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/health`);
      if (res.ok) {
        setIsBackendConnected(true);
      } else {
        setIsBackendConnected(false);
      }
    } catch {
      setIsBackendConnected(false);
    }
  };

  const loadStoreSettings = async () => {
    try {
      const s = await api.getSettings();
      setSettings(s);
    } catch (err) {
      console.error("Failed to load store settings", err);
    }
  };

  const loadStockAlertMetrics = async () => {
    try {
      const [alerts, lowStock] = await Promise.all([
        api.getExpiryAlerts(60),
        api.getLowStockAlerts(),
      ]);
      setNearExpiryCount(alerts.nearExpiry.length + alerts.expired.length);
      setLowStockCount(lowStock.length);
    } catch (err) {
      console.error("Failed to load stock metrics", err);
    }
  };

  return (
    <>
      {showSplash && (
        <SplashScreen
          onComplete={() => setShowSplash(false)}
          pharmacyName={settings?.pharmacyName}
        />
      )}

      <div className="app-container">
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          settings={settings}
          lowStockCount={lowStockCount}
          nearExpiryCount={nearExpiryCount}
        />

        {/* Main App Content View */}
        <div className="main-content">
          <Header
            currentTab={currentTab}
            isBackendConnected={isBackendConnected}
          />

          <main className="content-body">
            {currentTab === "billing" && (
              <BillingTerminal settings={settings} onShowToast={showToast} />
            )}

            {currentTab === "sales" && (
              <SalesHistory settings={settings} onShowToast={showToast} />
            )}

            {currentTab === "inventory" && (
              <InventoryManager
                onShowToast={showToast}
                onRefreshStats={loadStockAlertMetrics}
              />
            )}

            {currentTab === "purchase" && (
              <PurchaseManager
                onShowToast={showToast}
                onRefreshStats={loadStockAlertMetrics}
              />
            )}

            {currentTab === "parties" && (
              <PartyManager onShowToast={showToast} />
            )}

            {currentTab === "analytics" && (
              <AnalyticsDashboard onShowToast={showToast} />
            )}

            {currentTab === "settings" && (
              <SettingsManager
                settings={settings}
                onUpdateSettings={setSettings}
                onShowToast={showToast}
              />
            )}
          </main>
        </div>

        {/* Global Toast Notifications */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </>
  );
}

export default App;
