import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Database,
  FileJson,
  Hash,
  Loader2,
  MessageCircle,
  Phone,
  RefreshCw,
  Repeat2,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  CircleDot,
  ArrowRight,
  Globe,
  Mail,
  MapPin,
  Briefcase,
  CreditCard,
  Calendar,
  Fingerprint,
  Shield,
  Activity,
  Zap,
  ExternalLink,
  Copy,
  ChevronRight,
  Clock,
  AlertCircle,
  TrendingUp,
  Wallet,
  Home,
  Heart,
  Users,
  FileText,
  Eye,
  Lock,
  Cpu,
  Radio,
} from 'lucide-react';
import { isBankError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useProcessDetail,
  useProcessRetry,
  useProcessRerun,
  useProcessStatus,
  useProcessesAdmin,
  useBridgeBlacklistQuery,
  useBridgeCreateMicoopeIndividual,
  useBridgeComplementaryDataCreate,
  useBridgeCreateStandardAccount,
  useBridgeUpdateOnboarding,
  useBridgeUpdateComplementaryData,
  useBridgeQueryComplementClient,
} from '@/hooks/use-carla-data';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatPhone, formatRelative, mapStatusDisplay, normalizeAccountForUi, shortId } from '@/lib/utils';
import type { Account } from '@/types/account';

const confirmDanger = (message: string) => window.confirm(message || '¿Continuar?');

type FilterStatus = '' | 'ready_for_bank' | 'bank_processing' | 'bank_retry' | 'bank_rejected';

// Banking Flow Types
type BankStepStatus = 'locked' | 'pending' | 'in_progress' | 'completed' | 'error';

type BankStep = {
  key: string;
  stepNumber: number;
  label: string;
  desc: string;
  requires: string | null;
  requiresLabel: string | null;
  status: BankStepStatus;
  canExecute: boolean;
  finishedAt?: string | null;
  response?: unknown;
  icon: typeof Shield;
};

// Status maps for computing step states
const STEP_STATUS_MAP: Record<string, { completed: string[]; in_progress: string[]; error: string[]; pending: string[] }> = {
  blacklist: {
    completed: ['bank_blacklist_approved', 'bank_client_created', 'bank_account_created', 'bank_complementary_completed', 'bank_onboarding_updated', 'bank_complementary_updated', 'account_created'],
    in_progress: ['bank_blacklist_in_progress'],
    error: ['bank_blacklist_error', 'bank_blacklist_rejected'],
    pending: ['ready_for_bank', 'didit_verified']
  },
  client: {
    completed: ['bank_client_created', 'bank_account_created', 'bank_complementary_completed', 'bank_onboarding_updated', 'bank_complementary_updated', 'account_created'],
    in_progress: ['bank_client_creation_in_progress', 'bank_client_lookup_in_progress'],
    error: ['bank_client_creation_error'],
    pending: ['bank_blacklist_approved']
  },
  account: {
    completed: ['bank_account_created', 'bank_complementary_completed', 'bank_onboarding_updated', 'bank_complementary_updated', 'account_created'],
    in_progress: ['bank_account_creation_in_progress'],
    error: ['bank_account_creation_error'],
    pending: ['bank_client_created']
  },
  complementary: {
    completed: ['bank_complementary_completed', 'bank_onboarding_updated', 'bank_complementary_updated', 'account_created'],
    in_progress: ['bank_complementary_in_progress'],
    error: ['bank_complementary_error'],
    pending: ['bank_account_created']
  },
  onboarding_update: {
    completed: ['bank_onboarding_updated', 'bank_complementary_updated', 'account_created'],
    in_progress: ['bank_onboarding_update_in_progress'],
    error: ['bank_onboarding_update_error'],
    pending: ['bank_complementary_completed']
  },
  complementary_update: {
    completed: ['bank_complementary_updated', 'account_created'],
    in_progress: ['bank_complementary_update_in_progress'],
    error: ['bank_complementary_update_error'],
    pending: ['bank_onboarding_updated']
  },
  complement_query: {
    completed: ['account_created'],
    in_progress: ['bank_complement_query_in_progress'],
    error: ['bank_complement_query_error'],
    pending: ['bank_complementary_updated']
  }
};

const getStepStatus = (currentStatus: string, stepKey: string): BankStepStatus => {
  const stepMap = STEP_STATUS_MAP[stepKey];
  if (!stepMap) return 'locked';
  if (stepMap.completed.includes(currentStatus)) return 'completed';
  if (stepMap.in_progress.includes(currentStatus)) return 'in_progress';
  if (stepMap.error.includes(currentStatus)) return 'error';
  if (stepMap.pending.includes(currentStatus)) return 'pending';
  return 'locked';
};

const computeBankingSteps = (account: Account, currentStatus: string): BankStep[] => {
  const clientId = account.bank_partner_client_id;
  const status = currentStatus.toLowerCase();
  
  const stepConfigs = [
    { key: 'blacklist', stepNumber: 1, label: 'Blacklist Check', desc: 'Verificar listas negras', requires: null, requiresLabel: null, icon: Shield, finishedAt: account.bank_blacklist_finished_at, response: account.bank_blacklist_response },
    { key: 'client', stepNumber: 2, label: 'Crear Cliente', desc: 'Onboarding bancario', requires: 'blacklist', requiresLabel: 'Blacklist Check', icon: User, finishedAt: account.bank_client_finished_at, response: account.bank_client_response },
    { key: 'account', stepNumber: 3, label: 'Crear Cuenta', desc: 'Apertura de cuenta bancaria', requires: 'client', requiresLabel: 'Crear Cliente', icon: CreditCard, finishedAt: account.bank_account_finished_at, response: account.bank_account_response },
    { key: 'complementary', stepNumber: 4, label: 'Datos Complementarios', desc: 'Información adicional del cliente', requires: 'account', requiresLabel: 'Crear Cuenta', icon: FileText, finishedAt: account.bank_complementary_finished_at, response: account.bank_complementary_response },
    { key: 'onboarding_update', stepNumber: 5, label: 'Actualizar Onboarding', desc: 'Actualizar datos de onboarding', requires: 'complementary', requiresLabel: 'Datos Complementarios', icon: RefreshCw, finishedAt: account.bank_onboarding_finished_at, response: account.bank_onboarding_response },
    { key: 'complementary_update', stepNumber: 6, label: 'Actualizar Complemento', desc: 'Actualizar datos complementarios', requires: 'onboarding_update', requiresLabel: 'Actualizar Onboarding', icon: Database, finishedAt: account.bank_complementary_update_finished_at, response: account.bank_complementary_update_response },
    { key: 'complement_query', stepNumber: 7, label: 'Consulta Final', desc: 'Verificación final del registro', requires: 'complementary_update', requiresLabel: 'Actualizar Complemento', icon: CheckCircle2, finishedAt: account.bank_complement_query_finished_at, response: account.bank_complement_query_response },
  ];

  return stepConfigs.map((config) => {
    const stepStatus = getStepStatus(status, config.key);
    
    // Determine if step can be executed
    let canExecute = false;
    if (stepStatus === 'pending') {
      canExecute = true;
    } else if (stepStatus === 'error') {
      // Allow retry on error
      canExecute = config.key === 'blacklist' || !!clientId;
    }
    
    // For steps requiring client_id, ensure it exists
    if (config.requires && config.requires !== 'blacklist' && !clientId && stepStatus !== 'completed') {
      canExecute = false;
    }

    return {
      ...config,
      status: stepStatus,
      canExecute,
    };
  });
};

const STATUS_FILTERS: { value: FilterStatus; label: string; icon: React.ReactNode }[] = [
  { value: '', label: 'Todos', icon: <CircleDot size={12} /> },
  { value: 'ready_for_bank', label: 'Listo', icon: <CheckCircle2 size={12} /> },
  { value: 'bank_processing', label: 'En proceso', icon: <Loader2 size={12} /> },
  { value: 'bank_retry', label: 'Retry', icon: <Repeat2 size={12} /> },
  { value: 'bank_rejected', label: 'Rechazado', icon: <AlertTriangle size={12} /> },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  ok: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
  warn: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  error: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' },
  info: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', dot: 'bg-sky-500' },
};

const getInitials = (name: string) => {
  if (!name || name.startsWith('#') || name.startsWith('+')) return '?';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-blue-600',
];

const getAvatarColor = (id: string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export function ProcesosPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<FilterStatus>('');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [bankError, setBankError] = useState<{ key: string; step: string; code: string; message: string; correlationId: string } | null>(null);
  const auditOperator = 'operador.demo@carla';

  const COOLDOWN_KEY = 'carla_banking_cooldowns';
  const COOLDOWN_DURATION = 10;
  const [cooldowns, setCooldowns] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem(COOLDOWN_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    localStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldowns));
  }, [cooldowns]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCooldown = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, []);

  const getCooldownRemaining = useCallback((key: string) => {
    const lastTrigger = cooldowns[key];
    if (!lastTrigger) return 0;
    const elapsed = Math.floor((now - lastTrigger) / 1000);
    return Math.max(0, COOLDOWN_DURATION - elapsed);
  }, [cooldowns, now]);

  const triggerCooldown = useCallback((key: string) => {
    setCooldowns((prev) => ({ ...prev, [key]: Date.now() }));
  }, []);

  const filters = useMemo(() => ({ q: search, status, limit: 30 }), [search, status]);
  const listQuery = useProcessesAdmin(filters);
  const detailQuery = useProcessDetail(selectedId);

  useEffect(() => {
    if (!selectedId) return;
    const interval = setInterval(() => detailQuery.refetch(), 60000);
    return () => clearInterval(interval);
  }, [selectedId, detailQuery]);

  const statusMutation = useProcessStatus(selectedId);
  const retryMutation = useProcessRetry(selectedId);
  const rerunMutation = useProcessRerun(selectedId);
  const bridgeBlacklist = useBridgeBlacklistQuery(selectedId);
  const bridgeCreateIndividual = useBridgeCreateMicoopeIndividual(selectedId);
  const bridgeComplementaryCreate = useBridgeComplementaryDataCreate(selectedId);
  const bridgeCreateAccount = useBridgeCreateStandardAccount(selectedId);
  const bridgeUpdateOnboarding = useBridgeUpdateOnboarding(selectedId);
  const bridgeUpdateComplementary = useBridgeUpdateComplementaryData(selectedId);
  const bridgeQueryComplement = useBridgeQueryComplementClient(selectedId);

  const processes = listQuery.data || [];

  const kpis = useMemo(() => {
    const total = processes.length;
    const active = processes.filter((p) => (p.status || '').toLowerCase().includes('ready') || (p.banking_status || '').includes('processing') || (p.status || '').includes('created')).length;
    const errors = processes.filter((p) => /error|reject|fail/.test((p.status || p.banking_status || p.last_error || '').toLowerCase())).length;
    const retry = processes.filter((p) => /retry/.test((p.status || p.banking_status || '').toLowerCase())).length;
    return { total, active, errors, retry };
  }, [processes]);

  const onActionError = (message: string, error?: unknown, key?: string) => {
    if (isBankError(error)) {
      setBankError({
        key: key || 'unknown',
        step: error.step,
        code: error.detail.error_code,
        message: error.detail.error_message,
        correlationId: error.correlationId,
      });
      return;
    }
    const errMsg = error instanceof Error ? error.message : 'Intente de nuevo.';
    if (key) {
      setBankError({ key, step: 'request', code: 'ERROR', message: errMsg, correlationId: '' });
    } else {
      toast({ variant: 'destructive', title: message, description: errMsg });
    }
  };

  const cards = useMemo(() => processes.map((p) => {
    const account = (p as { account?: Account })?.account;
    const rootPhone = (p as { whatsapp_phone_e164?: string | null }).whatsapp_phone_e164 ?? undefined;
    const phoneVal = rootPhone || (p.phone ?? undefined);
    const normalized = normalizeAccountForUi(account, { id: p.id, phone: phoneVal, name: p.name ?? undefined });
    const statusDisplay = mapStatusDisplay(p.status ?? p.banking_status ?? undefined);
    const verificationDisplay = mapStatusDisplay(p.verification_status ?? undefined);
    const bankingDisplay = mapStatusDisplay(p.banking_status ?? undefined);
    
    // Get document info
    const docType = account?.document_type || '';
    const docNumber = account?.document_number || '';
    const product = account?.product_type || p.product_type || '';
    
    // Build display name - NEVER use phone as title (avoid duplicated data)
    const realName = normalized.fullName || p.name || account?.full_name;
    const title = realName || (docNumber ? `${docType || 'Doc'} ${docNumber}` : `#${shortId(p.id)}`);
    
    return {
      id: p.id,
      title,
      statusDisplay,
      phoneFormatted: formatPhone(normalized.mainPhone || phoneVal),
      hasPhone: Boolean(normalized.mainPhone || phoneVal),
      docType,
      docNumber,
      product,
      attempts: p.attempts ?? 0,
      events: p.events_count ?? 0,
      lastError: p.last_error,
      updated: p.updated_at ?? p.last_error_at ?? p.created_at ?? undefined,
      verificationDisplay,
      bankingDisplay,
      correlationId: p.correlation_id,
    };
  }), [processes]);


  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-xl text-foreground">Procesos</h1>
            <p className="text-xs text-muted-foreground">
              {listQuery.isLoading ? 'Cargando...' : `${processes.length} conversaciones activas`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => listQuery.refetch()} disabled={listQuery.isFetching}>
            <RefreshCw size={16} className={listQuery.isFetching ? 'animate-spin' : ''} />
          </Button>
        </div>
      </header>

      {/* Stats Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { label: 'Activos', value: kpis.active, color: 'emerald' },
          { label: 'Errores', value: kpis.errors, color: 'red' },
          { label: 'Retry', value: kpis.retry, color: 'amber' },
          { label: 'Total', value: kpis.total, color: 'slate' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
              stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
              stat.color === 'red' ? 'bg-red-500/10 text-red-500' :
              stat.color === 'amber' ? 'bg-amber-500/10 text-amber-500' :
              'bg-muted/50 text-foreground'
            }`}
          >
            <span className="font-bold text-lg tabular-nums">{stat.value}</span>
            <span className="text-xs opacity-80">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            placeholder="Buscar conversación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-muted/30 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-emerald-500/50"
            id="process-search"
            name="process-search"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl w-fit">
        {STATUS_FILTERS.map((item) => {
          const isActive = status === item.value;
          return (
            <button
              key={item.value || 'all'}
              onClick={() => setStatus(item.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <span className={isActive ? 'text-emerald-500' : ''}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Conversation List - WhatsApp Style */}
      <div className="rounded-2xl bg-card/50 border border-border/30 overflow-hidden divide-y divide-border/20">
        {listQuery.isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))
          : cards.map((card) => {
              const colors = STATUS_COLORS[card.statusDisplay.tone] || STATUS_COLORS.info;
              return (
                <article
                  key={card.id}
                  className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                  onClick={() => setSelectedId(card.id)}
                >
                  {/* Avatar */}
                  <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(card.id)} flex items-center justify-center text-white font-semibold text-sm shadow-lg`}>
                    {getInitials(card.title)}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${colors.dot} border-2 border-card`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Top row: Name + Time */}
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h4 className="font-semibold text-sm text-foreground truncate">{card.title}</h4>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        {card.updated ? formatRelative(card.updated) : ''}
                      </span>
                    </div>

                    {/* Phone number - clean display */}
                    {card.hasPhone && (
                      <p className="text-sm text-muted-foreground font-mono mb-1">{card.phoneFormatted}</p>
                    )}

                    {/* Bottom row: Status + Product */}
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${colors.bg} ${colors.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        {card.statusDisplay.label}
                      </span>
                      {card.product && (
                        <span className="text-[11px] text-muted-foreground truncate">{card.product}</span>
                      )}
                      {card.lastError && (
                        <AlertTriangle size={12} className="text-red-500 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <ArrowRight size={16} className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
                </article>
              );
            })}
        {listQuery.isError && (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <p className="font-semibold text-foreground mb-1">Error de conexión</p>
            <p className="text-sm text-muted-foreground mb-4">No se pudieron cargar las conversaciones</p>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => listQuery.refetch()}>
              <RefreshCw size={14} className="mr-2" />
              Reintentar
            </Button>
          </div>
        )}
        {!listQuery.isLoading && !processes.length && !listQuery.isError && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={28} className="text-muted-foreground/50" />
            </div>
            <p className="font-semibold text-foreground mb-1">Sin conversaciones</p>
            <p className="text-sm text-muted-foreground">No hay procesos que coincidan con tu búsqueda</p>
          </div>
        )}
      </div>

      {/* Detail Sheet - Premium Design */}
      <Sheet open={Boolean(selectedId)} onOpenChange={(open) => { setSelectedId(open ? selectedId : undefined); if (!open) setBankError(null); }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl p-0 bg-gradient-to-b from-background via-background to-muted/20 border-l border-border/30">
          {detailQuery.isLoading ? (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="w-20 h-20 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : detailQuery.isError ? (
            <div className="p-6">
              <div className="rounded-2xl bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 p-8 text-center backdrop-blur-sm">
                <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} className="text-red-400" />
                </div>
                <p className="font-semibold text-lg text-foreground mb-1">Error al cargar</p>
                <p className="text-sm text-muted-foreground mb-4">No se pudo obtener la información del proceso</p>
                <code className="text-xs font-mono text-red-400/70 bg-red-500/10 px-3 py-1 rounded-lg">{selectedId}</code>
              </div>
              <Button variant="outline" size="lg" className="mt-6 w-full rounded-xl h-12" onClick={() => detailQuery.refetch()}>
                <RefreshCw size={16} className={`mr-2 ${detailQuery.isFetching ? 'animate-spin' : ''}`} />
                Reintentar
              </Button>
            </div>
          ) : detailQuery.data ? (
            (() => {
              const account = (detailQuery.data?.account || {}) as Account;
              const normalized = normalizeAccountForUi(account, { id: detailQuery.data.id, phone: detailQuery.data.phone ?? undefined, name: detailQuery.data.name ?? undefined });
              const fullName = normalized.fullName || normalized.displayName || '—';
              const mainPhone = formatPhone(normalized.mainPhone);
              const email = normalized.email || '—';
              const complianceSource = normalized.complianceSource;
              const risk = normalized.riskFlags.risk;
              const valueOrDash = (v?: string | number | null) => (v === undefined || v === null || v === '' ? '—' : v);
              
              const statusDisplay = mapStatusDisplay(detailQuery.data.status ?? detailQuery.data.banking_status ?? undefined);
              const statusColors = STATUS_COLORS[statusDisplay.tone] || STATUS_COLORS.info;
              
              const bankClientId = account.external_customer_id || account.bank_partner_client_id || account.external_account_id || account.id;
              const phoneForBank = normalized.mainPhone || account.phone_main || undefined;

              // Calculate stats
              const verificationsDone = [account.didit_status, account.renap_status, account.phone_verification_status].filter(s => /approved|verified|ok|success/.test((s || '').toLowerCase())).length;
              const bankStepsDone = [account.bank_blacklist_finished_at, account.bank_client_finished_at, account.bank_account_finished_at, account.bank_complementary_finished_at].filter(Boolean).length;

              const copyToClipboard = (text: string, label: string) => {
                navigator.clipboard.writeText(text);
                toast({ title: 'Copiado', description: label });
              };

              return (
                <div className="flex flex-col min-h-full">
                  {/* Hero Header with Gradient */}
                  <div className="relative overflow-hidden">
                    {/* Background gradient based on status */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      statusDisplay.tone === 'ok' ? 'from-emerald-500/20 via-emerald-500/5' :
                      statusDisplay.tone === 'error' ? 'from-red-500/20 via-red-500/5' :
                      statusDisplay.tone === 'warn' ? 'from-amber-500/20 via-amber-500/5' :
                      'from-sky-500/20 via-sky-500/5'
                    } to-transparent`} />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
                    
                    <div className="relative p-6 pb-8">
                      {/* Top bar with ID and actions */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => copyToClipboard(detailQuery.data?.id || '', 'ID copiado')}
                            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/50 backdrop-blur-sm border border-border/30 hover:border-accent/50 transition-all"
                          >
                            <Hash size={12} className="text-muted-foreground" />
                            <code className="text-[11px] font-mono text-muted-foreground group-hover:text-foreground transition-colors">{shortId(detailQuery.data?.id || '')}</code>
                            <Copy size={10} className="text-muted-foreground/50 group-hover:text-accent transition-colors" />
                          </button>
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot} animate-pulse`} />
                            {statusDisplay.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-background/50" onClick={() => detailQuery.refetch()} disabled={detailQuery.isFetching}>
                            <RefreshCw size={14} className={detailQuery.isFetching ? 'animate-spin' : ''} />
                          </Button>
                        </div>
                      </div>

                      {/* Main identity */}
                      <div className="flex items-start gap-4">
                        {/* Large Avatar */}
                        <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${getAvatarColor(detailQuery.data?.id || '')} flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-black/20 ring-4 ring-background/50`}>
                          {getInitials(fullName)}
                          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg ${statusColors.dot} border-4 border-background flex items-center justify-center`}>
                            {statusDisplay.tone === 'ok' ? <CheckCircle2 size={12} className="text-white" /> :
                             statusDisplay.tone === 'error' ? <AlertCircle size={10} className="text-white" /> :
                             <Clock size={10} className="text-white" />}
                          </div>
                        </div>

                        {/* Identity info */}
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-bold text-foreground truncate mb-1">{fullName}</h2>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                            {mainPhone !== '—' && (
                              <button onClick={() => copyToClipboard(normalized.mainPhone || '', 'Teléfono copiado')} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group">
                                <Phone size={13} className="text-accent/70" />
                                <span className="font-mono">{mainPhone}</span>
                                <Copy size={10} className="opacity-0 group-hover:opacity-100 text-accent transition-opacity" />
                              </button>
                            )}
                            {email !== '—' && (
                              <button onClick={() => copyToClipboard(email, 'Email copiado')} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group">
                                <Mail size={13} className="text-accent/70" />
                                <span className="truncate max-w-[180px]">{email}</span>
                                <Copy size={10} className="opacity-0 group-hover:opacity-100 text-accent transition-opacity" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/50 backdrop-blur-sm text-[11px] text-muted-foreground">
                              <Fingerprint size={11} />
                              {account.document_type || 'DPI'} {account.document_number || '—'}
                            </span>
                            {account.product_type && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/50 backdrop-blur-sm text-[11px] text-muted-foreground">
                                <CreditCard size={11} />
                                {account.product_type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="px-6 -mt-4">
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { icon: ShieldCheck, label: 'Verificaciones', value: `${verificationsDone}/3`, color: verificationsDone === 3 ? 'emerald' : 'amber', gradient: 'from-emerald-500/20 to-teal-500/10' },
                        { icon: Building2, label: 'Banco', value: `${bankStepsDone}/4`, color: bankStepsDone === 4 ? 'emerald' : 'sky', gradient: 'from-sky-500/20 to-blue-500/10' },
                        { icon: Shield, label: 'Compliance', value: risk ? 'Alerta' : 'OK', color: risk ? 'red' : 'emerald', gradient: risk ? 'from-red-500/20 to-orange-500/10' : 'from-emerald-500/20 to-green-500/10' },
                        { icon: Activity, label: 'Intentos', value: String(account.integration_attempts || 0), color: 'violet', gradient: 'from-violet-500/20 to-purple-500/10' },
                      ].map((stat) => (
                        <div key={stat.label} className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.gradient} border border-border/30 p-3 hover:border-${stat.color}-500/30 transition-all cursor-default`}>
                          <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/20 flex items-center justify-center mb-2`}>
                            <stat.icon size={16} className={`text-${stat.color}-500`} />
                          </div>
                          <p className="text-lg font-bold text-foreground">{stat.value}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex-1 px-6 pt-6 pb-6">
                    <Tabs defaultValue="resumen" className="w-full">
                      <TabsList className="w-full p-1 bg-muted/30 rounded-xl border border-border/30 mb-4">
                        <TabsTrigger value="resumen" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                          <User size={13} /> Resumen
                        </TabsTrigger>
                        <TabsTrigger value="verificaciones" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                          <Fingerprint size={13} /> Verificación
                        </TabsTrigger>
                        <TabsTrigger value="banco" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                          <Building2 size={13} /> Banco
                        </TabsTrigger>
                        <TabsTrigger value="raw" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                          <Cpu size={13} /> JSON
                        </TabsTrigger>
                      </TabsList>

                      {/* Tab: Resumen */}
                      <TabsContent value="resumen" className="mt-0 space-y-4 animate-in fade-in-50 duration-200">
                        {/* Identity Section */}
                        <div className="rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/30 overflow-hidden">
                          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-muted/30">
                            <User size={14} className="text-accent" />
                            <span className="text-xs font-semibold text-foreground">Identidad</span>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-4">
                            {[
                              { label: 'Nombre completo', value: fullName, icon: User },
                              { label: 'Documento', value: normalized.documentLabel, icon: Fingerprint, mono: true },
                              { label: 'Nacionalidad', value: normalized.nationality, icon: Globe },
                              { label: 'Estado civil', value: normalized.maritalStatus, icon: Heart },
                              { label: 'Fecha nacimiento', value: formatDate(account.birth_date), icon: Calendar },
                              { label: 'Género', value: account.gender, icon: Users },
                            ].map((field) => (
                              <div key={field.label} className="group">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <field.icon size={11} className="text-muted-foreground/50" />
                                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{field.label}</p>
                                </div>
                                <p className={`text-sm text-foreground ${field.mono ? 'font-mono' : ''}`}>{valueOrDash(field.value)}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Contact Section */}
                        <div className="rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/30 overflow-hidden">
                          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-muted/30">
                            <Phone size={14} className="text-accent" />
                            <span className="text-xs font-semibold text-foreground">Contacto</span>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-4">
                            {[
                              { label: 'Teléfono', value: mainPhone, icon: Phone, mono: true },
                              { label: 'Email', value: email, icon: Mail },
                              { label: 'Dirección', value: normalized.address, icon: MapPin, span: true },
                              { label: 'Tipo vivienda', value: normalized.housingType, icon: Home },
                            ].map((field) => (
                              <div key={field.label} className={`group ${field.span ? 'col-span-2' : ''}`}>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <field.icon size={11} className="text-muted-foreground/50" />
                                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{field.label}</p>
                                </div>
                                <p className={`text-sm text-foreground ${field.mono ? 'font-mono' : ''}`}>{valueOrDash(field.value)}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Employment & Financial */}
                        <div className="rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/30 overflow-hidden">
                          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-muted/30">
                            <Briefcase size={14} className="text-accent" />
                            <span className="text-xs font-semibold text-foreground">Empleo y Finanzas</span>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-4">
                            {[
                              { label: 'Situación laboral', value: normalized.employmentStatus, icon: Briefcase },
                              { label: 'Empleador', value: normalized.employer, icon: Building2 },
                              { label: 'Ingreso mensual', value: normalized.monthlyIncome ? `Q${normalized.monthlyIncome.toLocaleString()}` : null, icon: TrendingUp },
                              { label: 'Egreso mensual', value: normalized.monthlyExpenses ? `Q${normalized.monthlyExpenses.toLocaleString()}` : null, icon: Wallet },
                            ].map((field) => (
                              <div key={field.label} className="group">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <field.icon size={11} className="text-muted-foreground/50" />
                                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{field.label}</p>
                                </div>
                                <p className="text-sm text-foreground">{valueOrDash(field.value)}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Risk Flags */}
                        <div className="rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/30 overflow-hidden">
                          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 bg-muted/30">
                            <Shield size={14} className="text-accent" />
                            <span className="text-xs font-semibold text-foreground">Compliance & Riesgo</span>
                          </div>
                          <div className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {[
                                { label: 'PEP', value: account.is_pep, icon: AlertTriangle },
                                { label: 'Relacionado PEP', value: account.is_pep_related, icon: Users },
                                { label: 'US Tax', value: account.has_us_tax_obligations, icon: Globe },
                              ].map((flag) => (
                                <div key={flag.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${flag.value ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'}`}>
                                  <flag.icon size={14} />
                                  <span className="text-xs font-medium">{flag.label}: {flag.value ? 'Sí' : 'No'}</span>
                                </div>
                              ))}
                            </div>
                            {complianceSource.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-border/30">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Fuentes compliance</p>
                                <p className="text-xs text-foreground">{complianceSource.join(', ')}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Timestamps */}
                        <div className="flex items-center gap-4 px-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            Creado: {formatDate(account.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            Actualizado: {formatDate(detailQuery.data.updated_at)}
                          </span>
                        </div>
                      </TabsContent>

                      {/* Tab: Verificaciones */}
                      <TabsContent value="verificaciones" className="mt-0 space-y-3 animate-in fade-in-50 duration-200">
                        {/* Timeline */}
                        <div className="relative pl-6">
                          <div className="absolute left-2 top-4 bottom-4 w-px bg-gradient-to-b from-accent via-border to-border/30" />
                          
                          {[
                            { 
                              key: 'didit',
                              label: 'DIDIT Identity', 
                              status: account.didit_status, 
                              date: account.didit_last_check,
                              decision: account.didit_metadata?.decision?.status,
                              reason: account.didit_metadata?.decision?.reason,
                              link: account.didit_verification_link,
                              icon: Eye
                            },
                            { 
                              key: 'renap',
                              label: 'RENAP Guatemala', 
                              status: account.renap_status, 
                              date: account.renap_last_check,
                              icon: FileText
                            },
                            { 
                              key: 'phone',
                              label: 'Verificación Teléfono', 
                              status: account.phone_verification_status, 
                              date: account.phone_verification_metadata?.verified_at,
                              icon: Phone
                            },
                            { 
                              key: 'qic',
                              label: 'QIC Check', 
                              status: account.qic_status, 
                              date: account.qic_last_check,
                              icon: Lock
                            },
                          ].map((item) => {
                            const isOk = /approved|verified|ok|success|clear/.test((item.status || '').toLowerCase());
                            const isError = /error|fail|reject/.test((item.status || '').toLowerCase());
                            const tone = isOk ? 'emerald' : isError ? 'red' : 'amber';
                            
                            return (
                              <div key={item.key} className="relative pb-4 last:pb-0">
                                {/* Timeline dot */}
                                <div className={`absolute -left-4 w-4 h-4 rounded-full border-2 border-background ${isOk ? 'bg-emerald-500' : isError ? 'bg-red-500' : 'bg-amber-500'} flex items-center justify-center`}>
                                  {isOk && <CheckCircle2 size={10} className="text-white" />}
                                  {isError && <AlertCircle size={8} className="text-white" />}
                                </div>
                                
                                <div className={`ml-4 rounded-xl bg-gradient-to-r from-${tone}-500/10 to-transparent border border-${tone}-500/20 p-4 hover:border-${tone}-500/40 transition-all`}>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-8 h-8 rounded-lg bg-${tone}-500/20 flex items-center justify-center`}>
                                        <item.icon size={16} className={`text-${tone}-500`} />
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-semibold text-foreground">{item.label}</h4>
                                        <p className={`text-xs text-${tone}-600 dark:text-${tone}-400`}>{valueOrDash(item.status)}</p>
                                      </div>
                                    </div>
                                    {item.date && (
                                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(item.date)}</span>
                                    )}
                                  </div>
                                  
                                  {(item.decision || item.reason) && (
                                    <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-2 gap-3">
                                      {item.decision && (
                                        <div>
                                          <p className="text-[10px] text-muted-foreground uppercase">Decisión</p>
                                          <p className="text-xs text-foreground">{item.decision}</p>
                                        </div>
                                      )}
                                      {item.reason && (
                                        <div>
                                          <p className="text-[10px] text-muted-foreground uppercase">Motivo</p>
                                          <p className="text-xs text-foreground">{item.reason}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {item.link && (
                                    <Button variant="ghost" size="sm" className="mt-3 h-7 text-xs" onClick={() => window.open(item.link || '#', '_blank')}>
                                      <ExternalLink size={12} className="mr-1" /> Ver verificación
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {risk && (
                          <div className="rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/30 p-4 flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                              <AlertTriangle size={20} className="text-amber-500" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-amber-700 dark:text-amber-300 mb-1">Alerta de Riesgo</h4>
                              <p className="text-sm text-amber-600/80 dark:text-amber-200/80">Se detectaron flags de compliance (PEP/relacionado). Se requiere revisión manual antes de continuar.</p>
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Tab: Banco - Sequential Banking Flow */}
                      <TabsContent value="banco" className="mt-0 space-y-4 animate-in fade-in-50 duration-200">
                        {(() => {
                          const formatBirthDate = (date?: string | null) => {
                            if (!date) return '';
                            const digits = date.replace(/\D/g, '').slice(0, 8);
                            return digits.length === 8 ? digits : '';
                          };
                          
                          const mutateWithError = <T,>(mutation: { mutate: (args: T, opts?: { onError?: (e: unknown) => void; onSuccess?: () => void }) => void }, args: T, label: string, key: string) => {
                            mutation.mutate(args, {
                              onError: (e) => onActionError(`Fallo ${label}`, e, key),
                              onSuccess: () => { toast({ title: `${label} OK` }); detailQuery.refetch(); },
                            });
                          };

                          // Compute all 7 steps with their states
                          const currentStatus = detailQuery.data?.status || account.status || 'ready_for_bank';
                          const bankingSteps = computeBankingSteps(account, currentStatus);
                          const completedSteps = bankingSteps.filter(s => s.status === 'completed').length;
                          const nextStep = bankingSteps.find(s => s.status === 'pending' || s.status === 'error');

                          // Step action mappings
                          const stepActions: Record<string, () => void> = {
                            blacklist: () => mutateWithError(bridgeBlacklist, { dpi: account.document_number, C75000: account.document_type || '11', C75016: `D${(account.document_number || '').replace(/^D/i, '')}`, C75804: '', C75020: '', C75503: account.document_country || 'GT', C75043: account.document_country || 'GT', C75084: formatBirthDate(account.birth_date) }, 'Blacklist', 'blacklist'),
                            client: () => mutateWithError(bridgeCreateIndividual, { account_opening_id: detailQuery.data?.id } as never, 'Crear Cliente', 'client'),
                            account: () => mutateWithError(bridgeCreateAccount, { clientId: bankClientId ?? '', body: { currency: account.account_currency, product: account.product_type, phone: phoneForBank } }, 'Crear Cuenta', 'account'),
                            complementary: () => mutateWithError(bridgeComplementaryCreate, { clientId: bankClientId ?? '', body: account.extra_data?.complete_flow_data || account.extra_data || {} }, 'Datos Complementarios', 'complementary'),
                            onboarding_update: () => mutateWithError(bridgeUpdateOnboarding, { clientId: bankClientId ?? '', body: { email: account.email, phone: phoneForBank, full_name: account.full_name } }, 'Actualizar Onboarding', 'onboarding_update'),
                            complementary_update: () => mutateWithError(bridgeUpdateComplementary, { clientId: bankClientId ?? '', body: account.extra_data?.complete_flow_data || account.extra_data || {} }, 'Actualizar Complemento', 'complementary_update'),
                            complement_query: () => mutateWithError(bridgeQueryComplement, bankClientId ?? '', 'Consulta Final', 'complement_query'),
                          };

                          const stepPending: Record<string, boolean> = {
                            blacklist: bridgeBlacklist.isPending,
                            client: bridgeCreateIndividual.isPending,
                            account: bridgeCreateAccount.isPending,
                            complementary: bridgeComplementaryCreate.isPending,
                            onboarding_update: bridgeUpdateOnboarding.isPending,
                            complementary_update: bridgeUpdateComplementary.isPending,
                            complement_query: bridgeQueryComplement.isPending,
                          };

                          return (
                            <>
                              {/* Bank Header with Progress */}
                              <div className="rounded-xl bg-gradient-to-r from-sky-500/10 to-blue-500/5 border border-sky-500/20 p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                                      <Building2 size={20} className="text-sky-500" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-foreground">{valueOrDash(account.institution_name)}</h4>
                                      <p className="text-xs text-muted-foreground font-mono">{valueOrDash(bankClientId)}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10 text-[10px] text-accent font-medium">
                                      <Radio size={10} className="animate-pulse" />
                                      Auto-refresh 60s
                                    </span>
                                  </div>
                                </div>
                                {/* Progress Bar */}
                                <div className="mt-3">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-medium text-foreground">{completedSteps}/7 pasos completados</span>
                                    <span className="text-[10px] text-muted-foreground">{Math.round((completedSteps / 7) * 100)}%</span>
                                  </div>
                                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                                    <div 
                                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                                      style={{ width: `${(completedSteps / 7) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Clean Step Cards */}
                              <div className="space-y-2">
                                {bankingSteps.map((step) => {
                                  const cooldownKey = `${selectedId}_${step.key}`;
                                  const cooldownRemaining = getCooldownRemaining(cooldownKey);
                                  const isOnCooldown = cooldownRemaining > 0;
                                  const isPending = stepPending[step.key] || false;
                                  const hasError = bankError?.key === step.key;
                                  const isNextStep = nextStep?.key === step.key;
                                  const isLocked = step.status === 'locked';
                                  const isCompleted = step.status === 'completed';
                                  const isError = step.status === 'error' || hasError;
                                  const canClick = step.canExecute && !isPending && !isOnCooldown && !isCompleted;

                                  return (
                                    <div 
                                      key={step.key} 
                                      className={`group rounded-2xl border transition-all duration-200 overflow-hidden ${
                                        isCompleted ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' :
                                        isError ? 'bg-red-500/5 border-red-500/30' :
                                        isNextStep ? 'bg-gradient-to-r from-sky-500/10 to-blue-500/5 border-sky-500/30 shadow-md' :
                                        isLocked ? 'bg-muted/5 border-border/10 opacity-50' :
                                        'bg-muted/20 border-border/20 hover:border-border/40'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 p-3">
                                        {/* Step number circle */}
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                                          isCompleted ? 'bg-emerald-500 text-white' :
                                          isError ? 'bg-red-500 text-white' :
                                          isPending ? 'bg-accent text-white' :
                                          isNextStep ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' :
                                          isLocked ? 'bg-muted/50 text-muted-foreground/40' :
                                          'bg-muted text-muted-foreground'
                                        }`}>
                                          {isCompleted ? (
                                            <CheckCircle2 size={18} />
                                          ) : isError ? (
                                            <AlertCircle size={16} />
                                          ) : isPending ? (
                                            <Loader2 size={16} className="animate-spin" />
                                          ) : (
                                            step.stepNumber
                                          )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <h4 className={`font-medium text-sm truncate ${isLocked ? 'text-muted-foreground/50' : 'text-foreground'}`}>
                                              {step.label}
                                            </h4>
                                            {isNextStep && (
                                              <span className="px-1.5 py-0.5 rounded-full bg-sky-500/20 text-[9px] font-semibold text-sky-500 uppercase tracking-wide">
                                                Siguiente
                                              </span>
                                            )}
                                          </div>
                                          <p className={`text-[11px] truncate ${isLocked ? 'text-muted-foreground/30' : 'text-muted-foreground'}`}>
                                            {isCompleted && step.finishedAt ? formatDate(step.finishedAt) : step.desc}
                                          </p>
                                        </div>

                                        {/* Action */}
                                        <div className="shrink-0">
                                          {isCompleted ? (
                                            <span className="text-emerald-500 text-xs font-medium">✓</span>
                                          ) : isLocked ? (
                                            <span className="text-muted-foreground/30 text-[10px]">—</span>
                                          ) : (
                                            <Button 
                                              size="sm" 
                                              variant={isError ? 'destructive' : isNextStep ? 'default' : 'ghost'}
                                              disabled={!canClick}
                                              className={`h-8 px-3 text-xs rounded-lg ${isNextStep ? 'shadow-md' : ''}`}
                                              onClick={() => { 
                                                triggerCooldown(cooldownKey); 
                                                setBankError(null); 
                                                stepActions[step.key]?.(); 
                                              }}
                                            >
                                              {isPending ? (
                                                <Loader2 size={12} className="animate-spin" />
                                              ) : isOnCooldown ? (
                                                <span className="font-mono text-[10px]">{formatCooldown(cooldownRemaining)}</span>
                                              ) : isError ? (
                                                <RefreshCw size={12} />
                                              ) : (
                                                <Zap size={12} />
                                              )}
                                            </Button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Error inline */}
                                      {hasError && bankError && (
                                        <div className="px-3 pb-3">
                                          <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 text-xs">
                                            <AlertTriangle size={12} className="text-red-400 mt-0.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                              <span className="font-mono text-red-400 text-[10px]">{bankError.code}</span>
                                              <span className="text-red-300 ml-2">{bankError.message}</span>
                                            </div>
                                            <button onClick={() => setBankError(null)} className="text-red-400/50 hover:text-red-300">×</button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Success message when all steps complete */}
                              {completedSteps === 7 && (
                                <div className="rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/30 p-4 flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={24} className="text-emerald-500" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">Flujo Bancario Completado</h4>
                                    <p className="text-sm text-emerald-600/80 dark:text-emerald-200/80">Todos los 7 pasos se han ejecutado exitosamente. La cuenta está creada.</p>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </TabsContent>

                      {/* Tab: JSON Raw */}
                      <TabsContent value="raw" className="mt-0 space-y-3 animate-in fade-in-50 duration-200">
                        {[
                          { key: 'account', label: 'Account Object', data: account, icon: Database },
                          { key: 'extra', label: 'Extra Data', data: account.extra_data, icon: FileJson },
                          { key: 'didit', label: 'DIDIT Metadata', data: account.didit_metadata, icon: Eye },
                          { key: 'renap', label: 'RENAP Data', data: account.renap_citizen_data, icon: FileText },
                        ].filter(item => item.data).map((item) => (
                          <details key={item.key} className="group rounded-xl border border-border/30 bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden" open={item.key === 'account'}>
                            <summary className="cursor-pointer px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                                  <item.icon size={14} className="text-accent" />
                                </div>
                                <span className="text-sm font-medium text-foreground">{item.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => { e.preventDefault(); copyToClipboard(JSON.stringify(item.data, null, 2), `${item.label} copiado`); }}
                                  className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <Copy size={12} />
                                </button>
                                <ChevronRight size={14} className="text-muted-foreground transition-transform group-open:rotate-90" />
                              </div>
                            </summary>
                            <div className="border-t border-border/30">
                              <pre className="max-h-80 overflow-auto p-4 text-[11px] font-mono leading-relaxed bg-black/5 dark:bg-black/40">
                                <code dangerouslySetInnerHTML={{
                                  __html: JSON.stringify(item.data, null, 2)
                                    .replace(/(".*?")(?=:)/g, '<span class="text-cyan-600 dark:text-cyan-400">$1</span>')
                                    .replace(/: "(.*?)"/g, ': <span class="text-emerald-600 dark:text-emerald-300">"$1"</span>')
                                    .replace(/: ([0-9.\-]+)/g, ': <span class="text-amber-600 dark:text-amber-300">$1</span>')
                                    .replace(/: (true)/g, ': <span class="text-green-600 dark:text-green-400">$1</span>')
                                    .replace(/: (false)/g, ': <span class="text-red-600 dark:text-red-400">$1</span>')
                                    .replace(/: (null)/g, ': <span class="text-purple-600 dark:text-purple-400">$1</span>')
                                }} />
                              </pre>
                            </div>
                          </details>
                        ))}
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Footer Actions */}
                  <div className="sticky bottom-0 border-t border-border/30 bg-gradient-to-t from-background via-background to-background/95 backdrop-blur-sm p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 text-xs rounded-lg"
                          disabled={retryMutation.isPending}
                          onClick={() => {
                            if (!confirmDanger('Recolocar en retry?')) return;
                            retryMutation.mutate(
                              { operator: auditOperator, reason: '' },
                              { onError: (er) => onActionError('Fallo retry', er), onSuccess: () => toast({ title: 'Retry enviado' }) },
                            );
                          }}
                        >
                          <Repeat2 size={14} className="mr-1" /> Retry
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 text-xs rounded-lg"
                          disabled={rerunMutation.isPending}
                          onClick={() => {
                            if (!confirmDanger('Rerun incluye eventos. ¿Continuar?')) return;
                            rerunMutation.mutate(
                              { include_events: true, operator: auditOperator, reason: '' },
                              { onError: (er) => onActionError('Fallo rerun', er), onSuccess: () => toast({ title: 'Rerun disparado' }) },
                            );
                          }}
                        >
                          <Sparkles size={14} className="mr-1" /> Rerun
                        </Button>
                      </div>
                      <div className="flex items-center gap-1">
                        {[
                          { value: 'ready_for_bank', label: 'Listo', color: 'emerald' },
                          { value: 'bank_processing', label: 'Procesando', color: 'sky' },
                          { value: 'bank_rejected', label: 'Rechazado', color: 'red' },
                          { value: 'account_created', label: 'Creada', color: 'violet' },
                        ].map((s) => (
                          <Button
                            key={s.value}
                            variant="ghost"
                            size="sm"
                            className={`h-8 text-[11px] px-2 hover:bg-${s.color}-500/10 hover:text-${s.color}-600 dark:hover:text-${s.color}-400`}
                            disabled={statusMutation.isPending}
                            onClick={() => {
                              if (!confirmDanger(`Forzar estado "${s.label}"?`)) return;
                              statusMutation.mutate(
                                { status: s.value, operator: auditOperator, reason: '' },
                                { onError: (e) => onActionError('Fallo al forzar estado', e), onSuccess: () => toast({ title: 'Estado ajustado', description: s.label }) },
                              );
                            }}
                          >
                            <ChevronRight size={10} className="mr-0.5" />{s.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Database size={36} className="text-muted-foreground/40" />
              </div>
              <p className="font-medium text-foreground mb-1">Seleccione un proceso</p>
              <p className="text-sm text-muted-foreground">Haga clic en una conversación para ver sus detalles</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
