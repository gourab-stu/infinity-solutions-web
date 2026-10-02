import React, { useState, useEffect } from "react";
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  Edit2,
  Trash2,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  TrendingDown,
} from "lucide-react";
import type { Medicine, Batch } from "../../types";
import { api } from "../../services/api";
import { formatCurrency, formatMonthYear } from "../../utils/formatters";
import {
  AddMedicineModal,
  AddBatchModal,
  StockAdjustmentModal,
} from "./InventoryModals";

interface InventoryManagerProps {
  onShowToast: (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
  ) => void;
  onRefreshStats?: () => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  onShowToast,
  onRefreshStats,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "catalog" | "expiry" | "adjustments"
  >("catalog");

  // Medicines List
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Expanded Medicine rows
  const [expandedMeds, setExpandedMeds] = useState<Set<string>>(new Set());

  // Expiry Alerts
  const [nearExpiryBatches, setNearExpiryBatches] = useState<Batch[]>([]);
  const [expiredBatches, setExpiredBatches] = useState<Batch[]>([]);

  // Adjustments Log
  const [adjustments, setAdjustments] = useState<any[]>([]);

  // Modals state
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const [batchModalMed, setBatchModalMed] = useState<Medicine | null>(null);
  const [adjustBatch, setAdjustBatch] = useState<Batch | null>(null);

  useEffect(() => {
    loadMedicines();
    loadExpiryAlerts();
    loadAdjustments();
  }, [searchQuery, categoryFilter, lowStockOnly]);

  const loadMedicines = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMedicines({
        search: searchQuery || undefined,
        category: categoryFilter || undefined,
        lowStock: lowStockOnly || undefined,
      });
      setMedicines(data);
    } catch (err: any) {
      onShowToast("error", "Failed to load medicines", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExpiryAlerts = async () => {
    try {
      const { nearExpiry, expired } = await api.getExpiryAlerts(60);
      setNearExpiryBatches(nearExpiry);
      setExpiredBatches(expired);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAdjustments = async () => {
    try {
      const list = await api.getAdjustments();
      setAdjustments(list);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (medId: string) => {
    setExpandedMeds((prev) => {
      const next = new Set(prev);
      if (next.has(medId)) next.delete(medId);
      else next.add(medId);
      return next;
    });
  };

  const handleSaveMedicine = async (data: Partial<Medicine>) => {
    try {
      if (editingMedicine) {
        await api.updateMedicine(editingMedicine.id, data);
        onShowToast("success", "Updated", `${data.name} updated successfully`);
      } else {
        await api.createMedicine(data);
        onShowToast("success", "Created", `${data.name} added to catalog`);
      }
      loadMedicines();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      onShowToast("error", "Save Failed", err.message);
    }
  };

  const handleDeleteMedicine = async (med: Medicine) => {
    if (!window.confirm(`Are you sure you want to delete ${med.name}?`)) return;
    try {
      await api.deleteMedicine(med.id);
      onShowToast("success", "Deleted", `${med.name} removed from inventory`);
      loadMedicines();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      onShowToast("error", "Delete Failed", err.message);
    }
  };

  const handleSaveBatch = async (data: Partial<Batch>) => {
    try {
      await api.createBatch(data);
      onShowToast(
        "success",
        "Batch Added",
        `Batch ${data.batchNumber} saved successfully`,
      );
      loadMedicines();
      loadExpiryAlerts();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      onShowToast("error", "Batch Failed", err.message);
    }
  };

  const handleSaveAdjustment = async (data: any) => {
    try {
      await api.adjustStock(data);
      onShowToast(
        "success",
        "Stock Adjusted",
        "Write-off recorded and inventory updated",
      );
      loadMedicines();
      loadExpiryAlerts();
      loadAdjustments();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      onShowToast("error", "Adjustment Failed", err.message);
    }
  };

  // Categories list
  const categories = Array.from(
    new Set(medicines.map((m) => m.category)),
  ).filter(Boolean);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        height: "100%",
      }}
    >
      {/* Subtabs and Top Action Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className={`btn btn-sm ${activeSubTab === "catalog" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveSubTab("catalog")}
          >
            <Boxes size={16} /> Medicine Catalog ({medicines.length})
          </button>
          <button
            className={`btn btn-sm ${activeSubTab === "expiry" ? "btn-danger" : "btn-secondary"}`}
            onClick={() => setActiveSubTab("expiry")}
          >
            <ShieldAlert size={16} /> Expiry Tracker (
            {nearExpiryBatches.length + expiredBatches.length} Alerts)
          </button>
          <button
            className={`btn btn-sm ${activeSubTab === "adjustments" ? "btn-cyan" : "btn-secondary"}`}
            onClick={() => setActiveSubTab("adjustments")}
          >
            <TrendingDown size={16} /> Adjustments & Write-offs
          </button>
        </div>

        {activeSubTab === "catalog" && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingMedicine(null);
              setShowAddMedModal(true);
            }}
          >
            <Plus size={16} /> Add New Medicine
          </button>
        )}
      </div>

      {/* TAB 1: MEDICINE CATALOG & STOCK */}
      {activeSubTab === "catalog" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Filters Bar */}
          <div
            className="card"
            style={{
              padding: "0.75rem 1rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-dim)",
                }}
              />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: "2.2rem" }}
                placeholder="Filter by name, composition, SKU, manufacturer, rack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="select"
              style={{ width: "180px" }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              className={`btn btn-sm ${lowStockOnly ? "btn-danger" : "btn-secondary"}`}
              onClick={() => setLowStockOnly((prev) => !prev)}
            >
              <AlertTriangle size={14} /> Low Stock Only
            </button>
          </div>

          {/* Catalog Data Table */}
          <div
            className="data-table-container"
            style={{ flex: 1, overflowY: "auto" }}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "35px" }}></th>
                  <th>Medicine / Brand</th>
                  <th>Generic Name</th>
                  <th>Category</th>
                  <th>Dosage / Rack</th>
                  <th style={{ textAlign: "right" }}>GST %</th>
                  <th style={{ textAlign: "center" }}>Total Stock</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ width: "120px", textAlign: "center" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{ textAlign: "center", padding: "3rem" }}
                    >
                      Loading medicines...
                    </td>
                  </tr>
                ) : medicines.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      No medicines match the selected filter.
                    </td>
                  </tr>
                ) : (
                  medicines.map((med) => {
                    const isExpanded = expandedMeds.has(med.id);
                    const isLow = (med.totalStock || 0) <= med.minStockAlert;
                    const isOutOfStock = (med.totalStock || 0) === 0;

                    return (
                      <React.Fragment key={med.id}>
                        <tr
                          style={{
                            background: isExpanded
                              ? "rgba(255,255,255,0.02)"
                              : "transparent",
                          }}
                        >
                          <td>
                            <button
                              onClick={() => toggleExpand(med.id)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--text-dim)",
                                cursor: "pointer",
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown size={18} />
                              ) : (
                                <ChevronRight size={18} />
                              )}
                            </button>
                          </td>
                          <td>
                            <div
                              style={{
                                fontWeight: 700,
                                color: "var(--text-main)",
                              }}
                            >
                              {med.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.72rem",
                                color: "var(--text-dim)",
                              }}
                            >
                              SKU: {med.sku} • {med.manufacturer}
                            </div>
                          </td>
                          <td
                            style={{
                              color: "var(--text-muted)",
                              fontSize: "0.8rem",
                            }}
                          >
                            {med.genericName}
                          </td>
                          <td>
                            <span className="badge badge-indigo">
                              {med.category}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: "0.8rem" }}>
                              {med.dosageForm}{" "}
                              {med.strength && `(${med.strength})`}
                            </div>
                            {med.rackLocation && (
                              <div
                                style={{
                                  fontSize: "0.7rem",
                                  color: "var(--text-dim)",
                                }}
                              >
                                📍 {med.rackLocation}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 600 }}>
                            {med.gstRate}%
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              fontWeight: 800,
                              fontSize: "0.95rem",
                            }}
                          >
                            {med.totalStock || 0}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {isOutOfStock ? (
                              <span className="badge badge-rose">
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="badge badge-amber">
                                Low Stock (&le;{med.minStockAlert})
                              </span>
                            ) : (
                              <span className="badge badge-emerald">
                                In Stock
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div
                              style={{
                                display: "flex",
                                gap: "0.35rem",
                                justifyContent: "center",
                              }}
                            >
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setBatchModalMed(med);
                                }}
                                title="Add Batch"
                              >
                                <Plus size={13} /> Batch
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setEditingMedicine(med);
                                  setShowAddMedModal(true);
                                }}
                                title="Edit"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleDeleteMedicine(med)}
                                style={{ color: "var(--rose)" }}
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Nested Batches Table when expanded */}
                        {isExpanded && (
                          <tr
                            style={{
                              background: "#f8fafc",
                              borderBottom: "1px solid var(--border-medium)",
                            }}
                          >
                            <td
                              colSpan={9}
                              style={{
                                padding: "0.75rem 1.5rem 1.25rem 2.5rem",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  color: "var(--primary)",
                                  marginBottom: "0.4rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.03em",
                                }}
                              >
                                Available Stock Batches (
                                {med.batches?.length || 0})
                              </div>
                              {!med.batches || med.batches.length === 0 ? (
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-dim)",
                                  }}
                                >
                                  No active batches found. Click "+ Batch" to
                                  record stock.
                                </div>
                              ) : (
                                <table
                                  style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "0.76rem",
                                    background: "#ffffff",
                                    border: "1px solid var(--border-subtle)",
                                    borderRadius: "var(--radius-xs)",
                                  }}
                                >
                                  <thead>
                                    <tr
                                      style={{
                                        color: "var(--text-dim)",
                                        background: "#f1f5f9",
                                        borderBottom:
                                          "1px solid var(--border-subtle)",
                                        textAlign: "left",
                                      }}
                                    >
                                      <th style={{ padding: "6px 8px" }}>
                                        Batch No
                                      </th>
                                      <th style={{ padding: "6px 8px" }}>
                                        Expiry Date
                                      </th>
                                      <th
                                        style={{
                                          padding: "6px 8px",
                                          textAlign: "right",
                                        }}
                                      >
                                        Cost Price
                                      </th>
                                      <th
                                        style={{
                                          padding: "6px 8px",
                                          textAlign: "right",
                                        }}
                                      >
                                        MRP
                                      </th>
                                      <th
                                        style={{
                                          padding: "6px 8px",
                                          textAlign: "right",
                                        }}
                                      >
                                        Retail Rate
                                      </th>
                                      <th
                                        style={{
                                          padding: "6px 8px",
                                          textAlign: "right",
                                        }}
                                      >
                                        Wholesale Rate
                                      </th>
                                      <th
                                        style={{
                                          padding: "6px 8px",
                                          textAlign: "center",
                                        }}
                                      >
                                        Quantity
                                      </th>
                                      <th
                                        style={{
                                          padding: "6px 8px",
                                          textAlign: "center",
                                        }}
                                      >
                                        Status
                                      </th>
                                      <th
                                        style={{
                                          padding: "6px 8px",
                                          textAlign: "center",
                                        }}
                                      >
                                        Action
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {med.batches.map((b) => {
                                      const isExp =
                                        new Date(b.expiryDate).getTime() <
                                        Date.now();
                                      const isNear =
                                        (b.daysUntilExpiry || 999) <= 60 &&
                                        !isExp;

                                      return (
                                        <tr
                                          key={b.id}
                                          style={{
                                            borderBottom:
                                              "1px solid var(--border-subtle)",
                                          }}
                                        >
                                          <td
                                            style={{
                                              padding: "6px 8px",
                                              fontWeight: 700,
                                              color: "var(--text-main)",
                                            }}
                                          >
                                            {b.batchNumber}
                                          </td>
                                          <td style={{ padding: "6px 8px" }}>
                                            <span
                                              style={{
                                                color: isExp
                                                  ? "var(--rose)"
                                                  : isNear
                                                    ? "var(--amber)"
                                                    : "var(--text-main)",
                                                fontWeight: 600,
                                              }}
                                            >
                                              {formatMonthYear(b.expiryDate)}
                                            </span>
                                            <span
                                              style={{
                                                fontSize: "0.7rem",
                                                color: "var(--text-dim)",
                                                marginLeft: "4px",
                                              }}
                                            >
                                              ({b.daysUntilExpiry}d left)
                                            </span>
                                          </td>
                                          <td
                                            style={{
                                              padding: "6px 8px",
                                              textAlign: "right",
                                            }}
                                          >
                                            {formatCurrency(b.purchasePrice)}
                                          </td>
                                          <td
                                            style={{
                                              padding: "6px 8px",
                                              textAlign: "right",
                                            }}
                                          >
                                            {formatCurrency(b.mrp)}
                                          </td>
                                          <td
                                            style={{
                                              padding: "6px 8px",
                                              textAlign: "right",
                                              fontWeight: 600,
                                              color: "var(--primary)",
                                            }}
                                          >
                                            {formatCurrency(b.retailPrice)}
                                          </td>
                                          <td
                                            style={{
                                              padding: "6px 8px",
                                              textAlign: "right",
                                            }}
                                          >
                                            {formatCurrency(b.wholesalePrice)}
                                          </td>
                                          <td
                                            style={{
                                              padding: "6px 8px",
                                              textAlign: "center",
                                              fontWeight: 800,
                                            }}
                                          >
                                            {b.quantity}
                                          </td>
                                          <td
                                            style={{
                                              padding: "6px 8px",
                                              textAlign: "center",
                                            }}
                                          >
                                            {isExp ? (
                                              <span
                                                className="badge badge-rose"
                                                style={{ fontSize: "0.65rem" }}
                                              >
                                                Expired
                                              </span>
                                            ) : isNear ? (
                                              <span
                                                className="badge badge-amber"
                                                style={{ fontSize: "0.65rem" }}
                                              >
                                                Near Expiry
                                              </span>
                                            ) : (
                                              <span
                                                className="badge badge-emerald"
                                                style={{ fontSize: "0.65rem" }}
                                              >
                                                Active
                                              </span>
                                            )}
                                          </td>
                                          <td
                                            style={{
                                              padding: "6px 8px",
                                              textAlign: "center",
                                            }}
                                          >
                                            <button
                                              className="btn btn-secondary btn-sm"
                                              style={{
                                                fontSize: "0.65rem",
                                                padding: "2px 6px",
                                              }}
                                              onClick={() =>
                                                setAdjustBatch({
                                                  ...b,
                                                  medicine: med,
                                                })
                                              }
                                            >
                                              Write-Off / Adjust
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EXPIRY TRACKER & ALERTS */}
      {activeSubTab === "expiry" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.25rem",
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Expired Batches (Red Zone) */}
          <div
            className="card"
            style={{
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
                color: "var(--rose)",
              }}
            >
              <ShieldAlert size={20} />
              <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
                Expired Stock (Zero Sale Allowed)
              </h3>
              <span className="badge badge-rose">
                {expiredBatches.length} Batches
              </span>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {expiredBatches.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    color: "var(--text-muted)",
                  }}
                >
                  ✅ No expired items found in stock.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {expiredBatches.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        padding: "0.85rem",
                        borderRadius: "var(--radius-md)",
                        background: "rgba(244, 63, 94, 0.08)",
                        border: "1px solid rgba(244, 63, 94, 0.25)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{ fontWeight: 700, color: "var(--text-main)" }}
                        >
                          {b.medicine?.name || "Medicine"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--rose)",
                            marginTop: "2px",
                          }}
                        >
                          Batch: <strong>{b.batchNumber}</strong> • Expired on:{" "}
                          {new Date(b.expiryDate).toLocaleDateString("en-IN")}
                        </div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-dim)",
                          }}
                        >
                          Remaining Quantity: {b.quantity} units (Loss: ₹
                          {(b.quantity * b.purchasePrice).toFixed(2)})
                        </div>
                      </div>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setAdjustBatch(b)}
                      >
                        Quarantine & Write-Off
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Near Expiry Batches (<60 Days - Amber Zone) */}
          <div
            className="card"
            style={{
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem",
                color: "var(--amber)",
              }}
            >
              <Clock size={20} />
              <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
                Near Expiry Watch (&lt; 60 Days)
              </h3>
              <span className="badge badge-amber">
                {nearExpiryBatches.length} Batches
              </span>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {nearExpiryBatches.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    color: "var(--text-muted)",
                  }}
                >
                  ✅ No batches expiring within the next 60 days.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {nearExpiryBatches.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        padding: "0.85rem",
                        borderRadius: "var(--radius-md)",
                        background: "rgba(245, 158, 11, 0.08)",
                        border: "1px solid rgba(245, 158, 11, 0.25)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{ fontWeight: 700, color: "var(--text-main)" }}
                        >
                          {b.medicine?.name || "Medicine"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--amber)",
                            marginTop: "2px",
                          }}
                        >
                          Batch: <strong>{b.batchNumber}</strong> • Exp:{" "}
                          {new Date(b.expiryDate).toLocaleDateString("en-IN")} (
                          {b.daysUntilExpiry} days left)
                        </div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-dim)",
                          }}
                        >
                          Stock: {b.quantity} units (Valuation: ₹
                          {(b.quantity * b.retailPrice).toFixed(2)})
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <span
                          className="badge badge-amber"
                          style={{ fontSize: "0.7rem" }}
                        >
                          FEFO Priority
                        </span>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setAdjustBatch(b)}
                        >
                          Write-off
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ADJUSTMENTS & WRITE-OFFS LOG */}
      {activeSubTab === "adjustments" && (
        <div
          className="data-table-container"
          style={{ flex: 1, overflowY: "auto" }}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Adjustment Type</th>
                <th style={{ textAlign: "center" }}>Quantity</th>
                <th style={{ textAlign: "right" }}>Cost Impact (₹)</th>
                <th>Reason / Justification</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    No stock adjustments recorded yet.
                  </td>
                </tr>
              ) : (
                adjustments.map((a) => (
                  <tr key={a.id}>
                    <td style={{ color: "var(--text-dim)" }}>
                      {new Date(a.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td style={{ fontWeight: 700 }}>{a.medicine?.name}</td>
                    <td>
                      <span className="badge badge-cyan">
                        {a.batch?.batchNumber}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${a.type === "EXPIRED_WRITE_OFF" ? "badge-rose" : "badge-amber"}`}
                      >
                        {a.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: 800,
                        color: "var(--rose)",
                      }}
                    >
                      -{a.quantity}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                      ₹{a.costImpact?.toFixed(2)}
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{a.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showAddMedModal && (
        <AddMedicineModal
          isOpen={showAddMedModal}
          onClose={() => setShowAddMedModal(false)}
          onSave={handleSaveMedicine}
          editMedicine={editingMedicine}
        />
      )}

      {batchModalMed && (
        <AddBatchModal
          isOpen={true}
          onClose={() => setBatchModalMed(null)}
          medicine={batchModalMed}
          onSave={handleSaveBatch}
        />
      )}

      {adjustBatch && (
        <StockAdjustmentModal
          isOpen={true}
          onClose={() => setAdjustBatch(null)}
          batch={adjustBatch}
          onSave={handleSaveAdjustment}
        />
      )}
    </div>
  );
};
