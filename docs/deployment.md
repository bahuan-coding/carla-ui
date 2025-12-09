# Deployment - Netlify

## Estratégia

- **Branch `main`:** Deploy para produção.
- **Pull Requests:** Deploy Preview automático.
- **Feature branches:** Branch Deploys opcionais.

## Configuração (`netlify.toml`)

```toml
[build]
  command = "pnpm build"
  publish = "dist"
  [build.environment]
    NODE_VERSION = "18.14.0"
    NETLIFY_USE_PNPM = "true"

[context.production.environment]
  VITE_API_URL = "https://x.carla.money"
  NODE_ENV = "production"

[context.deploy-preview.environment]
  VITE_API_URL = "https://x.carla.money"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## Variáveis de Ambiente

Configurar na UI do Netlify (Site settings > Build & deploy > Environment):

- `VITE_API_URL` - URL da API
- `VITE_API_TOKEN` - Token da API (se necessário)

**Nota:** Variáveis expostas ao cliente devem ser prefixadas com `VITE_`.

## Desenvolvimento Local

```bash
pnpm add -g netlify-cli
netlify login
netlify dev  # Emula redirects, headers e env
```

## Rollback

O Netlify mantém histórico de deploys. Reverter para deploy anterior com um clique na UI.




