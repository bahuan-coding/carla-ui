import { Settings, User, Bell, Shield, Palette, Globe, Key, Building2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const settingsSections = [
  {
    title: 'Cuenta',
    items: [
      { icon: User, label: 'Perfil', description: 'Información personal y foto' },
      { icon: Key, label: 'Seguridad', description: 'Contraseña y autenticación' },
      { icon: Bell, label: 'Notificaciones', description: 'Preferencias de alertas' },
    ],
  },
  {
    title: 'Organización',
    items: [
      { icon: Building2, label: 'Cooperativa', description: 'Datos de la institución' },
      { icon: Shield, label: 'Permisos', description: 'Roles y accesos' },
      { icon: Globe, label: 'Integraciones', description: 'APIs y servicios externos' },
    ],
  },
  {
    title: 'Preferencias',
    items: [
      { icon: Palette, label: 'Apariencia', description: 'Tema y colores' },
      { icon: Globe, label: 'Idioma', description: 'Español (Guatemala)' },
    ],
  },
];

export function ConfiguracionPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-500/20">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-xl text-foreground">Configuración</h1>
          <p className="text-xs text-muted-foreground">Administra tu cuenta y preferencias</p>
        </div>
      </header>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h2>
            <div className="rounded-2xl border border-border/30 bg-card/50 overflow-hidden divide-y divide-border/20">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-accent/10 transition-colors">
                      <IconComponent size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="pt-6 border-t border-border/30">
        <h2 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-3 px-1">
          Zona de peligro
        </h2>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Cerrar sesión</p>
              <p className="text-sm text-muted-foreground">Salir de tu cuenta en este dispositivo</p>
            </div>
            <Button variant="outline" size="sm" className="border-red-500/30 text-red-600 hover:bg-red-500/10 hover:text-red-600">
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

