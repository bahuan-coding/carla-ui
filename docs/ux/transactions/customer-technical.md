Contexto: aba Technical Data de uma transação, detalhando mensagens de integração.

Abas superiores:
- Integration Messaging (ativa), Metadata, Webhook, Auth, Decision; tabs em linha com fundo escuro e estado ativo em azul.

Hero técnico:
- Linha Customer → A55 Platform → Acquirer → A55 Response com ícones circulares.
- Texto explicativo de fluxo de dados.

Blocos de payload:
- Cabeçalho com contador “3 payloads”, botões Expand All / Collapse All e Copy All.
- Cada bloco é colapsável com chevron; cabeçalho colorido por papel:
  - Customer Request (azul): payload JSON com ~21 fields, scrollable; botão Copy no canto.
  - Acquirer Request (laranja): payload enviado para adquirente, com botão Copy.
  - Acquirer Response (verde): payload recebido, com botão Copy.
- Estrutura do bloco: header com ícone (seta), título, contador de campos; body com plano de fundo escuro e monoespaçado.

Layout e interação:
- Cards dentro de container escuro com bordas suaves; scroll vertical para bloco ativo.
- Botões Copy em outline colorido; colapsar/expandir por seção.
- Sidebar e cabeçalhos permanecem no padrão do app.

Referência visual: `reference/transactions-technical.png`.

