import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, PhoneOutgoing, ShieldCheck, UserRound } from 'lucide-react';

const conversations = [
  { name: 'Juan Pérez', product: 'Crédito', status: 'Activo', time: '10:23', unread: 2 },
  { name: 'María García', product: 'Apertura de Cuenta', status: 'Pendiente', time: '10:15', unread: 1 },
  { name: 'Carlos López', product: 'KYC', status: 'Activo', time: '09:58', unread: 0 },
];

const profile = {
  name: 'Juan Pérez',
  phone: '+52 55 1234 5678',
  estado: 'Activo',
  etiquetas: ['Crédito', 'Urgente'],
  proceso: 'Crédito Personal $50,000',
  progreso: '60%',
};

export function ConversacionesPage() {
  const initials = useMemo(() => profile.name.split(' ').map((p) => p[0]).join('').slice(0, 2), []);

  return (
    <div className="grid gap-4 lg:grid-cols-[320px,1.4fr,0.8fr]">
      <Card className="glass border-border/60 bg-surface p-0 text-foreground">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold">Conversaciones</h3>
          <Badge variant="outline" className="text-xs text-accent border-accent/30">
            Activas
          </Badge>
        </div>
        <div className="divide-y divide-border/40">
          {conversations.map((c) => (
            <div key={c.name} className="flex items-center justify-between px-4 py-3 hover:bg-foreground/5">
              <div>
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-xs text-foreground/60">{c.product}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  {c.status}
                </Badge>
                {c.unread ? (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] text-background">
                    {c.unread}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="glass border-border/60 bg-surface p-0 text-foreground">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Juan Pérez</p>
            <p className="text-xs text-foreground/60">Solicitud de Crédito</p>
          </div>
          <Badge variant="outline" className="text-xs text-emerald-300 border-emerald-300/30">
            Activo
          </Badge>
        </div>
        <div className="space-y-3 px-4 pb-4 pt-0">
          <div className="flex flex-col gap-2 text-sm">
            <div className="self-start rounded-xl bg-primary/10 px-3 py-2 text-primary">Hola, quisiera solicitar un crédito.</div>
            <div className="self-end rounded-xl bg-secondary px-3 py-2 text-foreground">¡Hola Juan! Envíame tu INE y comprobante.</div>
            <div className="self-start rounded-xl bg-primary/10 px-3 py-2 text-primary">Listo, aquí está.</div>
          </div>
          <div className="rounded-xl border border-border/50 bg-background/60 px-3 py-2 text-xs text-foreground/60">
            Input y acciones rápidas (templates, adjuntar, macros) vão aqui.
          </div>
        </div>
      </Card>

      <Card className="glass border-border/60 bg-surface p-4 text-foreground space-y-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{profile.name}</p>
            <p className="text-xs text-foreground/60">{profile.phone}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-emerald-300">
            <ShieldCheck size={14} />
            <span>Estado: {profile.estado}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.etiquetas.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[11px]">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="rounded-lg border border-border/50 bg-background/60 p-3">
            <p className="text-xs text-foreground/60">Transacción actual</p>
            <p className="text-sm font-semibold">{profile.proceso}</p>
            <p className="text-xs text-foreground/60">Progreso: {profile.progreso}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground/60">
            <UserRound size={14} /> Asignado a María López
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
        <Skeleton className="h-20 w-full bg-foreground/10" />
      </Card>
    </div>
  );
}

