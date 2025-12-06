# 21: Troubleshooting e Otimizações - Netlify

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Problemas Comuns e Soluções

### 1.1. Build Falha com Erro de Dependências

**Sintoma:** O build falha com mensagens como `npm ERR! 404 Not Found` ou `ENOENT: no such file or directory`.

**Causa:** Geralmente, há um mismatch entre o gerenciador de pacotes usado localmente e o esperado pelo Netlify, ou uma dependência não foi instalada corretamente.

**Solução:**

1.  Certifique-se de que o arquivo `package-lock.json` (para npm) ou `pnpm-lock.yaml` (para pnpm) está versionado no Git.
2.  Verifique se a variável de ambiente `NETLIFY_USE_PNPM` está configurada como `true` no `netlify.toml` (já que usamos pnpm).
3.  Limpe o cache do Netlify e retrigger o build através da UI do Netlify.

### 1.2. Variáveis de Ambiente Não Estão Disponíveis no Build

**Sintoma:** O build é bem-sucedido, mas a aplicação não consegue acessar variáveis de ambiente como `VITE_API_URL`.

**Causa:** Variáveis de ambiente podem não estar configuradas corretamente ou não têm o escopo correto.

**Solução:**

1.  Verifique se a variável está configurada na UI do Netlify em **Site settings > Build & deploy > Environment**.
2.  Certifique-se de que o escopo inclui **Builds**.
3.  Para variáveis que devem ser expostas ao código do cliente (React), elas **devem** ser prefixadas com `VITE_`.
4.  Verifique se a variável está definida no contexto correto (`production`, `deploy-preview`, etc.).

### 1.3. Rotas do React Router Retornam 404

**Sintoma:** Ao acessar uma rota como `/conversations` diretamente, o navegador retorna um erro 404.

**Causa:** A regra de redirect para SPA não está configurada ou está incorreta.

**Solução:**

1.  Verifique se o arquivo `netlify.toml` contém a seguinte regra:
    ```toml
    [[redirects]]
      from = "/*"
      to = "/index.html"
      status = 200
    ```
2.  Certifique-se de que o arquivo está na raiz do repositório.
3.  Teste localmente com `netlify dev` para confirmar que o redirect funciona.

### 1.4. Deploy Preview Usa a API de Produção em Vez de Staging

**Sintoma:** Ao revisar um Deploy Preview, a aplicação está se conectando à API de produção em vez da API de staging.

**Causa:** A variável de ambiente `VITE_API_URL` não está configurada corretamente para o contexto `deploy-preview`.

**Solução:**

1.  Verifique o `netlify.toml` e certifique-se de que o contexto `deploy-preview` está definido:
    ```toml
    [context.deploy-preview]
      [context.deploy-preview.environment]
        VITE_API_URL = "https://staging-api.carla.money"
    ```
2.  Se a variável estiver configurada na UI, certifique-se de que está no contexto correto.

---

## 2. Otimizações de Performance

### 2.1. Reduzir o Tempo de Build

O tempo de build é crítico para a experiência de desenvolvimento. Aqui estão algumas estratégias para otimizá-lo:

**1. Usar Cache de Dependências:**
O Netlify automaticamente armazena em cache as dependências entre builds. Para garantir que o cache seja eficaz:
- Mantenha o arquivo `pnpm-lock.yaml` atualizado e versionado.
- Evite alterar versões de dependências desnecessariamente.

**2. Lazy Loading de Componentes:**
Use `React.lazy()` e `Suspense` para dividir o código em chunks menores, reduzindo o tamanho do bundle inicial.

```typescript
// Exemplo
const ConversationsPage = React.lazy(() => import('./pages/Conversations'));

// No componente pai
<Suspense fallback={<LoadingSpinner />}>
  <ConversationsPage />
</Suspense>
```

**3. Tree Shaking:**
Certifique-se de que as dependências suportam tree shaking. O Vite já faz isso automaticamente para módulos ES6.

### 2.2. Otimizar o Tamanho do Bundle

**1. Analisar o Bundle:**
Use a ferramenta `vite-plugin-visualizer` para visualizar o tamanho do bundle:

```bash
pnpm add -D vite-plugin-visualizer
```

Adicione ao `vite.config.ts`:

```typescript
import { visualizer } from "rollup-plugin-visualizer";

export default {
  plugins: [
    visualizer({
      open: true, // Abre o relatório automaticamente após o build
    }),
  ],
};
```

**2. Minificação:**
O Vite minifica automaticamente o código em produção. Certifique-se de que o modo de produção está ativado durante o build.

### 2.3. Otimizar Cache de Assets

Assets estáticos (imagens, fonts) devem ser cacheados por um longo período. O `netlify.toml` já contém uma regra para isso:

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 3. Monitoramento e Alertas

### 3.1. Configurar Notificações de Falha de Deploy

O Netlify pode enviar notificações quando um deploy falha. Configure isso em **Site settings > Build & deploy > Deploy notifications**.

### 3.2. Usar Build Plugins para Verificações Adicionais

Você pode adicionar plugins ao `netlify.toml` para executar verificações adicionais durante o build:

```toml
[[plugins]]
  package = "netlify-plugin-check-links"
  
  [plugins.inputs]
    # Verificar links internos
    checkInternal = true
    # Verificar links externos
    checkExternal = false
```

---

## 4. Segurança

### 4.1. Validar Secrets

Nunca coloque secrets ou tokens no `netlify.toml` ou no código. Use a UI do Netlify para configurar variáveis sensíveis.

### 4.2. Revisar Política de CSP

A Política de Segurança de Conteúdo (CSP) definida no `netlify.toml` deve ser a mais restritiva possível. Se você adicionar novos recursos (ex: Google Analytics), atualize a CSP para permitir esses recursos.

---

Esta documentação fornece as ferramentas e conhecimentos necessários para diagnosticar e resolver problemas comuns, bem como otimizar o desempenho e a segurança do deployment no Netlify.
