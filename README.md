# Carla Channels Dashboard

Dashboard fintech WhatsApp-first para cooperativas de crédito. Interface moderna com estética dark crystal, data visualization avançada e CRM integrado.

## Stack

- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS** + **shadcn/ui** + **Radix UI**
- **TanStack Query** + **Zustand** + **React Hook Form** + **Zod**
- **Recharts** para visualização de dados
- **Lucide Icons** para iconografia

## Telas

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard com KPIs, atividade semanal e distribuição de processos |
| `/conversations` | CRM de conversas WhatsApp com chat em tempo real |
| `/transactions` | Tabela de transações com filtros e paginação |
| `/processes` | Gestão de fluxos de automação WhatsApp |

## Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Servidor de desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Lint
pnpm lint
```

## Deploy

Deploy automatizado via Netlify:

- **main** → Produção
- **Pull Requests** → Deploy Preview

Configuração em `netlify.toml`.

## Documentação

| Arquivo | Conteúdo |
|---------|----------|
| `docs/design-system.md` | Design System "Aura" |
| `docs/components.md` | Biblioteca de componentes |
| `docs/screens.md` | Especificação das telas |
| `docs/tech-stack.md` | Stack tecnológico |
| `docs/deployment.md` | Guia de deploy Netlify |
| `docs/api-integration.md` | Integração com APIs |
| `docs/admin-api.md` | Especificação Admin API |

## Variáveis de Ambiente

```env
VITE_API_URL=https://x.carla.money
```
