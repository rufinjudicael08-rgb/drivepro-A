import React from 'react';
import { jsPDF } from 'jspdf';
import { CheckCircle2, Download, Printer, ShieldCheck, X } from 'lucide-react';
import {
  convertEurFee,
  formatTariffForCountry,
  getCountryByCode,
  getCountryLocalizedName,
} from '../data/countries';
import { getCountryTheme } from '../data/countryThemes';
import { PARIS_HQ_CONTACT } from '../data/curriculum';
import { getTranslations, normalizeLangCode } from '../data/i18n';
import {
  CountryConfig,
  Language,
  PaymentLogRecord,
  RegistrationRecord,
} from '../types';
import { InstituteCrestSvg } from './CountryVisuals';

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  lang: Language;
  country?: CountryConfig;
  registration: RegistrationRecord;
  payment?: PaymentLogRecord | null;
  onClose: () => void;
}

function pdfSafeText(str: string, asciiFallback: string): string {
  // jsPDF built-in Helvetica supports ISO-8859-1 characters; fall back cleanly for Cyrillic/CJK/Arabic
  return /^[\u0020-\u00FF]+$/.test(str) ? str : asciiFallback;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  isOpen,
  lang,
  country,
  registration,
  payment,
  onClose,
}) => {
  if (!isOpen) return null;

  const t = getTranslations(lang);
  const resolvedCountry = country || getCountryByCode(registration.countryCode);
  const countryTheme = getCountryTheme(resolvedCountry);
  const localizedCountryName = getCountryLocalizedName(
    resolvedCountry.code,
    lang,
    registration.countryName
  );

  const triggeredEur = registration.triggeredAmountEur || registration.baseFeeEur;
  const localAmountFormatted = formatTariffForCountry(
    triggeredEur,
    resolvedCountry,
    lang
  );
  const localAmountAscii = `${convertEurFee(triggeredEur, resolvedCountry)} ${resolvedCountry.currency}`;

  const invoiceNo = `FAC-${registration.queueNumber}-${registration.licenseCategory}`;
  const txRef = payment?.transactionRef || registration.latestPaymentId || 'TP-ENREGISTRE';
  const verifCode =
    registration.confirmationCode ||
    payment?.verificationCode ||
    `DPA-${triggeredEur}EUR-${registration.queueNumber}`;
  const isVerifiedByAdmin = registration.paymentStatus === 'verified';

  const handleDownloadPdfReceipt = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const localeCode = normalizeLangCode(lang);

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 34, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text(
      pdfSafeText(countryTheme.authorityName, countryTheme.authorityCode),
      16,
      16
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(191, 219, 254);
    doc.text(
      pdfSafeText(t.invoiceHeaderSub, 'OFFICIAL INVOICE & PAYMENT RECEIPT'),
      16,
      24
    );
    doc.text(`N° ${invoiceNo}`, 194, 16, { align: 'right' });
    doc.text(new Date().toLocaleDateString(localeCode), 194, 24, {
      align: 'right',
    });

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9.5);
    doc.text(
      `${countryTheme.authorityCode}  |  ${PARIS_HQ_CONTACT.accreditation}  |  ${pdfSafeText(
        localizedCountryName,
        resolvedCountry.nameEn
      )}`,
      16,
      44
    );

    doc.setDrawColor(226, 232, 240);
    doc.line(16, 49, 194, 49);

    const rows: [string, string][] = [
      [pdfSafeText(t.invoiceNumberLabel, 'Invoice Number'), invoiceNo],
      [
        pdfSafeText(t.invoiceCandidateLabel, 'Candidate'),
        pdfSafeText(registration.fullName, registration.email),
      ],
      [pdfSafeText('E-mail', 'Email'), registration.email],
      [
        pdfSafeText(t.invoiceCountryLabel, 'Country'),
        pdfSafeText(localizedCountryName, resolvedCountry.nameEn),
      ],
      [
        pdfSafeText(t.invoicePermitLabel, 'Permit Category'),
        `${pdfSafeText(t.permitLabel, 'Permit')} ${registration.licenseCategory} (#${registration.queueNumber})`,
      ],
      [
        pdfSafeText(t.invoicePayModeLabel, 'Payment Mode'),
        pdfSafeText(t.invoicePayModeValue, 'Official E-Payment'),
      ],
      [pdfSafeText(t.invoiceTxRefLabel, 'Transaction Reference'), txRef],
      [pdfSafeText(t.invoiceConfCodeLabel, 'Confirmation Code'), verifCode],
      [pdfSafeText(t.invoiceAmountLabel, 'Confirmed Amount'), localAmountAscii],
    ];

    let y = 60;
    rows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(100, 116, 139);
      doc.text(label, 16, y);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(String(value), 194, y, { align: 'right' });

      doc.setDrawColor(241, 245, 249);
      doc.line(16, y + 3.5, 194, y + 3.5);
      y += 12;
    });

    y += 6;
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(16, y, 178, 18, 2.5, 2.5, 'FD');
    doc.setTextColor(4, 120, 87);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(
      isVerifiedByAdmin
        ? `${pdfSafeText(t.invoiceConfirmedByDir, 'CONFIRMED')} (${localAmountAscii})`
        : pdfSafeText(t.invoiceRecordedStatus, 'RECORDED — OFFICIAL RECEIPT ISSUED'),
      105,
      y + 10.5,
      { align: 'center' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${countryTheme.authorityCode} · ${pdfSafeText(
        t.invoiceFooterNote,
        'Official document generated automatically.'
      )}`,
      105,
      282,
      { align: 'center' }
    );

    doc.save(`Facture_${invoiceNo}_${countryTheme.authorityCode}.pdf`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full overflow-hidden shadow-2xl">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <InstituteCrestSvg theme={countryTheme} className="w-8 h-8 shrink-0" />
            <span className="font-display font-bold text-base truncate">
              {countryTheme.authorityName}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label={t.contactCloseBtn}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-mono text-blue-700 font-bold">
                {t.invoiceTitle}
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                {invoiceNo}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {countryTheme.authorityName} · {PARIS_HQ_CONTACT.accreditation} ·{' '}
                {localizedCountryName}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">{t.invoiceAmountLabel}</div>
              <div className="text-2xl font-mono font-bold text-emerald-700 tabular-nums">
                {localAmountFormatted}
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">{t.invoiceCandidateLabel}</span>
              <span className="font-semibold text-slate-900">
                {registration.fullName}
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">{t.invoicePermitLabel}</span>
              <span className="font-semibold text-slate-900">
                {t.permitLabel} {registration.licenseCategory} (#
                {registration.queueNumber})
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">{t.invoicePayModeLabel}</span>
              <span className="font-semibold text-blue-700">
                {t.invoicePayModeValue}
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">{t.invoiceTxRefLabel}</span>
              <span className="font-mono font-semibold text-slate-900">
                {txRef}
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">{t.invoiceConfCodeLabel}</span>
              <span className="font-mono font-bold text-slate-900">
                {verifCode}
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">{t.statusLabel}</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                {isVerifiedByAdmin
                  ? t.invoiceConfirmedByDir
                  : t.invoiceRecordedStatus}
              </span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-2.5 text-sm text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{t.invoiceCertifyBanner}</span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-semibold rounded-lg cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t.invoicePrintBtn}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdfReceipt}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-lg cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{t.invoiceDownloadBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

