import React from "react";
import type { Sale, StoreSettings } from "../../types";
import { Modal } from "../common/ModalAndToast";
import { Printer } from "lucide-react";
import { generateAndPrintInvoice } from "../../utils/pdfGenerator";
import {
  formatCurrency,
  formatDate,
  formatMonthYear,
} from "../../utils/formatters";

interface InvoicePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  settings: StoreSettings | null;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  isOpen,
  onClose,
  sale,
  settings,
}) => {
  const [printFormat, setPrintFormat] = React.useState<"thermal" | "a4">("a4");

  if (!sale) return null;

  const handlePrint = () => {
    generateAndPrintInvoice(sale, settings, printFormat);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tax Invoice - ${sale.billNumber}`}
      maxWidth={printFormat === "thermal" ? "450px" : "780px"}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className={`btn btn-sm ${printFormat === "a4" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setPrintFormat("a4")}
            >
              Standard A4 GST
            </button>
            <button
              className={`btn btn-sm ${printFormat === "thermal" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setPrintFormat("thermal")}
            >
              Thermal 80mm
            </button>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handlePrint}
              title="Generate vector PDF / Print dialog"
            >
              <Printer size={15} /> Print / Save as PDF
            </button>
          </div>
        </div>
      }
    >
      {/* Printable Area */}
      <div
        id="printable-invoice"
        style={{
          backgroundColor: "#ffffff",
          color: "#0f172a",
          padding: printFormat === "thermal" ? "1rem" : "1.5rem",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
          fontFamily:
            printFormat === "thermal" ? "var(--font-mono)" : "var(--font-main)",
          fontSize: printFormat === "thermal" ? "0.72rem" : "0.82rem",
          lineHeight: 1.4,
        }}
      >
        {printFormat === "thermal" ? (
          /* THERMAL 80mm RECEIPT */
          <div style={{ textAlign: "center" }}>
            <h3
              style={{
                fontSize: "1.05rem",
                fontWeight: 800,
                margin: 0,
                color: "#0f172a",
              }}
            >
              {settings?.pharmacyName || "INFINITY PHARMA SOLUTIONS"}
            </h3>
            <p style={{ margin: "2px 0", color: "#475569" }}>
              {settings?.tagline}
            </p>
            <p style={{ margin: "2px 0", color: "#334155" }}>
              {settings?.address}, {settings?.city} - {settings?.pincode}
            </p>
            <p style={{ margin: "2px 0", color: "#334155" }}>
              Ph: {settings?.phone} | GST: {settings?.gstin}
            </p>
            <p style={{ margin: "2px 0", color: "#334155" }}>
              DL No: {settings?.dlNumber}
            </p>
            <div
              style={{ borderBottom: "1px dashed #0f172a", margin: "0.5rem 0" }}
            />

            <div
              style={{
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.75rem",
              }}
            >
              <div>
                <strong>Bill No:</strong> {sale.billNumber}
                <br />
                <strong>Customer:</strong> {sale.customerName}
                <br />
                {sale.doctorName && (
                  <span>
                    <strong>Doctor:</strong> {sale.doctorName}
                    <br />
                  </span>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <strong>Date:</strong> {formatDate(sale.createdAt)}
                <br />
                <span style={{ textTransform: "uppercase", fontWeight: 700 }}>
                  {sale.type} BILL
                </span>
                <br />
                <span>Pay: {sale.paymentMethod}</span>
              </div>
            </div>

            <div
              style={{ borderBottom: "1px dashed #0f172a", margin: "0.5rem 0" }}
            />

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.72rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid #0f172a" }}>
                  <th>Item</th>
                  <th>Batch</th>
                  <th>Exp</th>
                  <th style={{ textAlign: "center" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Rate</th>
                  <th style={{ textAlign: "right" }}>Amt</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px dotted #cbd5e1" }}>
                    <td style={{ fontWeight: 600 }}>{it.medicineName}</td>
                    <td>{it.batchNumber}</td>
                    <td>{formatMonthYear(it.expiryDate)}</td>
                    <td style={{ textAlign: "center" }}>{it.quantity}</td>
                    <td style={{ textAlign: "right" }}>
                      {formatCurrency(it.unitPrice)}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                      {formatCurrency(it.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{ borderBottom: "1px dashed #0f172a", margin: "0.5rem 0" }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                textAlign: "right",
                fontSize: "0.76rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Sub Total:</span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>GST Tax (Included):</span>
                <span>{formatCurrency(sale.taxAmount)}</span>
              </div>
              {sale.discountAmount > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#e11d48",
                  }}
                >
                  <span>Discount:</span>
                  <span>- {formatCurrency(sale.discountAmount)}</span>
                </div>
              )}
              {sale.roundOff !== 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#64748b",
                  }}
                >
                  <span>Round Off:</span>
                  <span>{formatCurrency(sale.roundOff)}</span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  borderTop: "1px solid #0f172a",
                  paddingTop: "4px",
                }}
              >
                <span>NET PAYABLE:</span>
                <span>{formatCurrency(sale.grandTotal)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "2px",
                }}
              >
                <span>Paid ({sale.paymentMethod}):</span>
                <span>{formatCurrency(sale.paidAmount)}</span>
              </div>
              {sale.changeAmount > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#059669",
                    fontWeight: 600,
                  }}
                >
                  <span>Change Returned:</span>
                  <span>{formatCurrency(sale.changeAmount)}</span>
                </div>
              )}
            </div>

            <div
              style={{ borderBottom: "1px dashed #0f172a", margin: "0.5rem 0" }}
            />
            <p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 600 }}>
              {settings?.invoiceFooter || "Thank you! Get well soon."}
            </p>
          </div>
        ) : (
          /* STANDARD A4 GST TAX INVOICE */
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "2px solid #0f172a",
                paddingBottom: "0.75rem",
                marginBottom: "0.85rem",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  {settings?.pharmacyName || "INFINITY PHARMA SOLUTIONS"}
                </h2>
                <p
                  style={{
                    margin: "2px 0",
                    fontSize: "0.75rem",
                    color: "#475569",
                  }}
                >
                  {settings?.tagline}
                </p>
                <p
                  style={{
                    margin: "2px 0",
                    fontSize: "0.72rem",
                    color: "#334155",
                  }}
                >
                  {settings?.address}, {settings?.city} - {settings?.pincode}
                </p>
                <p
                  style={{
                    margin: "2px 0",
                    fontSize: "0.72rem",
                    color: "#334155",
                  }}
                >
                  <strong>GSTIN:</strong> {settings?.gstin} |{" "}
                  <strong>DL No:</strong> {settings?.dlNumber}
                </p>
                <p
                  style={{
                    margin: "2px 0",
                    fontSize: "0.72rem",
                    color: "#334155",
                  }}
                >
                  <strong>Phone:</strong> {settings?.phone} |{" "}
                  <strong>Email:</strong> {settings?.email}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    display: "inline-block",
                    border: "1.5px solid #0f172a",
                    padding: "0.2rem 0.6rem",
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    marginBottom: "0.4rem",
                    textTransform: "uppercase",
                  }}
                >
                  TAX INVOICE ({sale.type})
                </div>
                <div style={{ fontSize: "0.76rem" }}>
                  <strong>Invoice No:</strong> {sale.billNumber}
                </div>
                <div style={{ fontSize: "0.76rem" }}>
                  <strong>Date:</strong> {formatDate(sale.createdAt)}
                </div>
                <div style={{ fontSize: "0.76rem" }}>
                  <strong>Payment:</strong> {sale.paymentMethod} (
                  {sale.paymentStatus})
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-xs)",
                marginBottom: "0.85rem",
                fontSize: "0.76rem",
              }}
            >
              <div>
                <strong style={{ textDecoration: "underline" }}>
                  Billed To:
                </strong>
                <br />
                <strong>Customer:</strong> {sale.customerName}
                <br />
                {sale.customerPhone && (
                  <span>
                    <strong>Phone:</strong> {sale.customerPhone}
                    <br />
                  </span>
                )}
                {sale.customer?.gstin && (
                  <span>
                    <strong>GSTIN:</strong> {sale.customer.gstin}
                    <br />
                  </span>
                )}
                {sale.customer?.address && (
                  <span>
                    <strong>Address:</strong> {sale.customer.address}
                  </span>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <strong style={{ textDecoration: "underline" }}>
                  Prescription Details:
                </strong>
                <br />
                <strong>Doctor:</strong> {sale.doctorName || "Self / OTC"}
                <br />
                <strong>Rx No:</strong> {sale.prescriptionNumber || "N/A"}
              </div>
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                marginBottom: "0.85rem",
                fontSize: "0.76rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f1f5f9",
                    borderTop: "1px solid #0f172a",
                    borderBottom: "1px solid #0f172a",
                  }}
                >
                  <th style={{ padding: "5px 6px" }}>#</th>
                  <th style={{ padding: "5px 6px" }}>Medicine / Composition</th>
                  <th style={{ padding: "5px 6px" }}>Batch</th>
                  <th style={{ padding: "5px 6px" }}>Expiry</th>
                  <th style={{ padding: "5px 6px", textAlign: "center" }}>
                    Qty
                  </th>
                  <th style={{ padding: "5px 6px", textAlign: "right" }}>
                    MRP
                  </th>
                  <th style={{ padding: "5px 6px", textAlign: "right" }}>
                    Rate
                  </th>
                  <th style={{ padding: "5px 6px", textAlign: "center" }}>
                    GST%
                  </th>
                  <th style={{ padding: "5px 6px", textAlign: "center" }}>
                    Disc%
                  </th>
                  <th style={{ padding: "5px 6px", textAlign: "right" }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "5px 6px", color: "#64748b" }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: "5px 6px", fontWeight: 600 }}>
                      {it.medicineName}
                    </td>
                    <td style={{ padding: "5px 6px" }}>{it.batchNumber}</td>
                    <td style={{ padding: "5px 6px" }}>
                      {formatMonthYear(it.expiryDate)}
                    </td>
                    <td
                      style={{
                        padding: "5px 6px",
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                    >
                      {it.quantity}
                    </td>
                    <td style={{ padding: "5px 6px", textAlign: "right" }}>
                      {formatCurrency(it.mrp)}
                    </td>
                    <td style={{ padding: "5px 6px", textAlign: "right" }}>
                      {formatCurrency(it.unitPrice)}
                    </td>
                    <td style={{ padding: "5px 6px", textAlign: "center" }}>
                      {it.gstRate}%
                    </td>
                    <td style={{ padding: "5px 6px", textAlign: "center" }}>
                      {it.discountPercent}%
                    </td>
                    <td
                      style={{
                        padding: "5px 6px",
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
                justifyContent: "space-between",
                borderTop: "1.5px solid #0f172a",
                paddingTop: "0.65rem",
              }}
            >
              <div style={{ width: "55%" }}>
                <p style={{ margin: 0, fontSize: "0.72rem" }}>
                  <strong>Terms & Conditions:</strong>
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.68rem",
                    color: "#475569",
                    lineHeight: 1.35,
                  }}
                >
                  1. Goods once sold will not be taken back without valid bill.
                  <br />
                  2. Medicines requiring refrigeration must be stored at 2°C -
                  8°C.
                  <br />
                  3. Subject to local jurisdiction only.
                </p>
                <div style={{ marginTop: "2rem" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Authorized Signatory / Pharmacist
                  </p>
                </div>
              </div>

              <div
                style={{
                  width: "42%",
                  textAlign: "right",
                  fontSize: "0.78rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 0",
                  }}
                >
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>
                    {formatCurrency(sale.subtotal)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "2px 0",
                  }}
                >
                  <span>GST Breakdown (CGST+SGST):</span>
                  <span>{formatCurrency(sale.taxAmount)}</span>
                </div>
                {sale.discountAmount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "2px 0",
                      color: "#e11d48",
                    }}
                  >
                    <span>Total Discount:</span>
                    <span>- {formatCurrency(sale.discountAmount)}</span>
                  </div>
                )}
                {sale.roundOff !== 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "2px 0",
                      color: "#64748b",
                    }}
                  >
                    <span>Round Off:</span>
                    <span>{formatCurrency(sale.roundOff)}</span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 0",
                    borderTop: "1.5px solid #0f172a",
                    borderBottom: "1.5px solid #0f172a",
                    fontSize: "1rem",
                    fontWeight: 800,
                    margin: "4px 0",
                  }}
                >
                  <span>Grand Total:</span>
                  <span>{formatCurrency(sale.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
