# 18: Guia de Deployment - Netlify

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Visão Geral

Este documento fornece um guia completo e especializado para o deployment contínuo (CI/CD) do **Carla Channels Dashboard** na plataforma **Netlify**. O objetivo é estabelecer um fluxo de trabalho robusto, automatizado e otimizado, garantindo que cada `git push` para o repositório principal resulte em um deploy seguro e eficiente.

## 2. Estratégia de Deployment

Adotaremos uma estratégia de **Git-triggered builds**, onde o Netlify monitora nosso repositório GitHub e aciona builds automaticamente com base em commits e pull requests.

-   **Branch de Produção (`main`):** Cada push para a branch `main` acionará um deploy para o ambiente de produção (`carla-dashboard.netlify.app` ou domínio customizado).
-   **Pull Requests:** Cada pull request aberto contra a branch `main` gerará um **Deploy Preview**. Este é um ambiente de staging único e imutável, com sua própria URL, permitindo que a equipe revise as mudanças visualmente antes do merge.
-   **Branches de Feature:** Opcionalmente, podemos configurar o Netlify para criar **Branch Deploys** para outras branches, permitindo o teste de features em desenvolvimento.

## 3. Configuração do Projeto no Netlify

O projeto será conectado ao Netlify através da interface web, seguindo estes passos:

1.  **Criar um Novo Site:** No dashboard do Netlify, selecionar "Add new site" > "Import an existing project".
2.  **Conectar ao GitHub:** Autorizar o Netlify a acessar o repositório do projeto no GitHub.
3.  **Configurações de Build:** As configurações de build serão gerenciadas principalmente pelo arquivo `netlify.toml`, mas as configurações iniciais podem ser:
    -   **Base directory:** (deixar em branco se o `package.json` estiver na raiz)
    -   **Build command:** `pnpm build`
    -   **Publish directory:** `dist`

## 4. O Arquivo `netlify.toml`

Este arquivo, localizado na raiz do projeto, é o coração da nossa configuração de deployment. Ele garante que a configuração seja versionada junto com o código.

```toml
# /netlify.toml

# Configurações de Build Globais
[build]
  # Comando para construir o site (usando pnpm)
  command = "pnpm build"
  
  # Diretório de publicação (output do Vite)
  publish = "dist"
  
  # Variáveis de ambiente para o build
  [build.environment]
    NODE_VERSION = "18.14.0"
    # Garante que o pnpm seja usado
    NETLIFY_USE_PNPM = "true"

# Contexto de Produção
[context.production]
  # Variáveis de ambiente específicas para produção
  [context.production.environment]
    VITE_API_URL = "https://api.carla.money"
    NODE_ENV = "production"

# Contexto de Deploy Preview (para Pull Requests)
[context.deploy-preview]
  # Variáveis de ambiente para staging/preview
  [context.deploy-preview.environment]
    VITE_API_URL = "https://staging-api.carla.money"

# Regra de Redirect para SPAs (Single Page Applications)
# Isso garante que o roteamento do React funcione corretamente.
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Regras de Cabeçalhos (Headers) para Segurança e Cache
[[headers]]
  # Aplica a todos os paths
  for = "/*"
  [headers.values]
    # Previne clickjacking
    X-Frame-Options = "DENY"
    # Previne XSS
    X-XSS-Protection = "1; mode=block"
    # Força o uso de HTTPS
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    # Política de Segurança de Conteúdo (CSP) - Exemplo inicial
    # DEVE ser refinada para ser mais restritiva
    Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://api.carla.money https://staging-api.carla.money;"

[[headers]]
  # Aplica cache de longa duração para assets imutáveis
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## 5. Variáveis de Ambiente (Secrets)

Variáveis sensíveis, como tokens de API, **NÃO** devem ser colocadas no `netlify.toml`. Elas devem ser configuradas na UI do Netlify em **Site settings > Build & deploy > Environment**.

-   `VITE_CLERK_PUBLISHABLE_KEY`: Chave publicável para o serviço de autenticação.
-   `API_SIGNATURE_TOKEN`: Se estiver usando signed proxy redirects.

**Importante:** Para que as variáveis de ambiente sejam expostas ao código do cliente (React), elas **precisam** ser prefixadas com `VITE_`, conforme a convenção do Vite.

## 6. Otimizações e Melhores Práticas

-   **Cache de Dependências:** O Netlify automaticamente armazena em cache as dependências do `node_modules` (ou do store do `pnpm`) entre builds, acelerando o processo.
-   **Build Plugins:** Podemos adicionar plugins via `netlify.toml` para otimizar ainda mais. Um exemplo útil é o `netlify-plugin-check-links` para verificar links quebrados a cada deploy.
-   **Netlify Dev:** Para um desenvolvimento local que simula o ambiente Netlify (incluindo redirects, headers e environment variables), a equipe deve usar o Netlify CLI com o comando `netlify dev`.

## 7. Rollbacks

O Netlify mantém um histórico de todos os deploys. Se um deploy de produção introduzir um bug, podemos instantaneamente reverter para qualquer deploy anterior através da UI do Netlify com um único clique, garantindo uma recuperação rápida de falhas.

---

Esta documentação estabelece um pipeline de CI/CD de nível profissional no Netlify, garantindo que o Carla Channels Dashboard seja implantado de forma rápida, segura e confiável.
