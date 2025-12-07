# Cliente 360° — Estados e QA visual

## Loading
- Skeletons com shimmer curto (1.2–1.5s), mantendo proporção real: cards, linhas de tabela, timeline.
- Placeholder de avatar e badges; evitar spinner central.

## Empty
- Mensagem empática + CTA de ação (ex.: “Sem interações hoje — agende follow-up”).
- Timeline: linha do tempo vazia com marcas cinzas; botão “Logar interação”.
- Produtos: callout para importar/atualizar dados; link para criação de produto.

## Error / Fallback
- Banner discreto no topo do bloco afetado; retry local.
- Timeline offline: permitir anotações locais com sync posterior.
- Guardas para ausência de KYC/score: mostrar skeleton parcial e botão “reprocessar”.

## Acessibilidade e teclado
- Focus ring visível em todos botões/links; ordem lógica.
- Atalhos: `A` agendar, `N` nova nota, `T` adicionar tarefa, `/` buscar.

## QA visual rápido
- Alinhamentos: baseline de títulos com badges; grids 12 col; gutters 20–24 px.
- Contrast check (WCAG AA): texto principal ≥ 4.5:1; badges de risco com texto #0B1021.
- Consistência de densidade: padding cards 16–20 px; radius 16–18 px; sombra 2–4 px.
- Estados de hover/focus presentes para botões, linhas de tabela e timeline pills.

