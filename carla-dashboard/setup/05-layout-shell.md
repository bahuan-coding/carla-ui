# 05 - Layout & Shell

Providers globais:
- QueryClientProvider (TanStack Query).
- Theme (classe `dark` por default; toggle light/dark).
- Zustand store UI (sidebar, tema, toasts).

Router:
- Rotas: `/` (Dashboard), `/conversaciones`, `/transacciones`, `/procesos`, `/config`.
- Future: `/procesos/:id`, `/conversaciones/:id`.

Shell:
- Sidebar fixa com ícones (lucide) e labels em espanhol.
- Header com título, período/filtros, export/acciones, estado do sistema.
- Main com container responsivo (max-w-6xl/7xl) e grid adaptativo (xl/2xl densidade alta).
- Suporte mobile: drawer para sidebar, header compacto.

Estados:
- Loading: skeletons para cards/listas/tabelas.
- Empty/error: mensagens claras em espanhol + CTA reintentar/crear.

