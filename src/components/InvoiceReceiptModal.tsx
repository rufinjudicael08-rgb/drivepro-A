import React from 'react';
import { jsPDF } from 'jspdf';
import { CheckCircle2, Download, Printer, ShieldCheck, X } from 'lucide-react';
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

  const isFr = lang === 'fr';
  const isRo = lang === 'ro';
  const pick = (fr: string, ro: string, en: string) =>
    isFr ? fr : isRo ? ro : en;

  const triggeredEur = registration.triggeredAmountEur || registration.baseFeeEur;
  const invoiceNo = `FAC-${registration.queueNumber}-${registration.licenseCategory}`;
  const txRef = payment?.transactionRef || registration.latestPaymentId || 'TP-ENREGISTRE';
  const verifCode =
    registration.confirmationCode ||
    payment?.verificationCode ||
    `DPA-${triggeredEur}EUR-${registration.queueNumber}`;
  const isVerifiedByAdmin = registration.paymentStatus === 'verified';

  const handleDownloadPdfReceipt = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 34, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('DrivePro Academy', 16, 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(191, 219, 254);
    doc.text(
      pick(
        'FACTURE OFFICIELLE & RECU DE PAIEMENT',
        'FACTURA OFICIALA & CHITANTA DE PLATA',
        'OFFICIAL INVOICE & PAYMENT RECEIPT'
      ),
      16,
      24
    );
    doc.text(`N° ${invoiceNo}`, 194, 16, { align: 'right' });
    doc.text(new Date().toLocaleDateString('fr-FR'), 194, 24, { align: 'right' });

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9.5);
    doc.text(
      `DrivePro Academy International  |  ${PARIS_HQ_CONTACT.accreditation}  |  ${registration.countryName}`,
      16,
      44
    );

    doc.setDrawColor(226, 232, 240);
    doc.line(16, 49, 194, 49);

    const rows: [string, string][] = [
      [pick('Numéro de Facture', 'Numar Factura', 'Invoice Number'), invoiceNo],
      [pick('Candidat', 'Candidat', 'Candidate'), registration.fullName],
      [pick('Adresse e-mail', 'Adresa e-mail', 'Email'), registration.email],
      [pick('Pays du Dossier', 'Tara Dosarului', 'Country'), registration.countryName],
      [
        pick('Catégorie de Permis', 'Categorie Permis', 'Permit Category'),
        `${pick('Permis', 'Permis', 'Permit')} ${registration.licenseCategory} (#${registration.queueNumber})`,
      ],
      [pick('Mode de Règlement', 'Metoda de Plata', 'Payment Mode'), 'Télépaiement Officiel'],
      [pick('Référence Preuve', 'Referinta Tranzactie', 'Transaction Reference'), txRef],
      [pick('Code Confirmation', 'Cod Confirmare', 'Confirmation Code'), verifCode],
      [pick('Montant Validé', 'Suma Confirmata', 'Confirmed Amount'), `${triggeredEur} EUR`],
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
    doc.setFontSize(10.5);
    doc.text(
      isVerifiedByAdmin
        ? pick(
            `PAIEMENT VALIDE (${triggeredEur} EUR) — COURS & EXAMENS DEBLOQUES`,
            `PLATA CONFIRMATA (${triggeredEur} EUR) — CURSURI & EXAMENE DEBLOCATE`,
            `PAYMENT CONFIRMED (${triggeredEur} EUR) — COURSES & EXAMS UNLOCKED`
          )
        : pick(
            'JUSTIFICATIF ENREGISTRE — FACTURE OFFICIELLE EMISE',
            'DOVADA INREGISTRATA — FACTURA OFICIALA EMISA',
            'PROOF RECORDED — OFFICIAL RECEIPT ISSUED'
          ),
      105,
      y + 10.5,
      { align: 'center' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'DrivePro Academy International · Document officiel généré automatiquement.',
      105,
      282,
      { align: 'center' }
    );

    doc.save(`Facture_${invoiceNo}_DriveProAcademy.pdf`);
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
                {pick('FACTURE & REÇU OFFICIEL', 'FACTURĂ & CHITANȚĂ OFICIALĂ', 'OFFICIAL INVOICE & RECEIPT')}
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                {invoiceNo}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                DrivePro Academy · {PARIS_HQ_CONTACT.accreditation} · {registration.countryName}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">
                {pick('Montant', 'Sumă', 'Amount')}
              </div>
              <div className="text-2xl font-mono font-bold text-emerald-700 tabular-nums">
                {triggeredEur} €
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">{pick('Candidat', 'Candidat', 'Candidate')}</span>
              <span className="font-semibold text-slate-900">{registration.fullName}</span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">{pick('Catégorie de permis', 'Categorie permis', 'Permit')}</span>
              <span className="font-semibold text-slate-900">
                {pick('Permis', 'Permis', 'Permit')} {registration.licenseCategory} (#{registration.queueNumber})
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">{pick('Paiement', 'Plată', 'Payment Method')}</span>
              <span className="font-semibold text-blue-700">
                {pick('Télépaiement Officiel', 'Plată Oficială', 'Official E-Payment')}
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">
                {pick('Référence transaction', 'Referință tranzacție', 'Transaction ID')}
              </span>
              <span className="font-mono font-semibold text-slate-900">{txRef}</span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">
                {pick('Code validation', 'Cod validare', 'Confirmation Code')}
              </span>
              <span className="font-mono font-bold text-slate-900">{verifCode}</span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">{pick('Statut', 'Status', 'Status')}</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                {isVerifiedByAdmin
                  ? pick('Confirmé par la Direction', 'Confirmat de Direcție', 'Confirmed by Direction')
                  : pick('Enregistré', 'Înregistrat', 'Recorded')}
              </span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-2.5 text-sm text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              {pick(
                'Cette facture officielle PDF certifie votre paiement et ouvre l’accès à vos cours et au lien des épreuves physiques.',
                'Această factură oficială PDF certifică plata și deschide accesul la cursuri și la linkul pentru proba fizică.',
                'This official PDF invoice certifies your payment and unlocks online courses and physical test scheduling.'
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-semibold rounded-lg cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{pick('Imprimer', 'Tipărește', 'Print')}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdfReceipt}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-lg cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{pick('Télécharger Facture (PDF)', 'Descarcă Factura (PDF)', 'Download PDF Invoice')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
