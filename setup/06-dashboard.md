# 06 - Dashboard (BI WhatsApp Fintech)

Objetivo: visão em tempo real de operação via WhatsApp/banking.

Blocos:
- KPIs (cards glass): Conversaciones Activas, Procesos en Curso, Completados Hoy, SLA de Respuesta, Volumen Financiero, Conversión. Badges de variação (vs semana passada).
- Gráficos: Actividad Semanal (stacked bar por tipo de proceso), Distribución de Procesos (donut), SLA/tiempo de respuesta (linha/area). Filtros de período (semana/mes/custom) e por proceso.
- Insights automáticos: lista curta de “Hallazgos” (texto + ícone) vindos de endpoint opcional.

Estados:
- Loading: skeleton cards e placeholders de gráfico.
- Error: banner/alerta com “Reintentar”.
- Empty: orientado (ex: “No hay datos para este período”).

Interações:
- Filtro global de período.
- Export rápido (CSV/PDF) para métricas principais.
- Tooltips ricas (valor + %).

