import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useConversationDetail, useConversationStream, useConversations, useSendMessage } from '@/hooks/use-carla-data';
import { MessageCircle, PhoneOutgoing, ShieldCheck, UserRound } from 'lucide-react';

type FormFields = { message: string };

export function ConversacionesPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const conversationsQuery = useConversations();
  const currentConversationId = selectedId ?? conversationsQuery.data?.[0]?.id;

  const filtered = useMemo(
    () =>
      (conversationsQuery.data || []).filter(
        (c) =>
          !filter ||
          c.name.toLowerCase().includes(filter.toLowerCase()) ||
          (c.product || '').toLowerCase().includes(filter.toLowerCase()),
      ),
    [conversationsQuery.data, filter],
  );

  const detailQuery = useConversationDetail(currentConversationId);
  const { liveMessages } = useConversationStream(currentConversationId);
  const messages = useMemo(() => {
    const combined = [...(detailQuery.data?.messages || []), ...liveMessages];
    return combined.sort((a, b) => a.at.localeCompare(b.at));
  }, [detailQuery.data?.messages, liveMessages]);

  const sendMessage = useSendMessage(currentConversationId);
  const form = useForm<FormFields>();

  const profile = detailQuery.data;
  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
    : 'CC';

  const submit = form.handleSubmit(async (data) => {
    if (!currentConversationId) return;
    try {
      await sendMessage.mutateAsync({ text: data.message });
      form.reset();
    } catch (err) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: err instanceof Error ? err.message : 'Tente novamente',
        variant: 'destructive',
      });
    }
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[320px,1.4fr,0.8fr]">
      <Card className="glass border-border/60 bg-surface p-0 text-foreground">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold">Conversaciones</h3>
            <p className="text-xs text-foreground/60">Conectadas via Carla-Channels</p>
          </div>
          <Badge variant="outline" className="text-xs text-accent border-accent/30">
            {conversationsQuery.data?.length ?? 0} activas
          </Badge>
        </div>
        <div className="px-4 pb-3">
          <Input
            placeholder="Buscar por cliente o producto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm"
            id="conversation-filter"
            name="conversation-filter"
          />
        </div>
        <div className="divide-y divide-border/40">
          {conversationsQuery.isLoading
            ? Array.from({ length: 6 }).map((_, idx) => <Skeleton key={idx} className="h-14 w-full bg-foreground/10" />)
            : filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-foreground/5 ${
                    c.id === currentConversationId ? 'bg-foreground/10' : ''
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-foreground/60">{c.product || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.status ? (
                      <Badge variant="secondary" className="text-[10px]">
                        {c.status}
                      </Badge>
                    ) : null}
                    {c.unread ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] text-background">{c.unread}</span>
                    ) : null}
                  </div>
                </button>
              ))}
          {conversationsQuery.isError ? (
            <p className="px-4 py-3 text-xs text-destructive">No se pudo cargar la lista de conversaciones.</p>
          ) : null}
          {!conversationsQuery.isLoading && !filtered.length ? (
            <p className="px-4 py-3 text-xs text-foreground/60">Sin conversaciones para este filtro.</p>
          ) : null}
        </div>
      </Card>

      <Card className="glass border-border/60 bg-surface p-0 text-foreground">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold">{profile?.name || 'Seleccione una conversación'}</p>
            <p className="text-xs text-foreground/60">{profile?.product || '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full border border-border/50 px-2 py-1 text-[11px] text-foreground/80">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Live WS
            </span>
            {profile?.status ? (
              <Badge variant="outline" className="text-xs text-emerald-300 border-emerald-300/30">
                {profile.status}
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="flex max-h-[520px] flex-col gap-3 overflow-y-auto px-4 pb-4 pt-0">
          {detailQuery.isLoading ? (
            <Skeleton className="h-40 w-full bg-foreground/10" />
          ) : (
            <div className="flex flex-col gap-2 text-sm">
              {messages.map((m) => (
                <div
                  key={`${m.id}-${m.at}`}
                  className={`max-w-[80%] rounded-xl px-3 py-2 ${
                    m.direction === 'out' ? 'self-end bg-secondary text-foreground' : 'self-start bg-primary/10 text-primary'
                  }`}
                >
                  <p>{m.body}</p>
                  <p className="mt-1 text-[10px] text-foreground/60">{new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))}
              {!messages.length ? <p className="text-xs text-foreground/60">Sin mensajes aún.</p> : null}
            </div>
          )}
          {selectedId ? (
            <form onSubmit={submit} className="sticky bottom-0 mt-2 flex items-center gap-2 rounded-xl border border-border/50 bg-background/60 px-3 py-2">
              <Input
                {...form.register('message', { required: true })}
                placeholder="Escribe un mensaje"
                className="border-0 bg-transparent text-sm focus-visible:ring-0"
                id="conversation-message"
                name="conversation-message"
              />
              <Button type="submit" size="sm" disabled={sendMessage.isPending}>
                Enviar
              </Button>
            </form>
          ) : null}
        </div>
      </Card>

      <Card className="glass border-border/60 bg-surface p-4 text-foreground space-y-4">
        {detailQuery.isLoading ? (
          <Skeleton className="h-32 w-full bg-foreground/10" />
        ) : profile ? (
          <>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{profile.name}</p>
                <p className="text-xs text-foreground/60">{profile.phone || '—'}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-emerald-300">
                <ShieldCheck size={14} />
                <span>Estado: {profile.status || '—'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(profile.tags || []).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[11px]">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="rounded-lg border border-border/50 bg-background/60 p-3">
                <p className="text-xs text-foreground/60">Transacción actual</p>
                <p className="text-sm font-semibold">{profile.proceso || '—'}</p>
                <p className="text-xs text-foreground/60">Progreso: {profile.progreso || '—'}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground/60">
                <UserRound size={14} /> Asignado a {profile.assignedTo || '—'}
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <MessageCircle size={12} /> Abrir conversación
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <PhoneOutgoing size={12} /> Llamar
                </Badge>
              </div>
            </div>
          </>
        ) : (
          <p className="text-xs text-foreground/60">Seleccione una conversación para ver el perfil.</p>
        )}
      </Card>
    </div>
  );
}

