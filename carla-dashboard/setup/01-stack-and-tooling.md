# 01 - Stack & Tooling

- Framework: React 19 + Vite 7 + TypeScript 5.9, pnpm.
- UI: Tailwind 3.4, shadcn/Radix, lucide.
- Estado/dados: TanStack Query v5, Zustand, RHF + Zod.
- Build/Deploy: Netlify (prod/deploy-preview), `netlify dev` local.

Comandos base:
```bash
pnpm create vite carla-dashboard --template react-ts
pnpm install
pnpm add -D tailwindcss postcss autoprefixer
pnpm dlx tailwindcss init -p
pnpm dlx shadcn@latest init -y   # estilo New York, cor Neutral
pnpm dlx shadcn@latest add button input card dialog sheet tooltip dropdown-menu avatar badge tabs table toast skeleton
```

Alias e providers:
- Alias `@/*` em `tsconfig.*`.
- Providers globais: QueryClientProvider, Theme provider (class), Zustand store UI.

Scripts package.json:
- dev: `vite`
- build: `tsc -b && vite build`
- lint: `eslint .`
- preview: `vite preview`

