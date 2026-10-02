import React, { useState, useEffect } from "react";
import {
  Search,
  Printer,
  Clock,
  Eye,
  Building2,
  User,
  RefreshCw,
  TrendingUp,
  Calendar,
} from "lucide-react";
import type { Sale, StoreSettings } from "../../types";
import { api } from "../../services/api";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from "../../utils/formatters";
import { Modal } from "../common/ModalAndToast";
import { InvoicePrintModal } from "../billing/InvoicePrintModal";

interface SalesHistoryProps {
  settings: StoreSettings | null;
  onShowToast: (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
  ) => void;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({
  settings,
  onShowToast,
}) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [billingTypeFilter, setBillingTypeFilter] = useState<
    "ALL" | "RETAIL" | "WHOLESALE"
  >("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    "ALL" | "PAID" | "UNPAID" | "PARTIAL"
  >("ALL");
  const [dateFilter, setDateFilter] = useState<
    "ALL" | "TODAY" | "YESTERDAY" | "7DAYS" | "THIS_MONTH" | "CUSTOM"
  >("TODAY");
  const [customDate, setCustomDate] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  // Modals
  const [selectedSaleForPrint, setSelectedSaleForPrint] = useState<Sale | null>(
    null,
  );
  const [viewingSaleDetails, setViewingSaleDetails] = useState<Sale | null>(
    null,
  );
  const [settlingSale, setSettlingSale] = useState<Sale | null>(null);
  const [settleAmount, setSettleAmount] = useState<number>(0);
  const [settleMethod, setSettleMethod] = useState<"CASH" | "UPI" | "CARD">(
    "CASH",
  );
  const [isSettling, setIsSettling] = useState<boolean>(false);

  useEffect(() => {
    loadSales();
  }, [
    searchQuery,
    billingTypeFilter,
    paymentStatusFilter,
    dateFilter,
    customDate,
  ]);

  const getDateRange = () => {
    const now = new Date();

    if (dateFilter === "TODAY") {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
      );
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }

    if (dateFilter === "YESTERDAY") {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
        0,
        0,
        0,
        0,
      );
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
        23,
        59,
        59,
        999,
      );
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }

    if (dateFilter === "7DAYS") {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 6,
        0,
        0,
        0,
        0,
      );
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }

    if (dateFilter === "THIS_MONTH") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }

    if (dateFilter === "CUSTOM" && customDate) {
      const [y, m, d] = customDate.split("-").map(Number);
      if (y && m && d) {
        const start = new Date(y, m - 1, d, 0, 0, 0, 0);
        const end = new Date(y, m - 1, d, 23, 59, 59, 999);
        return { startDate: start.toISOString(), endDate: end.toISOString() };
      }
    }

    return { startDate: undefined, endDate: undefined };
  };

  const loadSales = async () => {
    setIsLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const res = await api.getSales({
        limit: 100,
        offset: 0,
        search: searchQuery || undefined,
        startDate,
        endDate,
      });

      let filtered = res.sales;
      if (billingTypeFilter !== "ALL") {
        filtered = filtered.filter((s) => s.type === billingTypeFilter);
      }
      if (paymentStatusFilter !== "ALL") {
        filtered = filtered.filter(
          (s) => s.paymentStatus === paymentStatusFilter,
        );
      }

      setSales(filtered);
    } catch (err: any) {
      onShowToast("error", "Failed to load sales", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettlePayment = async () => {
    if (!settlingSale) return;
    setIsSettling(true);
    try {
      await api.updateSalePayment(settlingSale.id, {
        paymentStatus: "PAID",
        paidAmount: settleAmount,
      });
      onShowToast(
        "success",
        "Payment Settled",
        `Bill ${settlingSale.billNumber} marked as PAID`,
      );
      setSettlingSale(null);
      loadSales();
    } catch (err: any) {
      onShowToast("error", "Settlement Failed", err.message);
    } finally {
      setIsSettling(false);
    }
  };

  // KPIs
  const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const retailRevenue = sales
    .filter((s) => s.type === "RETAIL")
    .reduce((sum, s) => sum + s.grandTotal, 0);
  const wholesaleRevenue = sales
    .filter((s) => s.type === "WHOLESALE")
    .reduce((sum, s) => sum + s.grandTotal, 0);
  const totalOutstanding = sales
    .filter((s) => s.paymentStatus !== "PAID")
    .reduce((sum, s) => sum + Math.max(0, s.grandTotal - s.paidAmount), 0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        height: "100%",
      }}
    >
      {/* KPI Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.85rem",
        }}
      >
        <div
          className="card"
          style={{
            padding: "0.85rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "var(--radius-xs)",
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrendingUp size={20} />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.68rem",
                color: "var(--text-dim)",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Total Invoices / Revenue
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "var(--text-main)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatCurrency(totalRevenue)}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
              {sales.length} Invoices Listed
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: "0.85rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "var(--radius-xs)",
              backgroundColor: "var(--cyan-light)",
              color: "var(--cyan)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={20} />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.68rem",
                color: "var(--text-dim)",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Retail Sales
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "var(--text-main)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatCurrency(retailRevenue)}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
              {sales.filter((s) => s.type === "RETAIL").length} Retail Bills
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: "0.85rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "var(--radius-xs)",
              backgroundColor: "var(--indigo-light)",
              color: "var(--indigo)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building2 size={20} />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.68rem",
                color: "var(--text-dim)",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Wholesale B2B Sales
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "var(--text-main)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatCurrency(wholesaleRevenue)}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
              {sales.filter((s) => s.type === "WHOLESALE").length} B2B Invoices
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: "0.85rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.85rem",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "var(--radius-xs)",
              backgroundColor: "var(--amber-light)",
              color: "var(--amber)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div
              style={{
                fontSize: "0.68rem",
                color: "var(--text-dim)",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Credit / Receivables
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color:
                  totalOutstanding > 0 ? "var(--rose)" : "var(--text-main)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {formatCurrency(totalOutstanding)}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
              Pending Customer Credit
            </div>
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div
        className="card"
        style={{
          padding: "0.75rem 1rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
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
            style={{ paddingLeft: "2.3rem", fontSize: "0.82rem" }}
            placeholder="Search by Bill #, Customer Name, Phone, Doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <select
          className="select"
          style={{ width: "150px" }}
          value={billingTypeFilter}
          onChange={(e) => setBillingTypeFilter(e.target.value as any)}
        >
          <option value="ALL">All Sale Types</option>
          <option value="RETAIL">Retail Only</option>
          <option value="WHOLESALE">Wholesale Only</option>
        </select>

        {/* Payment Status Filter */}
        <select
          className="select"
          style={{ width: "150px" }}
          value={paymentStatusFilter}
          onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
        >
          <option value="ALL">All Payment Statuses</option>
          <option value="PAID">Paid Only</option>
          <option value="UNPAID">Credit / Unpaid</option>
          <option value="PARTIAL">Partial Payment</option>
        </select>

        {/* Date Filter Buttons */}
        <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
          {[
            { id: "TODAY", label: "Today" },
            { id: "YESTERDAY", label: "Yesterday" },
            { id: "7DAYS", label: "7 Days" },
            { id: "THIS_MONTH", label: "This Month" },
            { id: "ALL", label: "All Time" },
          ].map((d) => (
            <button
              key={d.id}
              className={`btn btn-sm ${dateFilter === d.id ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setDateFilter(d.id as any)}
              style={{ fontSize: "0.72rem", padding: "0.25rem 0.5rem" }}
            >
              {d.label}
            </button>
          ))}

          {/* Custom Date Picker */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              marginLeft: "0.2rem",
            }}
          >
            <Calendar size={13} color="var(--text-dim)" />
            <input
              type="date"
              className="input"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateFilter("CUSTOM");
              }}
              style={{
                padding: "0.2rem 0.4rem",
                fontSize: "0.72rem",
                width: "125px",
                borderColor:
                  dateFilter === "CUSTOM"
                    ? "var(--primary)"
                    : "var(--border-subtle)",
                backgroundColor:
                  dateFilter === "CUSTOM"
                    ? "var(--primary-light)"
                    : "var(--bg-input)",
              }}
              title="Filter by custom single date"
            />
          </div>
        </div>

        {/* Refresh button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={loadSales}
          title="Refresh Invoices"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Sales Invoices Table */}
      <div
        className="data-table-container"
        style={{ flex: 1, overflowY: "auto" }}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "120px" }}>Bill Number</th>
              <th style={{ width: "110px" }}>Date & Time</th>
              <th>Customer / Patient</th>
              <th>Doctor / Rx</th>
              <th style={{ width: "80px", textAlign: "center" }}>Items</th>
              <th style={{ width: "90px", textAlign: "right" }}>Subtotal</th>
              <th style={{ width: "80px", textAlign: "right" }}>Tax (GST)</th>
              <th style={{ width: "95px", textAlign: "right" }}>Grand Total</th>
              <th style={{ width: "110px", textAlign: "center" }}>Payment</th>
              <th style={{ width: "140px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={10}
                  style={{ textAlign: "center", padding: "3rem" }}
                >
                  Loading sales records...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    color: "var(--text-muted)",
                  }}
                >
                  No sales invoices found matching the current filters.
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "var(--text-main)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {sale.billNumber}
                    </div>
                    <span
                      className={`badge ${sale.type === "RETAIL" ? "badge-primary" : "badge-cyan"}`}
                      style={{ fontSize: "0.62rem", marginTop: "2px" }}
                    >
                      {sale.type}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-main)",
                        fontWeight: 600,
                      }}
                    >
                      {formatDate(sale.createdAt)}
                    </div>
                    <div
                      style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}
                    >
                      {new Date(sale.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--text-main)" }}>
                      {sale.customerName}
                    </div>
                    {sale.customerPhone && (
                      <div
                        style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}
                      >
                        📞 {sale.customerPhone}
                      </div>
                    )}
                  </td>
                  <td>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {sale.doctorName || "Self / OTC"}
                    </div>
                    {sale.prescriptionNumber && (
                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: "var(--text-dim)",
                        }}
                      >
                        Rx: {sale.prescriptionNumber}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>
                    {sale.items?.length || 0}
                  </td>
                  <td
                    style={{ textAlign: "right", color: "var(--text-muted)" }}
                  >
                    {formatCurrency(sale.subtotal)}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      color: "var(--text-dim)",
                      fontSize: "0.75rem",
                    }}
                  >
                    {formatCurrency(sale.taxAmount)}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: 800,
                      color: "var(--text-main)",
                      fontSize: "0.88rem",
                    }}
                  >
                    {formatCurrency(sale.grandTotal)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      className={`badge ${sale.paymentStatus === "PAID" ? "badge-emerald" : sale.paymentStatus === "PARTIAL" ? "badge-amber" : "badge-rose"}`}
                      style={{ fontSize: "0.65rem" }}
                    >
                      {sale.paymentStatus}
                    </span>
                    <div
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-dim)",
                        marginTop: "2px",
                      }}
                    >
                      {sale.paymentMethod}
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.3rem",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setViewingSaleDetails(sale)}
                        title="View invoice line items"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedSaleForPrint(sale)}
                        title="Print / PDF Invoice"
                      >
                        <Printer size={13} /> PDF
                      </button>
                      {sale.paymentStatus !== "PAID" && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: "0.65rem", padding: "2px 6px" }}
                          onClick={() => {
                            setSettlingSale(sale);
                            setSettleAmount(sale.grandTotal);
                          }}
                          title="Settle Outstanding Credit"
                        >
                          Settle
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Details Modal */}
      {viewingSaleDetails && (
        <Modal
          isOpen={true}
          onClose={() => setViewingSaleDetails(null)}
          title={`Invoice Details: ${viewingSaleDetails.billNumber}`}
          maxWidth="700px"
          footer={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setSelectedSaleForPrint(viewingSaleDetails);
                  setViewingSaleDetails(null);
                }}
              >
                <Printer size={14} /> Print / Save as PDF
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setViewingSaleDetails(null)}
              >
                Close
              </button>
            </div>
          }
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                background: "var(--bg-surface)",
                padding: "0.75rem",
                borderRadius: "var(--radius-xs)",
                border: "1px solid var(--border-subtle)",
                fontSize: "0.78rem",
              }}
            >
              <div>
                <div>
                  <strong>Customer:</strong> {viewingSaleDetails.customerName}
                </div>
                {viewingSaleDetails.customerPhone && (
                  <div>
                    <strong>Phone:</strong> {viewingSaleDetails.customerPhone}
                  </div>
                )}
                <div>
                  <strong>Doctor:</strong>{" "}
                  {viewingSaleDetails.doctorName || "Self / OTC"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div>
                  <strong>Date:</strong>{" "}
                  {formatDateTime(viewingSaleDetails.createdAt)}
                </div>
                <div>
                  <strong>Type:</strong> {viewingSaleDetails.type} BILL
                </div>
                <div>
                  <strong>Payment:</strong> {viewingSaleDetails.paymentMethod} (
                  {viewingSaleDetails.paymentStatus})
                </div>
              </div>
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.76rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f1f5f9",
                    borderBottom: "1px solid var(--border-subtle)",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "6px 8px" }}>Medicine Name</th>
                  <th style={{ padding: "6px 8px" }}>Batch</th>
                  <th style={{ padding: "6px 8px", textAlign: "center" }}>
                    Qty
                  </th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>
                    Rate
                  </th>
                  <th style={{ padding: "6px 8px", textAlign: "center" }}>
                    GST
                  </th>
                  <th style={{ padding: "6px 8px", textAlign: "right" }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {viewingSaleDetails.items?.map((it, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: "1px solid var(--border-subtle)" }}
                  >
                    <td style={{ padding: "6px 8px", fontWeight: 600 }}>
                      {it.medicineName}
                    </td>
                    <td style={{ padding: "6px 8px" }}>{it.batchNumber}</td>
                    <td
                      style={{
                        padding: "6px 8px",
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                    >
                      {it.quantity}
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>
                      {formatCurrency(it.unitPrice)}
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "center" }}>
                      {it.gstRate}%
                    </td>
                    <td
                      style={{
                        padding: "6px 8px",
                        textAlign: "right",
                        fontWeight: 700,
                      }}
                    >
                      {formatCurrency(it.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "220px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                  fontSize: "0.78rem",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Subtotal:</span>
                  <span>{formatCurrency(viewingSaleDetails.subtotal)}</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>GST Tax:</span>
                  <span>{formatCurrency(viewingSaleDetails.taxAmount)}</span>
                </div>
                {viewingSaleDetails.discountAmount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: "var(--rose)",
                    }}
                  >
                    <span>Discount:</span>
                    <span>
                      - {formatCurrency(viewingSaleDetails.discountAmount)}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 800,
                    fontSize: "0.92rem",
                    borderTop: "1px solid var(--border-subtle)",
                    paddingTop: "4px",
                    marginTop: "2px",
                  }}
                >
                  <span>Grand Total:</span>
                  <span>{formatCurrency(viewingSaleDetails.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Settle Credit Modal */}
      {settlingSale && (
        <Modal
          isOpen={true}
          onClose={() => setSettlingSale(null)}
          title={`Settle Credit Payment: ${settlingSale.billNumber}`}
          maxWidth="450px"
          footer={
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setSettlingSale(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSettlePayment}
                disabled={isSettling}
              >
                {isSettling ? "Settling..." : "Confirm Payment Received"}
              </button>
            </div>
          }
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
          >
            <div
              style={{
                background: "var(--bg-surface)",
                padding: "0.75rem",
                borderRadius: "var(--radius-xs)",
                fontSize: "0.78rem",
              }}
            >
              <div>
                <strong>Customer:</strong> {settlingSale.customerName}
              </div>
              <div>
                <strong>Invoice Total:</strong>{" "}
                {formatCurrency(settlingSale.grandTotal)}
              </div>
              <div>
                <strong>Currently Paid:</strong>{" "}
                {formatCurrency(settlingSale.paidAmount)}
              </div>
              <div
                style={{
                  color: "var(--rose)",
                  fontWeight: 700,
                  marginTop: "2px",
                }}
              >
                Pending Balance:{" "}
                {formatCurrency(
                  Math.max(
                    0,
                    settlingSale.grandTotal - settlingSale.paidAmount,
                  ),
                )}
              </div>
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Amount Received (₹)
              </label>
              <input
                type="number"
                className="input"
                value={settleAmount}
                onChange={(e) =>
                  setSettleAmount(parseFloat(e.target.value) || 0)
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Payment Mode
              </label>
              <select
                className="select"
                value={settleMethod}
                onChange={(e) => setSettleMethod(e.target.value as any)}
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI / QR</option>
                <option value="CARD">Debit / Credit Card</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* PDF / Print Modal */}
      {selectedSaleForPrint && (
        <InvoicePrintModal
          isOpen={true}
          onClose={() => setSelectedSaleForPrint(null)}
          sale={selectedSaleForPrint}
          settings={settings}
        />
      )}
    </div>
  );
};
