import { PaymentLogRecord, RegistrationRecord } from '../types';

function escapeCsvCell(value: string | number | boolean | undefined | null): string {
  const str = String(value ?? '');
  if (/[",\n\r;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeXmlHtml(value: string | number | boolean | undefined | null): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportRegistrationsCsv(records: RegistrationRecord[]) {
  const headers = [
    'Registration ID',
    'Queue #',
    'Full Name',
    'Email',
    'Phone',
    'Address',
    'City',
    'Country Code',
    'Country',
    'WiFi Confirmed',
    'ID Type',
    'ID Number',
    'ID Document File',
    'License Category',
    'Language',
    'Currency',
    'Base Fee (EUR)',
    'Converted Fee',
    'Payment Method',
    'Payment Status',
    'Dossier Status',
    'Code Progress (%)',
    'Best Quiz Score (%)',
    'Social Platform',
    'Referral Code',
    'Assigned Instructor ID',
  ];

  const rows = records.map((r) => [
    r.id,
    r.queueNumber,
    r.fullName,
    r.email,
    r.phone,
    r.address,
    r.city,
    r.countryCode,
    r.countryName,
    r.wifiReady ? 'Oui' : 'Non',
    r.idCardType,
    r.idCardNumber,
    r.idCardFileName,
    r.licenseCategory,
    r.preferredLanguage,
    r.currency,
    r.baseFeeEur,
    r.convertedAmount,
    r.paymentMethod,
    r.paymentStatus,
    r.dossierStatus,
    r.codeProgress,
    r.quizBestScore,
    r.referralPlatform || 'Direct',
    r.referralCode || '-',
    r.assignedInstructorId,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');

  const dateStamp = new Date().toISOString().slice(0, 10);
  triggerDownload(csvContent, `drivepro_applications_${dateStamp}.csv`, 'text/csv;charset=utf-8;');
}

export function exportRegistrationsExcel(records: RegistrationRecord[]) {
  const headers = [
    'ID Dossier',
    'File #',
    'Nom Complet',
    'Email',
    'Téléphone',
    'Adresse',
    'Ville',
    'Pays',
    'Wi-Fi / Internet',
    'Type Pièce',
    'N° Pièce Identité',
    'Fichier CNI',
    'Catégorie',
    'Langue',
    'Devise',
    'Frais Base (EUR)',
    'Montant Converti',
    'Mode Paiement',
    'Statut Paiement',
    'Statut Dossier',
    'Code (%)',
    'Meilleur QCM (%)',
    'Réseau Source',
    'Code Tracking',
  ];

  const headerHtml = headers
    .map((h) => `<th style="background:#0f172a;color:#ffffff;padding:6px 10px;">${escapeXmlHtml(h)}</th>`)
    .join('');
  const bodyHtml = records
    .map(
      (r) =>
        `<tr>
          <td>${escapeXmlHtml(r.id)}</td>
          <td>${escapeXmlHtml(r.queueNumber)}</td>
          <td>${escapeXmlHtml(r.fullName)}</td>
          <td>${escapeXmlHtml(r.email)}</td>
          <td>${escapeXmlHtml(r.phone)}</td>
          <td>${escapeXmlHtml(r.address)}</td>
          <td>${escapeXmlHtml(r.city)}</td>
          <td>${escapeXmlHtml(r.countryName)} (${escapeXmlHtml(r.countryCode)})</td>
          <td>${r.wifiReady ? 'Confirmé' : 'Non'}</td>
          <td>${escapeXmlHtml(r.idCardType)}</td>
          <td>${escapeXmlHtml(r.idCardNumber)}</td>
          <td>${escapeXmlHtml(r.idCardFileName)}</td>
          <td>${escapeXmlHtml(r.licenseCategory)}</td>
          <td>${escapeXmlHtml(r.preferredLanguage)}</td>
          <td>${escapeXmlHtml(r.currency)}</td>
          <td>${escapeXmlHtml(r.baseFeeEur)}</td>
          <td>${escapeXmlHtml(r.convertedAmount)}</td>
          <td>${escapeXmlHtml(r.paymentMethod)}</td>
          <td>${escapeXmlHtml(r.paymentStatus)}</td>
          <td>${escapeXmlHtml(r.dossierStatus)}</td>
          <td>${escapeXmlHtml(r.codeProgress)}</td>
          <td>${escapeXmlHtml(r.quizBestScore)}</td>
          <td>${escapeXmlHtml(r.referralPlatform || 'Direct')}</td>
          <td>${escapeXmlHtml(r.referralCode || '-')}</td>
        </tr>`
    )
    .join('');

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /></head>
    <body>
      <table border="1" cellspacing="0" cellpadding="4">
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${bodyHtml}</tbody>
      </table>
    </body>
  </html>`;

  const dateStamp = new Date().toISOString().slice(0, 10);
  triggerDownload(html, `drivepro_applications_${dateStamp}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
}

export function exportPaymentsCsv(logs: PaymentLogRecord[]) {
  const headers = [
    'Payment ID',
    'Registration ID',
    'Candidate Name',
    'Sender Name',
    'Sender Phone',
    'Country Code',
    'Currency',
    'Base Amount (EUR)',
    'Amount Paid',
    'Payment Method',
    'Transaction Reference',
    'Status',
  ];

  const rows = logs.map((p) => [
    p.id,
    p.registrationId,
    p.candidateName,
    p.senderName || '-',
    p.senderPhone || '-',
    p.countryCode,
    p.currency,
    p.baseAmountEur,
    p.amountPaid,
    p.method,
    p.transactionRef,
    p.status,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');

  const dateStamp = new Date().toISOString().slice(0, 10);
  triggerDownload(csvContent, `drivepro_payments_${dateStamp}.csv`, 'text/csv;charset=utf-8;');
}

export function exportPaymentsExcel(logs: PaymentLogRecord[]) {
  const headers = [
    'ID Paiement',
    'ID Dossier',
    'Candidat',
    'Expéditeur',
    'Tél. Expéditeur',
    'Pays',
    'Devise',
    'Base (EUR)',
    'Montant Payé',
    'Méthode',
    'Référence Transaction',
    'Statut',
  ];

  const headerHtml = headers
    .map((h) => `<th style="background:#0f172a;color:#ffffff;padding:6px 10px;">${escapeXmlHtml(h)}</th>`)
    .join('');
  const bodyHtml = logs
    .map(
      (p) =>
        `<tr>
          <td>${escapeXmlHtml(p.id)}</td>
          <td>${escapeXmlHtml(p.registrationId)}</td>
          <td>${escapeXmlHtml(p.candidateName)}</td>
          <td>${escapeXmlHtml(p.senderName || '-')}</td>
          <td>${escapeXmlHtml(p.senderPhone || '-')}</td>
          <td>${escapeXmlHtml(p.countryCode)}</td>
          <td>${escapeXmlHtml(p.currency)}</td>
          <td>${escapeXmlHtml(p.baseAmountEur)}</td>
          <td>${escapeXmlHtml(p.amountPaid)}</td>
          <td>${escapeXmlHtml(p.method)}</td>
          <td>${escapeXmlHtml(p.transactionRef)}</td>
          <td>${escapeXmlHtml(p.status)}</td>
        </tr>`
    )
    .join('');

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /></head>
    <body>
      <table border="1" cellspacing="0" cellpadding="4">
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${bodyHtml}</tbody>
      </table>
    </body>
  </html>`;

  const dateStamp = new Date().toISOString().slice(0, 10);
  triggerDownload(html, `drivepro_payments_${dateStamp}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
}
