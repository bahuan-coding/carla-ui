# 12: Visão Geral das Telas e Navegação

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Introdução

Este documento descreve a arquitetura de informação e a estrutura de navegação do **Carla Channels Dashboard**. Ele fornece uma visão geral de alto nível das principais telas da aplicação e como elas se conectam para criar um fluxo de usuário coeso e intuitivo. O objetivo é garantir que o usuário possa navegar pela plataforma de forma eficiente, entendendo claramente o propósito de cada seção.

## 2. Arquitetura de Layout Principal

O layout da aplicação é consistente em todas as telas e é composto por três organismos principais:

1.  **Menu Lateral Fixo (`Sidebar`):** Localizado à esquerda, contém a navegação principal e persistente da aplicação. É a principal ferramenta de orientação do usuário.
2.  **Cabeçalho da Aplicação (`Header`):** Localizado no topo da área de conteúdo, exibe o título da página atual, ações contextuais e o menu do usuário.
3.  **Área de Conteúdo Principal (`Main Content`):** O espaço central e dinâmico onde o conteúdo específico de cada tela é renderizado.

```
+----------------------+----------------------------------------------------+
|                      |                                                    |
|      Sidebar         |                      Header                          |
|                      |                                                    |
+----------------------+----------------------------------------------------+
|                      |                                                    |
|                      |                                                    |
|                      |                                                    |
|                      |                                                    |
|      (Navegação)     |                 Main Content Area                  |
|                      |                                                    |
|                      |                                                    |
|                      |                                                    |
|                      |                                                    |
+----------------------+----------------------------------------------------+
```

## 3. Fluxo de Navegação e Telas Principais

A navegação principal, localizada na `Sidebar`, dará acesso às seguintes telas:

| Ícone (Lucide) | Nome da Tela | Rota (Exemplo) | Propósito Principal |
| :--- | :--- | :--- | :--- |
| `LayoutDashboard` | **Dashboard** | `/` | Fornecer uma visão geral e em tempo real das métricas e atividades mais importantes (KPIs, atividade semanal, distribuição de processos). É a tela inicial da aplicação. |
| `MessageCircle` | **Conversas** | `/conversations` | Gerenciar todas as interações com os clientes via WhatsApp. Funciona como um CRM, permitindo visualizar históricos, responder mensagens e acompanhar o status de cada conversa. |
| `ArrowRightLeft` | **Transações** | `/transactions` | Visualizar e gerenciar o fluxo de todas as transações e processos em andamento em uma visão de tabela detalhada. Permite acompanhar etapas, progresso e prioridades. |
| `Workflow` | **Processos** | `/processes` | Gerenciar e visualizar os fluxos de automação do WhatsApp. Permite criar, editar e ver o desempenho de processos como "Abertura de Conta" ou "Solicitação de Crédito". |
| `Settings` | **Configuração** | `/settings` | Gerenciar as configurações da conta, integrações, usuários e outras preferências da plataforma. |

## 4. Descrição Detalhada das Telas

### 4.1. Dashboard (BI)
-   **Objetivo:** Dar ao usuário um pulso rápido e visual da operação. Responder à pergunta: "Como estamos agora?".
-   **Componentes Chave:** `KpiCard`, Gráficos de Barra (`BarChart`), Gráficos de Rosca (`DonutChart`).
-   **Layout:** Um grid de `KpiCard` no topo, seguido por gráficos maiores que ocupam a largura da página.

### 4.2. Conversas (CRM)
-   **Objetivo:** Centralizar a comunicação com o cliente. Responder à pergunta: "Quem precisa da minha atenção agora?".
-   **Layout:** Um layout de três colunas:
    1.  **Lista de Conversas:** À esquerda, uma lista rolável de `ConversationListItem`.
    2.  **Painel de Chat:** No centro, o histórico da conversa selecionada.
    3.  **Painel de Informações do Cliente:** À direita, detalhes sobre o cliente e a transação associada.

### 4.3. Transações (Visão de Processos)
-   **Objetivo:** Fornecer uma visão detalhada e gerenciável de todos os processos em andamento. Responder à pergunta: "Qual é o status de tudo que está acontecendo?".
-   **Componentes Chave:** `DataTable`.
-   **Layout:** Uma grande tabela de dados que ocupa a maior parte da tela, com filtros e busca no cabeçalho.

### 4.4. Processos (WhatsApp Flows)
-   **Objetivo:** Permitir a gestão dos fluxos de automação. Responder à pergunta: "Quais são nossos processos automatizados e como estão performando?".
-   **Layout:** Um grid de cards, onde cada card representa um processo. Cada card mostra o nome do processo, uma breve descrição e estatísticas de uso.

---

Os documentos seguintes fornecerão a especificação detalhada para cada uma dessas telas, descrevendo a composição exata dos componentes e o layout de cada uma.
