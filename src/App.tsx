import { useEffect, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { BrainCircuit, ChartPie, MessageCircle, Settings, Workflow } from 'lucide-react';
import { DashboardPage } from '@/pages/Dashboard';
import { ConversacionesPage } from '@/pages/Conversaciones';
import { TransaccionesPage } from '@/pages/Transacciones';
import { ProcesosPage } from '@/pages/Procesos';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Theme = 'light' | 'dark';

const nav = [
  { to: '/', label: 'Dashboard', icon: ChartPie },
  { to: '/conversaciones', label: 'Conversaciones', icon: MessageCircle },
  { to: '/transacciones', label: 'Transacciones', icon: BrainCircuit },
  { to: '/procesos', label: 'Procesos', icon: Workflow },
  { to: '/config', label: 'Configuración', icon: Settings },
];

const getPreferredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('theme') as Theme | null;
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const preferred = getPreferredTheme();
    setTheme(preferred);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0c1428] to-[#0b1020] text-foreground">
      <aside className="hidden w-64 flex-col border-r border-border/40 bg-background/40 p-4 lg:flex">
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-border/40 bg-foreground/5 px-3 py-2">
          <div className="h-8 w-8 rounded-lg bg-accent/20" />
          <div>
            <p className="text-sm font-semibold">Carla Channels</p>
            <p className="text-xs text-foreground/60">Automatización financiera</p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-foreground/10 ${
                    isActive ? 'bg-foreground/10 text-accent' : 'text-foreground'
                  }`
                }
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center justify-between rounded-lg border border-border/40 bg-foreground/5 px-3 py-2 text-xs text-foreground/70">
          <span>Tema</span>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Claro' : 'Oscuro'}
          </Button>
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-foreground/60">Operación en tiempo real</p>
            <h1 className="text-2xl font-semibold">Dashboard - Carla CRM</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-emerald-300 border-emerald-300/30">
              Sistema Activo
            </Badge>
            <Button variant="outline" size="sm" className="text-xs">
              Exportar reporte
            </Button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/conversaciones" element={<ConversacionesPage />} />
          <Route path="/transacciones" element={<TransaccionesPage />} />
          <Route path="/procesos" element={<ProcesosPage />} />
          <Route path="/config" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}
