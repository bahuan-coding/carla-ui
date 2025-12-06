# 16: Especificação de Tela - Processos

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Visão Geral

**Nome da Tela:** Processos
**Rota:** `/processes`

A tela de Processos é o centro de gerenciamento para os fluxos de automação do WhatsApp. Aqui, os usuários (geralmente administradores ou gestores) podem criar, visualizar, editar e analisar o desempenho dos diferentes fluxos de trabalho automatizados que a Carla oferece, como "Abertura de Conta de Poupança" ou "Solicitação de Crédito Pessoal".

## 2. Estrutura do Layout

O layout desta tela é baseado em um **grid de cards**. Cada card representa um processo de automação, fornecendo um resumo visual e acesso rápido a ações. Esta abordagem é mais visual e menos densa que uma tabela, adequada para gerenciar um número moderado de itens.

```
+----------------------------------------------------------------------------+
| Header: Processos                                                          |
+----------------------------------------------------------------------------+
|                                                                            |
| +------------------------------------------------------------------------+ |
| | Ações da Página (Busca, Botão "Novo Processo")                         | |
| +------------------------------------------------------------------------+ |
|                                                                            |
| +------------------+  +------------------+  +------------------+           |
| | Card de Processo |  | Card de Processo |  | Card de Processo |           |
| |                  |  |                  |  |                  |           |
| +------------------+  +------------------+  +------------------+           |
|                                                                            |
| +------------------+  +------------------+  +------------------+           |
| | Card de Processo |  | Card de Processo |  | Card de Processo |           |
| |                  |  |                  |  |                  |           |
| +------------------+  +------------------+  +------------------+           |
|                                                                            |
+----------------------------------------------------------------------------+
```

## 3. Composição e Especificações

### 3.1. Cabeçalho da Tela (`Header`)

-   **Título:** "Processos de WhatsApp"
-   **Subtítulo:** "Gerencie e visualize todos os seus fluxos automatizados"

### 3.2. Ações da Página

-   **Layout:** Uma barra de ações localizada abaixo do cabeçalho da tela.
-   **Busca:** Um `Input` com um ícone de busca para filtrar processos por nome.
-   **Botão de Ação Principal:** Um `Button` primário com o texto "+ Novo Processo" para iniciar o fluxo de criação de um novo processo de automação.

### 3.3. Grid de Processos

-   **Layout:** Um grid responsivo com 3 colunas em telas grandes (`lg`), 2 em telas médias (`md`), e 1 em telas pequenas (`sm`). O espaçamento (`gap`) entre os cards deve ser de `32px` (`gap-8`).

### 3.4. Card de Processo (`ProcessCard` - Molécula)

**Propósito:** Representar um único fluxo de automação de forma resumida e acionável.

#### Estrutura e Composição

-   **Container (`Card`):** O contêiner principal.
-   **Cabeçalho do Card:** Título do processo e um `Badge` de status.
-   **Corpo do Card:** Descrição e estatísticas de uso.
-   **Rodapé do Card:** Ações (botão de editar e menu de mais opções).

#### Especificação de Estilo

-   **Container (`Card`):**
    -   Estilo: `bg-neutral-100 border border-neutral-300 rounded-lg p-6 flex flex-col`.
    -   Altura: Deve ter uma altura fixa (`h-64` ou similar) para garantir o alinhamento no grid.

-   **Cabeçalho do Card:**
    -   Layout: `flex justify-between items-start`.
    -   **Título:** `text-lg font-semibold text-neutral-900` (ex: "Abertura de Conta de Aforro").
    -   **Badge de Status:** `Badge` com o status do processo (ex: "Ativo" - variante Sucesso, "Rascunho" - variante Alerta).

-   **Corpo do Card:**
    -   Layout: `flex-grow` para ocupar o espaço disponível.
    -   **Descrição:** `text-sm text-neutral-700 mt-2` (ex: "Processo completo de abertura de conta com validações de KYC").
    -   **Estatísticas:**
        -   Layout: `flex items-center gap-4 mt-4`.
        -   Componente: Ícone + Texto (ex: `<Users className="h-4 w-4" /> 12 passos`, `<Clock className="h-4 w-4" /> Faz 2 horas`).

-   **Rodapé do Card:**
    -   Layout: `flex justify-between items-center mt-auto pt-4 border-t border-neutral-300`.
    -   **Estatística Principal:** `text-sm font-medium text-neutral-900` (ex: "▷ 234 usos este mês").
    -   **Ações:**
        -   `Button` secundário com texto "Editar".
        -   `DropdownMenu` com ícone `MoreHorizontal` para outras ações ("Duplicar", "Arquivar", "Ver Análise").

## 4. Fluxo de Criação/Edição (Modal ou Nova Página)

-   Ao clicar em "+ Novo Processo" ou "Editar", o usuário será levado a uma nova página ou um modal de tela cheia.
-   Esta interface de edição será um construtor visual de fluxos (fora do escopo desta especificação inicial), permitindo ao usuário adicionar e conectar etapas do processo de automação.

---

Esta tela capacita os usuários a gerenciar o coração da automação da Carla. O design de cards permite uma visualização rápida e agradável dos processos disponíveis, incentivando a exploração e a otimização dos fluxos.
