# Stack de Tecnologia

## Stack Principal

| Categoria | Tecnologia | Versão | Justificativa |
| :--- | :--- | :--- | :--- |
| **Framework** | React | `19+` | Interfaces de usuário complexas e reativas. |
| **Build Tool** | Vite | `7+` | HMR instantâneo e build otimizado. |
| **Linguagem** | TypeScript | `5+` | Tipagem estática para robustez. |
| **Estilização** | Tailwind CSS | `3.4+` | Controle total sobre estilos. |

## Componentes e UI

| Categoria | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Componentes** | shadcn/ui | Customização total e propriedade do código. |
| **Primitivas** | Radix UI | Acessibilidade e comportamento headless. |
| **Ícones** | Lucide Icons | SVG leve e consistente. |

## Estado e Dados

| Categoria | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Estado do Servidor** | TanStack Query v5 | Fetching, caching, sincronização. |
| **Estado Global** | Zustand 4.5+ | Gerenciamento de estado minimalista. |
| **Formulários** | React Hook Form 7+ | Performance otimizada em forms. |
| **Validação** | Zod | Schemas com inferência de tipos. |

## Ferramentas de Desenvolvimento

| Categoria | Tecnologia |
| :--- | :--- |
| **Pacotes** | pnpm |
| **Linter** | ESLint |
| **Formatação** | Prettier |

## Setup Inicial

```bash
pnpm create vite carla-dashboard --template react-ts
cd carla-dashboard
pnpm install
pnpm dlx shadcn-ui@latest init
```


