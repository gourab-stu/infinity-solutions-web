import React, { useState } from "react";
import type { Medicine, Batch, DosageForm, AdjustmentType } from "../../types";
import { Modal } from "../common/ModalAndToast";

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Medicine>) => Promise<void>;
  editMedicine?: Medicine | null;
}

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editMedicine,
}) => {
  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: editMedicine?.name || "",
    genericName: editMedicine?.genericName || "",
    sku: editMedicine?.sku || `MED-${Math.floor(1000 + Math.random() * 9000)}`,
    barcode: editMedicine?.barcode || "",
    category: editMedicine?.category || "General",
    dosageForm: editMedicine?.dosageForm || "TABLET",
    strength: editMedicine?.strength || "",
    manufacturer: editMedicine?.manufacturer || "",
    hsnCode: editMedicine?.hsnCode || "300490",
    gstRate: editMedicine?.gstRate || 12,
    minStockAlert: editMedicine?.minStockAlert || 20,
    rackLocation: editMedicine?.rackLocation || "",
    prescriptionRequired: editMedicine?.prescriptionRequired || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editMedicine ? "Edit Medicine Profile" : "Add New Medicine to Catalog"
      }
      maxWidth="650px"
      footer={
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editMedicine ? "Save Changes" : "Create Medicine"}
          </button>
        </div>
      }
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.85rem",
        }}
      >
        <div style={{ gridColumn: "span 2" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Medicine Brand Name *
          </label>
          <input
            type="text"
            required
            className="input"
            placeholder="e.g. Augmentin 625 Duo Tablet"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Generic Composition *
          </label>
          <input
            type="text"
            required
            className="input"
            placeholder="e.g. Amoxicillin (500mg) + Clavulanic Acid (125mg)"
            value={formData.genericName}
            onChange={(e) =>
              setFormData({ ...formData, genericName: e.target.value })
            }
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            SKU / Item Code *
          </label>
          <input
            type="text"
            required
            className="input"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Barcode / EAN
          </label>
          <input
            type="text"
            className="input"
            placeholder="Scan or type barcode"
            value={formData.barcode || ""}
            onChange={(e) =>
              setFormData({ ...formData, barcode: e.target.value })
            }
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Category
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Antibiotics, Cardiac, Analgesics"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Dosage Form
          </label>
          <select
            className="select"
            value={formData.dosageForm}
            onChange={(e) =>
              setFormData({
                ...formData,
                dosageForm: e.target.value as DosageForm,
              })
            }
          >
            <option value="TABLET">Tablet</option>
            <option value="CAPSULE">Capsule</option>
            <option value="SYRUP">Syrup</option>
            <option value="INJECTION">Injection</option>
            <option value="OINTMENT">Ointment / Cream</option>
            <option value="DROPS">Drops</option>
            <option value="INHALER">Inhaler</option>
            <option value="SUSPENSION">Suspension</option>
            <option value="POWDER">Powder</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Manufacturer *
          </label>
          <input
            type="text"
            required
            className="input"
            placeholder="e.g. GlaxoSmithKline, Sun Pharma"
            value={formData.manufacturer}
            onChange={(e) =>
              setFormData({ ...formData, manufacturer: e.target.value })
            }
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Strength
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g. 625mg, 100ml"
            value={formData.strength || ""}
            onChange={(e) =>
              setFormData({ ...formData, strength: e.target.value })
            }
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            GST Rate (%)
          </label>
          <input
            type="number"
            className="input"
            value={formData.gstRate}
            onChange={(e) =>
              setFormData({
                ...formData,
                gstRate: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Min Stock Alert Threshold
          </label>
          <input
            type="number"
            className="input"
            value={formData.minStockAlert}
            onChange={(e) =>
              setFormData({
                ...formData,
                minStockAlert: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Rack / Shelf Location
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Rack A-3, Shelf 2"
            value={formData.rackLocation || ""}
            onChange={(e) =>
              setFormData({ ...formData, rackLocation: e.target.value })
            }
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1.25rem",
          }}
        >
          <input
            type="checkbox"
            id="rxReq"
            checked={formData.prescriptionRequired}
            onChange={(e) =>
              setFormData({
                ...formData,
                prescriptionRequired: e.target.checked,
              })
            }
          />
          <label
            htmlFor="rxReq"
            style={{
              fontSize: "0.8rem",
              color: "var(--text-main)",
              cursor: "pointer",
            }}
          >
            Requires Doctor Prescription (Schedule H/H1)
          </label>
        </div>
      </form>
    </Modal>
  );
};

interface AddBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  onSave: (data: Partial<Batch>) => Promise<void>;
}

export const AddBatchModal: React.FC<AddBatchModalProps> = ({
  isOpen,
  onClose,
  medicine,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Batch>>({
    batchNumber: "",
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2))
      .toISOString()
      .split("T")[0],
    purchasePrice: 100,
    mrp: 150,
    retailPrice: 140,
    wholesalePrice: 115,
    quantity: 50,
    packSize: 10,
    status: "ACTIVE",
  });

  if (!medicine) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...formData,
      medicineId: medicine.id,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Stock Batch: ${medicine.name}`}
      maxWidth="550px"
      footer={
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Save Batch
          </button>
        </div>
      }
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.85rem",
        }}
      >
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Batch Number *
          </label>
          <input
            type="text"
            required
            className="input"
            placeholder="e.g. AUG-2501"
            value={formData.batchNumber}
            onChange={(e) =>
              setFormData({ ...formData, batchNumber: e.target.value })
            }
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Expiry Date *
          </label>
          <input
            type="date"
            required
            className="input"
            value={formData.expiryDate}
            onChange={(e) =>
              setFormData({ ...formData, expiryDate: e.target.value })
            }
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Purchase / Cost Price (₹) *
          </label>
          <input
            type="number"
            step="0.1"
            required
            className="input"
            value={formData.purchasePrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                purchasePrice: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            MRP (Maximum Retail Price) *
          </label>
          <input
            type="number"
            step="0.1"
            required
            className="input"
            value={formData.mrp}
            onChange={(e) =>
              setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })
            }
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Retail Selling Price (₹) *
          </label>
          <input
            type="number"
            step="0.1"
            required
            className="input"
            value={formData.retailPrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                retailPrice: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Wholesale Selling Price (₹) *
          </label>
          <input
            type="number"
            step="0.1"
            required
            className="input"
            value={formData.wholesalePrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                wholesalePrice: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Opening Quantity (Units) *
          </label>
          <input
            type="number"
            required
            className="input"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Pack Size (Units/Strip)
          </label>
          <input
            type="number"
            className="input"
            value={formData.packSize}
            onChange={(e) =>
              setFormData({
                ...formData,
                packSize: parseInt(e.target.value) || 1,
              })
            }
          />
        </div>
      </form>
    </Modal>
  );
};

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch | null;
  onSave: (data: {
    medicineId: string;
    batchId: string;
    type: AdjustmentType;
    quantity: number;
    reason: string;
  }) => Promise<void>;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  batch,
  onSave,
}) => {
  const [type, setType] = useState<AdjustmentType>("EXPIRED_WRITE_OFF");
  const [quantity, setQuantity] = useState<number>(batch?.quantity || 1);
  const [reason, setReason] = useState("Expired batch write-off from counter");

  if (!batch) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      medicineId: batch.medicineId,
      batchId: batch.id,
      type,
      quantity,
      reason,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Stock Write-Off / Adjustment: Batch ${batch.batchNumber}`}
      maxWidth="480px"
      footer={
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleSubmit}>
            Confirm Adjustment
          </button>
        </div>
      }
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
      >
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Adjustment Type
          </label>
          <select
            className="select"
            value={type}
            onChange={(e) => setType(e.target.value as AdjustmentType)}
          >
            <option value="EXPIRED_WRITE_OFF">Expired Stock Write-off</option>
            <option value="DAMAGE">Damaged / Broken Packaging</option>
            <option value="RETURN_TO_SUPPLIER">
              Return to Supplier / Distributor
            </option>
            <option value="INVENTORY_AUDIT">Physical Count Discrepancy</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Quantity to Adjust (Current: {batch.quantity})
          </label>
          <input
            type="number"
            min={1}
            max={batch.quantity}
            required
            className="input"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Reason / Notes *
          </label>
          <textarea
            required
            className="textarea"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div
          style={{
            padding: "0.6rem 0.8rem",
            borderRadius: "var(--radius-md)",
            background: "rgba(244, 63, 94, 0.1)",
            border: "1px solid rgba(244, 63, 94, 0.25)",
            fontSize: "0.75rem",
            color: "var(--rose)",
          }}
        >
          Financial Impact:{" "}
          <strong>₹{(quantity * batch.purchasePrice).toFixed(2)}</strong> will
          be deducted from inventory valuation.
        </div>
      </form>
    </Modal>
  );
};
