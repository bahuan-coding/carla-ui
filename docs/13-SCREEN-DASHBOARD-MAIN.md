# 13: Especificação de Tela - Dashboard Principal (BI)

**Versão:** 2.0
**Data:** 06 de Dezembro de 2025

---

## 1. Visão Geral

**Nome da Tela:** Dashboard
**Rota:** `/`

O Dashboard é a tela principal e o ponto de entrada da aplicação. Seu objetivo é fornecer aos gestores e agentes uma visão panorâmica e em tempo real da saúde da operação. A tela deve ser limpa, informativa e permitir a identificação rápida de tendências, sucessos e pontos de atenção.

## 2. Estrutura do Layout

O layout do Dashboard será construído sobre um grid flexível, organizado em duas seções principais:

1.  **Linha de KPIs (Indicadores Chave de Performance):** Uma linha no topo da página com quatro cards de KPI, fornecendo as métricas mais vitais.
2.  **Seção de Gráficos Detalhados:** Abaixo dos KPIs, dois gráficos maiores fornecerão uma análise mais profunda da atividade semanal e da distribuição dos processos.

```
+----------------------------------------------------------------------------+
| Header: Dashboard                                                          |
+----------------------------------------------------------------------------+
|                                                                            |
| [ KPI Card 1 ]  [ KPI Card 2 ]  [ KPI Card 3 ]  [ KPI Card 4 ]             |
|                                                                            |
+------------------------------------------+---------------------------------+
|                                          |                                 |
|                                          |                                 |
|                                          |                                 |
|           Gráfico de Atividade           |      Gráfico de Distribuição    |
|                Semanal                   |            de Processos         |
|             (Bar Chart)                  |           (Donut Chart)         |
|                                          |                                 |
|                                          |                                 |
|                                          |                                 |
+------------------------------------------+---------------------------------+
```

## 3. Composição e Especificações

### 3.1. Cabeçalho da Tela (`Header`)

-   **Título:** "Dashboard"
-   **Ações Globais:**
    -   **Filtro de Período:** Um `Select` (Dropdown) para filtrar os dados da tela (ex: "Esta Semana", "Este Mês", "Últimos 90 dias").
    -   **Botão de Exportar:** Um `Button` primário com o texto "Exportar Relatório" e um ícone de download.

### 3.2. Seção de KPIs

-   **Layout:** Um grid de 4 colunas com um `gap-8` (32px) entre os cards.
-   **Componente:** `KpiCard` (Molécula).

**Especificação dos 4 KPIs:**

1.  **Conversas Ativas:**
    -   **Ícone:** `MessageCircle`
    -   **Título:** "Conversas Ativas"
    -   **Valor (Exemplo):** "245"
    -   **Variação (Exemplo):** `+12%` (ícone `ArrowUpCircle` verde)

2.  **Processos em Curso:**
    -   **Ícone:** `Loader`
    -   **Título:** "Processos em Curso"
    -   **Valor (Exemplo):** "167"
    -   **Variação (Exemplo):** `+8%` (ícone `ArrowUpCircle` verde)

3.  **Completados Hoje:**
    -   **Ícone:** `CheckCircle`
    -   **Título:** "Completados Hoje"
    -   **Valor (Exemplo):** "93"
    -   **Variação (Exemplo):** `+15%` (ícone `ArrowUpCircle` verde)

4.  **Tempo de Resposta:**
    -   **Ícone:** `Clock`
    -   **Título:** "Tempo de Resposta"
    -   **Valor (Exemplo):** "24min"
    -   **Variação (Exemplo):** `-5%` (ícone `ArrowDownCircle` verde, pois um tempo menor é melhor).

### 3.3. Gráfico de Atividade Semanal

-   **Layout:** Ocupa 8 de 12 colunas do grid principal.
-   **Componente:** Um `Card` contendo um Gráfico de Barras (`BarChart`).
-   **Card:**
    -   **Título:** "Atividade Semanal"
    -   **Subtítulo:** "Fluxo de conversas e processos completados"
    -   **Ações no Card:** Filtros para alternar a visualização de dados (ex: "Todos os Processos", "Crédito", "Transferência").
-   **Gráfico de Barras (`BarChart` - Recharts):**
    -   **Eixo X:** Dias da semana ("Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom").
    -   **Eixo Y:** Número de atividades.
    -   **Barras:** Barras empilhadas (`StackedBarChart`). Cada segmento da barra representa um tipo de processo (ex: Crédito, Transferência, Inversión), usando cores diferentes da paleta (Azul Primário, Verde Secundário, Amarelo de Alerta).
    -   **Tooltip:** Ao passar o mouse sobre uma barra, um tooltip deve mostrar o detalhe dos valores para cada tipo de processo naquele dia.

### 3.4. Gráfico de Distribuição de Processos

-   **Layout:** Ocupa 4 de 12 colunas do grid principal.
-   **Componente:** Um `Card` contendo um Gráfico de Rosca (`DonutChart`).
-   **Card:**
    -   **Título:** "Distribuição de Processos"
    -   **Subtítulo:** "Por tipo de serviço"
-   **Gráfico de Rosca (`DonutChart` - Recharts):**
    -   **Segmentos:** Cada segmento representa um tipo de processo (ex: "Apertura de Cuenta", "Solicitud de Crédito", "Transferencia").
    -   **Cores:** Usar a paleta de cores do sistema para diferenciar os segmentos.
    -   **Legenda:** Uma legenda abaixo ou ao lado do gráfico, listando cada tipo de processo, sua cor correspondente e o valor percentual.

## 4. Comportamento Responsivo

-   **Telas Médias (Tablet - `md`):**
    -   O grid de KPIs deve quebrar para 2 colunas.
    -   Os gráficos de Atividade Semanal e Distribuição de Processos devem ocupar a largura total (12 colunas) e serem empilhados verticalmente.
-   **Telas Pequenas (Mobile):**
    -   O grid de KPIs deve quebrar para 1 coluna.
    -   Os gráficos permanecem empilhados verticalmente.

---

Esta especificação fornece um guia detalhado para a construção da tela de Dashboard, garantindo que ela seja funcional, esteticamente alinhada à marca Carla e informativa para o usuário final.
