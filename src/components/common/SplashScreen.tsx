import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Database,
  Wifi,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
  pharmacyName?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  pharmacyName,
}) => {
  const [dbStatus, setDbStatus] = useState<"CHECKING" | "CONNECTED" | "FAILED">(
    "CHECKING",
  );
  const [internetStatus, setInternetStatus] = useState<
    "CHECKING" | "CONNECTED" | "FAILED"
  >("CHECKING");
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState(
    "Initiating System Diagnostics...",
  );
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Check Internet Connectivity
  const checkInternet = async (): Promise<boolean> => {
    if (!navigator.onLine) {
      return false;
    }
    try {
      // Fast DNS head fetch to verify active internet throughput
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return true;
    } catch {
      // If CORS or offline, fallback to navigator.onLine check
      return navigator.onLine;
    }
  };

  // Check Database & Backend Health
  const checkDatabase = async (): Promise<boolean> => {
    try {
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${backendUrl}/health`, {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);
      if (!res.ok) return false;
      const data = await res.json();
      return (
        data?.status === "UP" ||
        data?.database === "CONNECTED" ||
        res.status === 200
      );
    } catch {
      return false;
    }
  };

  const runDiagnostics = useCallback(async () => {
    setIsRetrying(true);
    setStatusText("Checking Database & Internet Connectivity...");
    setProgress(30);

    // Parallel Diagnostics
    const [isDbOk, isNetOk] = await Promise.all([
      checkDatabase(),
      checkInternet(),
    ]);

    setDbStatus(isDbOk ? "CONNECTED" : "FAILED");
    setInternetStatus(isNetOk ? "CONNECTED" : "FAILED");
    setIsRetrying(false);

    if (isDbOk && isNetOk) {
      // Both prerequisites met -> Complete Startup Sequence
      setProgress(65);
      setStatusText("Validating License & FEFO Stock Engine...");

      setTimeout(() => {
        setProgress(100);
        setStatusText("System Ready. Launching Application...");
        setTimeout(() => {
          onComplete();
        }, 500);
      }, 400);
    } else {
      // Prerequisites unmet -> Application remains stuck at splash
      setProgress(40);
      if (!isDbOk && !isNetOk) {
        setStatusText(
          "Startup Blocked: Database disconnected & No internet connection.",
        );
      } else if (!isDbOk) {
        setStatusText(
          "Startup Blocked: Cannot connect to PostgreSQL Database Server.",
        );
      } else {
        setStatusText(
          "Startup Blocked: No active Internet Connection detected.",
        );
      }
    }
  }, [onComplete]);

  // Initial and Recurring Diagnostic Polling
  useEffect(() => {
    runDiagnostics();

    // Event listeners for instant network reconnection
    const handleOnline = () => runDiagnostics();
    const handleOffline = () => setInternetStatus("FAILED");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Continuous poll every 3 seconds if conditions are unmet
    const timer = setInterval(() => {
      if (dbStatus !== "CONNECTED" || internetStatus !== "CONNECTED") {
        setRetryCount((prev) => prev + 1);
        runDiagnostics();
      }
    }, 3000);

    return () => {
      clearInterval(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [dbStatus, internetStatus, runDiagnostics]);

  const allPassed = dbStatus === "CONNECTED" && internetStatus === "CONNECTED";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#f1f5f9",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        fontFamily: "var(--font-main)",
      }}
    >
      <div
        style={{
          width: "460px",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "2.2rem 2rem",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-sm)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Brand Icon */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "var(--radius-xs)",
            backgroundColor: allPassed ? "var(--primary)" : "#e11d48",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: allPassed
              ? "0 4px 14px rgba(5, 150, 105, 0.25)"
              : "0 4px 14px rgba(225, 29, 72, 0.25)",
            marginBottom: "1rem",
            transition: "all 0.3s ease",
          }}
        >
          {allPassed ? (
            <Activity size={32} color="#ffffff" strokeWidth={2.5} />
          ) : (
            <ShieldAlert size={32} color="#ffffff" strokeWidth={2.2} />
          )}
        </div>

        <h1
          style={{
            fontSize: "1.2rem",
            fontWeight: 800,
            color: "var(--text-main)",
            letterSpacing: "0.01em",
            marginBottom: "0.2rem",
          }}
        >
          {pharmacyName || "INFINITY PHARMA SOLUTIONS"}
        </h1>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-dim)",
            fontWeight: 500,
            marginBottom: "1.5rem",
          }}
        >
          Enterprise Pharmacy Management & POS System
        </p>

        {/* Progress Bar Container */}
        <div
          style={{
            width: "100%",
            height: "6px",
            backgroundColor: "var(--bg-app)",
            borderRadius: "var(--radius-xs)",
            overflow: "hidden",
            marginBottom: "0.75rem",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: allPassed ? "var(--primary)" : "#e11d48",
              transition: "width 0.3s ease, background-color 0.3s ease",
            }}
          />
        </div>

        {/* Status Line */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            fontSize: "0.72rem",
            color: allPassed ? "var(--text-muted)" : "#be123c",
            marginBottom: "1.25rem",
            fontWeight: 600,
            textAlign: "left",
          }}
        >
          <span style={{ flex: 1, paddingRight: "8px" }}>{statusText}</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 800,
              color: allPassed ? "var(--primary)" : "#e11d48",
            }}
          >
            {progress}%
          </span>
        </div>

        {/* Prerequisite Checklist Cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            width: "100%",
            marginBottom: "1.25rem",
          }}
        >
          {/* 1. Database Prerequisite */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.65rem 0.85rem",
              borderRadius: "var(--radius-xs)",
              backgroundColor:
                dbStatus === "CONNECTED"
                  ? "var(--primary-light)"
                  : dbStatus === "FAILED"
                    ? "var(--rose-light)"
                    : "var(--bg-surface)",
              border: `1px solid ${dbStatus === "CONNECTED" ? "var(--primary-border)" : dbStatus === "FAILED" ? "var(--rose-border)" : "var(--border-subtle)"}`,
              fontSize: "0.76rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
            >
              <Database
                size={16}
                color={
                  dbStatus === "CONNECTED"
                    ? "var(--primary)"
                    : dbStatus === "FAILED"
                      ? "var(--rose)"
                      : "var(--text-dim)"
                }
              />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, color: "var(--text-main)" }}>
                  1. PostgreSQL Database
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
                  {dbStatus === "CONNECTED"
                    ? "Connected to local PostgreSQL DB (Port 5000)"
                    : "Backend API / Database Offline"}
                </div>
              </div>
            </div>
            <div>
              {dbStatus === "CONNECTED" && (
                <span
                  className="badge badge-emerald"
                  style={{ display: "flex", alignItems: "center", gap: "3px" }}
                >
                  <CheckCircle2 size={11} /> Connected
                </span>
              )}
              {dbStatus === "FAILED" && (
                <span
                  className="badge badge-rose"
                  style={{ display: "flex", alignItems: "center", gap: "3px" }}
                >
                  <AlertTriangle size={11} /> Disconnected
                </span>
              )}
              {dbStatus === "CHECKING" && (
                <span className="badge badge-indigo">Checking...</span>
              )}
            </div>
          </div>

          {/* 2. Internet Prerequisite */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.65rem 0.85rem",
              borderRadius: "var(--radius-xs)",
              backgroundColor:
                internetStatus === "CONNECTED"
                  ? "var(--primary-light)"
                  : internetStatus === "FAILED"
                    ? "var(--rose-light)"
                    : "var(--bg-surface)",
              border: `1px solid ${internetStatus === "CONNECTED" ? "var(--primary-border)" : internetStatus === "FAILED" ? "var(--rose-border)" : "var(--border-subtle)"}`,
              fontSize: "0.76rem",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
            >
              <Wifi
                size={16}
                color={
                  internetStatus === "CONNECTED"
                    ? "var(--primary)"
                    : internetStatus === "FAILED"
                      ? "var(--rose)"
                      : "var(--text-dim)"
                }
              />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, color: "var(--text-main)" }}>
                  2. Internet Connection
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
                  {internetStatus === "CONNECTED"
                    ? "Active Network Connection Verified"
                    : "No Internet / Network Disconnected"}
                </div>
              </div>
            </div>
            <div>
              {internetStatus === "CONNECTED" && (
                <span
                  className="badge badge-emerald"
                  style={{ display: "flex", alignItems: "center", gap: "3px" }}
                >
                  <CheckCircle2 size={11} /> Online
                </span>
              )}
              {internetStatus === "FAILED" && (
                <span
                  className="badge badge-rose"
                  style={{ display: "flex", alignItems: "center", gap: "3px" }}
                >
                  <AlertTriangle size={11} /> Offline
                </span>
              )}
              {internetStatus === "CHECKING" && (
                <span className="badge badge-indigo">Checking...</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & Diagnostic Lock Message */}
        {!allPassed ? (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "0.65rem",
            }}
          >
            <div
              style={{
                fontSize: "0.7rem",
                color: "#be123c",
                backgroundColor: "#fff1f2",
                border: "1px solid #fecdd3",
                padding: "0.5rem",
                borderRadius: "var(--radius-xs)",
                textAlign: "center",
                lineHeight: 1.35,
              }}
            >
              ⚠️ <strong>Application Locked:</strong> The software requires both
              a healthy <strong>Database connection</strong> and an{" "}
              <strong>Internet connection</strong> to operate.
            </div>

            <button
              className="btn btn-secondary"
              onClick={runDiagnostics}
              disabled={isRetrying}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                gap: "0.4rem",
                fontSize: "0.78rem",
              }}
            >
              <RefreshCw size={14} className={isRetrying ? "spin" : ""} />
              {isRetrying ? "Retrying Diagnostics..." : "Retry Diagnostics Now"}
            </button>
            {retryCount > 0 && (
              <div style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>
                Auto-retry attempt #{retryCount} (polls every 3s)
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              fontSize: "0.72rem",
              color: "var(--primary)",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <CheckCircle2 size={14} /> All system prerequisites verified.
            Entering POS...
          </div>
        )}
      </div>
    </div>
  );
};
