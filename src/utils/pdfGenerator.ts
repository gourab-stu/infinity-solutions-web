import type { Sale, StoreSettings } from "../types";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatMonthYear,
} from "./formatters";

export function generateAndPrintInvoice(
  sale: Sale,
  settings: StoreSettings | null,
  format: "a4" | "thermal" = "a4",
) {
  const printWindow = window.open("", "_blank", "width=850,height=900");
  if (!printWindow) {
    alert("Please allow popups to print / save invoice.");
    return;
  }

  const isThermal = format === "thermal";

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice - ${sale.billNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&family=Noto+Sans+Mono:wght@500;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      font-family: ${isThermal ? "'Noto Sans Mono', monospace" : "'Open Sans', Arial, sans-serif"};
      font-size: ${isThermal ? "11px" : "12px"};
      color: #0f172a;
      background: #ffffff;
      padding: ${isThermal ? "10px" : "28px"};
      line-height: 1.35;
    }

    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
    }

    .title {
      font-size: ${isThermal ? "15px" : "20px"};
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .meta-box {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 2px;
      padding: 8px 12px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
    }

    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }

    .invoice-table th {
      background: #f1f5f9;
      border-top: 1px solid #0f172a;
      border-bottom: 1px solid #0f172a;
      padding: 6px 8px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .invoice-table td {
      border-bottom: 1px solid #e2e8f0;
      padding: 6px 8px;
      vertical-align: middle;
    }

    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }

    .summary-section {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #0f172a;
      padding-top: 10px;
    }

    .grand-total-row {
      display: flex;
      justify-content: space-between;
      font-size: 15px;
      font-weight: 800;
      border-top: 2px solid #0f172a;
      border-bottom: 2px solid #0f172a;
      padding: 6px 0;
      margin: 6px 0;
    }

    .badge-tag {
      display: inline-block;
      border: 1.5px solid #0f172a;
      padding: 2px 8px;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    @media print {
      body { padding: ${isThermal ? "4px" : "15mm"}; }
      @page {
        size: ${isThermal ? "80mm auto" : "A4 portrait"};
        margin: 0;
      }
    }
  </style>
</head>
<body>
  ${
    isThermal
      ? `
    <!-- 80mm Thermal Receipt -->
    <div style="text-align: center; margin-bottom: 8px;">
      <div style="font-size: 15px; font-weight: 800;">${settings?.pharmacyName || "INFINITY PHARMA SOLUTIONS"}</div>
      <div>${settings?.tagline || ""}</div>
      <div>${settings?.address || ""}, ${settings?.city || ""} - ${settings?.pincode || ""}</div>
      <div>Ph: ${settings?.phone || ""} | GST: ${settings?.gstin || ""}</div>
      <div>DL No: ${settings?.dlNumber || ""}</div>
      <div style="border-bottom: 1px dashed #000; margin: 6px 0;"></div>
      <div style="text-align: left; display: flex; justify-content: space-between;">
        <div>
          <div><strong>Bill:</strong> ${sale.billNumber}</div>
          <div><strong>Cust:</strong> ${sale.customerName}</div>
          ${sale.doctorName ? `<div><strong>Dr:</strong> ${sale.doctorName}</div>` : ""}
        </div>
        <div style="text-align: right;">
          <div><strong>Date:</strong> ${formatDate(sale.createdAt)}</div>
          <div><strong>Mode:</strong> ${sale.type}</div>
          <div><strong>Pay:</strong> ${sale.paymentMethod}</div>
        </div>
      </div>
      <div style="border-bottom: 1px dashed #000; margin: 6px 0;"></div>
    </div>

    <table class="invoice-table" style="font-size: 10px;">
      <thead>
        <tr>
          <th>Item</th>
          <th>Batch</th>
          <th class="text-center">Qty</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Amt</th>
        </tr>
      </thead>
      <tbody>
        ${sale.items
          .map(
            (it) => `
          <tr>
            <td class="font-bold">${it.medicineName}</td>
            <td>${it.batchNumber}</td>
            <td class="text-center">${it.quantity}</td>
            <td class="text-right">${formatCurrency(it.unitPrice)}</td>
            <td class="text-right font-bold">${formatCurrency(it.totalPrice)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div style="border-top: 1px dashed #000; padding-top: 6px; font-size: 11px;">
      <div style="display: flex; justify-content: space-between;">
        <span>Subtotal:</span>
        <span>${formatCurrency(sale.subtotal)}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>GST Tax (Incl):</span>
        <span>${formatCurrency(sale.taxAmount)}</span>
      </div>
      ${
        sale.discountAmount > 0
          ? `
        <div style="display: flex; justify-content: space-between; color: #e11d48;">
          <span>Discount:</span>
          <span>- ${formatCurrency(sale.discountAmount)}</span>
        </div>
      `
          : ""
      }
      <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; border-top: 1px solid #000; padding: 4px 0; margin-top: 4px;">
        <span>NET AMOUNT:</span>
        <span>${formatCurrency(sale.grandTotal)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 2px;">
        <span>Paid (${sale.paymentMethod}):</span>
        <span>${formatCurrency(sale.paidAmount)}</span>
      </div>
      ${
        sale.changeAmount > 0
          ? `
        <div style="display: flex; justify-content: space-between;">
          <span>Change Returned:</span>
          <span>${formatCurrency(sale.changeAmount)}</span>
        </div>
      `
          : ""
      }
    </div>
    <div style="border-top: 1px dashed #000; margin-top: 8px; padding-top: 6px; text-align: center; font-size: 10px;">
      ${settings?.invoiceFooter || "Thank you! Get well soon."}
    </div>
  `
      : `
    <!-- Standard A4 GST Tax Invoice -->
    <table class="header-table">
      <tr>
        <td style="width: 60%; vertical-align: top;">
          <div class="title">${settings?.pharmacyName || "INFINITY PHARMA SOLUTIONS"}</div>
          <div style="color: #475569; font-size: 12px; margin-top: 2px;">${settings?.tagline || "Healthcare & Diagnostics"}</div>
          <div style="font-size: 11.5px; margin-top: 4px; color: #334155;">
            ${settings?.address || ""}, ${settings?.city || ""} - ${settings?.pincode || ""}<br />
            <strong>GSTIN:</strong> ${settings?.gstin || ""} | <strong>DL No:</strong> ${settings?.dlNumber || ""}<br />
            <strong>Phone:</strong> ${settings?.phone || ""} | <strong>Email:</strong> ${settings?.email || ""}
          </div>
        </td>
        <td style="width: 40%; text-align: right; vertical-align: top;">
          <div class="badge-tag">TAX INVOICE (${sale.type})</div>
          <div style="font-size: 12px;"><strong>Invoice No:</strong> ${sale.billNumber}</div>
          <div style="font-size: 12px;"><strong>Invoice Date:</strong> ${formatDate(sale.createdAt)}</div>
          <div style="font-size: 12px;"><strong>Payment Status:</strong> ${sale.paymentStatus} (${sale.paymentMethod})</div>
        </td>
      </tr>
    </table>

    <div class="meta-box">
      <div>
        <strong style="text-decoration: underline;">Billed To (Customer):</strong><br />
        <span style="font-weight: 700; font-size: 13px;">${sale.customerName}</span><br />
        ${sale.customerPhone ? `Phone: ${sale.customerPhone}<br />` : ""}
        ${sale.customer?.gstin ? `GSTIN: ${sale.customer.gstin}<br />` : ""}
        ${sale.customer?.address ? `Address: ${sale.customer.address}` : ""}
      </div>
      <div style="text-align: right;">
        <strong style="text-decoration: underline;">Prescription Details:</strong><br />
        Doctor: <strong>${sale.doctorName || "Self / OTC"}</strong><br />
        Rx Number: <strong>${sale.prescriptionNumber || "N/A"}</strong><br />
        Time: ${formatDateTime(sale.createdAt)}
      </div>
    </div>

    <table class="invoice-table">
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th>Medicine / Composition</th>
          <th style="width: 85px;">Batch</th>
          <th style="width: 75px;">Expiry</th>
          <th style="width: 45px;" class="text-center">Qty</th>
          <th style="width: 70px;" class="text-right">MRP</th>
          <th style="width: 70px;" class="text-right">Rate</th>
          <th style="width: 50px;" class="text-center">GST%</th>
          <th style="width: 50px;" class="text-center">Disc%</th>
          <th style="width: 90px;" class="text-right">Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${sale.items
          .map(
            (it, idx) => `
          <tr>
            <td style="color: #64748b;">${idx + 1}</td>
            <td>
              <div class="font-bold">${it.medicineName}</div>
            </td>
            <td>${it.batchNumber}</td>
            <td>${formatMonthYear(it.expiryDate)}</td>
            <td class="text-center font-bold">${it.quantity}</td>
            <td class="text-right">${formatCurrency(it.mrp)}</td>
            <td class="text-right">${formatCurrency(it.unitPrice)}</td>
            <td class="text-center">${it.gstRate}%</td>
            <td class="text-center">${it.discountPercent}%</td>
            <td class="text-right font-bold">${formatCurrency(it.totalPrice)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="summary-section">
      <div style="width: 55%; font-size: 11px; color: #475569;">
        <strong>Terms & Conditions:</strong><br />
        1. Goods once sold will not be accepted back without original invoice.<br />
        2. Medicines requiring refrigeration must be stored at 2°C - 8°C.<br />
        3. Subject to local jurisdiction only.<br /><br />
        <div style="margin-top: 25px; color: #0f172a; font-weight: 700;">
          Authorized Signatory / Registered Pharmacist
        </div>
      </div>

      <div style="width: 40%; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span>Subtotal:</span>
          <span class="font-bold">${formatCurrency(sale.subtotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span>GST Breakdown (CGST+SGST):</span>
          <span>${formatCurrency(sale.taxAmount)}</span>
        </div>
        ${
          sale.discountAmount > 0
            ? `
          <div style="display: flex; justify-content: space-between; color: #e11d48; margin-bottom: 3px;">
            <span>Total Discount:</span>
            <span>- ${formatCurrency(sale.discountAmount)}</span>
          </div>
        `
            : ""
        }
        ${
          sale.roundOff !== 0
            ? `
          <div style="display: flex; justify-content: space-between; color: #64748b; margin-bottom: 3px;">
            <span>Round Off:</span>
            <span>${formatCurrency(sale.roundOff)}</span>
          </div>
        `
            : ""
        }
        <div class="grand-total-row">
          <span>GRAND TOTAL:</span>
          <span>${formatCurrency(sale.grandTotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: #334155;">
          <span>Amount Paid (${sale.paymentMethod}):</span>
          <span>${formatCurrency(sale.paidAmount)}</span>
        </div>
        ${
          sale.changeAmount > 0
            ? `
          <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: #059669; font-weight: 600;">
            <span>Change Returned:</span>
            <span>${formatCurrency(sale.changeAmount)}</span>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `
  }
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 250);
}
