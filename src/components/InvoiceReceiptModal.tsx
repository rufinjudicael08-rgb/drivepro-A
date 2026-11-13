import React from 'react';
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
  const txRef = payment?.transactionRef || registration.latestPaymentId || 'TTS-ENREGISTRE';
  const verifCode = payment?.verificationCode || `DP-${registration.queueNumber}`;
  const isVerifiedByAdmin = registration.paymentStatus === 'verified';

  const handleDownloadHtmlReceipt = () => {
    const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<title>Facture & Reçu ${invoiceNo} — Driv' Academy</title>
<style>
  body { font-family: Arial, sans-serif; background:#f8fafc; color:#0f172a; padding:32px; }
  .box { max-width:720px; margin:0 auto; background:#fff; border:1px solid #cbd5e1; border-radius:12px; padding:32px; }
  h1 { margin:0 0 6px; font-size:22px; }
  .muted { color:#475569; font-size:13px; }
  .row { display:flex; justify-content:space-between; border-bottom:1px solid #e2e8f0; padding:10px 0; font-size:14px; }
  .stamp { display:inline-block; margin-top:18px; padding:8px 14px; border:2px solid #047857; color:#047857; font-weight:700; border-radius:6px; font-size:12px; }
</style>
</head>
<body>
  <div class="box">
    <h1>Driv' Academy — Facture & Reçu Officiel</h1>
    <div class="muted">${PARIS_HQ_CONTACT.addressFr} · Agrément ${PARIS_HQ_CONTACT.accreditation} · Ouvert 24h/24 · 5j/7</div>
    <hr style="margin:20px 0;border:none;border-top:1px solid #e2e8f0;" />
    <div class="row"><span>Numéro de Facture</span><strong>${invoiceNo}</strong></div>
    <div class="row"><span>Candidat</span><strong>${registration.fullName}</strong></div>
    <div class="row"><span>E-mail / Téléphone</span><strong>${registration.email} · ${registration.phone}</strong></div>
    <div class="row"><span>Catégorie de Permis</span><strong>Permis ${registration.licenseCategory}</strong></div>
    <div class="row"><span>Dossier File d'Attente</span><strong>#${registration.queueNumber}</strong></div>
    <div class="row"><span>Mode de Paiement</span><strong>TapTap Send</strong></div>
    <div class="row"><span>ID Transaction TapTap Send</span><strong>${txRef}</strong></div>
    <div class="row"><span>Code Déclencheur Reçu</span><strong>${verifCode}</strong></div>
    <div class="row"><span>Montant Payé</span><strong>${formattedFee} (${registration.baseFeeEur} EUR)</strong></div>
    <div class="stamp">${isVerifiedByAdmin ? 'PAIEMENT CONFIRMÉ & VALIDÉ PAR DIRECTION' : 'REÇU TAPTAP SEND ENREGISTRÉ — FACTURE ÉMISE'}</div>
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Facture_Recu_${invoiceNo}_DrivAcademy.html`;
    a.click();
    URL.revokeObjectURL(url);
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
              <span className="font-semibold text-blue-700">TapTap Send</span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">
                {isEn ? 'TapTap Send Transaction ID' : 'ID Transaction TapTap Send'}
              </span>
              <span className="font-mono font-semibold text-slate-900">{txRef}</span>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <span className="text-slate-600">
                {isEn ? 'Receipt Verification Code' : 'Code Déclencheur Reçu'}
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
                  ? 'Receipt Recorded & Verified'
                  : 'Reçu enregistré & confirmé'}
              </span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-950">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              {isEn
                ? 'This official invoice certifies your registration fee receipt for online courses and physical test scheduling.'
                : 'Cette facture officielle certifie l’enregistrement de votre paiement TapTap Send et vous donne accès à vos cours et épreuves physiques.'}
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
              onClick={handleDownloadHtmlReceipt}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isEn ? 'Download Invoice' : 'Télécharger Facture & Reçu'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
