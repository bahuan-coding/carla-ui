import { useEffect } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { useUiStore } from '@/stores/ui';
import { BrainCircuit, ChartPie, MessageCircle, Settings, Workflow } from 'lucide-react';
import { DashboardPage } from '@/pages/Dashboard';
import { ConversacionesPage } from '@/pages/Conversaciones';
import { TransaccionesPage } from '@/pages/Transacciones';
import { ProcesosPage } from '@/pages/Procesos';

const nav = [
  { to: '/', label: 'Dashboard', icon: ChartPie },
  { to: '/conversaciones', label: 'Conversaciones', icon: MessageCircle },
  { to: '/transacciones', label: 'Transacciones', icon: BrainCircuit },
  { to: '/procesos', label: 'Procesos', icon: Workflow },
  { to: '/config', label: 'Configuración', icon: Settings },
];

export default function App() {
  const { theme, setTheme, period, setPeriod, sidebarOpen, setSidebarOpen } = useUiStore();
  const apiUrl = import.meta.env.VITE_API_URL || 'VITE_API_URL não definido';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0b1020] via-[#0c1428] to-[#0b1020] text-foreground">
      <aside
        className={`fixed left-0 top-0 z-30 h-full w-64 border-r border-border/40 bg-background/50 p-4 backdrop-blur-xl transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="mb-6 flex items-center justify-between gap-2 rounded-xl border border-border/40 bg-foreground/5 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent/20" />
            <div>
              <p className="text-sm font-semibold">Carla Channels</p>
              <p className="text-xs text-foreground/60">Automatización financiera</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            ×
          </Button>
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
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-6 rounded-lg border border-border/40 bg-foreground/5 px-3 py-2 text-xs text-foreground/70">
          <p className="font-semibold text-foreground/80">API</p>
          <p className="truncate text-foreground/60">{apiUrl}</p>
        </div>
        <div className="mt-auto flex items-center justify-between rounded-lg border border-border/40 bg-foreground/5 px-3 py-2 text-xs text-foreground/70">
          <span>Tema</span>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Claro' : 'Oscuro'}
          </Button>
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/30 bg-background/60 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </Button>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-foreground/60">Operación en tiempo real</p>
              <h1 className="text-2xl font-semibold">Carla Channels Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as typeof period)}
              className="rounded-lg border border-border/50 bg-foreground/5 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">30 días</option>
              <option value="90d">90 días</option>
            </select>
            <Badge variant="outline" className="text-xs text-emerald-300 border-emerald-300/30">
              Sistema Activo
            </Badge>
            <Button variant="outline" size="sm" className="text-xs">
              Exportar
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
      <Toaster />
    </div>
  );
}
