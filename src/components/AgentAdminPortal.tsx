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
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Link2,
  Search,
  Share2,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { CERTIFIED_INSTRUCTORS } from '../data/curriculum';
import {
  formatLocalCurrency,
  getCountryByCode,
  WORLD_COUNTRIES,
} from '../data/countries';
import { getTranslations } from '../data/i18n';
import { ADMIN_EMAIL, db, handleFirestoreError, OperationType } from '../firebase';
import {
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
  onSignIn: () => Promise<void>;
  onSimulateTrackedVisit: (trackingCode: string, platform: SocialPlatform) => void;
}

export const AgentAdminPortal: React.FC<AgentAdminPortalProps> = ({
  lang,
  user,
  registrations,
  payments,
  socialLinks,
  onSignIn,
  onSimulateTrackedVisit,
}) => {
  const t = getTranslations(lang);
  const isAdmin =
    user !== null && user.emailVerified && user.email === ADMIN_EMAIL;

  // Agent Social Link Generator state
  const [platform, setPlatform] = useState<SocialPlatform>('TikTok');
  const [campaignName, setCampaignName] = useState('Permis Express Paris & Bénin');
  const [targetCountry, setTargetCountry] = useState('BJ');
  const [creatingLink, setCreatingLink] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Admin Console filters
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const appOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://drivepro.academy';

  const handleCreateTrackedLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
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
        agentName: (user.displayName || user.email || 'DrivePro Agent').slice(0, 80),
        platform,
        campaignName: campaignName.trim().slice(0, 100) || `${platform} Lead Flow`,
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

  const handleVerifyCandidate = async (reg: RegistrationRecord) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'registrations', reg.id), {
        paymentStatus: 'verified',
        dossierStatus: 'practical_ready',
        updatedAt: serverTimestamp(),
      });
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
        String(r.queueNumber).includes(q);

      const matchesPlatform =
        platformFilter === 'ALL' ||
        (r.referralPlatform || 'Direct').toLowerCase() ===
          platformFilter.toLowerCase();

      const matchesStatus =
        statusFilter === 'ALL' || r.paymentStatus === statusFilter;

      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [registrations, searchQuery, platformFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = registrations.length;
    const paidOrVerified = registrations.filter(
      (r) => r.paymentStatus === 'paid' || r.paymentStatus === 'verified'
    ).length;
    const verifiedPractical = registrations.filter(
      (r) => r.dossierStatus === 'practical_ready'
    ).length;
    const socialLeads = registrations.filter(
      (r) => r.referralPlatform && r.referralPlatform !== 'Direct'
    ).length;
    return { total, paidOrVerified, verifiedPractical, socialLeads };
  }, [registrations]);

  return (
    <div className="space-y-8">
      {/* Section 1: Agent Social Automation Module */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {t.agentModuleTitle}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {lang === 'fr'
                ? 'Générez des liens traqués pour TikTok, Facebook et Instagram afin de capter des candidats internationaux et d’attribuer automatiquement chaque inscription.'
                : 'Generate tracked attribution URLs for TikTok, Facebook, and Instagram to capture international candidates and automatically attribute enrollments.'}
            </p>
          </div>
          {!user && (
            <button
              type="button"
              onClick={onSignIn}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.navSignIn}
            </button>
          )}
        </div>

        {/* Operational Social Automation Playbooks */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              platform: 'TikTok',
              titleFr: '01. Bio TikTok & Auto-DM',
              titleEn: '01. TikTok Bio & Auto-DM',
              descFr:
                'Placez votre lien traqué ?src=tiktok en lien de bio ou réponse automatique aux commentaires « PERMIS ». Le pays cible pré-configure la devise et le paiement Mobile Money/Carte.',
              descEn:
                'Place your ?src=tiktok tracked URL in profile bio or comment auto-replies. Target country auto-configures local currency and payment rails.',
            },
            {
              platform: 'Facebook',
              titleFr: '02. Facebook Lead Ads & Messenger',
              titleEn: '02. Facebook Lead Ads & Messenger',
              descFr:
                'Redirigez vos campagnes Facebook Ads ou messages automatiques Messenger vers votre lien traqué pour verrouiller les dossiers avec paiement SEPA / MoMo.',
              descEn:
                'Route Facebook Ads and Messenger automated flows directly to your tracked enrollment URL to lock dossiers via SEPA or Mobile Money.',
            },
            {
              platform: 'Instagram',
              titleFr: '03. Stories Instagram & Trigger DM',
              titleEn: '03. Instagram Stories & DM Trigger',
              descFr:
                'Ajoutez le sticker Lien en Story ou connectez un mot-clé DM (« CODE ») envoyant instantanément le tunnel d’inscription traqué DrivePro.',
              descEn:
                'Attach the Story Link sticker or DM keyword automation sending candidates straight into your attributed DrivePro funnel.',
            },
          ].map((card) => (
            <div
              key={card.platform}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
            >
              <div className="text-xs font-mono font-semibold text-blue-700">
                {card.platform}
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {lang === 'fr' ? card.titleFr : card.titleEn}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === 'fr' ? card.descFr : card.descEn}
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
              {lang === 'fr' ? 'Réseau social' : 'Social Platform'}
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              <option value="TikTok">TikTok</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              {lang === 'fr' ? 'Nom de la campagne' : 'Campaign Name'}
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
              {lang === 'fr' ? 'Pays ciblé' : 'Target Country'}
            </label>
            <select
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              {WORLD_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {lang === 'fr' ? c.nameFr : c.nameEn} ({c.code})
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
                : lang === 'fr'
                ? 'Créer lien traqué'
                : 'Generate Tracked Link'}
            </span>
          </button>
        </form>

        {/* Tracked Links Table */}
        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="py-3 px-4 font-semibold">
                  {lang === 'fr' ? 'Plateforme' : 'Platform'}
                </th>
                <th className="py-3 px-4 font-semibold">
                  {lang === 'fr' ? 'Campagne & Code' : 'Campaign & Code'}
                </th>
                <th className="py-3 px-4 font-semibold text-right">
                  {lang === 'fr' ? 'Clics' : 'Clicks'}
                </th>
                <th className="py-3 px-4 font-semibold text-right">
                  {lang === 'fr' ? 'Inscriptions' : 'Conversions'}
                </th>
                <th className="py-3 px-4 font-semibold text-right">
                  {lang === 'fr' ? 'Actions' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {socialLinks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-slate-500 text-sm">
                    {user
                      ? lang === 'fr'
                        ? 'Aucun lien traqué généré pour le moment. Créez votre premier lien ci-dessus.'
                        : 'No tracked links yet. Create your first social tracking URL above.'
                      : lang === 'fr'
                      ? 'Connectez-vous avec Google pour créer et enregistrer vos liens traqués agent.'
                      : 'Sign in with Google to generate and persist agent tracking links.'}
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
                                ? lang === 'fr'
                                  ? 'Copié'
                                  : 'Copied'
                                : lang === 'fr'
                                ? 'Copier URL'
                                : 'Copy URL'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTestClick(link)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>
                              {lang === 'fr' ? 'Simuler clic' : 'Test Visit'}
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
      </section>

      {/* Section 2: Real-Time Admin Console & CSV/Excel Exports */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {t.adminModuleTitle}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {lang === 'fr'
                ? 'Flux temps réel Firestore des dossiers candidats, validations de paiement et exports comptables CSV / Excel.'
                : 'Live Firestore stream of student applications, payment verifications, and CSV / Excel exports.'}
            </p>
          </div>

          {isAdmin && (
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
          )}
        </div>

        {!isAdmin ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900">
                  {lang === 'fr'
                    ? 'Accès administrateur protégé'
                    : 'Protected Administrator Console'}
                </div>
                <p className="text-xs text-slate-600 max-w-2xl">
                  {lang === 'fr'
                    ? `Pour consulter l’ensemble des dossiers candidats en temps réel et exporter les journaux CSV/Excel, connectez-vous avec le compte administrateur autorisé (${ADMIN_EMAIL}).`
                    : `To inspect all live candidate applications and export CSV/Excel payment logs, sign in with the authorized administrator account (${ADMIN_EMAIL}).`}
                </p>
              </div>
            </div>
            {!user && (
              <button
                type="button"
                onClick={onSignIn}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                {t.navSignIn}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Live KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: lang === 'fr' ? 'Total dossiers' : 'Total Applications',
                  value: stats.total,
                },
                {
                  label: lang === 'fr' ? 'Paiements validés' : 'Paid / Unlocked',
                  value: stats.paidOrVerified,
                },
                {
                  label: lang === 'fr' ? 'Prêts Pratique' : 'Practical Ready',
                  value: stats.verifiedPractical,
                },
                {
                  label: lang === 'fr' ? 'Leads Réseaux' : 'Social Attributed',
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
                    lang === 'fr'
                      ? 'Filtrer par nom, pays, ville, email ou #file...'
                      : 'Filter by name, country, city, email or queue #...'
                  }
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ALL">
                    {lang === 'fr' ? 'Toutes sources' : 'All Sources'}
                  </option>
                  <option value="TikTok">TikTok</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Direct">Direct</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white"
                >
                  <option value="ALL">
                    {lang === 'fr' ? 'Tous statuts' : 'All Statuses'}
                  </option>
                  <option value="pending">
                    {lang === 'fr' ? 'En attente' : 'Pending'}
                  </option>
                  <option value="paid">{lang === 'fr' ? 'Payé' : 'Paid'}</option>
                  <option value="verified">
                    {lang === 'fr' ? 'Vérifié' : 'Verified'}
                  </option>
                </select>
              </div>
            </div>

            {/* Applications Table */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                  <tr>
                    <th className="py-3 px-4 font-semibold">
                      {lang === 'fr' ? 'File #' : 'Queue #'}
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      {lang === 'fr' ? 'Candidat' : 'Candidate'}
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      {lang === 'fr' ? 'Pays & Catégorie' : 'Country & Cat.'}
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">
                      {lang === 'fr' ? 'Montant' : 'Fee'}
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      {lang === 'fr' ? 'Source' : 'Source'}
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      {lang === 'fr' ? 'Statut' : 'Status'}
                    </th>
                    <th className="py-3 px-4 font-semibold">
                      {lang === 'fr' ? 'Moniteur' : 'Instructor'}
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">
                      {lang === 'fr' ? 'Action' : 'Action'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 px-4 text-center text-slate-500 text-sm"
                      >
                        {lang === 'fr'
                          ? 'Aucune inscription ne correspond à vos filtres.'
                          : 'No registrations match the active filters.'}
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
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-700">
                            <div className="font-medium">{reg.countryName}</div>
                            <div className="text-slate-500">
                              {reg.city} · Cat. {reg.licenseCategory}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900">
                            {formatLocalCurrency(reg.convertedAmount, c, lang)}
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
                              <span className="text-emerald-700 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {lang === 'fr' ? 'Vérifié' : 'Verified'}
                              </span>
                            ) : reg.paymentStatus === 'paid' ? (
                              <span className="text-blue-700">
                                {lang === 'fr' ? 'Payé' : 'Paid'}
                              </span>
                            ) : (
                              <span className="text-amber-700">
                                {lang === 'fr' ? 'En attente' : 'Pending'}
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
                            {reg.paymentStatus !== 'verified' ? (
                              <button
                                type="button"
                                onClick={() => handleVerifyCandidate(reg)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md whitespace-nowrap cursor-pointer"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>
                                  {lang === 'fr' ? 'Valider Pratique' : 'Verify Ready'}
                                </span>
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 font-mono">
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Payment Logs Preview */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-semibold text-slate-900">
                {lang === 'fr'
                  ? `Journal des paiements récents (${payments.length})`
                  : `Recent Payment Audit Logs (${payments.length})`}
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Ref. Transaction</th>
                      <th className="py-2.5 px-4 font-semibold">
                        {lang === 'fr' ? 'Candidat' : 'Candidate'}
                      </th>
                      <th className="py-2.5 px-4 font-semibold">
                        {lang === 'fr' ? 'Méthode' : 'Method'}
                      </th>
                      <th className="py-2.5 px-4 font-semibold text-right">
                        {lang === 'fr' ? 'Montant' : 'Amount'}
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
                          colSpan={5}
                          className="py-6 px-4 text-center text-slate-500"
                        >
                          {lang === 'fr'
                            ? 'Aucun paiement enregistré pour l’instant.'
                            : 'No payment transactions logged yet.'}
                        </td>
                      </tr>
                    ) : (
                      payments.slice(0, 10).map((p) => (
                        <tr key={p.id}>
                          <td className="py-2.5 px-4 font-mono text-slate-800">
                            {p.transactionRef}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-900">
                            {p.candidateName} ({p.countryCode})
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">{p.method}</td>
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
          </>
        )}
      </section>
    </div>
  );
};
