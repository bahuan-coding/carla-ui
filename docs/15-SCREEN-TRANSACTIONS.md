# 15: Especificação de Tela - Transações

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Visão Geral

**Nome da Tela:** Transações
**Rota:** `/transactions`

A tela de Transações oferece uma visão completa e gerenciável de todos os processos e fluxos de trabalho em andamento. Diferente do Dashboard, que é uma visão de alto nível, esta tela é uma ferramenta de trabalho operacional para agentes e gestores acompanharem o status detalhado de cada solicitação, desde a abertura de conta até a aprovação de crédito.

## 2. Estrutura do Layout

O layout é centrado em um único e poderoso organismo: a **Tabela de Dados (`DataTable`)**. O objetivo é apresentar uma grande quantidade de informação de forma clara, escaneável e acionável.

```
+----------------------------------------------------------------------------+
| Header: Transações                                                         |
+----------------------------------------------------------------------------+
|                                                                            |
| +------------------------------------------------------------------------+ |
| | Título da Tabela e Ações (Filtros, Busca, Adicionar Novo)              | |
| +------------------------------------------------------------------------+ |
| |                                                                        | |
| |                            Tabela de Dados                             | |
| |                                                                        | |
| +------------------------------------------------------------------------+ |
| |                      Rodapé da Tabela (Paginação)                      | |
| +------------------------------------------------------------------------+ |
|                                                                            |
+----------------------------------------------------------------------------+
```

## 3. Composição e Especificações

### 3.1. Cabeçalho da Tela (`Header`)

-   **Título:** "Transações"
-   **Ações Globais:**
    -   **Visualização:** Botões de ícone para alternar entre a visão de Tabela (`Table`) e a visão Kanban (`Kanban`). A visão de Tabela é a padrão.

### 3.2. Organismo `DataTable`

-   **Componente:** `DataTable` (Organismo).
-   **Container:** O organismo inteiro é envolvido em um `Card` sem padding (`p-0`).

#### 3.2.1. Cabeçalho da Tabela

-   **Layout:** `flex justify-between items-center p-6`.
-   **Busca:** Um `Input` com um ícone de busca para filtrar transações por cliente, processo ou ID.
-   **Filtros:** `DropdownMenu` para filtrar por "Todos os Processos" e "Todas as Prioridades".

#### 3.2.2. Tabela

-   **Componente:** `Table` de `shadcn/ui`.
-   **Colunas da Tabela:**

| Cabeçalho | Conteúdo da Célula | Especificação do Componente |
| :--- | :--- | :--- |
| **Cliente** | Avatar e Nome do Cliente | Molécula `UserCell` (Avatar + Texto). |
| **Processo** | Nome do Processo | Texto (`text-sm`). |
| **Etapa Atual** | Nome da Etapa Atual | `Badge` (variante neutra). |
| **Progresso** | Barra de Progresso | `Progress` de `shadcn/ui`, usando a cor `primary`. |
| **Tempo** | Tempo decorrido na etapa | Texto (`text-sm text-neutral-700`). |
| **Prioridade** | Nível de Prioridade | `Badge` (variantes semânticas: Erro para Alta, Alerta para Média, Sucesso para Baixa). |
| **Tags** | Tags associadas | Múltiplos `Badges` (variante neutra). |
| **Ações** | Botões de Ação | `DropdownMenu` com ícone `MoreHorizontal`, contendo ações como "Ver Detalhes", "Reatribuir", etc. |

-   **Estilo das Linhas e Células:**
    -   As linhas devem ter um estado de `hover` (`bg-neutral-200/50`) para indicar interatividade.
    -   O conteúdo das células deve ser alinhado à esquerda, com padding vertical e horizontal (`px-6 py-4`).

#### 3.2.3. Rodapé da Tabela

-   **Componente:** Controles de paginação.
-   **Layout:** `flex justify-between items-center p-4 border-t border-neutral-300`.
-   **Funcionalidade:** Deve permitir ao usuário navegar entre as páginas de resultados, ir para a primeira/última página e ver a contagem total de itens.

## 4. Visão Kanban (Alternativa)

-   **Acionamento:** Clicar no ícone de Kanban no cabeçalho da tela.
-   **Layout:** A tela muda para um layout de colunas, onde cada coluna representa uma etapa do processo (ex: "Documentação", "KYC", "Aprovação").
-   **Componentes:**
    -   **Coluna Kanban:** Um container vertical para cada etapa.
    -   **Card de Transação:** Um card menor e simplificado que representa uma transação. Ele pode ser arrastado e solto (`drag-and-drop`) entre as colunas.
    -   **Funcionalidade Drag-and-Drop:** Requer uma biblioteca como `dnd-kit` para ser implementada.

## 5. Comportamento Responsivo

-   **Telas Médias e Pequenas (Tablet/Mobile):**
    -   Tabelas de dados são notoriamente difíceis em telas pequenas. A estratégia principal é a **rolagem horizontal**. A tabela manterá seu layout, e o usuário poderá rolar horizontalmente para ver todas as colunas.
    -   Como alternativa, em telas muito pequenas, a tabela pode ser transformada em uma lista de `Cards`, onde cada card representa uma linha e exibe as informações mais importantes verticalmente.

---

Esta tela é fundamental para o gerenciamento diário das operações. O design deve priorizar a densidade da informação sem sacrificar a clareza e a facilidade de uso.
