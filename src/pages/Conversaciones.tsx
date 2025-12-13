import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useConversationDetail, useConversationStream, useConversations, useSendMessage } from '@/hooks/use-carla-data';
import { sampleConversationsRich, type SampleConversation } from '@/lib/samples';
import { mapStatusToProgress } from '@/lib/utils';
import {
  MessageCircle,
  Phone,
  Video,
  Star,
  MoreVertical,
  Search,
  Send,
  Bot,
  User,
  Tag,
  Archive,
  Sparkles,
} from 'lucide-react';

type FormFields = { message: string };
type FilterTab = 'todas' | 'activas' | 'pendientes';

const CHANNEL_ICONS: Record<string, { icon: string; color: string }> = {
  whatsapp: { icon: '🟢', color: 'text-emerald-500' },
  web: { icon: '🌐', color: 'text-blue-500' },
  telegram: { icon: '✈️', color: 'text-sky-500' },
  instagram: { icon: '📷', color: 'text-pink-500' },
};

const PRODUCT_COLORS: Record<string, string> = {
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  in_progress: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  completed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  failed: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  resolved: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getInitials(name: string) {
  if (!name) return '??';
  // For "Cliente X" format, use "CX"
  if (name.startsWith('Cliente ')) {
    const rest = name.replace('Cliente ', '').trim();
    return 'C' + (rest[0] || '?').toUpperCase();
  }
  // For names with spaces, take first letter of each word
  const parts = name.split(' ').filter(p => p.length > 0);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  // Single word: take first two chars
  return name.slice(0, 2).toUpperCase();
}

// Conversation List Item
function ConversationCard({
  conv,
  isSelected,
  onClick,
  isDemo = false,
}: {
  conv: SampleConversation;
  isSelected: boolean;
  onClick: () => void;
  isDemo?: boolean;
}) {
  const channel = CHANNEL_ICONS[conv.channel] || CHANNEL_ICONS.web;
  const productColor = PRODUCT_COLORS[conv.productColor] || PRODUCT_COLORS.blue;
  
  // Avatar color based on real vs demo
  const avatarBg = isDemo 
    ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/10' 
    : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10';

  const displayName = conv.customer_name || conv.phone || conv.id;
  const lastMessage = conv.last_message ? (conv.last_message.length > 80 ? conv.last_message.slice(0, 80) + '...' : conv.last_message) : '';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 transition-all border-b border-border/30 hover:bg-foreground/5 ${
        isSelected ? 'bg-accent/5 border-l-2 border-l-accent' : ''
      } ${isDemo ? 'opacity-75' : ''}`}
    >
      <div className="flex gap-3">
        <div className="relative">
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarFallback className={`${avatarBg} text-sm font-medium`}>
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          {/* Online indicator for real conversations */}
          {!isDemo && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm truncate">{displayName}</span>
              <span className={channel.color} title={conv.channel}>{channel.icon}</span>
              {isDemo && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-violet-500/10 text-violet-500 border-violet-500/30">
                  Demo
                </Badge>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground shrink-0">{formatTime(conv.last_message_at)}</span>
          </div>
          {/* Show phone if different from name, or last message */}
          {conv.phone && conv.phone !== displayName ? (
            <p className="text-xs text-muted-foreground truncate mt-0.5 font-mono">{conv.phone}</p>
          ) : lastMessage ? (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{lastMessage}</p>
          ) : null}
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${productColor}`}>
                {conv.product}
              </Badge>
              {conv.transaction?.stage && (
                <span className="text-[10px] text-muted-foreground truncate">{conv.transaction.stage}</span>
              )}
            </div>
            {conv.unread_count > 0 && (
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                {conv.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// Chat Header
function ChatHeader({ conv, isDemo = false }: { conv: SampleConversation; isDemo?: boolean }) {
  const productColor = PRODUCT_COLORS[conv.productColor] || PRODUCT_COLORS.blue;
  const avatarBg = isDemo 
    ? 'bg-gradient-to-br from-violet-500/20 to-purple-500/10' 
    : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10';

  const displayName = conv.customer_name || conv.phone || conv.id;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 bg-background/60">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={`${avatarBg} text-sm font-medium`}>
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          {!isDemo && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{displayName}</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${productColor}`}>
              {conv.product}
            </Badge>
            {isDemo ? (
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-violet-500/10 text-violet-500 border-violet-500/30">
                Demo
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                Live
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{conv.phone || conv.id}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <Phone size={18} />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <Video size={18} />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <Star size={18} />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <MoreVertical size={18} />
        </Button>
      </div>
    </div>
  );
}

// Client Sidebar
function ClientSidebar({ conv }: { conv: SampleConversation }) {
  const [aiEnabled, setAiEnabled] = useState(conv.ai_enabled);
  const statusColor = STATUS_COLORS[conv.status] || STATUS_COLORS.pending;
  const txnStatusColor = conv.transaction ? STATUS_COLORS[conv.transaction.status] || STATUS_COLORS.pending : '';

  const displayName = conv.customer_name || conv.phone || conv.id;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Avatar and Name */}
      <div className="flex flex-col items-center pt-6 pb-4 border-b border-border/40">
        <Avatar className="h-20 w-20 mb-3">
          <AvatarFallback className="bg-gradient-to-br from-accent/30 to-accent/10 text-xl font-semibold">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-base">{displayName}</h3>
        <p className="text-sm text-muted-foreground">{conv.phone}</p>
        {conv.customer_email && (
          <p className="text-xs text-muted-foreground">{conv.customer_email}</p>
        )}
      </div>

      <div className="p-4 space-y-5">
        {/* Profile */}
        {conv.profile && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Perfil</h4>
            <div className="space-y-1.5 text-xs">
              {conv.profile.document_type && conv.profile.document_number && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{conv.profile.document_type}</span>
                  <span className="font-mono">{conv.profile.document_number}</span>
                </div>
              )}
              {conv.profile.location && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ubicación</span>
                  <span>{conv.profile.location}</span>
                </div>
              )}
              {conv.profile.birth_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nacimiento</span>
                  <span>{formatDate(conv.profile.birth_date)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estado */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Estado</h4>
          <Badge variant="outline" className={`text-xs capitalize ${statusColor}`}>
            {conv.transaction?.stage || conv.status}
          </Badge>
        </div>

        {/* Etiquetas */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Etiquetas</h4>
          <div className="flex flex-wrap gap-1.5">
            {conv.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Asignación de Respuestas */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-3">Asignación de Respuestas</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={14} className="text-accent" />
                <span className="text-sm">Inteligencia Artificial</span>
              </div>
              <button
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  aiEnabled ? 'bg-accent' : 'bg-muted'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    aiEnabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
            <div className="flex items-start gap-2">
              <User size={14} className="text-muted-foreground mt-0.5" />
              <div>
                <span className="text-sm">Agente Asignado</span>
                <p className="text-xs text-muted-foreground">
                  {conv.assigned_agent || 'Sin agente asignado'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transacción Actual */}
        {conv.transaction && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-3">Transacción Actual</h4>
            <div className="p-3 rounded-lg border border-border/50 bg-muted/30 space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle size={14} className="text-accent" />
                <span className="text-sm font-medium">{conv.transaction.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">ID: {conv.transaction.id}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Etapa</span>
                <Badge variant="outline" className={`text-[10px] capitalize ${txnStatusColor}`}>
                  {conv.transaction.stage}
                </Badge>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="text-foreground font-medium">{conv.transaction.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-emerald-400 transition-all"
                    style={{ width: `${conv.transaction.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones Rápidas */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-3">Acciones Rápidas</h4>
          <div className="space-y-1.5">
            <Button variant="ghost" className="w-full justify-start h-9 text-sm font-normal">
              <Tag size={14} className="mr-2 text-muted-foreground" />
              Agregar Etiqueta
            </Button>
            <Button variant="ghost" className="w-full justify-start h-9 text-sm font-normal">
              <Sparkles size={14} className="mr-2 text-muted-foreground" />
              Asignar Proceso
            </Button>
            <Button variant="ghost" className="w-full justify-start h-9 text-sm font-normal">
              <Archive size={14} className="mr-2 text-muted-foreground" />
              Archivar Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Detect if a name looks like a technical ID
const isTechnicalId = (name: string): boolean => {
  if (!name) return true;
  // Patterns that indicate technical IDs
  return /^conv_/i.test(name) || 
         /^test_/i.test(name) || 
         /^[a-f0-9]{8,}$/i.test(name) ||
         /^[a-f0-9-]{36}$/i.test(name) || // UUID
         /_[a-f0-9]{6,}$/i.test(name); // ends with hash
};

// Extract a conversation group key from ID (e.g., conv_test_micoope_001 from conv_test_micoope_001_abc123)
const getConversationGroupKey = (id: string): string => {
  // Pattern: take everything before the last underscore + hash
  const match = id.match(/^(.+?)_[a-f0-9]{6,}$/i);
  return match ? match[1] : id;
};

// Format phone number for display
const formatPhoneDisplay = (phone?: string | null): string => {
  if (!phone) return '';
  // Clean and format
  const clean = phone.replace(/[^\d+]/g, '');
  if (clean.length >= 10) {
    // Format: +XX XX XXXXX-XXXX or similar
    if (clean.startsWith('+')) {
      const country = clean.slice(0, 3);
      const area = clean.slice(3, 5);
      const rest = clean.slice(5);
      return `${country} ${area} ${rest.slice(0, 5)}-${rest.slice(5)}`;
    }
  }
  return phone;
};

// Group API conversations by prefix and aggregate
type ApiConversation = { 
  id: string; 
  customer_name?: string | null;
  phone?: string | null;
  customer_email?: string | null;
  last_message?: string | null;
  last_message_at?: string | null;
  last_message_direction?: 'inbound' | 'outbound' | null;
  unread_count?: number | null;
  status?: string | null;
  product?: string | null;
  process_id?: string | null;
  process_status?: string | null;
  channel?: string | null;
  ai_enabled?: boolean | null;
  assigned_agent?: string | null;
  tags?: string[] | null;
  // Legacy fields
  name?: string | null;
  unread?: number | null;
  updatedAt?: string | null;
  whatsapp_phone?: string | null;
  contact_name?: string | null;
  lastMessage?: string | null;
  lastMessagePreview?: string | null;
  [key: string]: unknown;
};

const groupAndTransformConversations = (apiData: ApiConversation[]): SampleConversation[] => {
  // Group by conversation prefix
  const groups = new Map<string, ApiConversation[]>();
  
  for (const conv of apiData) {
    const groupKey = getConversationGroupKey(conv.id);
    const existing = groups.get(groupKey) || [];
    existing.push(conv);
    groups.set(groupKey, existing);
  }
  
  // Transform each group into a single conversation
  const result: SampleConversation[] = [];
  
  for (const [groupKey, convs] of groups) {
    // Sort by date to get latest (prefer new field, fallback to legacy)
    const sorted = [...convs].sort((a, b) => 
      new Date(b.last_message_at || b.updatedAt || 0).getTime() - new Date(a.last_message_at || a.updatedAt || 0).getTime()
    );
    const latest = sorted[0];
    const totalUnread = convs.reduce((sum, c) => sum + (c.unread_count ?? c.unread ?? 0), 0);
    
    // Extract phone from any available field
    const phone = latest.phone || latest.whatsapp_phone || 
      (latest as Record<string, unknown>).whatsapp_phone_e164 as string || '';
    
    // Determine display name - priority: customer_name > contact_name > name > phone > ID
    let displayName = latest.customer_name || latest.contact_name || '';
    if (!displayName || isTechnicalId(displayName)) {
      displayName = latest.name || '';
    }
    if (!displayName || isTechnicalId(displayName)) {
      displayName = phone ? formatPhoneDisplay(phone) : `Cliente #${groupKey.slice(-8).toUpperCase()}`;
    }
    
    // Get last message preview (truncate to 80 chars per spec)
    const lastMessageRaw = latest.last_message || latest.lastMessage || latest.lastMessagePreview || '';
    const lastMessage = lastMessageRaw.length > 80 ? lastMessageRaw.slice(0, 80) + '...' : lastMessageRaw;
    
    // Get status and derive progress/stage
    const status = latest.status || latest.process_status || 'started';
    const progressInfo = mapStatusToProgress(status);
    
    result.push({
      id: groupKey,
      customer_name: displayName,
      phone: formatPhoneDisplay(phone),
      customer_email: latest.customer_email || undefined,
      channel: (latest.channel as 'whatsapp' | 'web' | 'telegram' | 'instagram') || 'whatsapp',
      product: latest.product || 'savings',
      productColor: 'emerald',
      status: status,
      process_id: latest.process_id || undefined,
      process_status: latest.process_status || undefined,
      unread_count: totalUnread,
      last_message: lastMessage,
      last_message_at: latest.last_message_at || latest.updatedAt || new Date().toISOString(),
      last_message_direction: latest.last_message_direction || undefined,
      tags: latest.tags || [],
      ai_enabled: latest.ai_enabled ?? true,
      assigned_agent: latest.assigned_agent || null,
      transaction: {
        id: latest.process_id || groupKey,
        name: latest.product || 'savings',
        status: status,
        stage: progressInfo.stage,
        progress: progressInfo.progress,
      },
    });
  }
  
  // Sort by latest activity
  return result.sort((a, b) => 
    new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  );
};

export function ConversacionesPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('todas');
  const conversationsQuery = useConversations();

  // Merge real API data with demo data (API first, then demos only if needed)
  const conversations = useMemo(() => {
    const apiData = conversationsQuery.data || [];
    const apiGrouped = groupAndTransformConversations(apiData as ApiConversation[]);
    
    // Only show demos if we have fewer than 3 real conversations
    if (apiGrouped.length >= 3) {
      return apiGrouped;
    }
    
    // Add demos but mark them visually different
    const demosNeeded = 3 - apiGrouped.length;
    const demos = sampleConversationsRich.slice(0, demosNeeded).map(d => ({
      ...d,
      productColor: 'violet',
    }));
    
    return [...apiGrouped, ...demos];
  }, [conversationsQuery.data]);

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  
  // Auto-select first conversation when data loads
  const effectiveSelectedId = selectedId || conversations[0]?.id;
  const currentConversation = effectiveSelectedId
    ? conversations.find(c => c.id === effectiveSelectedId)
    : conversations[0];

  const filtered = useMemo(() => {
    let result = conversations;
    if (activeTab === 'activas') {
      result = result.filter((c) => c.status === 'active');
    } else if (activeTab === 'pendientes') {
      result = result.filter((c) => c.status === 'pending');
    }
    if (filter) {
      const q = filter.toLowerCase();
      result = result.filter(
        (c) =>
          c.customer_name.toLowerCase().includes(q) ||
          c.product.toLowerCase().includes(q) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.transaction?.stage && c.transaction.stage.toLowerCase().includes(q))
      );
    }
    return result;
  }, [conversations, filter, activeTab]);

  const detailQuery = useConversationDetail(effectiveSelectedId);
  const { liveMessages } = useConversationStream(effectiveSelectedId);
  const messages = useMemo(() => {
    const apiMessages = detailQuery.data?.messages || [];
    const combined = [...apiMessages, ...liveMessages];
    return combined.sort((a, b) => a.at.localeCompare(b.at));
  }, [detailQuery.data?.messages, liveMessages]);

  const sendMessage = useSendMessage(effectiveSelectedId);
  const form = useForm<FormFields>();

  const submit = form.handleSubmit(async (data) => {
    if (!effectiveSelectedId) return;
    try {
      await sendMessage.mutateAsync({ text: data.message });
      form.reset();
    } catch (err) {
      toast({
        title: 'Error al enviar mensaje',
        description: err instanceof Error ? err.message : 'Intente de nuevo',
        variant: 'destructive',
      });
    }
  });

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0 -mx-4 -mt-4">
      {/* Conversation List */}
      <div className="w-[340px] shrink-0 border-r border-border/40 flex flex-col bg-background">
        {/* Search */}
        <div className="p-4 border-b border-border/40">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar conversaciones..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 h-9 text-sm bg-muted/30"
              id="conversation-filter"
              name="conversation-filter"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-4 py-2 border-b border-border/40">
          {(['todas', 'activas', 'pendientes'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversationsQuery.isLoading
            ? Array.from({ length: 5 }).map((_, idx) => <Skeleton key={idx} className="h-24 w-full" />)
            : filtered.map((c) => (
                <ConversationCard
                  key={c.id}
                  conv={c}
                  isSelected={c.id === effectiveSelectedId}
                  onClick={() => setSelectedId(c.id)}
                  isDemo={c.id.startsWith('conv_00')} // Demo IDs start with conv_00X
                />
              ))}
          {!conversationsQuery.isLoading && filtered.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground text-center">Sin conversaciones</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background/50">
        {currentConversation ? (
          <>
            <ChatHeader conv={currentConversation} isDemo={currentConversation.id.startsWith('conv_00')} />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {detailQuery.isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                messages.map((m) => {
                  const isOutbound = m.direction === 'out' || m.direction === 'outbound';
                  return (
                    <div
                      key={`${m.id}-${m.at}`}
                      className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                          isOutbound
                            ? 'bg-accent text-accent-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm">{m.body}</p>
                        <p className={`text-[10px] mt-1 ${isOutbound ? 'text-accent-foreground/70' : 'text-muted-foreground'}`}>
                          {formatTime(m.at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              {messages.length === 0 && !detailQuery.isLoading && (
                <p className="text-center text-sm text-muted-foreground py-8">Sin mensajes aún</p>
              )}
            </div>

            {/* AI Status Banner */}
            {currentConversation.ai_enabled && (
              <div className="px-4 py-2 bg-accent/5 border-t border-border/40">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bot size={14} className="text-accent" />
                  <span>La IA está respondiendo automáticamente. Desactívala para responder manualmente.</span>
                </div>
              </div>
            )}

            {/* Message Input */}
            <form
              name="conversation-form"
              onSubmit={submit}
              className="p-4 border-t border-border/40 bg-background/80"
            >
              <div className="flex items-center gap-2 p-2 rounded-xl border border-border/50 bg-muted/30">
                <Input
                  {...form.register('message', { required: true })}
                  placeholder="Escribe un mensaje..."
                  className="border-0 bg-transparent text-sm focus-visible:ring-0 flex-1"
                  id="conversation-message"
                  name="message"
                />
                <Button type="submit" size="sm" disabled={sendMessage.isPending} className="shrink-0">
                  <Send size={16} />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Selecciona una conversación</p>
          </div>
        )}
      </div>

      {/* Client Sidebar */}
      {currentConversation && (
        <div className="w-[320px] shrink-0 border-l border-border/40 bg-background">
          <ClientSidebar conv={currentConversation} />
        </div>
      )}
    </div>
  );
}
