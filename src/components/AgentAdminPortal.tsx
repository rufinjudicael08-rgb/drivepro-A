import React, { useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  Ban,
  Check,
  CheckCircle2,
  Copy,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Link2,
  Lock,
  Mail,
  Megaphone,
  Receipt,
  Search,
  Share2,
  ShieldAlert,
  UserCheck,
  Wifi,
  X,
} from 'lucide-react';
import { CERTIFIED_INSTRUCTORS } from '../data/curriculum';
import {
  formatLocalCurrency,
  getCountryByCode,
  WORLD_COUNTRIES,
} from '../data/countries';
import { getTranslations } from '../data/i18n';
import {
  ADMIN_EMAIL,
  db,
  FIREBASE_AUTH_PROVIDERS_URL,
  FIREBASE_AUTH_TEMPLATES_URL,
  FIREBASE_DATABASE_ID,
  FIREBASE_PROJECT_ID,
  FIRESTORE_CONSOLE_URL,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  ContactMessageRecord,
  Language,
  PaymentLogRecord,
  RegistrationRecord,
  SocialLinkRecord,
  SocialPlatform,
} from '../types';
import {
  exportPaymentsCsv,
  exportPaymentsExcel,
  exportRegistrationsCsv,
  exportRegistrationsExcel,
} from '../utils/exportData';

interface AgentAdminPortalProps {
  lang: Language;
  user: User | null;
  registrations: RegistrationRecord[];
  payments: PaymentLogRecord[];
  socialLinks: SocialLinkRecord[];
  contactMessages: ContactMessageRecord[];
  onSignIn: () => Promise<void>;
  onSimulateTrackedVisit: (trackingCode: string, platform: SocialPlatform) => void;
}

export const AgentAdminPortal: React.FC<AgentAdminPortalProps> = ({
  lang,
  user,
  registrations,
  payments,
  socialLinks,
  contactMessages,
  onSignIn,
  onSimulateTrackedVisit,
}) => {
  const t = getTranslations(lang);
  const isEn = lang === 'en';
  const isAdmin =
    user !== null && user.emailVerified && user.email === ADMIN_EMAIL;

  // Agent Social Link Generator state
  const [platform, setPlatform] = useState<SocialPlatform>('TikTok');
  const [campaignName, setCampaignName] = useState('DrivePro Academy — Permis en moins de 48h');
  const [targetCountry, setTargetCountry] = useState('FR');
  const [creatingLink, setCreatingLink] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAdId, setCopiedAdId] = useState<string | null>(null);

  // Admin Console filters, ID & Payment Proof preview modals
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [previewIdReg, setPreviewIdReg] = useState<RegistrationRecord | null>(null);
  const [previewReceiptPayment, setPreviewReceiptPayment] =
    useState<PaymentLogRecord | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const appOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://drivepro.academy';
  const currentHostname =
    typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  const handleCopyHostname = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const handleCreateTrackedLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) {
      await onSignIn();
      return;
    }

    setCreatingLink(true);
    const cleanSlug = platform.toUpperCase().slice(0, 3);
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const trackingCode = `${cleanSlug}_${targetCountry}_${randomSuffix}`;
    const linkId = `link_${Date.now()}_${randomSuffix}`;

    try {
      await setDoc(doc(db, 'social_links', linkId), {
        id: linkId,
        agentId: user.uid,
        agentName: (user.displayName || user.email || 'DrivePro Creator').slice(0, 80),
        platform,
        campaignName: campaignName.trim().slice(0, 100) || `${platform} Bio Link`,
        trackingCode,
        targetCountry,
        clicks: 0,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `social_links/${linkId}`);
    } finally {
      setCreatingLink(false);
    }
  };

  const handleCopyUrl = (link: SocialLinkRecord) => {
    const url = `${appOrigin}/?ref=${link.trackingCode}&src=${link.platform.toLowerCase()}&country=${link.targetCountry}`;
    navigator.clipboard.writeText(url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestClick = async (link: SocialLinkRecord) => {
    try {
      await updateDoc(doc(db, 'social_links', link.id), {
        clicks: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `social_links/${link.id}`);
    }
    onSimulateTrackedVisit(link.trackingCode, link.platform);
  };

  const handleConfirmMoneyReceived = async (reg: RegistrationRecord) => {
    if (!isAdmin) return;
    const triggeredEur = reg.baseFeeEur;
    const confirmationCode = `DPA-${triggeredEur}EUR-${reg.queueNumber}`;
    try {
      await updateDoc(doc(db, 'registrations', reg.id), {
        paymentStatus: 'verified',
        dossierStatus: 'code_unlocked',
        triggeredAmountEur: triggeredEur,
        confirmationCode,
        updatedAt: serverTimestamp(),
      });
      if (reg.latestPaymentId) {
        await updateDoc(doc(db, 'payments', reg.latestPaymentId), {
          verificationCode: confirmationCode,
          status: 'completed',
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `registrations/${reg.id}`);
    }
  };

  const handleRejectFakePayment = async (reg: RegistrationRecord) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'registrations', reg.id), {
        paymentStatus: 'pending',
        dossierStatus: 'locked',
        triggeredAmountEur: 0,
        confirmationCode: '',
        updatedAt: serverTimestamp(),
      });
      if (reg.latestPaymentId) {
        await updateDoc(doc(db, 'payments', reg.latestPaymentId), {
          status: 'refunded',
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `registrations/${reg.id}`);
    }
  };

  const handleAssignInstructor = async (
    reg: RegistrationRecord,
    instructorId: string
  ) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'registrations', reg.id), {
        assignedInstructorId: instructorId,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `registrations/${reg.id}`);
    }
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((r) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.countryName.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        (r.address || '').toLowerCase().includes(q) ||
        (r.idCardNumber || '').toLowerCase().includes(q) ||
        String(r.queueNumber).includes(q);

      const matchesPlatform =
        platformFilter === 'ALL' ||
        (r.referralPlatform || 'Direct').toLowerCase() ===
          platformFilter.toLowerCase();

      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'queue'
          ? r.paymentStatus === 'pending' && r.dossierStatus === 'queue'
          : r.paymentStatus === statusFilter;

      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [registrations, searchQuery, platformFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = registrations.length;
    const awaitingTrigger = registrations.filter(
      (r) => r.paymentStatus === 'pending' && r.dossierStatus === 'queue'
    ).length;
    const totalTriggeredEur = registrations.reduce(
      (sum, r) =>
        sum +
        (r.triggeredAmountEur ||
          (r.paymentStatus === 'verified' || r.paymentStatus === 'paid'
            ? r.baseFeeEur
            : 0)),
      0
    );
    const socialLeads = registrations.filter(
      (r) => r.referralPlatform && r.referralPlatform !== 'Direct'
    ).length;
    return { total, awaitingTrigger, totalTriggeredEur, socialLeads };
  }, [registrations]);

  if (!isAdmin) {
    return (
      <section className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-8 md:p-12 text-center space-y-5 shadow-lg">
        <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
          <Lock className="w-6 h-6" />
        </div>
        <div className="max-w-lg mx-auto space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEn
              ? 'Creator-Only Management Console'
              : 'Espace Direction strictement réservé au créateur du site'}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {isEn
              ? 'This dashboard (social bio links, client ID verification, and CSV/Excel exports) is hidden from public visitors and candidates. Access is strictly restricted to the authorized administrator account.'
              : 'Ce panneau (liens traqués pour bios TikTok/Instagram/Facebook, vérification des pièces d’identité et exports) est invisible pour les clients. L’accès est strictement réservé au compte Direction habilité.'}
          </p>
        </div>
        {!user && (
          <button
            type="button"
            onClick={onSignIn}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            <span>{t.navSignIn}</span>
          </button>
        )}
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section 0: Firebase Database & Email/Password Auth Diagnostics (Creator Only) */}
      <section className="bg-slate-900 text-white rounded-xl p-6 md:p-7 border border-slate-800 shadow-lg space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="text-xs font-mono text-blue-400 font-semibold">
              Diagnostic Firebase & Vercel · Réservé au créateur
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Accès direct à vos données Firebase &{' '}
              <span className="text-emerald-400">Comptes E-mail / Mot de passe</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={FIRESTORE_CONSOLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap"
            >
              <Database className="w-4 h-4" />
              <span>Ouvrir mes données Firestore</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={FIREBASE_AUTH_PROVIDERS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap"
            >
              <Globe className="w-4 h-4" />
              <span>Fournisseur E-mail / Mot de passe</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={FIREBASE_AUTH_TEMPLATES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg whitespace-nowrap"
            >
              <Mail className="w-4 h-4" />
              <span>Modèle E-mail « DrivePro Academy »</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-blue-300">
              1. Base de données Firebase ({FIREBASE_DATABASE_ID})
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vos comptes (<span className="font-mono text-white">users</span>), inscriptions, paiements, messages contact, liens TikTok/Instagram/Facebook/LinkedIn et QCM sont enregistrés dans la base{' '}
              <span className="font-mono text-white font-semibold">{FIREBASE_DATABASE_ID}</span> (Projet{' '}
              <span className="font-mono text-white">{FIREBASE_PROJECT_ID}</span>).
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2">
            <div className="text-xs font-semibold text-amber-300">
              2. Nom d’expéditeur « DrivePro Academy » (Mot de passe oublié) :
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cliquez sur <span className="font-semibold text-white">Modèle E-mail « DrivePro Academy »</span> ci-dessus →{' '}
              <span className="font-semibold text-white">Réinitialisation du mot de passe</span> → icône crayon → mettez{' '}
              <span className="font-mono text-amber-300">Nom de l’expéditeur : DrivePro Academy</span> et{' '}
              <span className="font-mono text-emerald-300">Adresse de réponse : Messagerie Direction</span> → Enregistrer.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5">
              <span className="font-mono text-[11px] text-white truncate">
                Domaine actif : {currentHostname}
              </span>
              <button
                type="button"
                onClick={handleCopyHostname}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-white rounded cursor-pointer shrink-0"
              >
                {copiedDomain ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Creator Social Bio Link Automation */}
      <section className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-blue-700 font-semibold">
              {isEn
                ? 'Private Direction Workspace · DrivePro Academy'
                : 'Espace Direction Privé · DrivePro Academy'}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {t.agentModuleTitle}
            </h2>
            <p className="text-[15px] text-slate-700 mt-1">
              {isEn
                ? 'Generate tracked links for your TikTok, Facebook, and Instagram bios to capture enrollments without exposing this management console to clients.'
                : 'Générez vos liens traqués pour vos bios TikTok, Facebook et Instagram afin de capter des candidats. Vos clients ne voient jamais cet onglet.'}
            </p>
          </div>
        </div>

        {/* Operational Social Automation Playbooks — Branded DrivePro Academy */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              platform: 'TikTok · DrivePro Academy',
              titleFr: '01. Bio TikTok & Auto-DM',
              titleEn: '01. TikTok Bio & Auto-DM',
              descFr:
                'Placez ?src=tiktok en bio sur votre compte « DrivePro Academy » ou en réponse automatique aux commentaires « PERMIS ».',
              descEn:
                'Place ?src=tiktok in your DrivePro Academy TikTok bio or automated comment replies.',
            },
            {
              platform: 'Facebook · DrivePro Academy',
              titleFr: '02. Page Facebook & Ads',
              titleEn: '02. Facebook Lead Ads',
              descFr:
                'Reliez vos publications et campagnes automatiques Facebook « DrivePro Academy » directement au télépaiement.',
              descEn:
                'Route DrivePro Academy Facebook Posts & Lead Ads straight to your official checkout URL.',
            },
            {
              platform: 'Instagram · DrivePro Academy',
              titleFr: '03. Bio Instagram & Reels',
              titleEn: '03. Instagram Bio & Reels',
              descFr:
                'Ajoutez le lien traqué en bio et en sticker Story sur « DrivePro Academy » pour capter vos candidats.',
              descEn:
                'Add the tracked URL in your DrivePro Academy Instagram bio and Story stickers.',
            },
            {
              platform: 'LinkedIn · DrivePro Academy',
              titleFr: '04. Page LinkedIn Pro',
              titleEn: '04. LinkedIn Pro Page',
              descFr:
                'Ciblez les professionnels et conducteurs (Permis B & C) via votre page « DrivePro Academy » avec inscription directe.',
              descEn:
                'Capture professionals seeking Permit B & C directly from your DrivePro Academy LinkedIn page.',
            },
          ].map((card) => (
            <div
              key={card.platform}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2"
            >
              <div className="text-xs font-mono font-bold text-blue-700">
                {card.platform}
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {isEn ? card.titleEn : card.titleFr}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isEn ? card.descEn : card.descFr}
              </p>
            </div>
          ))}
        </div>

        {/* Interactive Link Generator Form */}
        <form
          onSubmit={handleCreateTrackedLink}
          className="grid md:grid-cols-4 gap-4 items-end pt-2"
        >
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              {isEn ? 'Social Platform' : 'Réseau social'}
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              <option value="TikTok">TikTok (DrivePro Academy)</option>
              <option value="Facebook">Facebook (DrivePro Academy)</option>
              <option value="Instagram">Instagram (DrivePro Academy)</option>
              <option value="LinkedIn">LinkedIn (DrivePro Academy)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              {isEn ? 'Campaign / Bio Name' : 'Nom de la campagne / Bio'}
            </label>
            <input
              type="text"
              required
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              {isEn ? 'Target Country' : 'Pays ciblé'}
            </label>
            <select
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              {WORLD_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {isEn ? c.nameEn : c.nameFr} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={creatingLink}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Link2 className="w-4 h-4" />
            <span>
              {creatingLink
                ? '...'
                : isEn
                ? 'Generate Bio Link'
                : 'Créer lien bio traqué'}
            </span>
          </button>
        </form>

        {/* Tracked Links Table */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="py-3 px-4 font-semibold">
                  {isEn ? 'Platform' : 'Plateforme'}
                </th>
                <th className="py-3 px-4 font-semibold">
                  {isEn ? 'Campaign & Code' : 'Campagne & Code'}
                </th>
                <th className="py-3 px-4 font-semibold text-right">
                  {isEn ? 'Clicks' : 'Clics'}
                </th>
                <th className="py-3 px-4 font-semibold text-right">
                  {isEn ? 'Conversions' : 'Inscriptions'}
                </th>
                <th className="py-3 px-4 font-semibold text-right">
                  {isEn ? 'Actions' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {socialLinks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-slate-500 text-sm">
                    {isEn
                      ? 'No tracked bio links yet. Create your first URL above.'
                      : 'Aucun lien bio généré pour le moment. Créez votre premier lien ci-dessus.'}
                  </td>
                </tr>
              ) : (
                socialLinks.map((link) => {
                  const conversions = registrations.filter(
                    (r) => r.referralCode === link.trackingCode
                  ).length;
                  return (
                    <tr key={link.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {link.platform}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {link.campaignName}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          ?ref={link.trackingCode} · {link.targetCountry}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                        {link.clicks}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">
                        {conversions}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(link)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-md hover:bg-slate-100 cursor-pointer"
                          >
                            {copiedId === link.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-600" />
                            )}
                            <span>
                              {copiedId === link.id
                                ? isEn
                                  ? 'Copied'
                                  : 'Copié'
                                : isEn
                                ? 'Copy URL'
                                : 'Copier URL'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTestClick(link)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>
                              {isEn ? 'Test Visit' : 'Tester lien'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>

          {/* Automated Social Media Ads Kit (Facebook, Instagram, LinkedIn, TikTok) */}
          <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Pack Publicités Automatisées · DrivePro Academy (Facebook, Instagram, LinkedIn, TikTok)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Copiez vos annonces prêtes à l’emploi et lancez vos campagnes automatiques avec votre lien traqué.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://business.facebook.com/adsmanager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg whitespace-nowrap"
                >
                  Meta Ads (FB / IG)
                </a>
                <a
                  href="https://www.linkedin.com/campaignmanager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg whitespace-nowrap"
                >
                  LinkedIn Ads
                </a>
                <a
                  href="https://ads.tiktok.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg whitespace-nowrap"
                >
                  TikTok Ads
                </a>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {[
                {
                  id: 'fb_ig',
                  network: 'Facebook & Instagram Ads · DrivePro Academy',
                  text: `🚗 Votre permis international en moins de 48h avec DrivePro Academy !\n✅ Auto-école internationale agréée (UE · France · USA)\n✅ Télépaiement officiel + Facture PDF\n✅ Cours audio multilingues\n👉 Inscrivez-vous maintenant : ${appOrigin}/?src=facebook&ref=FB_AUTO`,
                },
                {
                  id: 'tiktok_li',
                  network: 'TikTok & LinkedIn Ads · DrivePro Academy',
                  text: `🔥 Permis A (300€) · Permis B (450€) · Permis C (650€) en moins de 48h !\nDrivePro Academy accompagne votre dossier complet, votre code audio et vos épreuves physiques.\n👉 Lien officiel : ${appOrigin}/?src=tiktok&ref=TT_AUTO`,
                },
              ].map((ad) => (
                <div
                  key={ad.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="text-xs font-mono font-bold text-amber-300">
                      {ad.network}
                    </div>
                    <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                      {ad.text}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(ad.text);
                        setCopiedAdId(ad.id);
                        setTimeout(() => setCopiedAdId(null), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      {copiedAdId === ad.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Annonce copiée</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier le texte publicitaire</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </section>

      {/* Section 2: Real-Time Admin Console, ID Cards & CSV/Excel Exports */}
      <section className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {t.adminModuleTitle}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {isEn
                ? 'Live Firestore stream of candidate dossiers (addresses, legal ID documents, verified senders) and CSV/Excel exports.'
                : 'Flux temps réel des dossiers complets (adresses, pièces d’identité, paiements vérifiés) et exports CSV / Excel.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => exportRegistrationsCsv(filteredRegistrations)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportAppsCsv}</span>
            </button>
            <button
              type="button"
              onClick={() => exportRegistrationsExcel(filteredRegistrations)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportAppsExcel}</span>
            </button>
            <button
              type="button"
              onClick={() => exportPaymentsCsv(payments)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportPaymentsCsv}</span>
            </button>
            <button
              type="button"
              onClick={() => exportPaymentsExcel(payments)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportPaymentsExcel}</span>
            </button>
          </div>
        </div>

        {/* Live KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: isEn ? 'Total Applications' : 'Total dossiers',
              value: stats.total,
            },
            {
              label: isEn ? 'Proofs to Trigger' : 'Preuves à déclencher',
              value: stats.awaitingTrigger,
            },
            {
              label: isEn ? 'Triggered Amount (€)' : 'Montant déclenché (€)',
              value: `${stats.totalTriggeredEur} €`,
            },
            {
              label: isEn ? 'Social Attributed' : 'Leads Réseaux',
              value: stats.socialLeads,
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70"
            >
              <div className="text-xs text-slate-500">{kpi.label}</div>
              <div className="text-2xl font-mono font-semibold text-slate-900 mt-1 tabular-nums">
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isEn
                  ? 'Filter by name, ID number, address, country, email or #...'
                  : 'Filtrer par nom, N° pièce CNI, adresse, pays ou #file...'
              }
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">
                {isEn ? 'All Sources' : 'Toutes sources'}
              </option>
              <option value="TikTok">TikTok</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Direct">Direct</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">
                {isEn ? 'All Statuses' : 'Tous statuts'}
              </option>
              <option value="queue">
                {isEn ? 'Proof Received (Trigger Pending)' : 'Preuve reçue (À déclencher)'}
              </option>
              <option value="pending">
                {isEn ? 'Pending' : 'En attente'}
              </option>
              <option value="verified">
                {isEn ? 'Funds Triggered' : 'Montant déclenché'}
              </option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="py-3 px-4 font-semibold">
                  {isEn ? 'Queue #' : 'File #'}
                </th>
                <th className="py-3 px-4 font-semibold">
                  {isEn ? 'Candidate & Address' : 'Candidat & Adresse'}
                </th>
                <th className="py-3 px-4 font-semibold">
                  {isEn ? 'Legal ID & Wi-Fi' : 'Pièce d’identité & Wi-Fi'}
                </th>
                <th className="py-3 px-4 font-semibold">
                  {isEn ? 'Country & Cat.' : 'Pays & Catégorie'}
                </th>
                <th className="py-3 px-4 font-semibold text-right">
                  {isEn ? 'Fee' : 'Montant'}
                </th>
                <th className="py-3 px-4 font-semibold">
                  {isEn ? 'Source' : 'Source'}
                </th>
                <th className="py-3 px-4 font-semibold">
                  {isEn ? 'Status' : 'Statut'}
                </th>
                <th className="py-3 px-4 font-semibold">
                  {isEn ? 'Instructor' : 'Examinateur'}
                </th>
                <th className="py-3 px-4 font-semibold text-right">
                  {isEn ? 'Action' : 'Action'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-8 px-4 text-center text-slate-500 text-sm"
                  >
                    {isEn
                      ? 'No registrations match the active filters.'
                      : 'Aucune inscription ne correspond à vos filtres.'}
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => {
                  const c = getCountryByCode(reg.countryCode);
                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 tabular-nums">
                        #{reg.queueNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {reg.fullName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {reg.email} · {reg.phone}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {reg.address || '—'} ({reg.city})
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="font-medium text-slate-900">
                          {reg.idCardType || 'CNI'} ·{' '}
                          <span className="font-mono">
                            {reg.idCardNumber || '—'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                            <Wifi className="w-3 h-3 text-emerald-600" />
                            {reg.wifiReady ? 'Wi-Fi OK' : 'Non confirmé'}
                          </span>
                          {reg.idCardThumbnail ? (
                            <button
                              type="button"
                              onClick={() => setPreviewIdReg(reg)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{isEn ? 'View ID' : 'Voir CNI'}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                              {reg.idCardFileName || '—'}
                            </span>
                          )}
                          {(() => {
                            const linkedPay = payments.find(
                              (p) =>
                                p.id === reg.latestPaymentId ||
                                p.registrationId === reg.id
                            );
                            if (!linkedPay) return null;
                            return (
                              <button
                                type="button"
                                onClick={() => setPreviewReceiptPayment(linkedPay)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100 cursor-pointer"
                              >
                                <Receipt className="w-3 h-3" />
                                <span>{isEn ? 'Payment Proof' : 'Voir Paiement'}</span>
                              </button>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        <div className="font-medium">{reg.countryName}</div>
                        <div className="text-slate-500">
                          {isEn ? 'Permit' : 'Permis'} {reg.licenseCategory}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900">
                        <div className="font-bold text-slate-900">{reg.baseFeeEur} €</div>
                        <div className="text-xs text-slate-600">
                          {formatLocalCurrency(reg.convertedAmount, c, lang)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Share2 className="w-3 h-3 text-slate-400" />
                          {reg.referralPlatform || 'Direct'}
                        </span>
                        {reg.referralCode && (
                          <div className="font-mono text-[11px] text-slate-400">
                            {reg.referralCode}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold">
                        {reg.paymentStatus === 'verified' ? (
                          <div className="space-y-0.5">
                            <span className="text-emerald-700 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {isEn
                                ? `Triggered: ${reg.triggeredAmountEur || reg.baseFeeEur} €`
                                : `Déclenché : ${reg.triggeredAmountEur || reg.baseFeeEur} €`}
                            </span>
                            {reg.confirmationCode && (
                              <div className="font-mono text-[10px] text-slate-600">
                                {reg.confirmationCode}
                              </div>
                            )}
                          </div>
                        ) : reg.paymentStatus === 'paid' ? (
                          <span className="text-blue-700">
                            {isEn ? 'Paid' : 'Payé'}
                          </span>
                        ) : reg.dossierStatus === 'queue' ? (
                          <span className="text-amber-700 font-bold">
                            {isEn ? 'Proof submitted (Trigger pending)' : 'Preuve transmise (À déclencher)'}
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            {isEn ? 'Pending' : 'En attente'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={reg.assignedInstructorId}
                          onChange={(e) =>
                            handleAssignInstructor(reg, e.target.value)
                          }
                          className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white"
                        >
                          {CERTIFIED_INSTRUCTORS.map((inst) => (
                            <option key={inst.id} value={inst.id}>
                              {inst.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          {reg.paymentStatus !== 'verified' ? (
                            <button
                              type="button"
                              onClick={() => handleConfirmMoneyReceived(reg)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>
                                {isEn
                                  ? `Funds Received — Trigger ${reg.baseFeeEur} €`
                                  : `Argent reçu — Déclencher ${reg.baseFeeEur} €`}
                              </span>
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-700 font-mono font-bold">
                              {reg.triggeredAmountEur || reg.baseFeeEur} € OK
                            </span>
                          )}
                          {(reg.paymentStatus !== 'pending' ||
                            reg.dossierStatus === 'queue') && (
                            <button
                              type="button"
                              onClick={() => handleRejectFakePayment(reg)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer"
                              title={
                                isEn
                                  ? 'Reject fake receipt & relock'
                                  : 'Rejeter (faux reçu) & reverrouiller'
                              }
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>{isEn ? 'Reject' : 'Rejeter'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Payment Logs Preview (Sender Name, Transaction ID & Trigger Code) */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-semibold text-slate-900">
            {isEn
              ? `Recent Payment Proofs & Trigger Logs (${payments.length})`
              : `Journal des preuves de paiement & montants déclenchés (${payments.length})`}
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Ref. Transaction</th>
                  <th className="py-2.5 px-4 font-semibold">Code Déclencheur</th>
                  <th className="py-2.5 px-4 font-semibold">
                    {isEn ? 'Candidate' : 'Candidat'}
                  </th>
                  <th className="py-2.5 px-4 font-semibold">
                    {isEn ? 'Sender Details' : 'Expéditeur paiement'}
                  </th>
                  <th className="py-2.5 px-4 font-semibold">
                    {isEn ? 'Verification' : 'Justificatif'}
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-right">
                    {isEn ? 'Amount' : 'Montant'}
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-right">
                    Base EUR
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-6 px-4 text-center text-slate-500"
                    >
                      {isEn
                        ? 'No payment transactions logged yet.'
                        : 'Aucun paiement enregistré pour l’instant.'}
                    </td>
                  </tr>
                ) : (
                  payments.slice(0, 12).map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-4 font-mono text-slate-800">
                        <div>{p.transactionRef}</div>
                        {p.status === 'refunded' && (
                          <span className="text-[10px] font-bold text-red-700">
                            REJETÉ / BLOQUÉ
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-blue-700">
                        {p.verificationCode || '—'}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {p.candidateName} ({p.countryCode})
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">
                        <div>{p.senderName || '—'}</div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {p.senderPhone || '—'}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <button
                          type="button"
                          onClick={() => setPreviewReceiptPayment(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded hover:bg-emerald-100 cursor-pointer"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>{isEn ? 'Details' : 'Détails'}</span>
                        </button>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {p.amountPaid} {p.currency}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-500">
                        {p.baseAmountEur} €
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 3: Client Contact & Questions Inbox (Creator Only) */}
      <section className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl p-6 md:p-8 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-700" />
              <span>
                {isEn
                  ? `Visitor Questions & Contact Messages (${contactMessages.length})`
                  : `Questions & Messages Clients reçus (${contactMessages.length})`}
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {isEn
                ? 'Every inquiry submitted from Contact is stored in Firebase and routed to the Direction team.'
                : 'Chaque question envoyée via Contact est enregistrée dans Firebase et transmise à l’équipe Direction.'}
            </p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2.5 px-4 font-semibold">
                  {isEn ? 'Sender' : 'Expéditeur'}
                </th>
                <th className="py-2.5 px-4 font-semibold">
                  {isEn ? 'Subject & Question' : 'Sujet & Question'}
                </th>
                <th className="py-2.5 px-4 font-semibold">
                  {isEn ? 'Status' : 'Statut'}
                </th>
                <th className="py-2.5 px-4 font-semibold text-right">
                  {isEn ? 'Reply' : 'Répondre'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contactMessages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 px-4 text-center text-slate-500">
                    {isEn
                      ? 'No contact questions received yet.'
                      : 'Aucune question reçue pour le moment.'}
                  </td>
                </tr>
              ) : (
                contactMessages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 align-top">
                      <div className="font-semibold text-slate-900">
                        {msg.fullName}
                      </div>
                      <div className="text-slate-600">{msg.email}</div>
                      {msg.phone && (
                        <div className="font-mono text-[11px] text-slate-500">
                          {msg.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 align-top max-w-md">
                      <div className="font-semibold text-blue-800">
                        {msg.subject}
                      </div>
                      <p className="text-slate-700 mt-1 whitespace-pre-line leading-relaxed">
                        {msg.message}
                      </p>
                    </td>
                    <td className="py-3 px-4 align-top font-mono text-slate-600">
                      {msg.status === 'replied'
                        ? isEn
                          ? 'Replied'
                          : 'Répondu'
                        : isEn
                        ? 'New'
                        : 'Nouveau'}
                    </td>
                    <td className="py-3 px-4 align-top text-right">
                      <a
                        href={`mailto:${msg.email}?subject=${encodeURIComponent(
                          `Re: ${msg.subject} — DrivePro Academy`
                        )}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-md whitespace-nowrap"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Reply' : 'Répondre'}</span>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Inline Legal ID Document Thumbnail Modal */}
      {previewIdReg && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {previewIdReg.fullName} — {previewIdReg.idCardType}
                </h3>
                <p className="text-xs font-mono text-slate-600 mt-0.5">
                  N° {previewIdReg.idCardNumber} · {previewIdReg.idCardFileName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewIdReg(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {previewIdReg.idCardThumbnail ? (
              <img
                src={previewIdReg.idCardThumbnail}
                alt={`Pièce d’identité ${previewIdReg.fullName}`}
                referrerPolicy="no-referrer"
                className="w-full max-h-80 object-contain rounded-lg border border-slate-200 bg-slate-50"
              />
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                <ShieldAlert className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                {isEn
                  ? 'Document file verified without image thumbnail.'
                  : 'Document enregistré sans aperçu miniature.'}
              </div>
            )}

            <div className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 space-y-1">
              <div>
                <span className="font-semibold text-slate-800">
                  {isEn ? 'Address: ' : 'Adresse : '}
                </span>
                {previewIdReg.address}, {previewIdReg.city} ({previewIdReg.countryName})
              </div>
              <div>
                <span className="font-semibold text-slate-800">
                  {isEn ? 'Phone / Email: ' : 'Téléphone / Email : '}
                </span>
                {previewIdReg.phone} · {previewIdReg.email}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verified Payment Details Modal */}
      {previewReceiptPayment && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {isEn ? 'Verified Payment Audit' : 'Justificatif Paiement Vérifié'}
                </h3>
                <p className="text-xs font-mono text-slate-600 mt-0.5">
                  {previewReceiptPayment.transactionRef} · Code{' '}
                  {previewReceiptPayment.verificationCode || '—'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReceiptPayment(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {previewReceiptPayment.receiptThumbnail ? (
              previewReceiptPayment.receiptThumbnail.startsWith(
                'data:application/pdf'
              ) ? (
                <div className="space-y-3">
                  <iframe
                    src={previewReceiptPayment.receiptThumbnail}
                    className="w-full h-72 rounded-lg border border-slate-200 bg-slate-50"
                    title="Reçu PDF"
                  />
                  <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 truncate">
                      <FileText className="w-4 h-4 text-blue-700 shrink-0" />
                      <span className="truncate">
                        {previewReceiptPayment.receiptFileName || 'recu_paiement.pdf'}
                      </span>
                    </span>
                    <a
                      href={previewReceiptPayment.receiptThumbnail}
                      download={
                        previewReceiptPayment.receiptFileName || 'recu_paiement.pdf'
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-md whitespace-nowrap shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Download PDF' : 'Télécharger PDF'}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <img
                    src={previewReceiptPayment.receiptThumbnail}
                    alt={`Justificatif paiement ${previewReceiptPayment.candidateName}`}
                    referrerPolicy="no-referrer"
                    className="w-full max-h-80 object-contain rounded-lg border border-slate-200 bg-slate-50"
                  />
                  <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <span className="text-xs font-medium text-slate-700 truncate">
                      {previewReceiptPayment.receiptFileName || 'recu_paiement.jpg'}
                    </span>
                    <a
                      href={previewReceiptPayment.receiptThumbnail}
                      download={
                        previewReceiptPayment.receiptFileName || 'recu_paiement.jpg'
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-md whitespace-nowrap shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Download' : 'Télécharger'}</span>
                    </a>
                  </div>
                </div>
              )
            ) : (
              <div className="p-5 text-center text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg font-medium space-y-1">
                <Receipt className="w-5 h-5 mx-auto text-emerald-700" />
                <div>
                  {isEn
                    ? 'Submitted with transaction ID — awaiting receipt attachment.'
                    : 'Preuve enregistrée avec référence de transaction.'}
                </div>
              </div>
            )}

            <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 space-y-1">
              <div>
                <span className="font-semibold text-slate-900">
                  {isEn ? 'Candidate: ' : 'Candidat : '}
                </span>
                {previewReceiptPayment.candidateName} ({previewReceiptPayment.baseAmountEur} €)
              </div>
              <div>
                <span className="font-semibold text-slate-900">
                  {isEn ? 'Sender: ' : 'Expéditeur : '}
                </span>
                {previewReceiptPayment.senderName} · {previewReceiptPayment.senderPhone}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
