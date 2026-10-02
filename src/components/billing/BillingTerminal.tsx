import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Sparkles,
  UserPlus,
  Layers,
  DollarSign,
  CreditCard,
  Smartphone,
  Wallet,
  RotateCcw,
  Save,
} from "lucide-react";
import type {
  Medicine,
  Batch,
  CartItem,
  Customer,
  Doctor,
  Sale,
  StoreSettings,
} from "../../types";
import { api } from "../../services/api";
import { formatCurrency, formatShortDate } from "../../utils/formatters";
import { Modal } from "../common/ModalAndToast";
import { InvoicePrintModal } from "./InvoicePrintModal";

interface BillingTerminalProps {
  settings: StoreSettings | null;
  onShowToast: (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
  ) => void;
}

export const BillingTerminal: React.FC<BillingTerminalProps> = ({
  settings,
  onShowToast,
}) => {
  // Billing Mode
  const [billingType, setBillingType] = useState<"RETAIL" | "WHOLESALE">(
    "RETAIL",
  );

  // Search & Items
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Parties & Metadata
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [walkInName, setWalkInName] = useState("Walk-in Customer");
  const [walkInPhone, setWalkInPhone] = useState("");

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [rxNumber, setRxNumber] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "UPI" | "CARD" | "CREDIT"
  >("CASH");
  const [additionalDiscount, setAdditionalDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Modals & States
  const [batchModalItem, setBatchModalItem] = useState<{
    medicine: Medicine;
    batches: Batch[];
  } | null>(null);
  const [heldBills, setHeldBills] = useState<
    {
      id: string;
      time: string;
      customerName: string;
      cart: CartItem[];
      billingType: "RETAIL" | "WHOLESALE";
    }[]
  >([]);
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustGstin, setNewCustGstin] = useState("");

  // Completed Invoice & Print Modal
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial parties
  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = async () => {
    try {
      const [cList, dList] = await Promise.all([
        api.getCustomers(),
        api.getDoctors(),
      ]);
      setCustomers(cList);
      setDoctors(dList);
    } catch (err) {
      console.error("Failed to load customers/doctors", err);
    }
  };

  // Search Medicines
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await api.getMedicines({ search: searchQuery });
        setSearchResults(
          results.filter((m) => m.batches && m.batches.length > 0),
        );
      } catch (err) {
        console.error(err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "F3") {
        e.preventDefault();
        setBillingType((prev) => (prev === "RETAIL" ? "WHOLESALE" : "RETAIL"));
      } else if (e.key === "F8") {
        e.preventDefault();
        handleHoldBill();
      } else if (e.key === "F9") {
        e.preventDefault();
        setShowRecallModal(true);
      } else if (e.key === "F10") {
        e.preventDefault();
        handleCheckout();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    cart,
    selectedCustomer,
    walkInName,
    additionalDiscount,
    paidAmount,
    paymentMethod,
    billingType,
  ]);

  // Add Item to Cart with FEFO (First Expiry First Out)
  const handleAddToCart = (medicine: Medicine, chosenBatch?: Batch) => {
    const availableBatches = (medicine.batches || []).filter(
      (b) => b.quantity > 0 && new Date(b.expiryDate).getTime() > Date.now(),
    );

    if (availableBatches.length === 0) {
      onShowToast(
        "error",
        "Out of Stock",
        `No active non-expired batch found for ${medicine.name}`,
      );
      return;
    }

    // Default to earliest expiry batch (FEFO) if not chosen
    const batch = chosenBatch || availableBatches[0];

    const unitPrice =
      billingType === "RETAIL"
        ? batch.retailPrice || batch.mrp
        : batch.wholesalePrice || batch.purchasePrice * 1.15;

    // Check if already in cart with same batch
    const existingIndex = cart.findIndex(
      (c) => c.medicine.id === medicine.id && c.selectedBatch.id === batch.id,
    );

    if (existingIndex >= 0) {
      const existing = cart[existingIndex];
      if (existing.quantity + 1 > batch.quantity) {
        onShowToast(
          "warning",
          "Stock Limit",
          `Cannot exceed available batch stock of ${batch.quantity}`,
        );
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          medicine,
          selectedBatch: batch,
          quantity: 1,
          unitPrice,
          discountPercent: 0,
          maxAvailable: batch.quantity,
        },
      ]);
    }

    setSearchQuery("");
    setSearchResults([]);
    searchInputRef.current?.focus();
    onShowToast(
      "success",
      "Added to Cart",
      `${medicine.name} (Batch: ${batch.batchNumber}) added`,
    );
  };

  // Open Batch Selection Modal
  const openBatchSelector = async (medicine: Medicine) => {
    try {
      const batches = await api.getBatchesFEFO(medicine.id);
      setBatchModalItem({ medicine, batches });
    } catch (err) {
      onShowToast("error", "Error", "Failed to fetch batches");
    }
  };

  // Update Cart Item
  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    const item = updated[index];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      updated.splice(index, 1);
      setCart(updated);
      return;
    }

    if (newQty > item.maxAvailable) {
      onShowToast(
        "warning",
        "Stock Limit",
        `Only ${item.maxAvailable} units available in Batch ${item.selectedBatch.batchNumber}`,
      );
      return;
    }

    item.quantity = newQty;
    setCart(updated);
  };

  const updateDiscount = (index: number, disc: number) => {
    const updated = [...cart];
    updated[index].discountPercent = Math.max(0, Math.min(100, disc));
    setCart(updated);
  };

  const updateUnitPrice = (index: number, price: number) => {
    const updated = [...cart];
    updated[index].unitPrice = Math.max(0, price);
    setCart(updated);
  };

  const removeItem = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  // Calculations
  const grossSubtotal = cart.reduce(
    (sum, it) => sum + it.unitPrice * it.quantity,
    0,
  );
  const itemsDiscountTotal = cart.reduce(
    (sum, it) => sum + it.unitPrice * it.quantity * (it.discountPercent / 100),
    0,
  );
  const netBeforeGeneralDiscount = grossSubtotal - itemsDiscountTotal;
  const netSubtotal = Math.max(
    0,
    netBeforeGeneralDiscount - additionalDiscount,
  );
  const grandTotal = Math.round(netSubtotal);
  const roundOff =
    Math.round((grandTotal - netSubtotal + Number.EPSILON) * 100) / 100;

  // Approximate GST breakdown
  const estimatedTax = cart.reduce((sum, it) => {
    const rate = it.medicine.gstRate || 12;
    const itemTotal =
      it.unitPrice * it.quantity * (1 - it.discountPercent / 100);
    return sum + (itemTotal - itemTotal / (1 + rate / 100));
  }, 0);

  // Update paid amount default when grand total changes
  useEffect(() => {
    setPaidAmount(grandTotal);
  }, [grandTotal]);

  const changeDue = Math.max(0, paidAmount - grandTotal);

  // Hold Bill
  const handleHoldBill = () => {
    if (cart.length === 0) {
      onShowToast("info", "Cart Empty", "Nothing to put on hold");
      return;
    }
    const held = {
      id: String(Date.now()),
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      customerName: selectedCustomer ? selectedCustomer.name : walkInName,
      cart: [...cart],
      billingType,
    };
    setHeldBills((prev) => [held, ...prev]);
    setCart([]);
    setSelectedCustomer(null);
    setWalkInName("Walk-in Customer");
    setWalkInPhone("");
    onShowToast(
      "success",
      "Bill Held",
      "Current bill placed on hold. Recall anytime with F9.",
    );
  };

  // Recall Bill
  const handleRecallBill = (bill: (typeof heldBills)[0]) => {
    setCart(bill.cart);
    setBillingType(bill.billingType);
    setWalkInName(bill.customerName);
    setHeldBills((prev) => prev.filter((b) => b.id !== bill.id));
    setShowRecallModal(false);
    onShowToast(
      "info",
      "Bill Recalled",
      `Restored bill for ${bill.customerName}`,
    );
  };

  // Add Quick Customer
  const handleCreateCustomer = async () => {
    if (!newCustName.trim()) {
      onShowToast("error", "Validation", "Customer name is required");
      return;
    }
    try {
      const created = await api.createCustomer({
        name: newCustName,
        phone: newCustPhone || null,
        gstin: newCustGstin || null,
        type: billingType === "WHOLESALE" ? "WHOLESALE" : "RETAIL",
      });
      setCustomers((prev) => [...prev, created]);
      setSelectedCustomer(created);
      setShowNewCustomerModal(false);
      setNewCustName("");
      setNewCustPhone("");
      setNewCustGstin("");
      onShowToast(
        "success",
        "Customer Added",
        `Customer ${created.name} created and selected`,
      );
    } catch (err: any) {
      onShowToast("error", "Failed", err.message);
    }
  };

  // Checkout & Submit Sale
  const handleCheckout = async () => {
    if (cart.length === 0) {
      onShowToast(
        "error",
        "Empty Cart",
        "Please add medicines to cart before checkout",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type: billingType,
        customerId: selectedCustomer ? selectedCustomer.id : null,
        customerName: selectedCustomer ? selectedCustomer.name : walkInName,
        customerPhone: selectedCustomer
          ? selectedCustomer.phone
          : walkInPhone || null,
        doctorId: selectedDoctor ? selectedDoctor : null,
        doctorName: selectedDoctor
          ? doctors.find((d) => d.id === selectedDoctor)?.name
          : null,
        prescriptionNumber: rxNumber || null,
        discountAmount: additionalDiscount,
        paidAmount,
        paymentMethod,
        items: cart.map((it) => ({
          medicineId: it.medicine.id,
          batchId: it.selectedBatch.id,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discountPercent: it.discountPercent,
        })),
      };

      const sale = await api.createSale(payload);
      setCompletedSale(sale);
      setShowPrintModal(true);

      // Reset cart
      setCart([]);
      setSelectedCustomer(null);
      setWalkInName("Walk-in Customer");
      setWalkInPhone("");
      setRxNumber("");
      setAdditionalDiscount(0);

      onShowToast(
        "success",
        "Invoice Generated!",
        `Bill ${sale.billNumber} created successfully`,
      );
    } catch (err: any) {
      onShowToast("error", "Checkout Failed", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{ display: "flex", gap: "1.25rem", height: "calc(100vh - 110px)" }}
    >
      {/* Left: Search & Cart Items Table */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          minWidth: 0,
        }}
      >
        {/* Top Control Bar: Search & Billing Mode */}
        <div
          className="card"
          style={{
            padding: "0.85rem 1rem",
            display: "flex",
            gap: "0.85rem",
            alignItems: "center",
          }}
        >
          {/* Mode Switcher */}
          <button
            className={`btn btn-sm ${billingType === "RETAIL" ? "btn-primary" : "btn-cyan"}`}
            onClick={() =>
              setBillingType((prev) =>
                prev === "RETAIL" ? "WHOLESALE" : "RETAIL",
              )
            }
            title="Switch Billing Mode (Shortcut: F3)"
            style={{ fontWeight: 700 }}
          >
            <Sparkles size={15} />
            {billingType === "RETAIL" ? "Retail POS" : "Wholesale B2B"}
          </button>

          {/* Search Box */}
          <div style={{ flex: 1, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-dim)",
              }}
            >
              <Search size={16} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="input"
              style={{ paddingLeft: "2.4rem", fontSize: "0.88rem" }}
              placeholder="Search medicine by Brand, Composition, Barcode, Shelf... (F1)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Live Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "105%",
                  left: 0,
                  right: 0,
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-lg)",
                  zIndex: 500,
                  maxHeight: "380px",
                  overflowY: "auto",
                }}
              >
                {searchResults.map((med) => {
                  const availableBatches = (med.batches || []).filter(
                    (b) => b.quantity > 0,
                  );
                  const fefoBatch = availableBatches[0];
                  const totalStock = availableBatches.reduce(
                    (s, b) => s + b.quantity,
                    0,
                  );

                  return (
                    <div
                      key={med.id}
                      style={{
                        padding: "0.65rem 0.85rem",
                        borderBottom: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "var(--bg-surface)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                      onClick={() => handleAddToCart(med)}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "0.88rem",
                              color: "var(--text-main)",
                            }}
                          >
                            {med.name}
                          </span>
                          <span
                            className="badge badge-indigo"
                            style={{ fontSize: "0.65rem" }}
                          >
                            {med.category}
                          </span>
                          {med.rackLocation && (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                color: "var(--text-dim)",
                                background: "var(--bg-app)",
                                padding: "1px 6px",
                                borderRadius: "var(--radius-xs)",
                              }}
                            >
                              📍 {med.rackLocation}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                            marginTop: "2px",
                          }}
                        >
                          {med.genericName} • {med.manufacturer}
                        </div>
                        {fefoBatch && (
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--primary)",
                              marginTop: "2px",
                            }}
                          >
                            ⚡ Auto FEFO: Batch{" "}
                            <strong>{fefoBatch.batchNumber}</strong> (Exp:{" "}
                            {formatShortDate(fefoBatch.expiryDate)}) • Stock:{" "}
                            {totalStock} units
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          textAlign: "right",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: 800,
                              color: "var(--text-main)",
                            }}
                          >
                            {formatCurrency(
                              billingType === "RETAIL"
                                ? fefoBatch?.retailPrice || fefoBatch?.mrp
                                : fefoBatch?.wholesalePrice,
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--text-dim)",
                            }}
                          >
                            MRP {formatCurrency(fefoBatch?.mrp || 0)}
                          </div>
                        </div>

                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openBatchSelector(med);
                          }}
                          title="Choose specific batch"
                        >
                          <Layers size={13} /> Batches
                        </button>

                        <button className="btn btn-primary btn-sm">
                          <Plus size={13} /> Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Hold & Recall Action Buttons */}
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleHoldBill}
              title="Put bill on hold (Shortcut: F8)"
              disabled={cart.length === 0}
            >
              <Save size={14} /> Hold Bill
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowRecallModal(true)}
              title="Recall held bills (Shortcut: F9)"
              style={{ position: "relative" }}
            >
              <RotateCcw size={14} /> Recall
              {heldBills.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    backgroundColor: "var(--rose)",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    fontSize: "0.62rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                  }}
                >
                  {heldBills.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Cart Table Container */}
        <div
          className="data-table-container"
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <div style={{ flex: 1, overflowY: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th>Medicine Item</th>
                  <th>Batch / Expiry</th>
                  <th style={{ width: "130px", textAlign: "center" }}>
                    Quantity
                  </th>
                  <th style={{ width: "100px", textAlign: "right" }}>
                    Rate (₹)
                  </th>
                  <th style={{ width: "90px", textAlign: "right" }}>Disc %</th>
                  <th style={{ width: "70px", textAlign: "center" }}>GST</th>
                  <th style={{ width: "100px", textAlign: "right" }}>
                    Amount (₹)
                  </th>
                  <th style={{ width: "50px", textAlign: "center" }}></th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: "center",
                        padding: "4rem 1rem",
                        color: "var(--text-dim)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.03)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Search size={28} color="var(--text-dim)" />
                        </div>
                        <div style={{ fontSize: "1rem", fontWeight: 600 }}>
                          Billing Terminal is Ready
                        </div>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            maxWidth: "360px",
                            color: "var(--text-muted)",
                          }}
                        >
                          Press <kbd>F1</kbd> to search medicines or scan a
                          barcode to immediately populate items.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cart.map((item, idx) => {
                    const lineGross = item.unitPrice * item.quantity;
                    const lineDiscount =
                      lineGross * (item.discountPercent / 100);
                    const lineNet = lineGross - lineDiscount;

                    return (
                      <tr key={`${item.medicine.id}-${item.selectedBatch.id}`}>
                        <td
                          style={{
                            color: "var(--text-dim)",
                            fontSize: "0.8rem",
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "var(--text-main)",
                            }}
                          >
                            {item.medicine.name}
                          </div>
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            {item.medicine.genericName}
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                            }}
                          >
                            <span
                              className="badge badge-cyan"
                              style={{ fontSize: "0.65rem" }}
                            >
                              {item.selectedBatch.batchNumber}
                            </span>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                color: "var(--text-dim)",
                              }}
                            >
                              Exp:{" "}
                              {new Date(
                                item.selectedBatch.expiryDate,
                              ).toLocaleDateString("en-IN", {
                                month: "2-digit",
                                year: "2-digit",
                              })}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "0.68rem",
                              color: "var(--text-dim)",
                              marginTop: "2px",
                            }}
                          >
                            Stock Avail: {item.maxAvailable}
                          </div>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "var(--radius-md)",
                              background: "var(--bg-input)",
                            }}
                          >
                            <button
                              onClick={() => updateQuantity(idx, -1)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--text-muted)",
                                padding: "4px 8px",
                                cursor: "pointer",
                              }}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={item.maxAvailable}
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                const diff = val - item.quantity;
                                updateQuantity(idx, diff);
                              }}
                              style={{
                                width: "45px",
                                background: "transparent",
                                border: "none",
                                textAlign: "center",
                                color: "var(--text-main)",
                                fontWeight: 700,
                                outline: "none",
                              }}
                            />
                            <button
                              onClick={() => updateQuantity(idx, 1)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--text-muted)",
                                padding: "4px 8px",
                                cursor: "pointer",
                              }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <input
                            type="number"
                            step="0.5"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateUnitPrice(
                                idx,
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            style={{
                              width: "75px",
                              background: "var(--bg-input)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "4px",
                              color: "var(--text-main)",
                              textAlign: "right",
                              padding: "2px 4px",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          />
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={item.discountPercent}
                            onChange={(e) =>
                              updateDiscount(
                                idx,
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            style={{
                              width: "55px",
                              background: "var(--bg-input)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "4px",
                              color: "var(--text-main)",
                              textAlign: "right",
                              padding: "2px 4px",
                              fontSize: "0.85rem",
                            }}
                          />
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {item.medicine.gstRate}%
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: 700,
                            color: "var(--text-main)",
                            fontSize: "0.95rem",
                          }}
                        >
                          ₹{lineNet.toFixed(2)}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            onClick={() => removeItem(idx)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--rose)",
                              cursor: "pointer",
                              opacity: 0.8,
                            }}
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Cart Status Footbar */}
          {cart.length > 0 && (
            <div
              style={{
                padding: "0.65rem 1rem",
                backgroundColor: "var(--bg-surface)",
                borderTop: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
              }}
            >
              <div>
                Total Items:{" "}
                <strong style={{ color: "var(--text-main)" }}>
                  {cart.length}
                </strong>{" "}
                ({cart.reduce((s, it) => s + it.quantity, 0)} units)
              </div>
              <div>
                Estimated GST Tax:{" "}
                <strong style={{ color: "var(--text-main)" }}>
                  {formatCurrency(estimatedTax)}
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Customer & Checkout Panel */}
      <div
        style={{
          width: "380px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          flexShrink: 0,
        }}
      >
        {/* Customer & Prescription Details Card */}
        <div className="card" style={{ padding: "1.25rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--text-main)",
              }}
            >
              Customer Information
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowNewCustomerModal(true)}
              style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
            >
              <UserPlus size={12} /> New
            </button>
          </div>

          {/* Select Customer or Walk-in */}
          <div style={{ marginBottom: "0.75rem" }}>
            <select
              className="select"
              value={selectedCustomer ? selectedCustomer.id : ""}
              onChange={(e) => {
                const found = customers.find((c) => c.id === e.target.value);
                setSelectedCustomer(found || null);
              }}
              style={{ fontSize: "0.85rem" }}
            >
              <option value="">Walk-in Customer (Cash / Retail)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ""} - {c.type}
                </option>
              ))}
            </select>
          </div>

          {!selectedCustomer ? (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <input
                type="text"
                className="input"
                placeholder="Walk-in Name"
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                style={{ fontSize: "0.8rem", flex: 1 }}
              />
              <input
                type="text"
                className="input"
                placeholder="Mobile (10 Digits)"
                value={walkInPhone}
                onChange={(e) => setWalkInPhone(e.target.value)}
                style={{ fontSize: "0.8rem", flex: 1 }}
              />
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "var(--bg-surface)",
                padding: "0.5rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                marginBottom: "0.75rem",
                fontSize: "0.75rem",
              }}
            >
              <div>
                <strong>Type:</strong> {selectedCustomer.type}
              </div>
              {selectedCustomer.gstin && (
                <div>
                  <strong>GSTIN:</strong> {selectedCustomer.gstin}
                </div>
              )}
              {selectedCustomer.outstandingBalance > 0 && (
                <div style={{ color: "var(--rose)", fontWeight: 600 }}>
                  Outstanding Balance:{" "}
                  {formatCurrency(selectedCustomer.outstandingBalance)}
                </div>
              )}
            </div>
          )}

          {/* Doctor & Rx Details */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select
              className="select"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              style={{ fontSize: "0.8rem", flex: 1 }}
            >
              <option value="">Doctor (Self/OTC)</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="input"
              placeholder="Rx / Presc. No."
              value={rxNumber}
              onChange={(e) => setRxNumber(e.target.value)}
              style={{ fontSize: "0.8rem", width: "110px" }}
            />
          </div>
        </div>

        {/* Payment & Invoice Summary Card */}
        <div
          className="card"
          style={{
            padding: "1.25rem",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--text-main)",
                marginBottom: "0.75rem",
              }}
            >
              Payment Breakdown
            </div>

            {/* Subtotal, Disc, Roundoff rows */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                fontSize: "0.85rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "var(--text-muted)",
                }}
              >
                <span>Items Subtotal:</span>
                <span style={{ color: "var(--text-main)", fontWeight: 600 }}>
                  {formatCurrency(grossSubtotal)}
                </span>
              </div>

              {itemsDiscountTotal > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "var(--primary)",
                    fontWeight: 600,
                  }}
                >
                  <span>Item Discounts:</span>
                  <span>- {formatCurrency(itemsDiscountTotal)}</span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>
                  Extra Discount (₹):
                </span>
                <input
                  type="number"
                  min={0}
                  value={additionalDiscount}
                  onChange={(e) =>
                    setAdditionalDiscount(
                      Math.max(0, parseFloat(e.target.value) || 0),
                    )
                  }
                  style={{
                    width: "80px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-xs)",
                    color: "var(--text-main)",
                    textAlign: "right",
                    padding: "2px 6px",
                    fontSize: "0.85rem",
                  }}
                />
              </div>

              {roundOff !== 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "var(--text-dim)",
                    fontSize: "0.75rem",
                  }}
                >
                  <span>Round Off:</span>
                  <span>{formatCurrency(roundOff)}</span>
                </div>
              )}

              {/* Net Grand Total Banner */}
              <div
                style={{
                  margin: "0.5rem 0",
                  padding: "0.85rem",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--primary-light)",
                  border: "1px solid var(--primary-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      color: "var(--primary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    NET AMOUNT DUE
                  </div>
                  <div
                    style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}
                  >
                    Incl. GST Tax
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--text-main)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {formatCurrency(grandTotal)}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div style={{ marginTop: "0.25rem" }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    marginBottom: "0.35rem",
                  }}
                >
                  Payment Method
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "0.35rem",
                  }}
                >
                  {[
                    { id: "CASH", label: "Cash", icon: DollarSign },
                    { id: "UPI", label: "UPI / QR", icon: Smartphone },
                    { id: "CARD", label: "Card", icon: CreditCard },
                    { id: "CREDIT", label: "Credit", icon: Wallet },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSel = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        style={{
                          padding: "0.45rem 0.25rem",
                          borderRadius: "var(--radius-xs)",
                          backgroundColor: isSel
                            ? "var(--primary-light)"
                            : "var(--bg-surface)",
                          border: `1px solid ${isSel ? "var(--primary)" : "var(--border-subtle)"}`,
                          color: isSel ? "var(--primary)" : "var(--text-muted)",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "2px",
                          fontSize: "0.7rem",
                          fontWeight: isSel ? 700 : 500,
                        }}
                      >
                        <Icon size={14} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Paid Amount & Change Calculation */}
              {paymentMethod === "CASH" && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    display: "flex",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <label
                      style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}
                    >
                      Tendered Cash (₹)
                    </label>
                    <input
                      type="number"
                      className="input"
                      min={0}
                      value={paidAmount}
                      onChange={(e) =>
                        setPaidAmount(
                          Math.max(0, parseFloat(e.target.value) || 0),
                        )
                      }
                      style={{ fontSize: "0.92rem", fontWeight: 700 }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}
                    >
                      Change Due
                    </label>
                    <div
                      style={{
                        height: "34px",
                        backgroundColor: "var(--bg-surface)",
                        borderRadius: "var(--radius-xs)",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 0.65rem",
                        fontSize: "0.92rem",
                        fontWeight: 800,
                        color:
                          changeDue > 0 ? "var(--primary)" : "var(--text-dim)",
                      }}
                    >
                      {formatCurrency(changeDue)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Checkout Button */}
          <div style={{ marginTop: "1rem" }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleCheckout}
              disabled={isSubmitting || cart.length === 0}
              title="Complete Checkout & Generate Invoice (Shortcut: F10)"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <Printer size={18} />
              {isSubmitting ? "Generating Invoice..." : "Complete & Print"}
            </button>
          </div>
        </div>
      </div>

      {/* Batch Selection Modal */}
      {batchModalItem && (
        <Modal
          isOpen={true}
          onClose={() => setBatchModalItem(null)}
          title={`Select Batch: ${batchModalItem.medicine.name}`}
          maxWidth="600px"
        >
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginBottom: "1rem",
            }}
          >
            Choose an available batch to add to cart:
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {batchModalItem.batches.map((b) => (
              <div
                key={b.id}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => {
                  handleAddToCart(batchModalItem.medicine, b);
                  setBatchModalItem(null);
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-main)" }}>
                    Batch: {b.batchNumber}
                  </div>
                  <div
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    Expiry:{" "}
                    {new Date(b.expiryDate).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    • {b.daysUntilExpiry} days left
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: "var(--primary)" }}>
                    Stock: {b.quantity} units
                  </div>
                  <div
                    style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}
                  >
                    Rate: ₹
                    {billingType === "RETAIL"
                      ? b.retailPrice
                      : b.wholesalePrice}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Recall Held Bills Modal */}
      {showRecallModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowRecallModal(false)}
          title="Recall Saved / Held Bills"
          maxWidth="550px"
        >
          {heldBills.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--text-muted)",
              }}
            >
              No bills currently on hold.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {heldBills.map((hb) => (
                <div
                  key={hb.id}
                  style={{
                    padding: "0.85rem 1rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-main)" }}>
                      {hb.customerName} ({hb.billingType})
                    </div>
                    <div
                      style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}
                    >
                      Held at {hb.time} • {hb.cart.length} items (₹
                      {hb.cart
                        .reduce((s, it) => s + it.unitPrice * it.quantity, 0)
                        .toFixed(2)}
                      )
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleRecallBill(hb)}
                  >
                    Recall Bill
                  </button>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Add New Quick Customer Modal */}
      {showNewCustomerModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowNewCustomerModal(false)}
          title="Add Quick Customer Profile"
          maxWidth="450px"
          footer={
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowNewCustomerModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateCustomer}
              >
                Save Customer
              </button>
            </div>
          }
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
          >
            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Customer / Business Name *
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Apex Clinic or John Doe"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
              />
            </div>
            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Phone Number
              </label>
              <input
                type="text"
                className="input"
                placeholder="+91 98765 43210"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
              />
            </div>
            {billingType === "WHOLESALE" && (
              <div>
                <label
                  style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                >
                  GSTIN (Wholesale B2B)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="27AAAAA0000A1Z5"
                  value={newCustGstin}
                  onChange={(e) => setNewCustGstin(e.target.value)}
                />
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Printable Invoice Modal */}
      {showPrintModal && completedSale && (
        <InvoicePrintModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          sale={completedSale}
          settings={settings}
        />
      )}
    </div>
  );
};
