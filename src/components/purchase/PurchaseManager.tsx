import React, { useState, useEffect } from "react";
import { Truck, Plus, Trash2, Save, PackagePlus, Eye } from "lucide-react";
import type { Purchase, Supplier, Medicine } from "../../types";
import { api } from "../../services/api";
import { Modal } from "../common/ModalAndToast";

interface PurchaseManagerProps {
  onShowToast: (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
  ) => void;
  onRefreshStats?: () => void;
}

interface NewPurchaseItemRow {
  medicineId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  freeQuantity: number;
  unitCost: number;
  mrp: number;
  gstRate: number;
  discount: number;
}

export const PurchaseManager: React.FC<PurchaseManagerProps> = ({
  onShowToast,
  onRefreshStats,
}) => {
  const [activeTab, setActiveTab] = useState<"history" | "new_entry">(
    "history",
  );

  // Purchase History
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Suppliers & Medicines for Entry
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // New Purchase Entry Form State
  const [supplierId, setSupplierId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dueDate, setDueDate] = useState("");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "BANK_TRANSFER" | "CASH" | "UPI" | "CREDIT"
  >("BANK_TRANSFER");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<NewPurchaseItemRow[]>([]);
  const [selectedMedForAdd, setSelectedMedForAdd] = useState("");

  // View Details Modal
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null,
  );

  useEffect(() => {
    loadPurchases();
    loadSuppliersAndMeds();
  }, []);

  const loadPurchases = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPurchases();
      setPurchases(data.purchases);
      setTotalPurchases(data.total);
    } catch (err: any) {
      onShowToast("error", "Error loading purchases", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuppliersAndMeds = async () => {
    try {
      const [sList, mList] = await Promise.all([
        api.getSuppliers(),
        api.getMedicines(),
      ]);
      setSuppliers(sList);
      setMedicines(mList);
    } catch (err) {
      console.error(err);
    }
  };

  const addItemRow = () => {
    if (!selectedMedForAdd) return;
    const med = medicines.find((m) => m.id === selectedMedForAdd);
    if (!med) return;

    const twoYearsFuture = new Date();
    twoYearsFuture.setFullYear(twoYearsFuture.getFullYear() + 2);

    setItems([
      ...items,
      {
        medicineId: med.id,
        batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: twoYearsFuture.toISOString().split("T")[0],
        quantity: 50,
        freeQuantity: 0,
        unitCost: 100,
        mrp: 150,
        gstRate: med.gstRate || 12,
        discount: 0,
      },
    ]);
    setSelectedMedForAdd("");
  };

  const updateItemRow = (
    index: number,
    field: keyof NewPurchaseItemRow,
    value: any,
  ) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const removeItemRow = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  // Calculations
  const calculatedSubtotal = items.reduce((sum, it) => {
    const gross = it.quantity * it.unitCost;
    return sum + (gross - it.discount);
  }, 0);

  const calculatedTax = items.reduce((sum, it) => {
    const taxable = Math.max(0, it.quantity * it.unitCost - it.discount);
    return sum + taxable * (it.gstRate / 100);
  }, 0);

  const totalAmount =
    Math.round((calculatedSubtotal + calculatedTax) * 100) / 100;

  useEffect(() => {
    setPaidAmount(totalAmount);
  }, [totalAmount]);

  // Submit Purchase
  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      onShowToast("error", "Supplier Required", "Please select a supplier");
      return;
    }
    if (!invoiceNumber.trim()) {
      onShowToast(
        "error",
        "Invoice No Required",
        "Enter supplier invoice number",
      );
      return;
    }
    if (items.length === 0) {
      onShowToast("error", "Items Required", "Add at least one medicine item");
      return;
    }

    try {
      const payload = {
        supplierId,
        invoiceNumber,
        purchaseDate,
        dueDate: dueDate || null,
        paidAmount,
        paymentMethod,
        notes: notes || null,
        items,
      };

      const created = await api.createPurchase(payload);
      onShowToast(
        "success",
        "GRN Created",
        `Purchase ${created.invoiceNumber} recorded and stock batches replenished!`,
      );

      // Reset form
      setSupplierId("");
      setInvoiceNumber("");
      setItems([]);
      setNotes("");
      setActiveTab("history");
      loadPurchases();
      if (onRefreshStats) onRefreshStats();
    } catch (err: any) {
      onShowToast("error", "Purchase Failed", err.message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        height: "100%",
      }}
    >
      {/* Top Header & Tab Toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className={`btn btn-sm ${activeTab === "history" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("history")}
          >
            <Truck size={16} /> Purchase Invoices ({totalPurchases})
          </button>
          <button
            className={`btn btn-sm ${activeTab === "new_entry" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("new_entry")}
          >
            <PackagePlus size={16} /> Record Inward Bill (GRN)
          </button>
        </div>
      </div>

      {/* VIEW 1: PURCHASE HISTORY */}
      {activeTab === "history" && (
        <div
          className="data-table-container"
          style={{ flex: 1, overflowY: "auto" }}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Supplier / Distributor</th>
                <th>Purchase Date</th>
                <th style={{ textAlign: "center" }}>Items Count</th>
                <th style={{ textAlign: "right" }}>Total Amount (₹)</th>
                <th style={{ textAlign: "right" }}>Paid (₹)</th>
                <th style={{ textAlign: "center" }}>Payment Status</th>
                <th style={{ width: "80px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "3rem" }}
                  >
                    Loading purchases...
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    No purchase invoices recorded yet. Click "Record Inward
                    Bill" to add your first supplier invoice.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span
                        className="badge badge-cyan"
                        style={{ fontSize: "0.75rem", fontWeight: 700 }}
                      >
                        {p.invoiceNumber}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{ fontWeight: 700, color: "var(--text-main)" }}
                      >
                        {p.supplier?.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-dim)",
                        }}
                      >
                        GSTIN: {p.supplier?.gstin || "N/A"} • Ph:{" "}
                        {p.supplier?.phone}
                      </div>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {new Date(p.purchaseDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>
                      {p.items?.length || 0}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 700,
                        color: "var(--text-main)",
                      }}
                    >
                      ₹{p.totalAmount.toFixed(2)}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        color: "var(--primary)",
                        fontWeight: 600,
                      }}
                    >
                      ₹{p.paidAmount.toFixed(2)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`badge ${p.paymentStatus === "PAID" ? "badge-emerald" : p.paymentStatus === "PARTIAL" ? "badge-amber" : "badge-rose"}`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedPurchase(p)}
                        title="View Items"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: RECORD GOODS RECEIVED NOTE (GRN) */}
      {activeTab === "new_entry" && (
        <form
          onSubmit={handleSubmitPurchase}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Supplier & Header Metadata */}
          <div
            className="card"
            style={{
              padding: "1.25rem",
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1rem",
            }}
          >
            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Supplier / Distributor *
              </label>
              <select
                required
                className="select"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city || "Vendor"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Supplier Invoice / Bill No *
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. INV-SUN-9921"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Purchase Date *
              </label>
              <input
                type="date"
                required
                className="input"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Credit Due Date (Optional)
              </label>
              <input
                type="date"
                className="input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Item Adder Bar */}
          <div
            className="card"
            style={{
              padding: "0.85rem 1rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1 }}>
              <select
                className="select"
                value={selectedMedForAdd}
                onChange={(e) => setSelectedMedForAdd(e.target.value)}
              >
                <option value="">
                  Select medicine to add to purchase bill...
                </option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.genericName}) - SKU: {m.sku}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={addItemRow}
              disabled={!selectedMedForAdd}
            >
              <Plus size={16} /> Add Medicine Line
            </button>
          </div>

          {/* Inward Items Table */}
          <div
            className="data-table-container"
            style={{ flex: 1, overflowY: "auto" }}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "35px" }}>#</th>
                  <th>Medicine</th>
                  <th style={{ width: "130px" }}>Batch No</th>
                  <th style={{ width: "130px" }}>Expiry Date</th>
                  <th style={{ width: "85px", textAlign: "center" }}>Qty</th>
                  <th style={{ width: "85px", textAlign: "center" }}>
                    Free Qty
                  </th>
                  <th style={{ width: "95px", textAlign: "right" }}>
                    Cost Price
                  </th>
                  <th style={{ width: "95px", textAlign: "right" }}>MRP</th>
                  <th style={{ width: "70px", textAlign: "center" }}>GST%</th>
                  <th style={{ width: "95px", textAlign: "right" }}>
                    Total (₹)
                  </th>
                  <th style={{ width: "40px" }}></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "var(--text-dim)",
                      }}
                    >
                      Select a medicine above and click "Add Medicine Line" to
                      populate items.
                    </td>
                  </tr>
                ) : (
                  items.map((row, idx) => {
                    const med = medicines.find((m) => m.id === row.medicineId);
                    const lineGross = row.quantity * row.unitCost;
                    const lineTax =
                      (lineGross - row.discount) * (row.gstRate / 100);
                    const lineTotal = lineGross - row.discount + lineTax;

                    return (
                      <tr key={idx}>
                        <td style={{ color: "var(--text-dim)" }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700 }}>{med?.name}</td>
                        <td>
                          <input
                            type="text"
                            required
                            className="input"
                            style={{ padding: "3px 6px", fontSize: "0.8rem" }}
                            value={row.batchNumber}
                            onChange={(e) =>
                              updateItemRow(idx, "batchNumber", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="date"
                            required
                            className="input"
                            style={{ padding: "3px 6px", fontSize: "0.8rem" }}
                            value={row.expiryDate}
                            onChange={(e) =>
                              updateItemRow(idx, "expiryDate", e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={1}
                            required
                            className="input"
                            style={{
                              padding: "3px 6px",
                              textAlign: "center",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                            }}
                            value={row.quantity}
                            onChange={(e) =>
                              updateItemRow(
                                idx,
                                "quantity",
                                parseInt(e.target.value) || 1,
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            className="input"
                            style={{
                              padding: "3px 6px",
                              textAlign: "center",
                              fontSize: "0.85rem",
                            }}
                            value={row.freeQuantity}
                            onChange={(e) =>
                              updateItemRow(
                                idx,
                                "freeQuantity",
                                parseInt(e.target.value) || 0,
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            required
                            className="input"
                            style={{
                              padding: "3px 6px",
                              textAlign: "right",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                            value={row.unitCost}
                            onChange={(e) =>
                              updateItemRow(
                                idx,
                                "unitCost",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.1"
                            required
                            className="input"
                            style={{
                              padding: "3px 6px",
                              textAlign: "right",
                              fontSize: "0.85rem",
                            }}
                            value={row.mrp}
                            onChange={(e) =>
                              updateItemRow(
                                idx,
                                "mrp",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                          />
                        </td>
                        <td style={{ textAlign: "center", fontSize: "0.8rem" }}>
                          {row.gstRate}%
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                          }}
                        >
                          ₹{lineTotal.toFixed(2)}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--rose)",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Summary & Actions */}
          <div
            className="card"
            style={{
              padding: "1rem 1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}
            >
              <div>
                <span
                  style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                >
                  Subtotal:{" "}
                </span>
                <strong style={{ color: "var(--text-main)" }}>
                  ₹{calculatedSubtotal.toFixed(2)}
                </strong>
              </div>
              <div>
                <span
                  style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                >
                  GST Tax:{" "}
                </span>
                <strong style={{ color: "var(--cyan)" }}>
                  ₹{calculatedTax.toFixed(2)}
                </strong>
              </div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: "var(--primary)",
                  borderLeft: "1px solid var(--border-subtle)",
                  paddingLeft: "1.5rem",
                }}
              >
                Total: ₹{totalAmount.toFixed(2)}
              </div>
            </div>

            <div
              style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
            >
              <div>
                <span
                  style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                >
                  Paid (₹):{" "}
                </span>
                <input
                  type="number"
                  className="input"
                  style={{ width: "110px", display: "inline-block" }}
                  value={paidAmount}
                  onChange={(e) =>
                    setPaidAmount(parseFloat(e.target.value) || 0)
                  }
                />
              </div>

              <select
                className="select"
                style={{ width: "130px" }}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CREDIT">Credit (Unpaid)</option>
              </select>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={items.length === 0}
              >
                <Save size={18} /> Record & Replenish Stock
              </button>
            </div>
          </div>
        </form>
      )}

      {/* View Purchase Modal */}
      {selectedPurchase && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPurchase(null)}
          title={`Purchase Bill: ${selectedPurchase.invoiceNumber}`}
          maxWidth="700px"
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                backgroundColor: "var(--bg-surface)",
                padding: "0.85rem",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
              }}
            >
              <div>
                <strong>Supplier:</strong> {selectedPurchase.supplier?.name}
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {new Date(selectedPurchase.purchaseDate).toLocaleDateString(
                  "en-IN",
                )}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span className="badge badge-emerald">
                  {selectedPurchase.paymentStatus}
                </span>
              </div>
              <div>
                <strong>Total Amount:</strong> ₹
                {selectedPurchase.totalAmount.toFixed(2)}
              </div>
            </div>

            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--cyan)",
              }}
            >
              Received Items:
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Batch</th>
                  <th>Expiry</th>
                  <th style={{ textAlign: "right" }}>Qty</th>
                  <th style={{ textAlign: "right" }}>Unit Cost</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedPurchase.items?.map((it) => (
                  <tr key={it.id}>
                    <td style={{ fontWeight: 600 }}>{it.medicine?.name}</td>
                    <td>
                      <span className="badge badge-cyan">{it.batchNumber}</span>
                    </td>
                    <td>
                      {new Date(it.expiryDate).toLocaleDateString("en-IN", {
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {it.quantity}{" "}
                      {it.freeQuantity > 0 ? `(+${it.freeQuantity} Free)` : ""}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      ₹{it.unitCost.toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                      ₹{it.totalCost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
};
