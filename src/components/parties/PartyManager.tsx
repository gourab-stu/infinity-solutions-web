import React, { useState, useEffect } from "react";
import {
  Users,
  Truck,
  Stethoscope,
  Plus,
  Search,
  Edit2,
  Trash2,
} from "lucide-react";
import type { Customer, Supplier, Doctor, CustomerType } from "../../types";
import { api } from "../../services/api";
import { Modal } from "../common/ModalAndToast";

interface PartyManagerProps {
  onShowToast: (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
  ) => void;
}

export const PartyManager: React.FC<PartyManagerProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<
    "customers" | "suppliers" | "doctors"
  >("customers");
  const [searchQuery, setSearchQuery] = useState("");

  // Lists
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Modals
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [showDoctorModal, setShowDoctorModal] = useState(false);

  // Form states
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({
    name: "",
    type: "RETAIL",
    phone: "",
    email: "",
    address: "",
    gstin: "",
    dlNumber: "",
    creditLimit: 0,
  });

  const [supplierForm, setSupplierForm] = useState<Partial<Supplier>>({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    gstin: "",
    dlNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    creditPeriodDays: 30,
  });

  const [doctorForm, setDoctorForm] = useState<Partial<Doctor>>({
    name: "",
    specialization: "",
    hospital: "",
    regNumber: "",
    phone: "",
  });

  useEffect(() => {
    loadAll();
  }, [searchQuery]);

  const loadAll = async () => {
    try {
      const [cList, sList, dList] = await Promise.all([
        api.getCustomers(searchQuery || undefined),
        api.getSuppliers(searchQuery || undefined),
        api.getDoctors(searchQuery || undefined),
      ]);
      setCustomers(cList);
      setSuppliers(sList);
      setDoctors(dList);
    } catch (err: any) {
      onShowToast("error", "Error", err.message);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.id, customerForm);
        onShowToast(
          "success",
          "Updated",
          `Customer ${customerForm.name} updated`,
        );
      } else {
        await api.createCustomer(customerForm);
        onShowToast(
          "success",
          "Created",
          `Customer ${customerForm.name} added`,
        );
      }
      setShowCustomerModal(false);
      loadAll();
    } catch (err: any) {
      onShowToast("error", "Failed", err.message);
    }
  };

  const handleDeleteCustomer = async (c: Customer) => {
    if (!window.confirm(`Delete customer ${c.name}?`)) return;
    try {
      await api.deleteCustomer(c.id);
      onShowToast("success", "Deleted", `Customer ${c.name} removed`);
      loadAll();
    } catch (err: any) {
      onShowToast("error", "Failed", err.message);
    }
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.updateSupplier(editingSupplier.id, supplierForm);
        onShowToast(
          "success",
          "Updated",
          `Supplier ${supplierForm.name} updated`,
        );
      } else {
        await api.createSupplier(supplierForm);
        onShowToast(
          "success",
          "Created",
          `Supplier ${supplierForm.name} added`,
        );
      }
      setShowSupplierModal(false);
      loadAll();
    } catch (err: any) {
      onShowToast("error", "Failed", err.message);
    }
  };

  const handleDeleteSupplier = async (s: Supplier) => {
    if (!window.confirm(`Delete supplier ${s.name}?`)) return;
    try {
      await api.deleteSupplier(s.id);
      onShowToast("success", "Deleted", `Supplier ${s.name} removed`);
      loadAll();
    } catch (err: any) {
      onShowToast("error", "Failed", err.message);
    }
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDoctor(doctorForm);
      onShowToast(
        "success",
        "Doctor Added",
        `Dr. ${doctorForm.name} registered`,
      );
      setShowDoctorModal(false);
      loadAll();
    } catch (err: any) {
      onShowToast("error", "Failed", err.message);
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
      {/* Tab Switcher & Search / New Button */}
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
            className={`btn btn-sm ${activeTab === "customers" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("customers")}
          >
            <Users size={16} /> Customers ({customers.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === "suppliers" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("suppliers")}
          >
            <Truck size={16} /> Suppliers & Vendors ({suppliers.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === "doctors" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("doctors")}
          >
            <Stethoscope size={16} /> Doctors Directory ({doctors.length})
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <div style={{ position: "relative", width: "240px" }}>
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
              placeholder="Search directory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {activeTab === "customers" && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingCustomer(null);
                setCustomerForm({
                  name: "",
                  type: "RETAIL",
                  phone: "",
                  email: "",
                  address: "",
                  gstin: "",
                  creditLimit: 0,
                });
                setShowCustomerModal(true);
              }}
            >
              <Plus size={16} /> Add Customer
            </button>
          )}

          {activeTab === "suppliers" && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingSupplier(null);
                setSupplierForm({
                  name: "",
                  contactPerson: "",
                  phone: "",
                  email: "",
                  gstin: "",
                  dlNumber: "",
                  creditPeriodDays: 30,
                });
                setShowSupplierModal(true);
              }}
            >
              <Plus size={16} /> Add Supplier
            </button>
          )}

          {activeTab === "doctors" && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setDoctorForm({
                  name: "",
                  specialization: "",
                  hospital: "",
                  regNumber: "",
                  phone: "",
                });
                setShowDoctorModal(true);
              }}
            >
              <Plus size={16} /> Add Doctor
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: CUSTOMERS */}
      {activeTab === "customers" && (
        <div
          className="data-table-container"
          style={{ flex: 1, overflowY: "auto" }}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer / Account Name</th>
                <th>Type</th>
                <th>Phone & Contact</th>
                <th>GSTIN / DL No</th>
                <th style={{ textAlign: "right" }}>Credit Limit</th>
                <th style={{ textAlign: "right" }}>Outstanding Balance (₹)</th>
                <th style={{ width: "90px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div
                        style={{ fontWeight: 700, color: "var(--text-main)" }}
                      >
                        {c.name}
                      </div>
                      {c.address && (
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-dim)",
                          }}
                        >
                          {c.address}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${c.type === "WHOLESALE" ? "badge-cyan" : c.type === "HOSPITAL" ? "badge-indigo" : "badge-emerald"}`}
                      >
                        {c.type}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.8rem" }}>
                        {c.phone || "N/A"}
                      </div>
                      {c.email && (
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-dim)",
                          }}
                        >
                          {c.email}
                        </div>
                      )}
                    </td>
                    <td>
                      {c.gstin ? (
                        <div
                          style={{
                            fontSize: "0.78rem",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          GST: {c.gstin}
                        </div>
                      ) : (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-dim)",
                          }}
                        >
                          Unregistered
                        </span>
                      )}
                      {c.dlNumber && (
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-dim)",
                          }}
                        >
                          DL: {c.dlNumber}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      ₹{(c.creditLimit || 0).toFixed(2)}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 700,
                        color:
                          c.outstandingBalance > 0
                            ? "var(--rose)"
                            : "var(--text-main)",
                      }}
                    >
                      ₹{c.outstandingBalance.toFixed(2)}
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
                            setEditingCustomer(c);
                            setCustomerForm(c);
                            setShowCustomerModal(true);
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDeleteCustomer(c)}
                          style={{ color: "var(--rose)" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: SUPPLIERS */}
      {activeTab === "suppliers" && (
        <div
          className="data-table-container"
          style={{ flex: 1, overflowY: "auto" }}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Distributor / Supplier Name</th>
                <th>Contact Person & Phone</th>
                <th>GSTIN & Drug License</th>
                <th>City / State</th>
                <th style={{ textAlign: "center" }}>Credit Days</th>
                <th style={{ textAlign: "right" }}>Outstanding Payable (₹)</th>
                <th style={{ width: "90px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                suppliers.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div
                        style={{ fontWeight: 700, color: "var(--text-main)" }}
                      >
                        {s.name}
                      </div>
                      {s.address && (
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-dim)",
                          }}
                        >
                          {s.address}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                        {s.contactPerson || "Sales Desk"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {s.phone}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        GST: {s.gstin || "N/A"}
                      </div>
                      {s.dlNumber && (
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-dim)",
                          }}
                        >
                          DL: {s.dlNumber}
                        </div>
                      )}
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {s.city || "N/A"}, {s.state || ""}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>
                      {s.creditPeriodDays} Days
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 700,
                        color:
                          s.outstandingBalance > 0
                            ? "var(--amber)"
                            : "var(--text-main)",
                      }}
                    >
                      ₹{s.outstandingBalance.toFixed(2)}
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
                            setEditingSupplier(s);
                            setSupplierForm(s);
                            setShowSupplierModal(true);
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDeleteSupplier(s)}
                          style={{ color: "var(--rose)" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: DOCTORS */}
      {activeTab === "doctors" && (
        <div
          className="data-table-container"
          style={{ flex: 1, overflowY: "auto" }}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Specialization</th>
                <th>Hospital / Clinic</th>
                <th>Registration No</th>
                <th>Contact Phone</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    No doctors registered yet.
                  </td>
                </tr>
              ) : (
                doctors.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 700, color: "var(--cyan)" }}>
                      {d.name}
                    </td>
                    <td>
                      <span className="badge badge-indigo">
                        {d.specialization || "General"}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-main)" }}>
                      {d.hospital || "Private Clinic"}
                    </td>
                    <td
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {d.regNumber || "N/A"}
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {d.phone || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCustomerModal(false)}
          title={editingCustomer ? "Edit Customer" : "Add Customer Profile"}
          maxWidth="550px"
          footer={
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowCustomerModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveCustomer}>
                Save Customer
              </button>
            </div>
          }
        >
          <form
            onSubmit={handleSaveCustomer}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.85rem",
            }}
          >
            <div style={{ gridColumn: "span 2" }}>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Full Name / Hospital Name *
              </label>
              <input
                type="text"
                required
                className="input"
                value={customerForm.name}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, name: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Account Type
              </label>
              <select
                className="select"
                value={customerForm.type}
                onChange={(e) =>
                  setCustomerForm({
                    ...customerForm,
                    type: e.target.value as CustomerType,
                  })
                }
              >
                <option value="RETAIL">Retail Patient</option>
                <option value="WHOLESALE">Wholesale B2B</option>
                <option value="HOSPITAL">Hospital / Clinic</option>
                <option value="DOCTOR">Doctor</option>
              </select>
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
                value={customerForm.phone || ""}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, phone: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                GSTIN (For B2B Billing)
              </label>
              <input
                type="text"
                className="input"
                placeholder="27AAAAA0000A1Z5"
                value={customerForm.gstin || ""}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, gstin: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Drug License No (DL)
              </label>
              <input
                type="text"
                className="input"
                value={customerForm.dlNumber || ""}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, dlNumber: e.target.value })
                }
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Address
              </label>
              <input
                type="text"
                className="input"
                value={customerForm.address || ""}
                onChange={(e) =>
                  setCustomerForm({ ...customerForm, address: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Credit Limit (₹)
              </label>
              <input
                type="number"
                className="input"
                value={customerForm.creditLimit || 0}
                onChange={(e) =>
                  setCustomerForm({
                    ...customerForm,
                    creditLimit: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowSupplierModal(false)}
          title={
            editingSupplier ? "Edit Supplier" : "Add Supplier / Distributor"
          }
          maxWidth="600px"
          footer={
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowSupplierModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveSupplier}>
                Save Supplier
              </button>
            </div>
          }
        >
          <form
            onSubmit={handleSaveSupplier}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.85rem",
            }}
          >
            <div style={{ gridColumn: "span 2" }}>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Supplier / Firm Name *
              </label>
              <input
                type="text"
                required
                className="input"
                value={supplierForm.name}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, name: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Contact Person
              </label>
              <input
                type="text"
                className="input"
                value={supplierForm.contactPerson || ""}
                onChange={(e) =>
                  setSupplierForm({
                    ...supplierForm,
                    contactPerson: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Phone Number *
              </label>
              <input
                type="text"
                required
                className="input"
                value={supplierForm.phone}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, phone: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                GSTIN
              </label>
              <input
                type="text"
                className="input"
                value={supplierForm.gstin || ""}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, gstin: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Drug License No (DL)
              </label>
              <input
                type="text"
                className="input"
                value={supplierForm.dlNumber || ""}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, dlNumber: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                City
              </label>
              <input
                type="text"
                className="input"
                value={supplierForm.city || ""}
                onChange={(e) =>
                  setSupplierForm({ ...supplierForm, city: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Credit Period (Days)
              </label>
              <input
                type="number"
                className="input"
                value={supplierForm.creditPeriodDays}
                onChange={(e) =>
                  setSupplierForm({
                    ...supplierForm,
                    creditPeriodDays: parseInt(e.target.value) || 30,
                  })
                }
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Doctor Modal */}
      {showDoctorModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowDoctorModal(false)}
          title="Add Doctor to Directory"
          maxWidth="480px"
          footer={
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDoctorModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveDoctor}>
                Register Doctor
              </button>
            </div>
          }
        >
          <form
            onSubmit={handleSaveDoctor}
            style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
          >
            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Doctor Name (with Degree) *
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. Dr. Anand Deshmukh, MD"
                value={doctorForm.name}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, name: e.target.value })
                }
              />
            </div>
            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Specialization
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Cardiologist, Physician"
                value={doctorForm.specialization || ""}
                onChange={(e) =>
                  setDoctorForm({
                    ...doctorForm,
                    specialization: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Hospital / Clinic Affiliation
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Apollo Hospital"
                value={doctorForm.hospital || ""}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, hospital: e.target.value })
                }
              />
            </div>
            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Medical Registration No
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. MMC-2004/08/2910"
                value={doctorForm.regNumber || ""}
                onChange={(e) =>
                  setDoctorForm({ ...doctorForm, regNumber: e.target.value })
                }
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
