import { Bell, CheckCheck, AlertCircle, Info, MessageSquare, CreditCard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sampleNotifications = [
  { id: '1', type: 'success', title: 'Cuenta creada exitosamente', message: 'Juan Pérez completó el proceso de apertura de cuenta', time: 'Hace 5 min', read: false, icon: CreditCard },
  { id: '2', type: 'warning', title: 'Verificación pendiente', message: 'María García necesita completar la verificación KYC', time: 'Hace 30 min', read: false, icon: Shield },
  { id: '3', type: 'info', title: 'Nuevo mensaje recibido', message: 'Carlos López envió un mensaje en el chat', time: 'Hace 1 hora', read: true, icon: MessageSquare },
  { id: '4', type: 'error', title: 'Error en transferencia', message: 'La transferencia de Roberto Sánchez falló', time: 'Hace 2 horas', read: true, icon: AlertCircle },
  { id: '5', type: 'info', title: 'Actualización del sistema', message: 'Se aplicaron mejoras de rendimiento', time: 'Ayer', read: true, icon: Info },
];

export function NotificacionesPage() {
  const unreadCount = sampleNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-xl text-foreground">Notificaciones</h1>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2 rounded-xl">
          <CheckCheck size={14} />
          Marcar todas como leídas
        </Button>
      </header>

      {/* Notifications List */}
      <div className="rounded-2xl border border-border/30 bg-card/50 overflow-hidden divide-y divide-border/20">
        {sampleNotifications.map((notification) => {
          const IconComponent = notification.icon;
          return (
            <div 
              key={notification.id} 
              className={`flex items-start gap-4 p-4 transition-colors cursor-pointer ${
                notification.read ? 'hover:bg-muted/30' : 'bg-accent/5 hover:bg-accent/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                notification.type === 'success' ? 'bg-emerald-500/10' :
                notification.type === 'warning' ? 'bg-amber-500/10' :
                notification.type === 'error' ? 'bg-red-500/10' :
                'bg-blue-500/10'
              }`}>
                <IconComponent size={18} className={
                  notification.type === 'success' ? 'text-emerald-600' :
                  notification.type === 'warning' ? 'text-amber-600' :
                  notification.type === 'error' ? 'text-red-600' :
                  'text-blue-600'
                } />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-medium text-foreground ${!notification.read ? 'font-semibold' : ''}`}>
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{notification.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state placeholder */}
      {sampleNotifications.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="text-muted-foreground/50" />
          </div>
          <p className="font-semibold text-foreground mb-1">Sin notificaciones</p>
          <p className="text-sm text-muted-foreground">No tienes notificaciones nuevas</p>
        </div>
      )}
    </div>
  );
}

