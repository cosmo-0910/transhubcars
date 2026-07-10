import type { Order } from '../../shared/lib/db';
import { formatPrice } from '../../shared/lib/formatters';

export const generateInvoice = (order: Order, platformSettings: any[], type: 'INVOICE' | 'RECEIPT' = 'INVOICE') => {
  const branding = platformSettings?.find(s => s.key === 'branding')?.value || {};
  const support = platformSettings?.find(s => s.key === 'support')?.value || {};
  const finance = platformSettings?.find(s => s.key === 'finance')?.value || {};

  const companyName = branding.name || 'Transhub Luxury';
  const logoUrl = branding.logo_url || 'https://pub-8134706509df44b2a8d6729a6747192a.r2.dev/transhub-logo-gold.png';
  const address = support.address || 'Lagos, Nigeria';
  const email = support.email || 'support@transhub.com';
  const phone = support.phone || '+234 808 678 8983';

  const invoiceDate = new Date().toLocaleDateString();
  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(); // 7 days from now

  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${type === 'RECEIPT' ? 'Receipt' : 'Invoice'} #${order.id.slice(0, 8).toUpperCase()}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          color: #1a1a1a;
          line-height: 1.5;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          position: relative;
          overflow: hidden;
        }

        body::before {
          content: "";
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          width: 80%;
          height: 80%;
          background-image: url("${logoUrl}");
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
          opacity: 0.03;
          z-index: -1;
          pointer-events: none;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 2px solid #c5a059;
          padding-bottom: 20px;
        }

        .logo-section img {
          height: 60px;
          margin-bottom: 10px;
        }

        .company-name {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .company-details {
          font-size: 12px;
          color: #666;
        }

        .invoice-title {
          text-align: right;
        }

        .invoice-title h1 {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          color: #c5a059;
          margin: 0 0 10px 0;
          text-transform: uppercase;
        }

        .invoice-meta {
          font-size: 14px;
          color: #666;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }

        .info-box h3 {
          font-size: 12px;
          text-transform: uppercase;
          color: #c5a059;
          letter-spacing: 1px;
          margin: 0 0 10px 0;
        }

        .info-box p {
          margin: 0;
          font-size: 14px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }

        th {
          text-align: left;
          padding: 15px;
          background: #f9f9f9;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #666;
          border-bottom: 1px solid #ddd;
        }

        td {
          padding: 15px;
          border-bottom: 1px solid #eee;
          font-size: 14px;
        }

        .amount-col {
          text-align: right;
          font-weight: 600;
        }

        .total-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
        }

        .total-box {
          width: 300px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }

        .grand-total {
          border-top: 2px solid #c5a059;
          border-bottom: none;
          font-weight: 700;
          font-size: 18px;
          color: #c5a059;
          margin-top: 10px;
        }

        .footer {
          text-align: center;
          font-size: 12px;
          color: #999;
          margin-top: 60px;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }

        .payment-info {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 40px;
        }

        .payment-info h3 {
          font-size: 14px;
          margin: 0 0 10px 0;
          color: #1a1a1a;
        }

        .payment-details {
          font-family: monospace;
          font-size: 14px;
        }
        
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-section">
          <!-- Logo placeholder if URL fails or for layout -->
          <img src="${logoUrl}" alt="Logo" style="height: 60px; margin-bottom: 10px;" onerror="this.style.display='none'">
          <div style="font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #c5a059; margin-bottom: 5px;">
            ${companyName.split(' ')[0]}<span style="color: #1a1a1a">.</span>
          </div>
          <div class="company-details">
            ${address}<br>
            ${email} | ${phone}
          </div>
        </div>
        <div class="invoice-title">
          <h1>${type === 'RECEIPT' ? 'Receipt' : 'Invoice'}</h1>
          <div class="invoice-meta">
            <div><strong>${type === 'RECEIPT' ? 'Receipt' : 'Invoice'} #:</strong> ${type === 'RECEIPT' ? 'RCT' : 'INV'}-${order.id.slice(0, 8).toUpperCase()}</div>
            <div><strong>Date:</strong> ${invoiceDate}</div>
            ${type === 'INVOICE' ? `<div><strong>Due Date:</strong> ${dueDate}</div>` : ''}
            <div><strong>Status:</strong> ${type === 'RECEIPT' ? 'PAID' : order.status.toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <h3>Bill To</h3>
          <p><strong>${order.profiles?.full_name || 'Valued Customer'}</strong></p>
          <p><strong>Customer ID:</strong> ${order.user_id?.slice(0, 8).toUpperCase()}</p>
          <p><strong>Payment Reference:</strong> ${order.payment_ref || 'N/A'}</p>
        </div>
        <div class="info-box">
          <h3>Vehicle Details</h3>
          <p><strong>${order.cars?.year} ${order.cars?.make} ${order.cars?.model}</strong></p>
          <p>VIN: ${order.cars?.vin || 'N/A'}</p>
          <p>Color: ${order.cars?.exterior_color} / ${order.cars?.interior_color}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="amount-col">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Vehicle Purchase</strong><br>
              <span style="font-size: 12px; color: #666;">
                ${order.cars?.year} ${order.cars?.make} ${order.cars?.model} - ${order.cars?.condition || 'Pre-owned'}
              </span>
            </td>
            <td class="amount-col">${formatPrice(order.amount)}</td>
          </tr>
          <!-- Future: Add taxes, towing fees, etc. here -->
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-box">
          <div class="total-row">
            <span>Subtotal</span>
            <span>${formatPrice(order.amount)}</span>
          </div>
          <div class="total-row">
            <span>Tax (${finance.tax_rate || 0}%)</span>
            <span>₦0.00</span>
          </div>
          <div class="total-row grand-total">
            <span>Total Due</span>
            <span>${formatPrice(order.amount)}</span>
          </div>
        </div>
      </div>

      <div class="payment-info">
        <h3>Payment Information</h3>
        <div class="payment-details">
          Bank: Access Bank PLC<br>
          Account Name: ${companyName}<br>
          Account Number: 0123456789<br>
          Ref: ${order.payment_ref || `${type === 'RECEIPT' ? 'RCT' : 'INV'}-${order.id.slice(0, 8).toUpperCase()}`}
        </div>
      </div>

      <div class="footer">
        <p>Thank you for choosing ${companyName}. This document is computer generated and valid without a signature.</p>
        <p><a href="https://transhub.com" style="color: #c5a059; text-decoration: none;">www.transhub.com</a></p>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        }
      </script>
    </body>
    </html>
  `;

  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(invoiceHtml);
    newWindow.document.close();
  } else {
    alert('Pop-up blocked. Please allow pop-ups for this site to generate invoices.');
  }
};
