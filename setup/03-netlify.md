# 03 - Netlify

Arquivo raiz `netlify.toml`:
- build: `pnpm build`, publish `dist`.
- env build: `NODE_VERSION=18.14.0`, `NETLIFY_USE_PNPM=true`.
- contexts: production (`VITE_API_URL=https://api.carla.money`), deploy-preview (`VITE_API_URL=https://staging-api.carla.money`).
- Redirect SPA: `/* -> /index.html 200`.
- Headers: X-Frame-Options DENY, X-XSS-Protection, HSTS, CSP (ajustar se novos domínios), cache /assets/* immutable.

Variáveis via UI Netlify (Site settings > Build & deploy > Environment):
- `VITE_API_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `API_SIGNATURE_TOKEN` (se proxy), outras chaves públicas.

CLI fluxo:
```bash
pnpm add -g netlify-cli
netlify login
netlify init
netlify dev      # emula redirects/headers/env
netlify env:pull # opcional sync local
```

CI/CD:
- main -> produção.
- PR -> Deploy Preview.
- Branch deploy opcional para features.

Checklist:
- CSP revisada ao adicionar integrações (analytics, fonts externas).
- `netlify dev` deve servir rotas internas (SPA) e aplicar headers.

