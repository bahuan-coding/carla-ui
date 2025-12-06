# 14: Especificação de Tela - Conversas (CRM)

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Visão Geral

**Nome da Tela:** Conversas
**Rota:** `/conversations`

A tela de Conversas é o centro de comando para toda a interação com o cliente. Ela funciona como um sistema de CRM focado em WhatsApp, permitindo que os agentes visualizem, gerenciem e respondam a todas as conversas em um único lugar. O design deve ser otimizado para eficiência, clareza e multitarefa.

## 2. Estrutura do Layout

A tela adota um layout de três colunas, um padrão clássico e eficaz para aplicações de mensagens.

```
+----------------+--------------------------------+--------------------------+
|                |                                |                          |
|  Lista de      |                                |     Informação do        |
|  Conversas     |         Painel de Chat         |         Cliente          |
|                |                                |                          |
| (Coluna 1)     |          (Coluna 2)            |        (Coluna 3)        |
|                |                                |                          |
+----------------+--------------------------------+--------------------------+
```

-   **Coluna 1 (Lista de Conversas):** Uma lista rolável de todas as conversas, permitindo ao agente selecionar com qual cliente interagir.
-   **Coluna 2 (Painel de Chat):** Exibe o histórico de mensagens da conversa selecionada e permite o envio de novas mensagens.
-   **Coluna 3 (Painel de Informações):** Mostra informações contextuais sobre o cliente e a transação associada à conversa.

## 3. Composição e Especificações

### 3.1. Coluna 1: Lista de Conversas

-   **Largura:** Ocupa 3 de 12 colunas do grid principal.
-   **Container:** `bg-neutral-100 border-r border-neutral-300`.
-   **Cabeçalho da Lista:**
    -   **Título:** "Conversas".
    -   **Busca:** Um `Input` com um ícone de busca para filtrar conversas por nome do cliente ou conteúdo da mensagem.
    -   **Filtros:** Botões (`Button` variante `ghost`) para filtrar por status ("Todas", "Ativas", "Pendentes").
-   **Corpo da Lista:**
    -   Uma lista rolável do componente molécula `ConversationListItem`.
    -   O item selecionado deve ter o estado "Ativo" (`bg-primary/10`).

### 3.2. Coluna 2: Painel de Chat

-   **Largura:** Ocupa 6 de 12 colunas do grid principal.
-   **Container:** `bg-neutral-200` (um fundo ligeiramente mais escuro para diferenciar da lista).
-   **Cabeçalho do Chat:**
    -   Layout: `flex items-center gap-3 p-4 border-b border-neutral-300`.
    -   **Avatar:** Avatar do cliente (`md`).
    -   **Nome e Status:** Nome do cliente (`text-lg font-semibold`) e seu status (`text-sm text-neutral-700`).
    -   **Ações do Chat:** Botões de ícone (`ghost`) para ações como "Ligar", "Ver Perfil", etc.
-   **Corpo do Chat (Histórico de Mensagens):**
    -   Layout: Uma área rolável com `flex flex-col gap-4 p-6`.
    -   **Bolha de Mensagem (Cliente):**
        -   Estilo: `bg-neutral-100 rounded-lg p-3 max-w-lg`.
        -   Alinhamento: `self-start` (esquerda).
    -   **Bolha de Mensagem (Agente/Sistema):**
        -   Estilo: `bg-neutral-900 text-neutral-100 rounded-lg p-3 max-w-lg`.
        -   Alinhamento: `self-end` (direita).
    -   **Timestamp:** `text-xs text-neutral-700` abaixo de cada bolha.
-   **Rodapé do Chat (Área de Input):**
    -   Layout: `flex items-center gap-4 p-4 border-t border-neutral-300`.
    -   **Input de Mensagem:** Um `Textarea` que se expande verticalmente com o conteúdo.
    -   **Ações de Input:** Botões de ícone para "Anexar Arquivo" e "Enviar".

### 3.3. Coluna 3: Painel de Informações do Cliente

-   **Largura:** Ocupa 3 de 12 colunas do grid principal.
-   **Container:** `bg-neutral-100 border-l border-neutral-300`.
-   **Layout:** Uma série de `Cards` ou seções empilhadas verticalmente.
-   **Seção 1: Informação do Cliente:**
    -   Layout: `flex flex-col items-center p-6 text-center`.
    -   **Avatar:** Avatar do cliente (`lg`, `h-16 w-16`).
    -   **Nome:** `text-xl font-bold`.
    -   **Contato:** `text-sm text-neutral-700`.
-   **Seção 2: Detalhes da Transação:**
    -   Um `Card` com o título "Transação Atual".
    -   Lista de `key-value` pairs (ex: "Crédito Pessoal: $50,000").
    -   Uma barra de progresso (`Progress` de shadcn/ui) mostrando o avanço da transação.
-   **Seção 3: Histórico de Transações:**
    -   Um `Card` com o título "Histórico de Transações".
    -   Uma lista simples de transações anteriores.

## 4. Comportamento Responsivo

-   **Telas Médias (Tablet - `md`):**
    -   O painel de Informações do Cliente (Coluna 3) deve ser ocultado ou transformado em uma aba/modal acessível a partir do cabeçalho do chat.
    -   A Lista de Conversas (Coluna 1) e o Painel de Chat (Coluna 2) permanecem visíveis.
-   **Telas Pequenas (Mobile):**
    -   Apenas a Lista de Conversas (Coluna 1) é visível por padrão.
    -   Ao selecionar uma conversa, a tela deve navegar para uma nova visão que mostra apenas o Painel de Chat, com um botão de "Voltar" para a lista.

---

Esta estrutura de três colunas é projetada para maximizar a produtividade do agente, mantendo todas as informações relevantes visíveis e acessíveis sem a necessidade de mudar de contexto constantemente de tela.
