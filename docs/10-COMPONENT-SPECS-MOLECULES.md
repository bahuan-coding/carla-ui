# 10: Especificações de Componentes - Moléculas

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Visão Geral

As moléculas são grupos de átomos que funcionam juntos como uma unidade. Elas formam os componentes mais tangíveis da nossa interface, como campos de formulário e cards de informação. Esta especificação detalha como os átomos definidos anteriormente devem ser combinados para criar moléculas coesas e funcionais, seguindo a estética do Design System "Aura".

---

## 2. Card de KPI (`KpiCard`)

**Propósito:** Exibir uma métrica chave de performance (Key Performance Indicator) de forma proeminente no dashboard.

### Estrutura e Composição

Um `KpiCard` é composto pelos seguintes átomos:
-   **Card (Container):** O contêiner principal.
-   **Ícone (`Icon`):** Uma representação visual da métrica.
-   **Texto (`Text`):** Para o título, o valor e a variação.

### Especificação de Estilo

-   **Container (`Card`):**
    -   Estilo: `bg-neutral-100 border border-neutral-300 rounded-lg p-6`.
    -   Sombra: `shadow-sm`.

-   **Layout Interno:**
    -   Use Flexbox (`flex flex-col`) com um `gap-4` entre os elementos internos.

-   **Seção do Título:**
    -   Layout: `flex justify-between items-center`.
    -   **Título (Texto):** `text-base font-medium text-neutral-700` (ex: "Conversas Ativas").
    -   **Ícone (`Icon`):** `h-5 w-5 text-primary` (usar o Azul Elétrico para destaque).

-   **Seção do Valor:**
    -   **Valor Principal (Texto):** `text-3xl font-bold text-neutral-900` (ex: "245").

-   **Seção da Variação:**
    -   Layout: `flex items-center gap-2`.
    -   **Ícone de Variação (`Icon`):** `h-4 w-4`. Cor `text-feedback-success` para aumento, `text-feedback-error` para queda.
    -   **Texto da Variação:** `text-sm font-medium`. Cor correspondente ao ícone (ex: `text-feedback-success`).
    -   **Texto de Contexto:** `text-sm text-neutral-700` (ex: "vs. semana passada").

**Exemplo de Código (Conceitual):**
```jsx
<Card className="p-6">
  <div className="flex justify-between items-center">
    <p className="text-base font-medium text-neutral-700">Conversas Ativas</p>
    <MessageCircle className="h-5 w-5 text-primary" />
  </div>
  <div>
    <p className="text-3xl font-bold text-neutral-900">245</p>
  </div>
  <div className="flex items-center gap-2">
    <ArrowUpCircle className="h-4 w-4 text-feedback-success" />
    <span className="text-sm font-medium text-feedback-success">+12%</span>
    <span className="text-sm text-neutral-700">vs. semana passada</span>
  </div>
</Card>
```

---

## 3. Campo de Formulário (`FormField`)

**Propósito:** Agrupar um `Label` e um `Input` (e opcionalmente uma mensagem de erro/ajuda) em uma única unidade funcional para uso em formulários.

### Estrutura e Composição

-   **Container `div`:** Agrupa todos os elementos.
-   **Label:** O rótulo que descreve o campo.
-   **Input:** O campo de entrada de dados.
-   **Texto de Ajuda/Erro (`Text`):** Uma mensagem opcional que aparece abaixo do input.

### Especificação de Estilo

-   **Layout:** Use Flexbox (`flex flex-col`) com um `gap-2`.

-   **Label:**
    -   Estilo: `text-sm font-medium text-neutral-900`.

-   **Input:**
    -   Deve seguir a especificação do átomo `Input`.

-   **Texto de Ajuda/Erro:**
    -   **Ajuda:** `text-xs text-neutral-700` (ex: "Sua senha deve ter no mínimo 8 caracteres").
    -   **Erro:** `text-xs text-feedback-error` (ex: "Este campo é obrigatório").

**Exemplo de Código (Conceitual):**
```jsx
<div className="flex flex-col gap-2">
  <Label htmlFor="email" className="text-sm font-medium text-neutral-900">
    Email
  </Label>
  <Input id="email" type="email" placeholder="voce@exemplo.com" />
  <p className="text-xs text-feedback-error">Por favor, insira um email válido.</p>
</div>
```

---

## 4. Item de Lista de Conversa (`ConversationListItem`)

**Propósito:** Representar uma única conversa na lista da tela de CRM.

### Estrutura e Composição

-   **Container `div`:** O elemento clicável.
-   **Avatar:** Imagem ou iniciais do cliente.
-   **Texto:** Nome do cliente, última mensagem, timestamp.
-   **Badge:** Para status ou contagem de mensagens não lidas.

### Especificação de Estilo

-   **Container:**
    -   Layout: `flex items-center gap-4 p-3 rounded-lg`.
    -   **Estado Padrão:** `bg-transparent`.
    -   **Estado Hover:** `bg-neutral-200`.
    -   **Estado Ativo/Selecionado:** `bg-primary/10`.

-   **Avatar:**
    -   Tamanho: `h-10 w-10` (`md`).

-   **Conteúdo de Texto (Layout):**
    -   `flex-grow` para ocupar o espaço disponível.
    -   Layout interno: `flex flex-col`.

-   **Nome do Cliente (Texto):**
    -   `text-sm font-semibold text-neutral-900`.

-   **Última Mensagem (Texto):**
    -   `text-sm text-neutral-700 truncate` (usar `truncate` para evitar quebra de layout).

-   **Seção Direita (Layout):**
    -   Layout: `flex flex-col items-end gap-1`.

-   **Timestamp (Texto):**
    -   `text-xs text-neutral-700`.

-   **Badge de Não Lidas:**
    -   Estilo: `bg-primary text-neutral-100 h-5 w-5 flex items-center justify-center text-xs rounded-full`.

---

Estas moléculas formam a base para a construção de organismos mais complexos e garantem que a combinação de átomos seja sempre consistente e harmoniosa.
