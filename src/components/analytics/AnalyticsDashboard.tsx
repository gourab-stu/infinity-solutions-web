import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Flame,
  Turtle,
} from "lucide-react";
import type {
  DashboardMetrics,
  SalesTrendItem,
  TopMedicine,
} from "../../types";
import { api } from "../../services/api";

interface AnalyticsDashboardProps {
  onShowToast: (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
  ) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  onShowToast,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trend, setTrend] = useState<SalesTrendItem[]>([]);
  const [topMedicines, setTopMedicines] = useState<TopMedicine[]>([]);
  const [fastSlow, setFastSlow] = useState<{
    fastMoving: any[];
    slowMoving: any[];
  }>({ fastMoving: [], slowMoving: [] });
  const [gstr1, setGstr1] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [m, t, top, fs, gstr] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getSalesTrend(7),
        api.getTopMedicines(5),
        api.getFastSlowMoving(),
        api.getGSTR1(),
      ]);

      setMetrics(m);
      setTrend(t);
      setTopMedicines(top);
      setFastSlow(fs);
      setGstr1(gstr);
    } catch (err: any) {
      onShowToast("error", "Analytics Error", err.message);
    }
  };

  const maxSalesInTrend = Math.max(...trend.map((t) => t.sales), 100);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        overflowY: "auto",
        paddingBottom: "2rem",
      }}
    >
      {/* Top KPI Metrics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
        }}
      >
        {/* Metric 1: Today's Sales */}
        <div
          className="card"
          style={{ padding: "1.25rem", borderLeft: "4px solid var(--primary)" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              TODAY'S REVENUE
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "var(--primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DollarSign size={18} color="var(--primary)" />
            </div>
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--text-main)",
              margin: "0.5rem 0",
              fontFamily: "var(--font-mono)",
            }}
          >
            ₹{(metrics?.todaySales || 0).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
            <strong>{metrics?.todayInvoicesCount || 0}</strong> invoices billed
            today
          </div>
        </div>

        {/* Metric 2: Month Revenue */}
        <div
          className="card"
          style={{ padding: "1.25rem", borderLeft: "4px solid var(--cyan)" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              MONTH-TO-DATE SALES
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "var(--cyan-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={18} color="var(--cyan)" />
            </div>
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--text-main)",
              margin: "0.5rem 0",
              fontFamily: "var(--font-mono)",
            }}
          >
            ₹{(metrics?.monthSales || 0).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
            Current month turnover
          </div>
        </div>

        {/* Metric 3: Total Stock Valuation */}
        <div
          className="card"
          style={{ padding: "1.25rem", borderLeft: "4px solid var(--indigo)" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              INVENTORY VALUATION
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "var(--indigo-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Package size={18} color="var(--indigo)" />
            </div>
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "var(--text-main)",
              margin: "0.5rem 0",
              fontFamily: "var(--font-mono)",
            }}
          >
            ₹{(metrics?.totalStockValue || 0).toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
            Purchase cost value on shelf
          </div>
        </div>

        {/* Metric 4: Risk & Alerts */}
        <div
          className="card"
          style={{ padding: "1.25rem", borderLeft: "4px solid var(--amber)" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              STOCK ALERTS
            </span>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "var(--amber-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={18} color="var(--amber)" />
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", margin: "0.5rem 0" }}>
            <div>
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "var(--amber)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {metrics?.nearExpiryCount || 0}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                Near Expiry
              </div>
            </div>
            <div
              style={{
                borderLeft: "1px solid var(--border-subtle)",
                paddingLeft: "1rem",
              }}
            >
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "var(--rose)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {metrics?.lowStockCount || 0}
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                Low Stock
              </div>
            </div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
            Immediate attention required
          </div>
        </div>
      </div>

      {/* Row 2: 7-Day Sales Trend & Top Selling Medicines */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "1.25rem",
        }}
      >
        {/* Sales & Profit Trend Visualizer */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                }}
              >
                7-Day Revenue & Profit Margin
              </h3>
              <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Daily breakdown of sales volume and estimated gross profit
              </p>
            </div>
            <div
              style={{ display: "flex", gap: "0.75rem", fontSize: "0.75rem" }}
            >
              <span
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "2px",
                    background: "var(--primary)",
                    display: "inline-block",
                  }}
                ></span>
                Revenue
              </span>
              <span
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "2px",
                    background: "var(--cyan)",
                    display: "inline-block",
                  }}
                ></span>
                Gross Profit
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: "180px",
              paddingTop: "1rem",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            {trend.map((t) => {
              const heightPercent = Math.min(
                100,
                Math.max(15, (t.sales / maxSalesInTrend) * 100),
              );
              const profitPercent = Math.min(
                100,
                Math.max(8, (t.profit / maxSalesInTrend) * 100),
              );

              return (
                <div
                  key={t.date}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.4rem",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "var(--text-main)",
                    }}
                  >
                    ₹{t.sales > 0 ? t.sales.toFixed(0) : 0}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "3px",
                      alignItems: "flex-end",
                      height: "120px",
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: `${heightPercent}%`,
                        borderRadius: "4px 4px 0 0",
                        background:
                          "linear-gradient(to top, var(--primary), #34d399)",
                        transition: "height 0.3s ease",
                      }}
                      title={`Sales: ₹${t.sales}`}
                    />
                    <div
                      style={{
                        width: "18px",
                        height: `${profitPercent}%`,
                        borderRadius: "4px 4px 0 0",
                        background:
                          "linear-gradient(to top, var(--cyan), #38bdf8)",
                        transition: "height 0.3s ease",
                      }}
                      title={`Profit: ₹${t.profit}`}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                    }}
                  >
                    {new Date(t.date).toLocaleDateString("en-IN", {
                      weekday: "short",
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Medicines */}
        <div
          className="card"
          style={{
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--text-main)",
              marginBottom: "0.25rem",
            }}
          >
            Top Selling Medicines
          </h3>
          <p
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              marginBottom: "1rem",
            }}
          >
            By total volume and revenue generated
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              flex: 1,
            }}
          >
            {topMedicines.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "var(--text-muted)",
                }}
              >
                No sales transactions recorded yet.
              </div>
            ) : (
              topMedicines.map((m, idx) => (
                <div
                  key={m.medicineName}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.82rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: "var(--primary)",
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span
                      style={{ fontWeight: 600, color: "var(--text-main)" }}
                    >
                      {m.medicineName}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-main)" }}>
                      ₹{m.totalRevenue.toFixed(2)}
                    </div>
                    <div
                      style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}
                    >
                      {m.quantitySold} units
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Fast vs Slow Moving Analysis & GSTR-1 Tax Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.25rem",
        }}
      >
        {/* Fast vs Slow Moving */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <h3
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--text-main)",
              marginBottom: "0.25rem",
            }}
          >
            Inventory Velocity Analysis
          </h3>
          <p
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              marginBottom: "1rem",
            }}
          >
            Fast moving items to reorder & slow moving stock
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            {/* Fast Moving */}
            <div
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.05)",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  color: "var(--primary)",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  marginBottom: "0.5rem",
                }}
              >
                <Flame size={16} /> Fast Moving
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                  fontSize: "0.75rem",
                }}
              >
                {fastSlow.fastMoving.slice(0, 4).map((f) => (
                  <div
                    key={f.medicineName}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>{f.medicineName}</span>
                    <strong style={{ color: "var(--primary)" }}>
                      {f.quantitySold} sold
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Slow Moving */}
            <div
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.05)",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  color: "var(--amber)",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  marginBottom: "0.5rem",
                }}
              >
                <Turtle size={16} /> Slow Moving
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                  fontSize: "0.75rem",
                }}
              >
                {fastSlow.slowMoving.length === 0 ? (
                  <span style={{ color: "var(--text-dim)" }}>
                    All items have steady sales.
                  </span>
                ) : (
                  fastSlow.slowMoving.slice(0, 4).map((s) => (
                    <div
                      key={s.medicineName}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{s.medicineName}</span>
                      <strong style={{ color: "var(--amber)" }}>
                        {s.stock} in shelf
                      </strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* GSTR-1 GST Tax Report Summary */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.25rem",
            }}
          >
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--text-main)",
              }}
            >
              GSTR-1 Tax Summary
            </h3>
            <span className="badge badge-cyan" style={{ fontSize: "0.65rem" }}>
              Current Month
            </span>
          </div>
          <p
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              marginBottom: "0.75rem",
            }}
          >
            Rate-wise taxable turnover & CGST / SGST collections
          </p>

          <table className="data-table" style={{ fontSize: "0.78rem" }}>
            <thead>
              <tr>
                <th>GST Slab</th>
                <th style={{ textAlign: "right" }}>Taxable Value (₹)</th>
                <th style={{ textAlign: "right" }}>CGST (₹)</th>
                <th style={{ textAlign: "right" }}>SGST (₹)</th>
                <th style={{ textAlign: "right" }}>Total Tax (₹)</th>
              </tr>
            </thead>
            <tbody>
              {!gstr1?.rateWiseBreakdown ||
              gstr1.rateWiseBreakdown.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "1rem",
                      color: "var(--text-dim)",
                    }}
                  >
                    No GST sales recorded this period.
                  </td>
                </tr>
              ) : (
                gstr1.rateWiseBreakdown.map((r: any) => (
                  <tr key={r.gstRate}>
                    <td style={{ fontWeight: 700 }}>{r.gstRate}% GST</td>
                    <td style={{ textAlign: "right" }}>
                      ₹{r.taxable.toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ₹{(r.taxAmount / 2).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ₹{(r.taxAmount / 2).toFixed(2)}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 700,
                        color: "var(--cyan)",
                      }}
                    >
                      ₹{r.taxAmount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {gstr1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "0.75rem",
                paddingTop: "0.5rem",
                borderTop: "1px solid var(--border-subtle)",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              <span>Total Taxable: ₹{gstr1.totalTaxable?.toFixed(2)}</span>
              <span style={{ color: "var(--cyan)" }}>
                Total GST Collected: ₹
                {(gstr1.totalCgst + gstr1.totalSgst)?.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
