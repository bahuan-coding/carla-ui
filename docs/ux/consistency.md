Hierarquia e layout:
- Sidebar fixa esquerda, conteúdo em colunas; manter gutters generosos e cartões alinhados por topo.
- Topbar com usuário e ações; evitar excesso de botões, priorizar refresh e criação.
- Cabeçalhos de tela com título, subtítulo/contexto, e ações primárias (Receipt, Refund, Change Status).

Padrões cromáticos/estados:
- Verde = sucesso/confirmado/aprovado; Azul = primário/ação; Ambar = aviso/risco; Vermelho = erro/rejeição; Roxo/Teal = métricas secundárias.
- Fundos escuros: manter contraste AA; textos claros; bordas discretas.
- Badges com cor suave + texto contrastante; usar ícones (check, warn, close) para status.

Componentização:
- Reusar cards de métrica para Mission Control, Onboarding e Breakdown financeiro.
- Colapsáveis para dados técnicos e payloads; manter botões Copy/Expand em cabeçalhos.
- Donut e barras graduais (risco) como padrões de visualização.
- Map widget padronizado com pin azul e controles ± no canto.

Acessibilidade e microcopy:
- Foco visível em inputs/tabs/botões (borda azul).
- Texto de status curto e direto; instruções em passos numerados nos modais.
- Indicadores monetários sempre com moeda explícita e alinhamento à direita.
- Evitar truncar IDs críticos; permitir copy rápido via ícone.

WhatsApp-first (reuso):
- Privilegiar legibilidade em telas compactas: colunas empilháveis, cards autossuficientes.
- Resumos no topo (valor, status, risco) seguidos de detalhes colapsáveis.
- CTA único e claro por modal; evitar múltiplas ações concorrentes.
- Manter cores e ícones consistentes com botões de resposta rápida.

