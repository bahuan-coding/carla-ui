# 20: Desenvolvimento Local com Netlify Dev

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Introdução

O **Netlify Dev** é uma ferramenta CLI que permite aos desenvolvedores replicar o ambiente de produção do Netlify localmente. Isso significa que você pode testar redirects, headers, variáveis de ambiente e até mesmo serverless functions antes de fazer push para o repositório. Para o nosso projeto React + Vite, o Netlify Dev fornece uma experiência de desenvolvimento que é praticamente idêntica ao ambiente de produção.

## 2. Instalação do Netlify CLI

Antes de usar o Netlify Dev, é necessário instalar o Netlify CLI globalmente:

```bash
# Usando npm
npm install -g netlify-cli

# Ou usando pnpm (recomendado)
pnpm add -g netlify-cli
```

Após a instalação, você pode verificar a versão com:

```bash
netlify --version
```

## 3. Autenticação

Para conectar o Netlify CLI ao seu site do Netlify:

```bash
netlify login
```

Este comando abrirá um navegador para você autenticar com sua conta do Netlify. Após a autenticação bem-sucedida, o CLI armazenará um token de acesso localmente.

## 4. Inicializando o Projeto

Se você ainda não tiver um projeto do Netlify criado, execute:

```bash
netlify init
```

Este comando o guiará através do processo de criação de um novo site no Netlify, associando-o ao seu repositório Git. Se você já tiver um site criado, o CLI detectará automaticamente.

## 5. Executando o Netlify Dev

Para iniciar o servidor de desenvolvimento local com emulação do Netlify:

```bash
netlify dev
```

Este comando fará o seguinte:

1.  Iniciará o servidor de desenvolvimento do Vite (normalmente em `http://localhost:3000` ou `http://localhost:5173`).
2.  Iniciará um proxy do Netlify que emula o ambiente de produção, incluindo redirects, headers e variáveis de ambiente.
3.  Exibirá a URL local (normalmente `http://localhost:8888`) onde você pode acessar o site.

## 6. Variáveis de Ambiente Locais

Quando você executa `netlify dev`, o CLI automaticamente carrega as variáveis de ambiente do arquivo `.env.local` (se existir) e também as variáveis configuradas no Netlify UI para o contexto `dev`.

Para adicionar variáveis de ambiente locais, crie um arquivo `.env.local` na raiz do projeto:

```bash
# .env.local
VITE_API_URL=http://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

**Importante:** Nunca comite o arquivo `.env.local` no Git. Adicione-o ao `.gitignore`:

```bash
# .gitignore
.env.local
.env.*.local
```

## 7. Testando Redirects e Headers Localmente

Um dos principais benefícios do Netlify Dev é a capacidade de testar redirects e headers localmente. Quando você executa `netlify dev`, o proxy do Netlify lê o arquivo `netlify.toml` e aplica as regras de redirect e headers.

Para testar a regra de SPA redirect (que redireciona todas as rotas para `index.html`):

1.  Acesse `http://localhost:8888/conversations` (ou qualquer rota do React Router).
2.  Você deve ser servido com `index.html`, permitindo que o React Router assuma o controle do roteamento.

Para testar headers de segurança, você pode usar as developer tools do navegador:

1.  Abra as Developer Tools (F12).
2.  Vá para a aba "Network".
3.  Recarregue a página.
4.  Clique em qualquer requisição e vá para a aba "Response Headers".
5.  Você deve ver os headers customizados que definimos no `netlify.toml` (ex: `Strict-Transport-Security`, `X-Frame-Options`).

## 8. Debugging e Logs

Para ver mais detalhes sobre o que está acontecendo durante o build e o serve, você pode adicionar a flag `--debug`:

```bash
netlify dev --debug
```

Isso exibirá logs verbosos, úteis para diagnosticar problemas.

## 9. Sincronizando Variáveis de Ambiente do Netlify

Se você tiver variáveis de ambiente configuradas no Netlify UI, pode sincronizá-las localmente com:

```bash
netlify env:pull
```

Este comando criará um arquivo `.env` local com as variáveis do Netlify (exceto as sensíveis como tokens). Você pode então renomear ou copiar este arquivo para `.env.local` conforme necessário.

---

O Netlify Dev é uma ferramenta poderosa que garante que o que você testa localmente é exatamente o que será implantado em produção, eliminando a surpresa de "funciona localmente mas não em produção".
