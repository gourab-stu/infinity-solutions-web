import React, { useState, useEffect } from "react";
import { Save, ShieldCheck, Printer, Building } from "lucide-react";
import type { StoreSettings } from "../../types";
import { api } from "../../services/api";

interface SettingsManagerProps {
  settings: StoreSettings | null;
  onUpdateSettings: (updated: StoreSettings) => void;
  onShowToast: (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
  ) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  onUpdateSettings,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({
    id: "default",
    pharmacyName: "INFINITY PHARMA SOLUTIONS",
    tagline: "Healthcare & Pharmacy Management",
    address: "101 Medical Center Rd, Central Plaza",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    phone: "+91 98201 54321",
    email: "contact@infinitypharma.com",
    gstin: "27AABCI1234F1Z9",
    dlNumber: "MH-MZ2-108291 / MH-MZ2-108292",
    currency: "₹",
    thermalPrint: true,
    invoiceFooter: "Thank you for your visit! Wishing you a speedy recovery.",
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.updateSettings(formData);
      onUpdateSettings(updated);
      onShowToast(
        "success",
        "Settings Saved",
        "Pharmacy store information updated successfully",
      );
    } catch (err: any) {
      onShowToast("error", "Save Failed", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        paddingBottom: "2rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
      >
        {/* Pharmacy Credentials Card */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.25rem",
              color: "var(--primary)",
            }}
          >
            <Building size={20} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
              Pharmacy & Store Profile
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div style={{ gridColumn: "span 2" }}>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Pharmacy / Business Name *
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.pharmacyName}
                onChange={(e) =>
                  setFormData({ ...formData, pharmacyName: e.target.value })
                }
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Tagline / Subtitle
              </label>
              <input
                type="text"
                className="input"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
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
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
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
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                State
              </label>
              <input
                type="text"
                className="input"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Pincode
              </label>
              <input
                type="text"
                className="input"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Contact Phone Number
              </label>
              <input
                type="text"
                className="input"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Email Address
              </label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Currency Symbol
              </label>
              <input
                type="text"
                className="input"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Regulatory & Tax Licensing */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.25rem",
              color: "var(--cyan)",
            }}
          >
            <ShieldCheck size={20} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
              Drug Licensing & GST Registration
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                GSTIN (GST Number)
              </label>
              <input
                type="text"
                className="input"
                placeholder="27AABCI1234F1Z9"
                value={formData.gstin}
                onChange={(e) =>
                  setFormData({ ...formData, gstin: e.target.value })
                }
              />
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Drug License No (Form 20B & 21B)
              </label>
              <input
                type="text"
                className="input"
                placeholder="MH-MZ2-108291 / MH-MZ2-108292"
                value={formData.dlNumber}
                onChange={(e) =>
                  setFormData({ ...formData, dlNumber: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Receipt & Invoicing Layout */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.25rem",
              color: "var(--indigo)",
            }}
          >
            <Printer size={20} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
              Invoicing & Print Customization
            </h3>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <input
                type="checkbox"
                id="thermalPrint"
                checked={formData.thermalPrint}
                onChange={(e) =>
                  setFormData({ ...formData, thermalPrint: e.target.checked })
                }
              />
              <label
                htmlFor="thermalPrint"
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  cursor: "pointer",
                }}
              >
                Default to 80mm Thermal Receipt format on print
              </label>
            </div>

            <div>
              <label
                style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
              >
                Invoice Bottom Greeting / Notes
              </label>
              <textarea
                className="textarea"
                rows={2}
                value={formData.invoiceFooter}
                onChange={(e) =>
                  setFormData({ ...formData, invoiceFooter: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSaving}
          >
            <Save size={18} /> {isSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
};
