Contexto: detalhes de uma transação (valores, moedas, status, risco, itens).

Cabeçalho:
- Botão Back à esquerda; título “Transaction Details” com UUID abaixo.
- Ações primárias: Receipt, Refund, Change Status (ícones + rotulo).
- Processed on (data/hora, timezone, cidade).

Valor e status:
- Card principal com valor em moeda original (BRL) em grande, equivalente em USD abaixo; badges: Confirmed, Credit Card; ícone de aprovação.
- Secção Financial Breakdown: donut chart com distribuição; cards Net Amount (97.9%, valor BRL), Total Fees (-2.1%, valor), Total Amount (verde).
- Secção Exchange Rate: mostra original BRL e convertido USD com taxa (1 USD → 5.44), caixa grande para valor convertido.

Seções adicionais:
- Risk Score (ver `transactions/risk.md`).
- Purchase Items: lista de itens com nome, descrição e total à direita.
- Identifiers laterais: IDs (Transaction, Charge UUID, References, Account/Merchant/Wallet UUIDs, Customer UUID, External ID, TID, Authorization Code).
- Anti-fraud: badge “Anti Fraud Decision Applied”; segurança: No 3DS Authentication, No DataOnly Mode.
- Estabelecimento: bloco lateral com Account, Merchant, Wallet e botão View Account.
- Payment card: marca, tipo, categoria, banco emissor, país (bandeira), provider e descriptor (ver `transactions/payment-card.md`).
- Localização: mapa com pin azul e controles ±.

Interações:
- Sidebar consistente; scroll vertical; seções empilháveis.
- Botões de ação no topo; badges clicáveis não evidenciadas, apenas informativas.

Referência visual esperada: `reference/transactions-detail.png`.

