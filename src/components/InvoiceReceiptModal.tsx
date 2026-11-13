import React from 'react';
import { jsPDF } from 'jspdf';
import { CheckCircle2, Download, Printer, ShieldCheck, X } from 'lucide-react';
import { formatLocalCurrency, getCountryByCode } from '../data/countries';
import { PARIS_HQ_CONTACT } from '../data/curriculum';
import { Language, PaymentLogRecord, RegistrationRecord } from '../types';
import { DriveProLogo } from './DriveProLogo';

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  lang: Language;
  registration: RegistrationRecord;
  payment?: PaymentLogRecord | null;
  onClose: () => void;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  isOpen,
  lang,
  registration,
  payment,
  onClose,
}) => {
  if (!isOpen) return null;

  const isEn = lang === 'en';
  const country = getCountryByCode(registration.countryCode);
  const formattedFee = formatLocalCurrency(
    registration.convertedAmount,
    country,
    lang
  );
  const invoiceNo = `FAC-${registration.queueNumber}-${registration.licenseCategory}`;
  const txRef = payment?.transactionRef || registration.latestPaymentId || 'TP-ENREGISTRE';
  const verifCode = payment?.verificationCode || `DP-${registration.queueNumber}`;
  const isVerifiedByAdmin = registration.paymentStatus === 'verified';

  const handleDownloadPdfReceipt = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    // Top dark navy header bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 34, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Driveo Academy', 16, 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(191, 219, 254);
    doc.text(
      isEn
        ? 'OFFICIAL INVOICE & PAYMENT RECEIPT'
        : 'FACTURE OFFICIELLE & RECU DE PAIEMENT',
      16,
      24
    );
    doc.text(`N° ${invoiceNo}`, 194, 16, { align: 'right' });
    doc.text(new Date().toLocaleDateString('fr-FR'), 194, 24, { align: 'right' });

    // HQ details
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9.5);
    doc.text(
      `${PARIS_HQ_CONTACT.addressFr}  |  Agrément ${PARIS_HQ_CONTACT.accreditation}  |  ${PARIS_HQ_CONTACT.displayPhone}`,
      16,
      44
    );

    doc.setDrawColor(226, 232, 240);
    doc.line(16, 49, 194, 49);

    const rows: [string, string][] = [
      [isEn ? 'Invoice Number' : 'Numéro de Facture', invoiceNo],
      [isEn ? 'Candidate' : 'Candidat', registration.fullName],
      [isEn ? 'Email' : 'Adresse e-mail', registration.email],
      [isEn ? 'Phone' : 'Téléphone', registration.phone],
      [
        isEn ? 'Permit Category' : 'Catégorie de Permis',
        `${isEn ? 'Permit' : 'Permis'} ${registration.licenseCategory} (#${registration.queueNumber})`,
      ],
      [isEn ? 'Payment Mode' : 'Mode de Paiement', 'Télépaiement Vérifié'],
      [isEn ? 'Transaction ID' : 'ID Transaction', txRef],
      [isEn ? 'Verification Code' : 'Code de Vérification', verifCode],
      [
        isEn ? 'Amount Paid' : 'Montant Réglé',
        `${formattedFee} (${registration.baseFeeEur} EUR)`,
      ],
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

    // Official validation stamp box
    y += 6;
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(16, y, 178, 18, 2.5, 2.5, 'FD');
    doc.setTextColor(4, 120, 87);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(
      isVerifiedByAdmin
        ? isEn
          ? 'CONFIRMED & VERIFIED BY DIRECTION — ACCESS UNLOCKED'
          : 'PAIEMENT CONFIRMÉ & VALIDÉ — ACCÈS COURS & EXAMENS DÉBLOQUÉS'
        : isEn
        ? 'PAYMENT RECORDED & VERIFIED — OFFICIAL RECEIPT ISSUED'
        : 'PAIEMENT ENREGISTRÉ & VÉRIFIÉ — FACTURE OFFICIELLE ÉMISE',
      105,
      y + 10.5,
      { align: 'center' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Driveo Academy International · Document officiel généré automatiquement.',
      105,
      282,
      { align: 'center' }
    );

    doc.save(`Facture_${invoiceNo}_DriveoAcademy.pdf`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full overflow-hidden shadow-2xl">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between gap-4">
          <DriveProLogo dark size="sm" />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-mono text-blue-700 font-bold">
                {isEn ? 'OFFICIAL INVOICE & RECEIPT' : 'FACTURE & REÇU OFFICIEL'}
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                {invoiceNo}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {PARIS_HQ_CONTACT.addressFr} · {PARIS_HQ_CONTACT.accreditation}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">
                {isEn ? 'Paid Amount' : 'Montant réglé'}
              </div>
              <div className="text-xl font-mono font-bold text-emerald-700 tabular-nums">
                {formattedFee}
              </div>
              <div className="text-xs font-mono text-slate-500">
                ({registration.baseFeeEur} €)
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">{isEn ? 'Candidate' : 'Candidat'}</span>
              <span className="font-semibold text-slate-900">{registration.fullName}</span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">{isEn ? 'Permit' : 'Catégorie de permis'}</span>
              <span className="font-semibold text-slate-900">
                {isEn ? 'Permit' : 'Permis'} {registration.licenseCategory} (#{registration.queueNumber})
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">{isEn ? 'Payment Method' : 'Mode de paiement'}</span>
              <span className="font-semibold text-blue-700">
                {isEn ? 'Verified E-Payment' : 'Télépaiement vérifié'}
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">
                {isEn ? 'Transaction ID' : 'ID de transaction'}
              </span>
              <span className="font-mono font-semibold text-slate-900">{txRef}</span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">
                {isEn ? 'Verification Code' : 'Code de vérification'}
              </span>
              <span className="font-mono font-bold text-slate-900">{verifCode}</span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">{isEn ? 'Status' : 'Statut'}</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                {isVerifiedByAdmin
                  ? isEn
                    ? 'Verified by Direction'
                    : 'Confirmé par Direction'
                  : isEn
                  ? 'Payment Recorded & Verified'
                  : 'Paiement enregistré & confirmé'}
              </span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              {isEn
                ? 'This official PDF invoice certifies your payment receipt for online courses and physical test scheduling.'
                : 'Cette facture officielle PDF certifie votre paiement et vous donne accès à vos cours et épreuves physiques.'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-lg cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isEn ? 'Print' : 'Imprimer'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdfReceipt}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{isEn ? 'Download PDF Invoice' : 'Télécharger Facture (PDF)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
