# 10 - Quality (A11y/Perf/Test)

Acessibilidade:
- Focus ring visível, labels/aria em inputs/botões, contraste WCAG.
- Navegação por teclado nas listas/tabelas/chat; skip links.

Performance:
- Code splitting por rota; lazy de gráficos pesados.
- Memo para listas e tabelas; virtualization (Transacciones) se necessário.
- Evitar re-render via Zustand selectors e query keys estáveis.

Testing/Checks:
- `pnpm lint`
- `pnpm build`
- `netlify dev` (redirect SPA, headers, envs).
- Smoke manual: chat enviar/receber (mock/WS), filtros tabela, gráficos com dados mock, tema claro/escuro.

