Base visual (dark theme):
- Fundo: tons navy/graphite profundos; cartões e modais em camadas ligeiramente mais claras.
- Contrastes: textos claros (branco/cinza-claro), ícones azuis/cinzas; separadores discretos.
- Acentos: verde aprovação/sucesso; amarelo âmbar para aviso; vermelho rubi para erro; azul para ações principais; roxo/teal para métricas secundárias.
- Tipografia: sans moderna, pesos variando de regular a bold; headings 20–28px, métricas 28–36px bold; labels 12–14px; chips e badges em 12–13px uppercase ou semi-bold.
- Espaçamento: grid em colunas com gutters generosos; cartões com padding 16–24px; listas/linhas 12–16px de separação; sidebar fixa com ícones + rótulos.

Componentes:
- App shell: sidebar esquerda fixa com navegação e seções expansíveis; topo com usuário + logout; ações rápidas no topo direito (refresh, add).
- Toolbars/filtros: campos de busca e selects em linha, labels pequenas, bordas finas, ícones embutidos, estados focus em azul.
- Cards de métrica: bloco com ícone, título label, valor grande, subtexto ou deltas; variações por cor (sucesso, risco, neutro).
- Listas/linhas de transação: bloco com status badge (pending/error/approved), nome do cliente, IDs, valor alinhado à direita; interações hover evidenciam.
- Badges/Chips: formas pill ou retangulares com cores semitransparentes; estados: Pending (azul claro), Approved/Confirmed (verde), Error/Rejected (vermelho), Medium Risk (âmbar), Dynamic (cinza/azul).
- Botões: primário preenchido azul; secundário outline cinza/azul; ícones à esquerda; CTA principal destacado em modais (ex.: “Understood”).
- Tabs: pill flat ou underlined; estado ativo com preenchimento azul claro; usados para escopos (Nacional/Internacional/Adiq/Merchant) e abas técnicas.
- Tables/Grids: cartões dentro de grid responsivo; em technical data, blocos colapsáveis com header colorido por papel (customer/acquirer/response).
- Modais: fundo escurecido, container central com título, descrição e ações no rodapé; suporte a checklists e status badges.
- Graphs/Indicators: donut para breakdown financeiro; barra de risco com gradiente de low→high; contadores com percentuais.
- Map widget: mapa embutido (OpenStreetMap) com pin azul e controles de zoom.

Estados e feedback:
- Statuses: Pending/Active/API Ready; Confirmed/Rejected/Processing; Dynamic Settlement; Medium Risk com score; Anti Fraud Decision Applied.
- Tooltips/labels sutis para valores (ex.: currency, brand, provider).
- Skeleton/placeholder não exibido nas capturas, mas seguir padding e contraste dos cards.

