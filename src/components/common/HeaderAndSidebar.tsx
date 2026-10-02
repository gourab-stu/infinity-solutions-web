import React from "react";
import {
  ShoppingCart,
  Boxes,
  Truck,
  Users,
  BarChart3,
  Settings,
  Activity,
  Calendar,
  Clock,
  ShieldCheck,
  FileText,
} from "lucide-react";
import type { StoreSettings } from "../../types";

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  settings?: StoreSettings | null;
  lowStockCount: number;
  nearExpiryCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  settings,
  lowStockCount,
  nearExpiryCount,
}) => {
  const menuItems = [
    { id: "billing", label: "POS Billing", icon: ShoppingCart },
    { id: "sales", label: "Sales History", icon: FileText },
    {
      id: "inventory",
      label: "Inventory & Stock",
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeColor: "badge-amber",
    },
    { id: "purchase", label: "Purchases (GRN)", icon: Truck },
    { id: "parties", label: "Customers & Vendors", icon: Users },
    { id: "analytics", label: "Analytics & Reports", icon: BarChart3 },
    { id: "settings", label: "Store Settings", icon: Settings },
  ];

  return (
    <aside
      style={{
        width: "220px",
        height: "100vh",
        backgroundColor: "#ffffff",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        padding: "0.75rem 0.5rem",
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "0.4rem 0.5rem 0.75rem",
          borderBottom: "1px solid var(--border-subtle)",
          marginBottom: "0.6rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-xs)",
              backgroundColor: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Activity size={16} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div style={{ overflow: "hidden" }}>
            <h1
              style={{
                fontSize: "0.85rem",
                fontWeight: 800,
                color: "var(--text-main)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.2,
              }}
            >
              {settings?.pharmacyName || "INFINITY PHARMA"}
            </h1>
            <p
              style={{
                fontSize: "0.65rem",
                color: "var(--text-dim)",
                margin: 0,
              }}
            >
              Management & POS
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          flex: 1,
        }}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.45rem 0.65rem",
                borderRadius: "var(--radius-xs)",
                backgroundColor: isActive
                  ? "var(--primary-light)"
                  : "transparent",
                color: isActive ? "var(--primary)" : "var(--text-muted)",
                border: isActive
                  ? "1px solid var(--primary-border)"
                  : "1px solid transparent",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                fontWeight: isActive ? 700 : 500,
                fontSize: "0.78rem",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "var(--bg-surface)";
                  e.currentTarget.style.color = "var(--text-main)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-muted)";
                }
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`badge ${item.badgeColor || "badge-amber"}`}
                  style={{ fontSize: "0.62rem" }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Stock Watch Pill */}
      {(nearExpiryCount > 0 || lowStockCount > 0) && (
        <div
          style={{
            padding: "0.5rem",
            borderRadius: "var(--radius-xs)",
            background: "var(--amber-light)",
            border: "1px solid var(--amber-border)",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              marginBottom: "2px",
            }}
          >
            <ShieldCheck size={13} color="var(--amber)" />
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "var(--amber)",
              }}
            >
              Stock Watch
            </span>
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
            {nearExpiryCount > 0 && (
              <div>⚠️ {nearExpiryCount} batches near expiry</div>
            )}
            {lowStockCount > 0 && (
              <div>📦 {lowStockCount} items below alert level</div>
            )}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div
        style={{
          paddingTop: "0.4rem",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.68rem",
          color: "var(--text-dim)",
        }}
      >
        <span>Desktop ERP</span>
        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
              display: "inline-block",
            }}
          ></span>
          Online
        </span>
      </div>
    </aside>
  );
};

interface HeaderProps {
  currentTab: string;
  isBackendConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  isBackendConnected,
}) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const titles: Record<string, { title: string; subtitle: string }> = {
    billing: {
      title: "POS / Rapid Billing Counter",
      subtitle: "Fast checkout, FEFO batch selection & instant GST invoices",
    },
    sales: {
      title: "Sales History & Invoices",
      subtitle:
        "Retail and wholesale invoice records, reprint bills, and credit settlements",
    },
    inventory: {
      title: "Medicine & Stock Inventory",
      subtitle: "Batch tracking, expiry alerts, and stock adjustments",
    },
    purchase: {
      title: "Purchase Orders & Stock Inward",
      subtitle: "Manage supplier bills, GRN entries, and accounts",
    },
    parties: {
      title: "Customers, Vendors & Doctors",
      subtitle: "Wholesale B2B accounts, retail patients, and vendor ledgers",
    },
    analytics: {
      title: "Business Intelligence & Reports",
      subtitle: "Profitability analysis, GSTR-1 summaries, and sales analytics",
    },
    settings: {
      title: "System & Pharmacy Settings",
      subtitle: "Configure store credentials, DL license, and thermal printing",
    },
  };

  const currentInfo = titles[currentTab] || {
    title: "Pharmacy Manager",
    subtitle: "Business management",
  };

  return (
    <header
      style={{
        height: "48px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 0.85rem",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <h2
          style={{
            fontSize: "0.92rem",
            fontWeight: 700,
            color: "var(--text-main)",
            margin: 0,
          }}
        >
          {currentInfo.title}
        </h2>
        <span style={{ color: "var(--border-medium)" }}>|</span>
        <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>
          {currentInfo.subtitle}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
        {/* Hotkey Helper Bar */}
        {currentTab === "billing" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.7rem",
              color: "var(--text-dim)",
            }}
          >
            <span>
              <kbd>F1</kbd> Search
            </span>
            <span>
              <kbd>F3</kbd> Mode
            </span>
            <span>
              <kbd>F8</kbd> Hold
            </span>
            <span>
              <kbd>F9</kbd> Recall
            </span>
            <span>
              <kbd>F10</kbd> Checkout
            </span>
          </div>
        )}

        {/* Date / Time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "var(--bg-surface)",
            padding: "0.2rem 0.5rem",
            borderRadius: "var(--radius-xs)",
            border: "1px solid var(--border-subtle)",
            fontSize: "0.72rem",
            color: "var(--text-muted)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <Calendar size={12} color="var(--cyan)" />
            <span>
              {currentTime.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div
            style={{
              width: "1px",
              height: "10px",
              backgroundColor: "var(--border-subtle)",
            }}
          />
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <Clock size={12} color="var(--primary)" />
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
              {currentTime.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Server Status Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            backgroundColor: isBackendConnected
              ? "var(--primary-light)"
              : "var(--rose-light)",
            border: `1px solid ${isBackendConnected ? "var(--primary-border)" : "var(--rose-border)"}`,
            padding: "0.15rem 0.5rem",
            borderRadius: "var(--radius-xs)",
            fontSize: "0.68rem",
            fontWeight: 700,
            color: isBackendConnected ? "var(--primary)" : "var(--rose)",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: isBackendConnected
                ? "var(--primary)"
                : "var(--rose)",
            }}
          />
          <span>{isBackendConnected ? "DB Connected" : "Disconnected"}</span>
        </div>
      </div>
    </header>
  );
};
