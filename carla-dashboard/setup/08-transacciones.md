# 08 - Transacciones

Objetivo: controlar processos bancários em fluxo.

Tabela densa (vista principal):
- Colunas: Cliente, Proceso, Etapa Actual, Progreso (barra), Tiempo (decorrido), Prioridad, Tags, Acciones (ver/editar).
- Filtros combináveis: proceso, prioridad, fecha, estado; busca por cliente/proceso.
- Paginación/virtualización para listas grandes; ordenação por progresso/tempo.

Vistas adicionais:
- Kanban por etapa (opcional).
- Export CSV.

Estados:
- Loading: skeleton linhas.
- Empty: “No hay transacciones con estos filtros”.
- Error: alerta + reintentar.

Interações:
- Click abre detalhe (futuro) ou ancora à conversa vinculada.
- Badges de SLA se tempo > meta.

