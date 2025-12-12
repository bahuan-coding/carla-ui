import { ArrowLeftRight, Search, Filter, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const sampleTransactions = [
  { id: '1', type: 'out', amount: 1500, currency: 'GTQ', recipient: 'Juan Pérez', status: 'completed', date: '2024-01-15' },
  { id: '2', type: 'in', amount: 3200, currency: 'GTQ', recipient: 'María García', status: 'completed', date: '2024-01-14' },
  { id: '3', type: 'out', amount: 850, currency: 'GTQ', recipient: 'Carlos López', status: 'pending', date: '2024-01-14' },
  { id: '4', type: 'in', amount: 5000, currency: 'GTQ', recipient: 'Ana Martínez', status: 'completed', date: '2024-01-13' },
  { id: '5', type: 'out', amount: 2100, currency: 'GTQ', recipient: 'Roberto Sánchez', status: 'failed', date: '2024-01-12' },
];

export function TransaccionesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ArrowLeftRight className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-xl text-foreground">Transacciones</h1>
            <p className="text-xs text-muted-foreground">Historial de movimientos y transferencias</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl">
            <Download size={14} />
            Exportar
          </Button>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            placeholder="Buscar transacción..."
            className="pl-10 h-11 bg-muted/30 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500/50"
          />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
          <Filter size={16} />
        </Button>
      </div>

      {/* Transactions List */}
      <div className="rounded-2xl border border-border/30 bg-card/50 overflow-hidden divide-y divide-border/20">
        {sampleTransactions.map((tx) => (
          <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              tx.type === 'in' ? 'bg-emerald-500/10' : 'bg-red-500/10'
            }`}>
              {tx.type === 'in' ? (
                <ArrowDownLeft size={18} className="text-emerald-600" />
              ) : (
                <ArrowUpRight size={18} className="text-red-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{tx.recipient}</p>
              <p className="text-xs text-muted-foreground">{tx.date}</p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${tx.type === 'in' ? 'text-emerald-600' : 'text-foreground'}`}>
                {tx.type === 'in' ? '+' : '-'}Q{tx.amount.toLocaleString()}
              </p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                tx.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                'bg-red-500/10 text-red-600'
              }`}>
                {tx.status === 'completed' ? 'Completado' : tx.status === 'pending' ? 'Pendiente' : 'Fallido'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

