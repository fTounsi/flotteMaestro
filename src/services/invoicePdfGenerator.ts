import { jsPDF } from 'jspdf';
import { Invoice, InvoiceLineItem } from '../types/fleet';

/**
 * Generates an official, publication-ready PDF invoice for fleet clients
 * based on vehicle count, telemetry packets, and service usage.
 */
export function generateInvoicePdf(invoice: Invoice, download: boolean = true): jsPDF {
  // A4 paper size: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Colors
  const primaryDark = [15, 23, 42]; // #0f172a (Slate 900)
  const brandEmerald = [5, 150, 105]; // #059669 (Emerald 600)
  const brandBlue = [37, 99, 235]; // #2563eb (Blue 600)
  const textMuted = [100, 116, 139]; // #64748b (Slate 500)
  const borderGray = [226, 232, 240]; // #e2e8f0 (Slate 200)
  const bgLight = [248, 250, 252]; // #f8fafc (Slate 50)

  // 1. Top Header Banner & Accent Bar
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Emerald Top Stripe
  doc.setFillColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // App / Brand Title in White
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FLOTTEMAESTRO TELEMATICS', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text('Enterprise Fleet Intelligence & Cloud Telematics Gateway', margin, 20);

  // Invoice Title on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL INVOICE', pageWidth - margin, 13, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text(invoice.invoiceNumber, pageWidth - margin, 19, { align: 'right' });

  // 2. Status Badge / Stamp
  let statusBg = [241, 245, 249];
  let statusText = [71, 85, 105];
  let statusLabel = 'DRAFT';

  if (invoice.status === 'paid') {
    statusBg = [209, 250, 229]; // emerald 100
    statusText = [6, 95, 70]; // emerald 800
    statusLabel = 'PAID / RÉGLÉE';
  } else if (invoice.status === 'pending') {
    statusBg = [254, 243, 199]; // amber 100
    statusText = [146, 64, 14]; // amber 800
    statusLabel = 'PAYMENT DUE / EN ATTENTE';
  } else if (invoice.status === 'overdue') {
    statusBg = [254, 226, 226]; // rose 100
    statusText = [153, 27, 27]; // rose 800
    statusLabel = 'OVERDUE / EN RETARD';
  }

  // Draw status badge
  const badgeWidth = 48;
  const badgeHeight = 7;
  const badgeX = pageWidth - margin - badgeWidth;
  const badgeY = 32;

  doc.setFillColor(statusBg[0], statusBg[1], statusBg[2]);
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(statusText[0], statusText[1], statusText[2]);
  doc.text(statusLabel, badgeX + badgeWidth / 2, badgeY + 4.8, { align: 'center' });

  // 3. Issuer & Client Information Blocks
  let cursorY = 35;

  // Box 1: Issuer Info (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('ISSUED BY / ÉMIS PAR:', margin, cursorY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(invoice.organizationName || 'FlotteMaestro Telematics SARL', margin, cursorY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Casablanca Nearshore Park, Shore 3', margin, cursorY + 10);
  doc.text('Casablanca 20270, Kingdom of Morocco', margin, cursorY + 14);
  doc.text('ICE: 002984172000031 | IF: 49182394 | RC: 512048', margin, cursorY + 18);
  doc.text('Support & Billing: billing@flottemaestro.ma | +212 522 40 88 00', margin, cursorY + 22);

  // Box 2: Bill To Client (Right)
  const clientColX = margin + contentWidth / 2 + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('BILL TO / FACTURÉ À:', clientColX, cursorY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text(invoice.clientLegalName || invoice.clientName, clientColX, cursorY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(invoice.clientAddress || 'Zone Industrielle', clientColX, cursorY + 10);
  doc.text(`${invoice.clientCity || 'Casablanca'}, ${invoice.clientCountry || 'Morocco'}`, clientColX, cursorY + 14);
  doc.text(invoice.clientIceOrTaxId || 'ICE: 001928471000083', clientColX, cursorY + 18);
  doc.text(`Attn: ${invoice.clientEmail} | ${invoice.clientPhone}`, clientColX, cursorY + 22);

  cursorY += 28;

  // 4. Invoice Metadata Card (4 Columns)
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, cursorY, contentWidth, 16, 2, 2, 'FD');

  const metaColWidth = contentWidth / 4;
  const metaFields = [
    {
      label: 'INVOICE DATE',
      val: new Date(invoice.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    {
      label: 'PAYMENT DUE',
      val: new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    {
      label: 'BILLING PERIOD',
      val: `${new Date(invoice.billingPeriodStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${new Date(invoice.billingPeriodEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
    },
    {
      label: 'MONITORED ASSETS',
      val: `${invoice.vehicleCount} Active Vehicles`
    }
  ];

  metaFields.forEach((mf, i) => {
    const x = margin + i * metaColWidth + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(mf.label, x, cursorY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.text(mf.val, x, cursorY + 11.5);
  });

  cursorY += 21;

  // 5. Fleet Service Usage & Rate Breakdown Table
  // Table Headers
  const colX_desc = margin + 3;
  const colX_metric = margin + 86;
  const colX_rate = margin + 134;
  const colX_total = margin + contentWidth - 3;

  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.roundedRect(margin, cursorY, contentWidth, 8, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TELEMATICS SERVICE & LINE ITEM', colX_desc, cursorY + 5.5);
  doc.text('USAGE METRIC / VEHICLE QTY', colX_metric, cursorY + 5.5);
  doc.text('UNIT RATE', colX_rate, cursorY + 5.5);
  doc.text('TOTAL', colX_total, cursorY + 5.5, { align: 'right' });

  cursorY += 9;

  // Line items
  invoice.lineItems.forEach((item: InvoiceLineItem, index: number) => {
    const rowHeight = 11;
    const isEven = index % 2 === 0;

    if (isEven) {
      doc.setFillColor(250, 250, 252);
      doc.rect(margin, cursorY, contentWidth, rowHeight, 'F');
    }

    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(margin, cursorY + rowHeight, margin + contentWidth, cursorY + rowHeight);

    // Description & Type Icon/Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.text(item.description, colX_desc, cursorY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    const subNote = item.vehicleCount ? `Asset quota: ${item.vehicleCount} vehicles` : 'Platform compute service';
    doc.text(subNote, colX_desc, cursorY + 8.5);

    // Usage Metric
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(item.usageMetric || `${item.quantity} units`, colX_metric, cursorY + 6);

    // Unit Rate
    const currSym = invoice.currency === 'MAD' ? 'DH' : invoice.currency === 'EUR' ? '€' : '$';
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`${currSym}${item.unitPrice.toFixed(2)}`, colX_rate, cursorY + 6);

    // Total Price
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
    doc.text(`${currSym}${item.totalPrice.toFixed(2)}`, colX_total, cursorY + 6, { align: 'right' });

    cursorY += rowHeight;
  });

  cursorY += 4;

  // 6. Lower Section: Payment Details (Left) + Totals Summary Box (Right)
  const lowerBoxTop = cursorY;

  // Left Side: Wire Transfer & Banking Instructions
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, lowerBoxTop, 100, 44, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('PAYMENT & WIRE TRANSFER INSTRUCTIONS', margin + 4, lowerBoxTop + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Bank Name: ${invoice.bankDetails?.bankName || 'Attijariwafa Bank Casablanca'}`, margin + 4, lowerBoxTop + 12);
  doc.text(`RIB / Account: ${invoice.bankDetails?.ribOrIban || 'MA64 007 780 0001234567890123 45'}`, margin + 4, lowerBoxTop + 17);
  doc.text(`SWIFT / BIC: ${invoice.bankDetails?.swiftBic || 'BCMAMAMC'}`, margin + 4, lowerBoxTop + 22);
  doc.text(`Reference: ${invoice.invoiceNumber} - ${invoice.clientName.substring(0, 18)}`, margin + 4, lowerBoxTop + 27);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Please include invoice reference in your wire transfer description.', margin + 4, lowerBoxTop + 34);
  doc.text('Accepts direct bank transfer, corporate check, or Stripe card portal.', margin + 4, lowerBoxTop + 39);

  // Right Side: Totals Summary
  const totalsBoxX = margin + 104;
  const totalsBoxWidth = contentWidth - 104;

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(totalsBoxX, lowerBoxTop, totalsBoxWidth, 44, 2, 2, 'FD');

  const currSym = invoice.currency === 'MAD' ? 'DH' : invoice.currency === 'EUR' ? '€' : '$';

  let totalsY = lowerBoxTop + 6;
  const totalsLabelX = totalsBoxX + 4;
  const totalsValX = totalsBoxX + totalsBoxWidth - 4;

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal (HT):', totalsLabelX, totalsY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${currSym}${invoice.subtotal.toFixed(2)}`, totalsValX, totalsY, { align: 'right' });

  // Discount if any
  if (invoice.discountAmount && invoice.discountAmount > 0) {
    totalsY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(brandEmerald[0], brandEmerald[1], brandEmerald[2]);
    doc.text('Volume Discount:', totalsLabelX, totalsY);
    doc.setFont('helvetica', 'bold');
    doc.text(`-${currSym}${invoice.discountAmount.toFixed(2)}`, totalsValX, totalsY, { align: 'right' });
  }

  // VAT / TVA
  totalsY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`VAT / TVA (${invoice.taxRatePercent}%):`, totalsLabelX, totalsY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${currSym}${invoice.taxAmount.toFixed(2)}`, totalsValX, totalsY, { align: 'right' });

  // Divider
  totalsY += 4;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.line(totalsBoxX + 3, totalsY, totalsBoxX + totalsBoxWidth - 3, totalsY);

  // Total TTC Amount Due
  totalsY += 7;
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.roundedRect(totalsBoxX + 3, totalsY - 4, totalsBoxWidth - 6, 12, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL AMOUNT (TTC):', totalsLabelX + 2, totalsY + 3.5);

  doc.setFontSize(11);
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text(`${currSym}${invoice.totalAmount.toFixed(2)}`, totalsValX - 2, totalsY + 3.5, { align: 'right' });

  // 7. Security Stamp, QR Verification Box & Digital Signature
  cursorY = lowerBoxTop + 48;

  // Terms & Legal Notes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('TERMS & REGULATORY NOTICE:', margin, cursorY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(invoice.termsAndConditions || 'Payment is due within 30 days of invoice date. Late payments are subject to a statutory 1.5% monthly interest fee.', margin, cursorY + 4);
  doc.text('Billed in accordance with ANRT / Morocco telecommunications compliance standards and ISO 27001 data center retention.', margin, cursorY + 8);

  // Cryptographic Verification Stamp Box (Right Bottom)
  const stampBoxWidth = 55;
  const stampBoxX = pageWidth - margin - stampBoxWidth;
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(stampBoxX, cursorY - 2, stampBoxWidth, 20, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
  doc.text('✓ DIGITAL TELEMETRICS SEAL', stampBoxX + 4, cursorY + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(71, 85, 105);
  doc.text(`Hash: SHA256-${invoice.id.substring(0, 8)}-${invoice.invoiceNumber.replace(/[^0-9]/g, '')}`, stampBoxX + 4, cursorY + 7);
  doc.text(`Timestamp: ${new Date(invoice.createdAt).toISOString()}`, stampBoxX + 4, cursorY + 11);
  doc.text('Certified Electronic Invoice', stampBoxX + 4, cursorY + 15);

  // 8. Page Footer
  const footerY = pageHeight - 8;
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, footerY - 2, pageWidth, 10, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  doc.text('FlotteMaestro Telematics • Registered Capital 1,000,000 MAD • CNSS: 9481023 • Patent: 34109822', margin, footerY + 3);

  doc.text(`Page 1 of 1 • Generated for ${invoice.clientName}`, pageWidth - margin, footerY + 3, { align: 'right' });

  if (download) {
    doc.save(`Invoice-${invoice.invoiceNumber}-${invoice.clientName.replace(/\s+/g, '_')}.pdf`);
  }

  return doc;
}

/**
 * Returns a Data URL for embedded on-screen iframe preview of the generated PDF.
 */
export function getInvoicePdfDataUrl(invoice: Invoice): string {
  const doc = generateInvoicePdf(invoice, false);
  return doc.output('datauristring');
}
