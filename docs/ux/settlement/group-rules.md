Contexto: gerenciamento de processos de settlement e regras.

Tela Group Rules (lista):
- Toolbar: filtro por “name” + select; campo Search by name.
- Botões no topo direito: Refresh, New Process, Create Group.
- Grid de cards por grupo: ex. “pagpop fees”, “cielo fees”, cada um mostra GROUP UUID, data/hora, e lista de regras (Credit Card, Debit Card, PIX etc.), indicando tipo (Platform, Dynamic), e validade (∞ ou dias).

Modal Group Details:
- Cabeçalho com título “Group Details”, subtítulo “View group and rules”, e botão Close (X).
- Bloco principal com nome do grupo, UUID, data de criação.
- Lista de Rules com contagem (ex. 5); cada regra em card horizontal com cor lateral (magenta/roxo), mostra:
  - Nome (Credit Card, Debit Card, etc.), labels “Dynamic Settlement”, “Platform”.
  - Acquirer (ex. a55).
  - IDs (rule UUID com ícone copy).
  - Fee (%), Settlement (∞ ou prazo), Event (Confirmed), Created (data).
- Rodapé com botões “Edit Group” (outline) e “Close”.

Visual:
- Modal em overlay com fundo escurecido; painel escuro com seções separadas.
- Cards de regra com barras coloridas à esquerda, texto branco/cinza, badges sutis.

Referência visual: `reference/settlement-group-rules.png`.

