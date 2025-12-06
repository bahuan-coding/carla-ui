# 07 - Conversaciones (CRM + WhatsApp)

Layout 3 colunas (desktop):
- Lista (esq.): filtros (Todas/Activas/Pendientes), busca, badges de tags/produtos, contador de não lidos.
- Chat (centro): histórico, bolhas com status entrega/leitura, anexos, ações rápidas (templates, macros, adjuntar), input com toolbar.
- Perfil (dir.): dados do cliente (Graph API + backend), etiquetas, produtos/serviços, responsável, transação atual, timeline de eventos, botões rápidos (Asignar, Cambiar estado, Crear tarea).

Tempo real:
- WebSocket para mensagens; fallback polling.
- Indicadores “escribiendo”, online/offline se disponível.

Estados:
- Loading: skeleton lista/chat/painel.
- Error: toast e botão Reintentar; fallback read-only se WS falhar.
- Empty: mensagem “Sin conversaciones” com CTA importar/crear.

Ações mínimas:
- Enviar mensagem, subir adjunto, marcar estado (Activo/Pendiente), alterar responsável, abrir transação vinculada.

