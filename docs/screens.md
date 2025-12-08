# Telas e Navegação

## Arquitetura de Layout

O layout da aplicação é consistente em todas as telas:

1. **Sidebar:** Menu lateral fixo à esquerda com navegação principal.
2. **Header:** Cabeçalho no topo com título da página e ações contextuais.
3. **Main Content:** Área central dinâmica onde o conteúdo é renderizado.

## Navegação Principal

| Ícone | Tela | Rota | Propósito |
| :--- | :--- | :--- | :--- |
| `LayoutDashboard` | **Dashboard** | `/` | Visão geral de KPIs e atividades em tempo real. |
| `MessageCircle` | **Conversas** | `/conversations` | CRM de interações via WhatsApp. |
| `ArrowRightLeft` | **Transações** | `/transactions` | Gerenciamento de processos em andamento. |
| `Workflow` | **Processos** | `/processes` | Fluxos de automação WhatsApp. |

---

## Dashboard (/)

**Objetivo:** Fornecer pulso rápido e visual da operação.

### Layout

- **Linha de KPIs:** 4 cards (Conversas Ativas, Processos em Curso, Completados Hoje, Tempo de Resposta).
- **Gráficos:** Atividade Semanal (BarChart) + Distribuição de Processos (DonutChart).

### Comportamento Responsivo

- Tablet: KPIs em 2 colunas, gráficos empilhados.
- Mobile: KPIs em 1 coluna, gráficos empilhados.

---

## Conversas (/conversations)

**Objetivo:** Centro de comando para interação com cliente via WhatsApp.

### Layout de 3 Colunas

1. **Lista de Conversas (3/12):** Lista rolável com busca e filtros.
2. **Painel de Chat (6/12):** Histórico de mensagens e área de input.
3. **Informações do Cliente (3/12):** Detalhes do cliente e transação.

### Comportamento Responsivo

- Tablet: Ocultar painel de informações.
- Mobile: Apenas lista visível, chat em navegação separada.

---

## Transações (/transactions)

**Objetivo:** Visão operacional detalhada de todos os processos.

### Layout

Centrado em uma **DataTable** com:

- Colunas: Cliente, Processo, Etapa Atual, Progresso, Tempo, Prioridade, Tags, Ações.
- Filtros e busca no cabeçalho.
- Paginação no rodapé.
- Alternativa: Visão Kanban por etapas.

### Comportamento Responsivo

- Rolagem horizontal para manter layout da tabela.
- Mobile: Cards empilhados como alternativa.

---

## Processos (/processes)

**Objetivo:** Gerenciamento de fluxos de automação WhatsApp.

### Layout

**Grid de ProcessCards** (3 colunas lg, 2 md, 1 sm):

Cada card contém:
- Título e Badge de status (Ativo/Rascunho)
- Descrição do processo
- Estatísticas (passos, tempo)
- Ações (Editar, Duplicar, Arquivar)

### Ações

- Busca por nome de processo.
- Botão "+ Novo Processo" para criação.



